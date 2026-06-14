import { NextRequest, NextResponse } from "next/server";
import { getMarketEvents } from "@/lib/marketCache";
import { normalizeListing } from "@/lib/kintaraApi";
import { formatMarketPrice } from "@/lib/format";

export const runtime = "nodejs";

function baseUrl() {
  return (
    process.env.KINTARA_BASE_URL ??
    process.env.NEXT_PUBLIC_KINTARA_BASE_URL ??
    "https://kintara.gg"
  ).replace(/\/$/, "");
}

function unwrapListings(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["listings", "items", "data", "results"]) {
    if (Array.isArray(record[key])) return record[key];
  }
  return [];
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sellerName: string }> },
) {
  const { sellerName: rawSellerName } = await params;
  const sellerName = decodeURIComponent(rawSellerName);
  const upstream = new URL(`${baseUrl()}/api/marketplace/listings`);
  upstream.searchParams.set("limit", "250");

  try {
    const response = await fetch(upstream, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `HTTP ${response.status} from ${upstream.pathname}`,
          status: response.status,
          source: upstream.pathname,
        },
        { status: response.status },
      );
    }

    const listings = unwrapListings(payload)
      .map(normalizeListing)
      .filter((listing) => listing.seller?.toLowerCase() === sellerName.toLowerCase());
    const tokenListings = listings.filter((listing) => listing.currency === "token");
    const goldListings = listings.filter((listing) => listing.currency === "gold");
    const totalTokenListedValue = tokenListings.reduce((sum, listing) => sum + listing.price, 0);
    const totalGoldListedValue = goldListings.reduce((sum, listing) => sum + listing.price, 0);
    const itemDistribution = Array.from(
      listings.reduce((map, listing) => {
        map.set(listing.itemType, (map.get(listing.itemType) ?? 0) + listing.quantity);
        return map;
      }, new Map<string, number>()),
    ).sort((a, b) => b[1] - a[1]);

    return NextResponse.json({
      ok: true,
      sellerName,
      generatedAt: new Date().toISOString(),
      listings,
      summary: {
        activeListings: listings.length,
        totalListedValue: [
          formatMarketPrice(totalGoldListedValue, "gold"),
          formatMarketPrice(totalTokenListedValue, "token"),
        ],
        tokenListings: tokenListings.length,
        goldListings: goldListings.length,
        itemDistribution,
        cheapestListings: [...listings].sort((a, b) => a.unitPrice - b.unitPrice).slice(0, 8),
      },
      events: getMarketEvents().filter(
        (event) =>
          typeof event.payload?.seller === "string" &&
          event.payload.seller.toLowerCase() === sellerName.toLowerCase(),
      ),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        status: 502,
        source: upstream.pathname,
      },
      { status: 502 },
    );
  }
}
