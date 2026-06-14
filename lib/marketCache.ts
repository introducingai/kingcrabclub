import { detectMarketEvents, summarizeMarket } from "./marketDiff";
import {
  getLatestPersistedSnapshot,
  getRecentPersistedEvents,
  persistMarketFrame,
} from "./marketHistoryDb";
import type { LiveMarketResponse, MarketEvent, MarketListing } from "./types";

type MarketCacheState = {
  listings: MarketListing[];
  events: MarketEvent[];
  lastGeneratedAt?: string;
  lastSuccessAt?: string;
  lastError?: string;
};

const globalMarketCache = globalThis as typeof globalThis & {
  __kintaraMarketCache?: MarketCacheState;
};

const cache = (globalMarketCache.__kintaraMarketCache ??= {
  listings: [],
  events: [],
});

// TODO: Replace module memory with Redis/Postgres persistence for production.
// Serverless runtimes can discard module state between requests or isolate it per region.

export function getMarketEvents() {
  const persisted = getRecentPersistedEvents(100);

  return persisted.length > 0 ? persisted : cache.events.slice(0, 100);
}

export function getLastListings() {
  return cache.listings;
}

export function recordMarketSnapshot(listings: MarketListing[]): LiveMarketResponse {
  const generatedAt = new Date().toISOString();
  const persistedSnapshot = cache.listings.length > 0 ? undefined : getLatestPersistedSnapshot();
  const previousListings = cache.listings.length > 0
    ? cache.listings
    : persistedSnapshot?.listings ?? [];
  const events =
    previousListings.length > 0
      ? detectMarketEvents(previousListings, listings, generatedAt)
      : [];

  cache.listings = listings;
  cache.lastGeneratedAt = generatedAt;
  cache.lastSuccessAt = generatedAt;
  cache.lastError = undefined;
  cache.events = [...events, ...cache.events].slice(0, 100);
  try {
    persistMarketFrame(listings, events, generatedAt);
  } catch (error) {
    console.error("Persistent market history write failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return {
    ok: true,
    generatedAt,
    listings,
    summary: summarizeMarket(listings),
    events: getMarketEvents(),
    stale: false,
  };
}

export function recordMarketFailure(error: string): LiveMarketResponse | undefined {
  cache.lastError = error;

  const persistedSnapshot = cache.listings.length > 0 ? undefined : getLatestPersistedSnapshot();
  const fallbackListings = cache.listings.length > 0
    ? cache.listings
    : persistedSnapshot?.listings ?? [];

  if (fallbackListings.length === 0) {
    return undefined;
  }

  const generatedAt = new Date().toISOString();

  return {
    ok: true,
    generatedAt,
    listings: fallbackListings,
    summary: summarizeMarket(fallbackListings),
    events: [],
    stale: true,
    warning: error,
  };
}
