import type {
  MarketEvent,
  MarketEventType,
  MarketListing,
  MarketSummary,
} from "./types";

const LARGE_STACK_THRESHOLD = 100;

function currencyForEvent(currency: string): "gold" | "token" | undefined {
  return currency === "gold" || currency === "token" ? currency : undefined;
}

function eventId(
  type: MarketEventType,
  createdAt: string,
  listingId?: string,
  itemType?: string,
) {
  return [createdAt, type, listingId ?? itemType ?? "market"]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]/g, "-");
}

function listingLabel(listing: MarketListing) {
  return `${listing.itemName} x${listing.quantity}`;
}

function floorKey(listing: MarketListing) {
  return `${listing.itemType}:${listing.currency}`;
}

function floorMap(listings: MarketListing[]) {
  const map = new Map<string, MarketListing>();

  listings.forEach((listing) => {
    const key = floorKey(listing);
    const current = map.get(key);

    if (!current || listing.unitPrice < current.unitPrice) {
      map.set(key, listing);
    }
  });

  return map;
}

function makeEvent(
  type: MarketEventType,
  message: string,
  createdAt: string,
  listing?: MarketListing,
  payload?: Record<string, unknown>,
): MarketEvent {
  return {
    id: eventId(type, createdAt, listing?.id, listing?.itemType),
    type,
    listingId: listing?.id,
    itemType: listing?.itemType,
    currency: listing ? currencyForEvent(listing.currency) : undefined,
    message,
    createdAt,
    payload: listing
      ? {
          seller: listing.seller,
          itemName: listing.itemName,
          quantity: listing.quantity,
          unitPrice: listing.unitPrice,
          ...payload,
        }
      : payload,
  };
}

export function detectMarketEvents(
  previousListings: MarketListing[],
  nextListings: MarketListing[],
  createdAt = new Date().toISOString(),
) {
  const events: MarketEvent[] = [];
  const previousById = new Map(previousListings.map((listing) => [listing.id, listing]));
  const nextById = new Map(nextListings.map((listing) => [listing.id, listing]));
  const previousFloors = floorMap(previousListings);
  const nextFloors = floorMap(nextListings);

  nextListings.forEach((listing) => {
    const previous = previousById.get(listing.id);

    if (!previous) {
      events.push(
        makeEvent(
          "listing_created",
          `New listing: ${listingLabel(listing)} at ${listing.unitPrice} ${listing.currency} each.`,
          createdAt,
          listing,
          { price: listing.price, unitPrice: listing.unitPrice, quantity: listing.quantity },
        ),
      );

      if (listing.quantity >= LARGE_STACK_THRESHOLD) {
        events.push(
          makeEvent(
            "large_stack_listed",
            `Large stack listed: ${listingLabel(listing)}.`,
            createdAt,
            listing,
            { quantity: listing.quantity },
          ),
        );
      }

      return;
    }

    if (!previous.reserved && listing.reserved) {
      events.push(
        makeEvent("listing_reserved", `${listingLabel(listing)} was reserved.`, createdAt, listing),
      );
    }

    if (previous.reserved && !listing.reserved) {
      events.push(
        makeEvent(
          "listing_unreserved",
          `${listingLabel(listing)} returned to the market.`,
          createdAt,
          listing,
        ),
      );
    }
  });

  previousListings.forEach((listing) => {
    if (!nextById.has(listing.id)) {
      events.push(
        makeEvent("listing_removed", `${listingLabel(listing)} left the market.`, createdAt, listing),
      );
    }
  });

  nextFloors.forEach((nextFloor, key) => {
    const previousFloor = previousFloors.get(key);

    if (!previousFloor) {
      events.push(
        makeEvent(
          "new_floor_listing",
          `New floor for ${nextFloor.itemName}: ${nextFloor.unitPrice} ${nextFloor.currency}.`,
          createdAt,
          nextFloor,
          { unitPrice: nextFloor.unitPrice },
        ),
      );
      return;
    }

    if (previousFloor.id !== nextFloor.id || previousFloor.unitPrice !== nextFloor.unitPrice) {
      events.push(
        makeEvent(
          "floor_price_changed",
          `${nextFloor.itemName} floor moved from ${previousFloor.unitPrice} to ${nextFloor.unitPrice} ${nextFloor.currency}.`,
          createdAt,
          nextFloor,
          {
            previousUnitPrice: previousFloor.unitPrice,
            nextUnitPrice: nextFloor.unitPrice,
            previousListingId: previousFloor.id,
          },
        ),
      );

      if (previousFloor.id !== nextFloor.id) {
        events.push(
          makeEvent(
            "new_floor_listing",
            `New floor listing for ${nextFloor.itemName}: ${nextFloor.unitPrice} ${nextFloor.currency}.`,
            createdAt,
            nextFloor,
            { unitPrice: nextFloor.unitPrice },
          ),
        );
      }
    }
  });

  return events;
}

export function summarizeMarket(listings: MarketListing[]): MarketSummary {
  const floors = Array.from(floorMap(listings).values())
    .sort((a, b) => a.unitPrice - b.unitPrice)
    .slice(0, 8)
    .map((listing) => ({
      itemType: listing.itemType,
      itemName: listing.itemName,
      currency: listing.currency,
      floorPrice: listing.unitPrice,
      listingId: listing.id,
    }));

  return {
    activeListings: listings.length,
    tokenListings: listings.filter((listing) => listing.currency === "token").length,
    goldListings: listings.filter((listing) => listing.currency === "gold").length,
    uniqueItemTypes: new Set(listings.map((listing) => listing.itemType)).size,
    topItemFloors: floors,
    biggestListings: [...listings]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6),
  };
}
