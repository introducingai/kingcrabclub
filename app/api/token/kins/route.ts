import { NextResponse } from "next/server";
import { normalizeDexScreenerResponse } from "@/lib/tokenApi";
import type { DexScreenerTokenResponse } from "@/lib/types";

const CACHE_SECONDS = 30;

function kinsMint() {
  return (
    process.env.KINS_MINT ??
    process.env.NEXT_PUBLIC_KINS_MINT ??
    "Tqj8yFmagrg7oorpQkVGYR52r96RFTamvWfth9bpump"
  );
}

export async function GET() {
  const endpoint = `https://api.dexscreener.com/latest/dex/tokens/${kinsMint()}`;
  const source = "/latest/dex/tokens";

  try {
    const response = await fetch(endpoint, {
      headers: {
        accept: "application/json",
      },
      next: { revalidate: CACHE_SECONDS },
    });
    const payload = (await response.json().catch(() => ({}))) as DexScreenerTokenResponse;

    if (!response.ok) {
      console.error("DexScreener KINS proxy failed", {
        status: response.status,
        source: endpoint,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "DexScreener token stats are temporarily unavailable.",
          status: response.status,
          source,
        },
        { status: response.status },
      );
    }

    const data = normalizeDexScreenerResponse(payload);

    return NextResponse.json({
      ok: true,
      data:
        data.pairUrl || data.priceUsd
          ? data
          : { sourceMessage: "No Solana KINS pair was found on DexScreener." },
      status: 200,
      source,
    }, {
      headers: {
        "Cache-Control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=60`,
      },
    });
  } catch (error) {
    console.error("DexScreener KINS proxy crashed", {
      source: endpoint,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        ok: false,
        error: "DexScreener token stats are temporarily unavailable.",
        status: 502,
        source,
      },
      { status: 502 },
    );
  }
}
