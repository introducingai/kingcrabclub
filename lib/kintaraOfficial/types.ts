export type OfficialCurrency = "gold" | "token";

export type IntegrationMode = "disabled" | "mock" | "staging" | "production";

export type MockPlayerProfile = {
  id: string;
  username: string;
  sessionWallet: string;
  goldBalance: number;
  kinsBalancePlaceholder: number;
};

export type MockInventoryItem = {
  itemId: string;
  itemType: string;
  name: string;
  displayName?: string;
  iconUrl?: string;
  category?: string;
  quantity: number;
  tradeable: boolean;
  reasonNotTradeable?: string;
  slotKind: "inventory" | "storage" | "equipment";
  slotIndex: number;
};

export type MockListing = {
  listingId: string;
  itemId: string;
  itemType: string;
  name: string;
  quantity: number;
  price: number;
  currency: OfficialCurrency;
  status: "active" | "cancelled" | "reserved" | "sold";
  createdAt: string;
};

export type MockReservation = {
  reservationId: string;
  listingId: string;
  expiresAt: string;
  createdAt: string;
};

export type MockTokenQuote = {
  quoteId: string;
  reservationId: string;
  amountKins: number;
  expiresAt: string;
  createdAt: string;
};

export type CreateListingInput = {
  itemId: string;
  quantity: number;
  price: number;
  currency: OfficialCurrency;
  slotKind: string;
  slotIndex: number;
};

export type CancelListingInput = {
  listingId: string;
};

export type ReserveInput = {
  listingId: string;
};

export type ReleaseInput = {
  reservationId: string;
};

export type TokenQuoteInput = {
  reservationId: string;
};

export type TokenConfirmInput = {
  reservationId: string;
  quoteId?: string;
};

export type GuardResult =
  | { ok: true }
  | { ok: false; error: string; status: number };
