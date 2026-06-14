import type {
  ApiEnvelope,
  ListingQuery,
  LiveMarketResponse,
  MarketEvent,
} from "./types";

function listingSearch(params: ListingQuery = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "all") {
      return;
    }

    search.set(key, value === true ? "1" : String(value));
  });

  return search.toString();
}

export async function fetchLiveMarket(
  params: ListingQuery = {},
): Promise<LiveMarketResponse> {
  const search = listingSearch(params);
  const response = await fetch(`/api/market/live${search ? `?${search}` : ""}`);
  const payload = (await response.json().catch(() => ({}))) as
    | LiveMarketResponse
    | ApiEnvelope;

  if (!response.ok || !("ok" in payload) || payload.ok !== true) {
    const error = "error" in payload ? payload.error : undefined;
    const status = "status" in payload ? payload.status : response.status;
    const source = "source" in payload && payload.source ? ` from ${payload.source}` : "";

    throw new Error(`HTTP ${status}${source}: ${error ?? "Live market data unavailable."}`);
  }

  return payload as LiveMarketResponse;
}

export async function fetchMarketEvents() {
  const response = await fetch("/api/market/events");
  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    events?: MarketEvent[];
    error?: string;
  };

  if (!response.ok || payload.ok !== true) {
    throw new Error(payload.error ?? "Market events are unavailable.");
  }

  return payload.events ?? [];
}
