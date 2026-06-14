import { NextRequest, NextResponse } from "next/server";
import { auditWriteAttempt } from "@/lib/kintaraOfficial/auditLog";
import { getKintaraOfficialClient } from "@/lib/kintaraOfficial/client";
import { guardResponse, requireIdempotencyKey, requireMockAuth, requireMockMode } from "@/lib/kintaraOfficial/featureGuards";
import type { ReserveInput } from "@/lib/kintaraOfficial/types";

export async function POST(request: NextRequest) {
  const action = "checkout.reserve";
  const blocked = guardResponse(requireMockMode()) ?? guardResponse(requireMockAuth()) ?? guardResponse(requireIdempotencyKey(request.headers));

  if (blocked) {
    auditWriteAttempt({ action, request, outcome: "blocked" });
    return blocked;
  }

  const input = (await request.json().catch(() => ({}))) as Partial<ReserveInput>;

  if (!input.listingId) {
    auditWriteAttempt({ action, request, outcome: "blocked", error: "missing_listing" });
    return NextResponse.json({ ok: false, error: "missing_listing" }, { status: 400 });
  }

  try {
    const reservation = getKintaraOfficialClient().reserve(input as ReserveInput);
    auditWriteAttempt({ action, request, outcome: "mock_success" });

    return NextResponse.json({
      ok: true,
      mode: "mock",
      reservation,
      warning: "Mock reservation only. No real reservation was sent.",
    });
  } catch (error) {
    auditWriteAttempt({
      action,
      request,
      outcome: "failed",
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
