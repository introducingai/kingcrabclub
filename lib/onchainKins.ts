type RawKinsTransfer = Record<string, unknown>;

export type KinsTransfer = {
  signature?: string;
  from?: string;
  to?: string;
  amount?: number;
  blockTime?: string;
  raw: RawKinsTransfer;
};

export async function fetchKinsTransfers(): Promise<KinsTransfer[]> {
  // TODO: Add an official Solana RPC/indexer provider and marketplace payment
  // address allowlist before using transfers for intelligence.
  return [];
}

export async function fetchKinsDexStats() {
  // DexScreener remains the source for token market stats in this MVP.
  // Marketplace listings are game-server state, while KINS payments may happen
  // on-chain. These are related signals, not interchangeable sources of truth.
  return undefined;
}

export function normalizeKinsTransfer(raw: RawKinsTransfer): KinsTransfer {
  return {
    signature: typeof raw.signature === "string" ? raw.signature : undefined,
    from: typeof raw.from === "string" ? raw.from : undefined,
    to: typeof raw.to === "string" ? raw.to : undefined,
    amount: typeof raw.amount === "number" ? raw.amount : undefined,
    blockTime: typeof raw.blockTime === "string" ? raw.blockTime : undefined,
    raw,
  };
}

// Marketplace listings are game-server state. KINS payments may be on-chain,
// but on-chain transfers cannot fully identify item or listing metadata unless
// Kintara encodes it in transaction data or provides an official mapping.
// Treasury/payment address discovery is required before correlating token
// transfers to marketplace sales.
