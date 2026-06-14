import type { NextRequest } from "next/server";
import { integrationMode } from "./featureGuards";

type AuditOutcome = "blocked" | "mock_success" | "failed";

export function auditWriteAttempt({
  action,
  request,
  outcome,
  error,
}: {
  action: string;
  request: NextRequest;
  outcome: AuditOutcome;
  error?: string;
}) {
  // TODO: Persist future staging/production audit logs to append-only storage.
  // Do not log private keys, wallet signatures, auth tokens, or raw transaction payloads.
  console.info("Kintara write-route audit", {
    action,
    mode: integrationMode(),
    outcome,
    error,
    idempotencyKey: request.headers.get("idempotency-key") ?? null,
    requestedAt: new Date().toISOString(),
  });
}
