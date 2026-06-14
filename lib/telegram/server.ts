import "server-only";

import { formatMarketPulseForTelegram } from "./format";
import type { LiveMarketResponse } from "../types";

export async function fetchLiveMarketForTelegram(origin: string) {
  const response = await fetch(`${origin}/api/market/live?sort=latest&limit=120&offset=0`, {
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as
    | LiveMarketResponse
    | { ok?: boolean; error?: string; status?: number };

  if (!response.ok || payload.ok !== true) {
    throw new Error("error" in payload && payload.error ? payload.error : `market_http_${response.status}`);
  }

  return payload as LiveMarketResponse;
}

export async function buildMarketPulseMessage(origin: string) {
  const live = await fetchLiveMarketForTelegram(origin);

  return formatMarketPulseForTelegram(live);
}
