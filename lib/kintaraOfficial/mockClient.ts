import type {
  CancelListingInput,
  CreateListingInput,
  MockInventoryItem,
  MockListing,
  MockPlayerProfile,
  MockReservation,
  MockTokenQuote,
  ReleaseInput,
  ReserveInput,
  TokenConfirmInput,
  TokenQuoteInput,
} from "./types";

type MockState = {
  profile: MockPlayerProfile;
  inventory: MockInventoryItem[];
  listings: MockListing[];
  reservations: MockReservation[];
  quotes: MockTokenQuote[];
};

const globalMockState = globalThis as typeof globalThis & {
  __kintaraOfficialMockState?: MockState;
};

const initialState: MockState = {
  profile: {
    id: "mock-player-001",
    username: "Mock Adventurer",
    sessionWallet: "MockSessionWallet111111111111111111111111111",
    goldBalance: 12500,
    kinsBalancePlaceholder: 420.69,
  },
  inventory: [
    {
      itemId: "inv-wood-01",
      itemType: "wood",
      name: "Wood",
      displayName: "Wood",
      category: "Resource",
      quantity: 500,
      tradeable: true,
      slotKind: "inventory",
      slotIndex: 0,
    },
    {
      itemId: "inv-fish-01",
      itemType: "cooked_fish_meat",
      name: "Cooked Fish Meat",
      displayName: "Cooked Fish Meat",
      category: "Food",
      quantity: 72,
      tradeable: true,
      slotKind: "inventory",
      slotIndex: 1,
    },
    {
      itemId: "inv-dragon-01",
      itemType: "mount_dragon",
      name: "Dragon Mount",
      displayName: "Dragon Mount",
      category: "Mount",
      quantity: 1,
      tradeable: false,
      reasonNotTradeable: "Equipped or soulbound in mock data.",
      slotKind: "equipment",
      slotIndex: 3,
    },
  ],
  listings: [],
  reservations: [],
  quotes: [],
};

const state = (globalMockState.__kintaraOfficialMockState ??= structuredClone(initialState));

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const mockKintaraClient = {
  me() {
    return state.profile;
  },

  inventory() {
    return state.inventory;
  },

  listings() {
    return state.listings;
  },

  createListing(input: CreateListingInput) {
    const item = state.inventory.find((inventoryItem) => inventoryItem.itemId === input.itemId);

    if (!item) {
      throw new Error("item_not_found");
    }

    const listing: MockListing = {
      listingId: id("listing"),
      itemId: input.itemId,
      itemType: item.itemType,
      name: item.name,
      quantity: input.quantity,
      price: input.price,
      currency: input.currency,
      status: "active",
      createdAt: now(),
    };

    state.listings.unshift(listing);

    return listing;
  },

  cancelListing(input: CancelListingInput) {
    const listing = state.listings.find((candidate) => candidate.listingId === input.listingId);

    if (!listing) {
      throw new Error("listing_not_found");
    }

    listing.status = "cancelled";

    return listing;
  },

  reserve(input: ReserveInput) {
    const listing = state.listings.find(
      (candidate) => candidate.listingId === input.listingId && candidate.status === "active",
    );

    if (!listing) {
      throw new Error("listing_not_found");
    }

    listing.status = "reserved";

    const reservation: MockReservation = {
      reservationId: id("reservation"),
      listingId: input.listingId,
      createdAt: now(),
      expiresAt: new Date(Date.now() + 90000).toISOString(),
    };

    state.reservations.unshift(reservation);

    return reservation;
  },

  release(input: ReleaseInput) {
    const reservation = state.reservations.find(
      (candidate) => candidate.reservationId === input.reservationId,
    );

    if (!reservation) {
      throw new Error("reservation_not_found");
    }

    const listing = state.listings.find((candidate) => candidate.listingId === reservation.listingId);

    if (listing && listing.status === "reserved") {
      listing.status = "active";
    }

    state.reservations = state.reservations.filter(
      (candidate) => candidate.reservationId !== input.reservationId,
    );

    return reservation;
  },

  tokenQuote(input: TokenQuoteInput) {
    const reservation = state.reservations.find(
      (candidate) => candidate.reservationId === input.reservationId,
    );

    if (!reservation) {
      throw new Error("reservation_not_found");
    }

    const listing = state.listings.find((candidate) => candidate.listingId === reservation.listingId);

    if (!listing) {
      throw new Error("listing_not_found");
    }

    const quote: MockTokenQuote = {
      quoteId: id("quote"),
      reservationId: reservation.reservationId,
      amountKins: listing.currency === "token" ? listing.price : listing.price * 8,
      createdAt: now(),
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };

    state.quotes.unshift(quote);

    return quote;
  },

  tokenConfirm(input: TokenConfirmInput) {
    const reservation = state.reservations.find(
      (candidate) => candidate.reservationId === input.reservationId,
    );

    if (!reservation) {
      throw new Error("reservation_not_found");
    }

    const listing = state.listings.find((candidate) => candidate.listingId === reservation.listingId);

    if (!listing) {
      throw new Error("listing_not_found");
    }

    listing.status = "sold";
    state.reservations = state.reservations.filter(
      (candidate) => candidate.reservationId !== input.reservationId,
    );

    return {
      completed: true,
      listing,
      quoteId: input.quoteId,
      completedAt: now(),
      note: "Mock completion only. No wallet signature or token transfer occurred.",
    };
  },
};
