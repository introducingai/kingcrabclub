import { NextRequest, NextResponse } from "next/server";
import { appendItemHistorySample } from "@/lib/itemHistoryCache";
import { computeItemMetrics } from "@/lib/itemMetrics";
import { normalizeItemStats, normalizeListing } from "@/lib/kintaraApi";
import { getPersistedEventsForItem, getPersistedItemHistory } from "@/lib/marketHistoryDb";
import { normalizeDexScreenerResponse } from "@/lib/tokenApi";
import type { DexScreenerTokenResponse, ItemStatsResponse } from "@/lib/types";

export const runtime = "nodejs";

const FRIENDLY_ERROR =
  "Kintara marketplace data is not publicly accessible from this companion yet. This likely needs an official API key, same-origin deployment, or approved integration.";

function baseUrl() {
  return (
    process.env.KINTARA_BASE_URL ??
    process.env.NEXT_PUBLIC_KINTARA_BASE_URL ??
    "https://kintara.gg"
  ).replace(/\/$/, "");
}

function kinsMint() {
  return (
    process.env.KINS_MINT ??
    process.env.NEXT_PUBLIC_KINS_MINT ??
    "Tqj8yFmagrg7oorpQkVGYR52r96RFTamvWfth9bpump"
  );
}

function unwrapListings(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;

  for (const key of ["listings", "items", "data", "results"]) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

async function fetchListings(itemType: string) {
  const endpoint = new URL(`${baseUrl()}/api/marketplace/listings`);
  endpoint.searchParams.set("q", itemType);
  endpoint.searchParams.set("limit", "250");

  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${endpoint.pathname}: ${FRIENDLY_ERROR}`);
  }

  return unwrapListings(payload).map(normalizeListing);
}

async function fetchStats(itemType: string, currency: "gold" | "token") {
  const endpoint = new URL(`${baseUrl()}/api/marketplace/stats`);
  endpoint.searchParams.set("itemType", itemType);

  if (currency === "token") {
    endpoint.searchParams.set("currency", "token");
  }

  const response = await fetch(endpoint, {
    next: { revalidate: 60 },
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Item stats fetch failed", {
      status: response.status,
      source: endpoint.toString(),
      bodyPreview: JSON.stringify(payload).slice(0, 240),
    });

    return {
      itemType,
      currency,
      points: [],
      sourceMessage: `HTTP ${response.status} from ${endpoint.pathname}`,
    } satisfies ItemStatsResponse;
  }

  return normalizeItemStats(payload, itemType, currency);
}

async function fetchKinsUsdPrice() {
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${kinsMint()}`,
    {
      next: { revalidate: 30 },
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    },
  );
  const payload = (await response.json().catch(() => ({}))) as DexScreenerTokenResponse;

  if (!response.ok) {
    return undefined;
  }

  return normalizeDexScreenerResponse(payload).priceUsd;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ itemType: string }> },
) {
  const { itemType: rawItemType } = await params;
  const itemType = decodeURIComponent(rawItemType);
  const generatedAt = new Date().toISOString();

  try {
    const [listings, goldStats, tokenStats, kinsUsdPrice] = await Promise.all([
      fetchListings(itemType),
      fetchStats(itemType, "gold"),
      fetchStats(itemType, "token"),
      fetchKinsUsdPrice(),
    ]);
    const itemListings = listings.filter((listing) => listing.itemType === itemType);
    const metrics = computeItemMetrics(itemListings, itemType, kinsUsdPrice);
    const memoryHistory = appendItemHistorySample(metrics);
    const persistedHistory = getPersistedItemHistory(itemType, "30d");
    const history = persistedHistory.length > 0 ? persistedHistory : memoryHistory;
    const events = getPersistedEventsForItem(itemType, "30d", 100);
    const tokenOrderBook = itemListings
      .filter((listing) => listing.currency === "token" && listing.quantity > 0)
      .sort((a, b) => a.unitPrice - b.unitPrice)
      .slice(0, 25);
    const goldOrderBook = itemListings
      .filter((listing) => listing.currency === "gold" && listing.quantity > 0)
      .sort((a, b) => a.unitPrice - b.unitPrice)
      .slice(0, 25);

    return NextResponse.json(
      {
        ok: true,
        itemType,
        metrics,
        salesStats: {
          gold: goldStats,
          token: tokenStats,
        },
        history,
        orderBook: {
          token: tokenOrderBook,
          gold: goldOrderBook,
        },
        events,
        generatedAt,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    const message =
      rawMessage === "fetch failed" || rawMessage.includes("aborted")
        ? FRIENDLY_ERROR
        : rawMessage;

    console.error("Item market route failed", {
      itemType,
      error: rawMessage,
    });

    return NextResponse.json(
      {
        ok: false,
        error: message,
        status: 502,
        source: `/api/market/item/${itemType}`,
      },
      { status: 502 },
    );
  }
}
