import { NextRequest, NextResponse } from "next/server";
import { fetchKinsBalance, getKinsMint } from "@/lib/walletReadOnly";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing wallet query parameter.",
        status: 400,
        source: "/api/wallet/kins-balance",
      },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await fetchKinsBalance(wallet), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const missingRpc = message.includes("SOLANA_RPC_URL");

    return NextResponse.json(
      {
        ok: false,
        wallet,
        kinsMint: getKinsMint(),
        error: missingRpc ? "missing_solana_rpc_url" : message,
        setupRequired: missingRpc,
        status: 503,
        source: "/api/wallet/kins-balance",
      },
      { status: 503 },
    );
  }
}
