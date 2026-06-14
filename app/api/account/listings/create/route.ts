import { NextRequest, NextResponse } from "next/server";
import { auditWriteAttempt } from "@/lib/kintaraOfficial/auditLog";
import { getKintaraOfficialClient } from "@/lib/kintaraOfficial/client";
import {
  guardResponse,
  requireIdempotencyKey,
  requireMockAuth,
  requireMockMode,
  validateCreateListingInput,
} from "@/lib/kintaraOfficial/featureGuards";
import type { CreateListingInput } from "@/lib/kintaraOfficial/types";

export async function POST(request: NextRequest) {
  const action = "account.listings.create";
  const modeGuard = requireMockMode();
  const authGuard = requireMockAuth();
  const idempotencyGuard = requireIdempotencyKey(request.headers);
  const blocked = guardResponse(modeGuard) ?? guardResponse(authGuard) ?? guardResponse(idempotencyGuard);

  if (blocked) {
    auditWriteAttempt({ action, request, outcome: "blocked" });
    return blocked;
  }

  const input = (await request.json().catch(() => ({}))) as Partial<CreateListingInput>;
  const client = getKintaraOfficialClient();
  const item = client.inventory().find((candidate) => candidate.itemId === input.itemId);
  const validation = validateCreateListingInput(input, Boolean(item?.tradeable));
  const invalid = guardResponse(validation);

  if (invalid) {
    auditWriteAttempt({ action, request, outcome: "blocked" });
    return invalid;
  }

  try {
    const listing = client.createListing(input as CreateListingInput);
    auditWriteAttempt({ action, request, outcome: "mock_success" });

    return NextResponse.json({
      ok: true,
      mode: "mock",
      listing,
      warning: "Mock listing only. No Kintara inventory changed.",
    });
  } catch (error) {
    auditWriteAttempt({
      action,
      request,
      outcome: "failed",
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
}
