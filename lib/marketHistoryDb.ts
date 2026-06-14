import "server-only";

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { computeItemMetrics } from "./itemMetrics";
import { normalizeListing } from "./kintaraApi";
import type {
  ItemMetricHistorySample,
  MarketEvent,
  MarketListing,
  MarketSellerMetricSample,
} from "./types";

type DbGlobal = typeof globalThis & {
  __kintaraMarketHistoryDb?: DatabaseSync;
};

type SnapshotRow = {
  capturedAt: string;
  listingId: string;
  itemType: string;
  sellerName: string | null;
  quantity: number;
  currency: string;
  price: number;
  unitPrice: number;
  status: string;
  createdAtRaw: string | null;
  rawJson: string;
};

type ItemMetricRow = ItemMetricHistorySample & {
  tokenListings: number;
  goldListings: number;
  tokenMedianUnit: number | null;
  goldMedianUnit: number | null;
  tokenAvgUnit: number | null;
  goldAvgUnit: number | null;
  tokenListedValueUsd: number | null;
};

type SellerMetricRow = MarketSellerMetricSample;

const migrationSql = readFileSync(
  join(process.cwd(), "db", "migrations", "001_market_history.sql"),
  "utf8",
);

function dbPath() {
  return (
    process.env.MARKET_HISTORY_DB_PATH ??
    join(process.cwd(), ".data", "kintara-market-history.sqlite")
  );
}

function database() {
  const globalDb = globalThis as DbGlobal;

  if (!globalDb.__kintaraMarketHistoryDb) {
    const path = dbPath();

    mkdirSync(dirname(path), { recursive: true });
    const db = new DatabaseSync(path);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA busy_timeout = 5000;");
    db.exec(migrationSql);
    globalDb.__kintaraMarketHistoryDb = db;
  }

  return globalDb.__kintaraMarketHistoryDb;
}

function minuteBucket(value: string) {
  const date = new Date(value);

  date.setSeconds(0, 0);

  return date.toISOString();
}

function rawJson(listing: MarketListing) {
  return JSON.stringify(listing.raw ?? listing);
}

function statusOf(listing: MarketListing) {
  return listing.reserved ? "reserved" : "active";
}

function sameNumber(a?: number | null, b?: number | null) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;

  return Math.abs(a - b) < 0.000001;
}

function materialListingKey(listing: MarketListing) {
  return [
    listing.id,
    listing.itemType,
    listing.seller ?? "",
    listing.quantity,
    listing.currency,
    listing.price,
    listing.unitPrice,
    listing.priceUsd ?? "",
    listing.unitPriceUsd ?? "",
    statusOf(listing),
  ].join("|");
}

function listingsChanged(previous: MarketListing[], next: MarketListing[]) {
  if (previous.length !== next.length) {
    return true;
  }

  const previousKeys = new Map(previous.map((listing) => [listing.id, materialListingKey(listing)]));

  return next.some((listing) => previousKeys.get(listing.id) !== materialListingKey(listing));
}

function rowToListing(row: SnapshotRow): MarketListing {
  try {
    return normalizeListing(JSON.parse(row.rawJson));
  } catch {
    return {
      id: row.listingId,
      itemType: row.itemType,
      itemName: row.itemType,
      quantity: row.quantity,
      seller: row.sellerName ?? undefined,
      currency: row.currency,
      price: row.price,
      unitPrice: row.unitPrice,
      reserved: row.status === "reserved",
      createdAt: row.createdAtRaw ?? undefined,
      raw: row.rawJson,
    };
  }
}

export function getLatestPersistedSnapshot() {
  const db = database();
  const latest = db
    .prepare("SELECT MAX(capturedAt) AS capturedAt FROM market_listing_snapshots")
    .get() as { capturedAt?: string | null } | undefined;

  if (!latest?.capturedAt) {
    return { capturedAt: undefined, listings: [] as MarketListing[] };
  }

  const rows = db
    .prepare("SELECT * FROM market_listing_snapshots WHERE capturedAt = ? ORDER BY id ASC")
    .all(latest.capturedAt) as SnapshotRow[];

  return {
    capturedAt: latest.capturedAt,
    listings: rows.map(rowToListing),
  };
}

