import type { ItemMetrics, MarketListing } from "./types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function numberFrom(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function explicitTokenTotal(listing: MarketListing) {
  const raw = asRecord(listing.raw);

  return (
    numberFrom(raw.priceToken) ??
    numberFrom(raw.tokenPrice) ??
    numberFrom(raw.priceKins) ??
    numberFrom(raw.kinsPrice) ??
    (listing.priceKind === "token" ? listing.price : undefined)
  );
}

function explicitUsdTotal(listing: MarketListing) {
  const raw = asRecord(listing.raw);

  return (
    listing.priceUsd ??
    numberFrom(raw.priceUsd) ??
    numberFrom(raw.usdPrice) ??
    numberFrom(raw.totalUsd)
  );
}

function median(values: number[]) {
  if (values.length === 0) {
    return undefined;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function average(values: number[]) {
  if (values.length === 0) {
    return undefined;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function cheapest(listings: MarketListing[]) {
  return [...listings].sort((a, b) => a.unitPrice - b.unitPrice)[0];
}

export function computeItemMetrics(
  listings: MarketListing[],
  itemType: string,
  kinsUsdPrice?: number,
): ItemMetrics {
  const itemListings = listings.filter(
    (listing) => listing.itemType === itemType && listing.quantity > 0,
  );
  const tokenListings = itemListings.filter((listing) => listing.currency === "token");
  const goldListings = itemListings.filter((listing) => listing.currency === "gold");
  const tokenUnitPrices = tokenListings
    .map((listing) => {
      const tokenTotal = explicitTokenTotal(listing);

      return tokenTotal ? tokenTotal / listing.quantity : listing.unitPrice;
    })
    .filter((value) => value > 0);
  const goldUnitPrices = goldListings
    .map((listing) => listing.price / listing.quantity)
    .filter((value) => value > 0);
  const cheapestTokenListing = cheapest(tokenListings);
  const cheapestGoldListing = cheapest(goldListings);
  const cheapestTokenTotal = cheapestTokenListing
    ? explicitTokenTotal(cheapestTokenListing)
    : undefined;
  const tokenFloorUnit = cheapestTokenListing
    ? cheapestTokenTotal
      ? cheapestTokenTotal / cheapestTokenListing.quantity
      : cheapestTokenListing.unitPrice
    : undefined;
  const goldFloorUnit = cheapestGoldListing
    ? cheapestGoldListing.price / cheapestGoldListing.quantity
    : undefined;
  const tokenListedValue = tokenListings.reduce((total, listing) => {
    const tokenTotal = explicitTokenTotal(listing);
    const usdTotal = explicitUsdTotal(listing);

    return total + (tokenTotal ?? usdTotal ?? listing.price);
  }, 0);
  const tokenListedValueUsd = tokenListings.reduce((total, listing) => {
    const usdTotal = explicitUsdTotal(listing);
    const tokenTotal = explicitTokenTotal(listing);

    if (usdTotal) {
      return total + usdTotal;
    }

    if (tokenTotal && kinsUsdPrice) {
      return total + tokenTotal * kinsUsdPrice;
    }

    return total;
  }, 0);
  const tokenFloorUsd =
    cheapestTokenListing?.unitPriceUsd ??
    (tokenFloorUnit && kinsUsdPrice ? tokenFloorUnit * kinsUsdPrice : undefined);

  return {
    itemType,
    activeListings: itemListings.length,
    listedQuantity: itemListings.reduce((total, listing) => total + listing.quantity, 0),
    tokenListings: tokenListings.length,
    goldListings: goldListings.length,
    tokenListedQuantity: tokenListings.reduce((total, listing) => total + listing.quantity, 0),
    goldListedQuantity: goldListings.reduce((total, listing) => total + listing.quantity, 0),
    tokenFloorUnit,
    goldFloorUnit,
    tokenMedianUnit: median(tokenUnitPrices),
    goldMedianUnit: median(goldUnitPrices),
    tokenAvgUnit: average(tokenUnitPrices),
    goldAvgUnit: average(goldUnitPrices),
    tokenListedValue,
    goldListedValue: goldListings.reduce((total, listing) => total + listing.price, 0),
    tokenFloorUsd,
    tokenListedValueUsd,
    cheapestTokenListing,
    cheapestGoldListing,
    sellers: new Set(itemListings.map((listing) => listing.seller).filter(Boolean)).size,
    updatedAt: new Date().toISOString(),
  };
}
