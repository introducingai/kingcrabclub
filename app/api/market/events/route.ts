import { NextResponse } from "next/server";
import { getMarketEvents } from "@/lib/marketCache";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      events: getMarketEvents(),
      source: "/api/market/events",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
