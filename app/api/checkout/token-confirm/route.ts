import { NextRequest, NextResponse } from "next/server";
import { auditWriteAttempt } from "@/lib/kintaraOfficial/auditLog";
import { getKintaraOfficialClient } from "@/lib/kintaraOfficial/client";
import { guardResponse, requireIdempotencyKey, requireMockAuth, requireMockMode } from "@/lib/kintaraOfficial/featureGuards";
import type { TokenConfirmInput } from "@/lib/kintaraOfficial/types";

export async function POST(request: NextRequest) {
  const action = "checkout.token_confirm";
  const blocked = guardResponse(requireMockMode()) ?? guardResponse(requireMockAuth()) ?? guardResponse(requireIdempotencyKey(request.headers));

  if (blocked) {
    auditWriteAttempt({ action, request, outcome: "blocked" });
    return blocked;
  }

  const input = (await request.json().catch(() => ({}))) as Partial<TokenConfirmInput>;

  if (!input.reservationId) {
    auditWriteAttempt({ action, request, outcome: "blocked", error: "reservation_not_found" });
    return NextResponse.json({ ok: false, error: "reservation_not_found" }, { status: 400 });
  }

  try {
    const result = getKintaraOfficialClient().tokenConfirm(input as TokenConfirmInput);
    auditWriteAttempt({ action, request, outcome: "mock_success" });

    return NextResponse.json({
      ok: true,
      mode: "mock",
      result,
      warning: "Mock confirmation only. No transaction signature was requested.",
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
