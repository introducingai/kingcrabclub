import type {
  ApiEnvelope,
  DexScreenerPair,
  DexScreenerTokenResponse,
  TokenStats,
} from "./types";

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

export function selectBestSolanaPair(pairs: DexScreenerPair[] = []) {
  return pairs
    .filter((pair) => pair.chainId?.toLowerCase() === "solana")
    .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
}

export function normalizeDexPair(pair?: DexScreenerPair): TokenStats {
  if (!pair) {
    return {};
  }

  return {
    priceUsd: numberFrom(pair.priceUsd),
    liquidityUsd: numberFrom(pair.liquidity?.usd),
    volume24h: numberFrom(pair.volume?.h24),
    priceChange24h: numberFrom(pair.priceChange?.h24),
    fdv: numberFrom(pair.fdv),
    marketCap: numberFrom(pair.marketCap),
    pairUrl: pair.url,
  };
}

export async function fetchDexScreenerKinsPairs(): Promise<TokenStats> {
  const response = await fetch("/api/token/kins");
  const payload = (await response.json().catch(() => ({}))) as
    | TokenStats
    | ApiEnvelope<TokenStats>;
  const envelope = payload as ApiEnvelope<TokenStats>;

  if (!response.ok || envelope.ok === false) {
    const status = envelope.status ?? response.status;
    const source = envelope.source ? ` from ${envelope.source}` : "";

    throw new Error(
      `HTTP ${status}${source}: ${
        envelope.error ?? "KINS token stats are temporarily unavailable."
      }`,
    );
  }

  return envelope.ok === true && "data" in envelope
    ? (envelope.data ?? {})
    : (payload as TokenStats);
}

export function normalizeDexScreenerResponse(
  payload: DexScreenerTokenResponse,
): TokenStats {
  return normalizeDexPair(selectBestSolanaPair(payload.pairs));
}
