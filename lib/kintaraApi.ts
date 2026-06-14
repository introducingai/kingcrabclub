import type {
  ApiEnvelope,
  ApiErrorPayload,
  ItemStatPoint,
  ItemStatsResponse,
  ListingQuery,
  ListingsResponse,
  MarketListing,
} from "./types";

const CORS_HELP =
  "Kintara marketplace data is not publicly accessible from this companion yet. This likely needs an official API key, same-origin deployment, or approved integration.";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function pickString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.length > 0) {
      return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function pickNumber(record: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function pickBoolean(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }
  }

  return undefined;
}

function displayNameFromItemType(itemType: string) {
  return itemType
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pickListingPrice(record: Record<string, unknown>, currency: string) {
  if (currency === "token") {
    return pickNumber(
      record,
      ["priceToken", "tokenPrice", "priceKins", "priceUsd", "price", "totalPrice"],
    );
  }

  if (currency === "gold") {
    return pickNumber(record, ["priceGold", "goldPrice", "price", "totalPrice"]);
  }

  return pickNumber(record, [
    "price",
    "totalPrice",
    "amount",
    "listPrice",
    "priceGold",
    "priceToken",
    "priceUsd",
  ]);
}

function hasNumber(record: Record<string, unknown>, keys: string[]) {
  return keys.some((key) => {
    const value = record[key];

    return (
      (typeof value === "number" && Number.isFinite(value)) ||
      (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))
    );
  });
}

