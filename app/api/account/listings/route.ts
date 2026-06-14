import { NextResponse } from "next/server";
import { getKintaraOfficialClient } from "@/lib/kintaraOfficial/client";
import { integrationMode } from "@/lib/kintaraOfficial/featureGuards";

export async function GET() {
  try {
    const client = getKintaraOfficialClient();

    return NextResponse.json({
      ok: true,
      mode: integrationMode(),
      listings: client.listings(),
    });
  } catch {
    return NextResponse.json({
      ok: false,
      mode: integrationMode(),
      error: "official_integration_disabled",
      listings: [],
    });
  }
}