export function getRecentPersistedEvents(limit = 100) {
  return rowsToEvents(
    database()
      .prepare("SELECT * FROM market_events ORDER BY createdAt DESC LIMIT ?")
      .all(limit) as EventRow[],
  );
}

export function getPersistedEventsForItem(itemType: string, range = "24h", limit = 100) {
  return rowsToEvents(
    database()
      .prepare(
        "SELECT * FROM market_events WHERE itemType = ? AND createdAt >= ? ORDER BY createdAt DESC LIMIT ?",
      )
      .all(itemType, sinceForRange(range), limit) as EventRow[],
  );
}

export function getPersistedEventsForSeller(sellerName: string, range = "24h", limit = 100) {
  return rowsToEvents(
    database()
      .prepare(
        "SELECT * FROM market_events WHERE lower(sellerName) = lower(?) AND createdAt >= ? ORDER BY createdAt DESC LIMIT ?",
      )
      .all(sellerName, sinceForRange(range), limit) as EventRow[],
  );
}

export function getPersistedItemHistory(itemType: string, range = "24h") {
  const rows = database()
    .prepare(
      "SELECT * FROM market_item_metrics WHERE itemType = ? AND capturedAt >= ? ORDER BY capturedAt ASC",
    )
    .all(itemType, sinceForRange(range)) as ItemMetricRow[];

  return rows.map((row) => ({
    itemType: row.itemType,
    capturedAt: row.capturedAt,
    tokenFloorUnit: row.tokenFloorUnit ?? undefined,
    goldFloorUnit: row.goldFloorUnit ?? undefined,
    tokenListedValue: row.tokenListedValue,
    goldListedValue: row.goldListedValue,
    tokenListedValueUsd: row.tokenListedValueUsd ?? undefined,
    listedQuantity: row.listedQuantity,
    activeListings: row.activeListings,
    tokenListings: row.tokenListings,
    goldListings: row.goldListings,
    tokenMedianUnit: row.tokenMedianUnit ?? undefined,
    goldMedianUnit: row.goldMedianUnit ?? undefined,
    tokenAvgUnit: row.tokenAvgUnit ?? undefined,
    goldAvgUnit: row.goldAvgUnit ?? undefined,
  }));
}

export function getPersistedSellerHistory(sellerName: string, range = "24h") {
  return database()
    .prepare(
      "SELECT * FROM market_seller_metrics WHERE lower(sellerName) = lower(?) AND capturedAt >= ? ORDER BY capturedAt ASC",
    )
    .all(sellerName, sinceForRange(range)) as SellerMetricRow[];
}