function unwrapListingCollection(payload: unknown): unknown[] {
  const envelopeData = asRecord(payload).data;

  if (envelopeData) {
    return unwrapListingCollection(envelopeData);
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);

  for (const key of ["listings", "items", "data", "results"]) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function unwrapStatCollection(payload: unknown): unknown[] {
  const envelopeData = asRecord(payload).data;

  if (envelopeData) {
    return unwrapStatCollection(envelopeData);
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);

  for (const key of ["points", "history", "daily", "data", "stats", "samples"]) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & ApiErrorPayload;
  const envelope = payload as ApiEnvelope<T>;

  if (!response.ok || envelope.ok === false) {
    const status = envelope.status ?? response.status;
    const source = envelope.source ? ` from ${envelope.source}` : "";
    const error = payload.message ?? payload.error ?? CORS_HELP;

    throw new Error(`HTTP ${status}${source}: ${error}`);
  }

  if (envelope.ok === true && "data" in envelope) {
    return envelope.data as T;
  }

  return payload;
}

export function normalizeListing(raw: unknown): MarketListing {
  const record = asRecord(raw);
  const item = asRecord(record.item);
  const currency = pickString(record, ["currency", "denom", "paymentCurrency"]) ?? "gold";
  const price = pickListingPrice(record, currency);
  const priceUsd = pickNumber(record, ["priceUsd", "usdPrice", "totalUsd"], NaN);
  const hasExplicitTokenPrice = hasNumber(record, [
    "priceToken",
    "tokenPrice",
    "priceKins",
    "kinsPrice",
  ]);
  const quantity = Math.max(1, pickNumber(record, ["quantity", "qty", "amountListed"], 1));
  const explicitUnitPrice = pickNumber(record, ["unitPrice", "priceEach", "avgUnitPrice"], NaN);
  const itemType =
    pickString(record, ["itemType", "type", "sku"]) ??
    pickString(item, ["itemType", "type", "id"]) ??
    "unknown-item";

  return {
    id:
      pickString(record, ["id", "listingId", "_id"]) ??
      `${itemType}-${pickString(record, ["seller", "sellerId", "owner"]) ?? "seller"}-${price}`,
    itemType,
    itemName:
      pickString(record, ["itemName", "name", "title"]) ??
      pickString(item, ["itemName", "name", "title"]) ??
      displayNameFromItemType(itemType),
    category:
      pickString(record, ["category", "itemCategory"]) ??
      pickString(item, ["category", "itemCategory"]),
    iconUrl:
      pickString(record, ["iconUrl", "imageUrl", "image"]) ??
      pickString(item, ["iconUrl", "imageUrl", "image"]),
    quantity,
    seller: pickString(record, [
      "sellerName",
      "seller",
      "sellerId",
      "owner",
      "wallet",
      "ownerAddress",
    ]),
    currency,
    price,
    unitPrice: Number.isFinite(explicitUnitPrice) ? explicitUnitPrice : price / quantity,
    priceUsd: Number.isFinite(priceUsd) ? priceUsd : undefined,
    unitPriceUsd: Number.isFinite(priceUsd) ? priceUsd / quantity : undefined,
    priceKind:
      currency === "gold"
        ? "gold"
        : currency === "token" && hasExplicitTokenPrice
          ? "token"
          : currency === "token" && Number.isFinite(priceUsd)
            ? "usd"
            : "unknown",
    reserved:
      pickBoolean(record, ["reserved", "isReserved", "hasReserve"]) ??
      Boolean(record.reservedBy),
    createdAt: pickString(record, ["createdAt", "created_at", "listedAt", "updatedAt"]),
    raw,
  };
}

export function normalizeItemStats(
  payload: unknown,
  itemType: string,
  currency?: string,
): ItemStatsResponse {
  const record = asRecord(payload);
  const points = unwrapStatCollection(payload).map((rawPoint) => {
    const point = asRecord(rawPoint);

    return {
      date: pickString(point, ["date", "day", "createdAt"]) ?? "",
      avgUnitPrice: pickNumber(point, ["avgUnitPrice", "averageUnitPrice", "avgPrice", "price"]),
      floorPrice: pickNumber(point, ["floorPrice", "minPrice"], NaN),
      salesCount: pickNumber(point, ["salesCount", "count", "sales"], NaN),
      volume: pickNumber(point, ["volume", "totalVolume"], NaN),
    } satisfies ItemStatPoint;
  });

  const usablePoints = points.filter(
    (point) => point.date && Number.isFinite(point.avgUnitPrice),
  );
  const positivePrices = usablePoints
    .map((point) =>
      Number.isFinite(point.floorPrice)
        ? point.floorPrice ?? point.avgUnitPrice
        : point.avgUnitPrice,
    )
    .filter((price) => price > 0);
  const floorFromPoints = Math.min(...positivePrices);
  const average30d =
    usablePoints.length > 0
      ? usablePoints
          .slice(-30)
          .reduce((total, point) => total + point.avgUnitPrice, 0) /
        Math.min(30, usablePoints.length)
      : undefined;

  return {
    itemType,
    currency: currency ?? pickString(record, ["currency"]),
    points: usablePoints,
    floorPrice:
      pickNumber(record, ["floorPrice", "currentFloor", "minPrice"], NaN) ||
      (Number.isFinite(floorFromPoints) ? floorFromPoints : undefined),
    average30d: pickNumber(record, ["average30d", "avg30d"], NaN) || average30d,
    salesCount:
      pickNumber(record, ["salesCount", "count", "totalSales"], NaN) ||
      usablePoints.reduce((total, point) => total + (point.salesCount ?? 0), 0),
    sourceMessage: pickString(record, ["message"]),
  };
}

export async function fetchListings(params: ListingQuery = {}): Promise<ListingsResponse> {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "all") {
      return;
    }

    search.set(key, value === true ? "1" : String(value));
  });

  const response = await fetch(`/api/kintara/listings?${search.toString()}`);
  const payload = await readJson<unknown>(response);
  const record = asRecord(payload);

  return {
    listings: unwrapListingCollection(payload).map(normalizeListing),
    total: pickNumber(record, ["total", "count"], undefined as unknown as number),
    sourceMessage: pickString(record, ["message"]),
  };
}

export async function fetchItemStats(
  itemType: string,
  currency?: string,
): Promise<ItemStatsResponse> {
  const search = new URLSearchParams({ itemType });

  if (currency && currency !== "all") {
    search.set("currency", currency);
  }

  const response = await fetch(`/api/kintara/stats?${search.toString()}`);
  const payload = await readJson<unknown>(response);

  return normalizeItemStats(payload, itemType, currency);
}

export { CORS_HELP };
