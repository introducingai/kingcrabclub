import { NextRequest, NextResponse } from "next/server";
import { getPersistedEventsForSeller, getPersistedSellerHistory } from "@/lib/marketHistoryDb";

export const runtime = "nodejs";

const ranges = new Set(["1h", "24h", "7d", "30d"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerName: string }> },
) {
  const { sellerName: rawSellerName } = await params;
  const sellerName = decodeURIComponent(rawSellerName);
  const range = ranges.has(request.nextUrl.searchParams.get("range") ?? "")
    ? request.nextUrl.searchParams.get("range") ?? "24h"
    : "24h";

  try {
    return NextResponse.json(
      {
        ok: true,
        sellerName,
        range,
        metrics: getPersistedSellerHistory(sellerName, range),
        events: getPersistedEventsForSeller(sellerName, range, 100),
        generatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        sellerName,
        range,
        error: error instanceof Error ? error.message : String(error),
        status: 500,
        source: `/api/market/seller/${sellerName}/history`,
      },
      { status: 500 },
    );
  }
}
