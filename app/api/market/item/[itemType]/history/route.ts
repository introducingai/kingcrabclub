import { NextRequest, NextResponse } from "next/server";
import { getPersistedEventsForItem, getPersistedItemHistory } from "@/lib/marketHistoryDb";

export const runtime = "nodejs";

const ranges = new Set(["1h", "24h", "7d", "30d"]);
const currencies = new Set(["all", "gold", "token"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemType: string }> },
) {
  const { itemType: rawItemType } = await params;
  const itemType = decodeURIComponent(rawItemType);
  const range = ranges.has(request.nextUrl.searchParams.get("range") ?? "")
    ? request.nextUrl.searchParams.get("range") ?? "24h"
    : "24h";
  const currency = currencies.has(request.nextUrl.searchParams.get("currency") ?? "")
    ? request.nextUrl.searchParams.get("currency") ?? "all"
    : "all";

  try {
    const metrics = getPersistedItemHistory(itemType, range);
    const events = getPersistedEventsForItem(itemType, range, 100);

    return NextResponse.json(
      {
        ok: true,
        itemType,
        range,
        currency,
        metrics,
        events,
        generatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        itemType,
        range,
        currency,
        error: error instanceof Error ? error.message : String(error),
        status: 500,
        source: `/api/market/item/${itemType}/history`,
      },
      { status: 500 },
    );
  }
}
