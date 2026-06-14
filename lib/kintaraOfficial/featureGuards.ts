import { featureFlags } from "../featureFlags";
import { kintaraOfficialErrors } from "./errors";
import type {
  CreateListingInput,
  GuardResult,
  IntegrationMode,
  OfficialCurrency,
} from "./types";

export function integrationMode(): IntegrationMode {
  return featureFlags.integrationMode;
}

export function requireMockMode(): GuardResult {
  if (integrationMode() === "disabled") {
    return { ok: false, error: kintaraOfficialErrors.integrationDisabled, status: 403 };
  }

  if (integrationMode() !== "mock") {
    return { ok: false, error: kintaraOfficialErrors.writesDisabled, status: 403 };
  }

  return { ok: true };
}

export function requireIdempotencyKey(headers: Headers): GuardResult {
  if (!headers.get("idempotency-key")) {
    return { ok: false, error: kintaraOfficialErrors.missingIdempotencyKey, status: 400 };
  }

  return { ok: true };
}

export function requireMockAuth(): GuardResult {
  if (integrationMode() !== "mock") {
    return { ok: false, error: "auth_required", status: 401 };
  }

  return { ok: true };
}

export function isCurrency(value: unknown): value is OfficialCurrency {
  return value === "gold" || value === "token";
}

export function validateCreateListingInput(
  input: Partial<CreateListingInput>,
  tradeable: boolean,
): GuardResult {
  if (!input.itemId) {
    return { ok: false, error: "missing_item", status: 400 };
  }

  if (!input.quantity || input.quantity <= 0) {
    return { ok: false, error: kintaraOfficialErrors.invalidQuantity, status: 400 };
  }

  if (!input.price || input.price <= 0) {
    return { ok: false, error: kintaraOfficialErrors.invalidPrice, status: 400 };
  }

  if (!isCurrency(input.currency)) {
    return { ok: false, error: kintaraOfficialErrors.invalidCurrency, status: 400 };
  }

  if (!tradeable) {
    return { ok: false, error: kintaraOfficialErrors.itemNotTradeable, status: 400 };
  }

  if (!input.slotKind || typeof input.slotIndex !== "number") {
    return { ok: false, error: "missing_slot", status: 400 };
  }

  return { ok: true };
}

export function guardResponse(result: GuardResult) {
  if (result.ok) {
    return undefined;
  }

  return Response.json(
    {
      ok: false,
      error: result.error,
    },
    { status: result.status },
  );
}
