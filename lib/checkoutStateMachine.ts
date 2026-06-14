export type CheckoutState =
  | "idle"
  | "reserving"
  | "reserved"
  | "quote_pending"
  | "awaiting_wallet"
  | "transaction_submitted"
  | "confirming_server"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

export type CheckoutEvent =
  | "reserve"
  | "reserve_ok"
  | "quote"
  | "quote_ok"
  | "submit_mock"
  | "confirm"
  | "complete"
  | "fail"
  | "expire"
  | "cancel";

const transitions: Record<CheckoutState, Partial<Record<CheckoutEvent, CheckoutState>>> = {
  idle: { reserve: "reserving", cancel: "cancelled" },
  reserving: { reserve_ok: "reserved", fail: "failed", cancel: "cancelled" },
  reserved: { quote: "quote_pending", expire: "expired", cancel: "cancelled" },
  quote_pending: { quote_ok: "awaiting_wallet", fail: "failed", cancel: "cancelled" },
  awaiting_wallet: { submit_mock: "transaction_submitted", cancel: "cancelled" },
  transaction_submitted: { confirm: "confirming_server", fail: "failed" },
  confirming_server: { complete: "completed", fail: "failed" },
  completed: {},
  failed: { reserve: "reserving" },
  expired: { reserve: "reserving" },
  cancelled: { reserve: "reserving" },
};

export function nextCheckoutState(state: CheckoutState, event: CheckoutEvent): CheckoutState {
  return transitions[state][event] ?? state;
}

export function mockCheckoutSteps(): CheckoutEvent[] {
  return ["reserve", "reserve_ok", "quote", "quote_ok", "submit_mock", "confirm", "complete"];
}