export function persistMarketFrame(
  listings: MarketListing[],
  events: MarketEvent[],
  generatedAt: string,
) {
  const db = database();
  const capturedAt = minuteBucket(generatedAt);
  const latest = getLatestPersistedSnapshot();

  db.exec("BEGIN IMMEDIATE");

  try {
    if (latest.capturedAt !== capturedAt || listingsChanged(latest.listings, listings)) {
      db.prepare("DELETE FROM market_listing_snapshots WHERE capturedAt = ?").run(capturedAt);
      const insertSnapshot = db.prepare(`
        INSERT INTO market_listing_snapshots (
          capturedAt, listingId, itemType, sellerName, quantity, currency, price, unitPrice,
          status, createdAtRaw, rawJson
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const listing of listings) {
        insertSnapshot.run(
          capturedAt,
          listing.id,
          listing.itemType,
          listing.seller ?? null,
          listing.quantity,
          listing.currency,
          listing.price,
          listing.unitPrice,
          statusOf(listing),
          listing.createdAt ?? null,
          rawJson(listing),
        );
      }
    }

    writeItemMetrics(db, listings, capturedAt);
    writeSellerMetrics(db, listings, capturedAt);
    writeEvents(db, events);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function writeItemMetrics(db: DatabaseSync, listings: MarketListing[], capturedAt: string) {
  const itemTypes = Array.from(new Set(listings.map((listing) => listing.itemType)));
  const deleteMetric = db.prepare(
    "DELETE FROM market_item_metrics WHERE capturedAt = ? AND itemType = ?",
  );
  const insertMetric = db.prepare(`
    INSERT INTO market_item_metrics (
      capturedAt, itemType, activeListings, listedQuantity, tokenListings, goldListings,
      tokenFloorUnit, goldFloorUnit, tokenMedianUnit, goldMedianUnit, tokenAvgUnit, goldAvgUnit,
      tokenListedValue, goldListedValue, tokenListedValueUsd
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const itemType of itemTypes) {
    const metrics = computeItemMetrics(listings, itemType);
    const previous = db
      .prepare(
        "SELECT * FROM market_item_metrics WHERE itemType = ? ORDER BY capturedAt DESC LIMIT 1",
      )
      .get(itemType) as ItemMetricRow | undefined;

    if (previous?.capturedAt !== capturedAt && !itemMetricsChanged(previous, metrics)) {
      continue;
    }

    deleteMetric.run(capturedAt, itemType);
    insertMetric.run(
      capturedAt,
      itemType,
      metrics.activeListings,
      metrics.listedQuantity,
      metrics.tokenListings,
      metrics.goldListings,
      metrics.tokenFloorUnit ?? null,
      metrics.goldFloorUnit ?? null,
      metrics.tokenMedianUnit ?? null,
      metrics.goldMedianUnit ?? null,
      metrics.tokenAvgUnit ?? null,
      metrics.goldAvgUnit ?? null,
      metrics.tokenListedValue,
      metrics.goldListedValue,
      metrics.tokenListedValueUsd ?? null,
    );
  }
}

function writeSellerMetrics(db: DatabaseSync, listings: MarketListing[], capturedAt: string) {
  const sellerNames = Array.from(
    new Set(listings.map((listing) => listing.seller).filter(Boolean) as string[]),
  );
  const deleteMetric = db.prepare(
    "DELETE FROM market_seller_metrics WHERE capturedAt = ? AND sellerName = ?",
  );
  const insertMetric = db.prepare(`
    INSERT INTO market_seller_metrics (
      capturedAt, sellerName, activeListings, listedQuantity, tokenListings, goldListings,
      tokenListedValue, goldListedValue, uniqueItemTypes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const sellerName of sellerNames) {
    const sellerListings = listings.filter((listing) => listing.seller === sellerName);
    const metric = computeSellerMetric(sellerName, sellerListings, capturedAt);
    const previous = db
      .prepare(
        "SELECT * FROM market_seller_metrics WHERE lower(sellerName) = lower(?) ORDER BY capturedAt DESC LIMIT 1",
      )
      .get(sellerName) as SellerMetricRow | undefined;

    if (previous?.capturedAt !== capturedAt && !sellerMetricsChanged(previous, metric)) {
      continue;
    }

    deleteMetric.run(capturedAt, sellerName);
    insertMetric.run(
      capturedAt,
      sellerName,
      metric.activeListings,
      metric.listedQuantity,
      metric.tokenListings,
      metric.goldListings,
      metric.tokenListedValue,
      metric.goldListedValue,
      metric.uniqueItemTypes,
    );
  }
}

function computeSellerMetric(
  sellerName: string,
  listings: MarketListing[],
  capturedAt: string,
): MarketSellerMetricSample {
  const tokenListings = listings.filter((listing) => listing.currency === "token");
  const goldListings = listings.filter((listing) => listing.currency === "gold");

  return {
    capturedAt,
    sellerName,
    activeListings: listings.length,
    listedQuantity: listings.reduce((total, listing) => total + listing.quantity, 0),
    tokenListings: tokenListings.length,
    goldListings: goldListings.length,
    tokenListedValue: tokenListings.reduce(
      (total, listing) => total + (listing.priceUsd ?? listing.price),
      0,
    ),
    goldListedValue: goldListings.reduce((total, listing) => total + listing.price, 0),
    uniqueItemTypes: new Set(listings.map((listing) => listing.itemType)).size,
  };
}

function itemMetricsChanged(previous: ItemMetricRow | undefined, next: ReturnType<typeof computeItemMetrics>) {
  if (!previous) return true;

  return (
    previous.activeListings !== next.activeListings ||
    previous.listedQuantity !== next.listedQuantity ||
    previous.tokenListings !== next.tokenListings ||
    previous.goldListings !== next.goldListings ||
    !sameNumber(previous.tokenFloorUnit, next.tokenFloorUnit) ||
    !sameNumber(previous.goldFloorUnit, next.goldFloorUnit) ||
    !sameNumber(previous.tokenMedianUnit, next.tokenMedianUnit) ||
    !sameNumber(previous.goldMedianUnit, next.goldMedianUnit) ||
    !sameNumber(previous.tokenAvgUnit, next.tokenAvgUnit) ||
    !sameNumber(previous.goldAvgUnit, next.goldAvgUnit) ||
    !sameNumber(previous.tokenListedValue, next.tokenListedValue) ||
    !sameNumber(previous.goldListedValue, next.goldListedValue) ||
    !sameNumber(previous.tokenListedValueUsd, next.tokenListedValueUsd)
  );
}

function sellerMetricsChanged(
  previous: MarketSellerMetricSample | undefined,
  next: MarketSellerMetricSample,
) {
  if (!previous) return true;

  return (
    previous.activeListings !== next.activeListings ||
    previous.listedQuantity !== next.listedQuantity ||
    previous.tokenListings !== next.tokenListings ||
    previous.goldListings !== next.goldListings ||
    previous.uniqueItemTypes !== next.uniqueItemTypes ||
    !sameNumber(previous.tokenListedValue, next.tokenListedValue) ||
    !sameNumber(previous.goldListedValue, next.goldListedValue)
  );
}

type EventRow = {
  id: string;
  createdAt: string;
  type: MarketEvent["type"];
  listingId: string | null;
  itemType: string | null;
  sellerName: string | null;
  currency: "gold" | "token" | null;
  message: string;
  payloadJson: string | null;
};

function writeEvents(db: DatabaseSync, events: MarketEvent[]) {
  const insertEvent = db.prepare(`
    INSERT OR IGNORE INTO market_events (
      id, createdAt, type, listingId, itemType, sellerName, currency, message, payloadJson
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const event of events) {
    insertEvent.run(
      event.id,
      event.createdAt,
      event.type,
      event.listingId ? String(event.listingId) : null,
      event.itemType ?? null,
      typeof event.payload?.seller === "string" ? event.payload.seller : null,
      event.currency ?? null,
      event.message,
      event.payload ? JSON.stringify(event.payload) : null,
    );
  }
}

function rowsToEvents(rows: EventRow[]): MarketEvent[] {
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    type: row.type,
    listingId: row.listingId ?? undefined,
    itemType: row.itemType ?? undefined,
    currency: row.currency ?? undefined,
    message: row.message,
    payload: row.payloadJson ? JSON.parse(row.payloadJson) : undefined,
  }));
}

export function sinceForRange(range: string) {
  const now = Date.now();
  const ms =
    range === "1h"
      ? 60 * 60 * 1000
      : range === "7d"
        ? 7 * 24 * 60 * 60 * 1000
        : range === "30d"
          ? 30 * 24 * 60 * 60 * 1000
          : 24 * 60 * 60 * 1000;

  return new Date(now - ms).toISOString();
}

export function hasMarketHistoryDatabase() {
  return existsSync(dbPath());
}
