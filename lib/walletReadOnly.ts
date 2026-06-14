export type KinsBalanceResponse = {
  ok: true;
  wallet: string;
  kinsMint: string;
  balanceRaw: string;
  balanceUi: number;
  updatedAt: string;
};

type RpcTokenAccount = {
  account?: {
    data?: {
      parsed?: {
        info?: {
          tokenAmount?: {
            amount?: string;
            uiAmount?: number | null;
            decimals?: number;
          };
        };
      };
    };
  };
};

type RpcTokenAccountsResponse = {
  result?: {
    value?: RpcTokenAccount[];
  };
  error?: {
    message?: string;
  };
};

export function getKinsMint() {
  return (
    process.env.KINS_MINT ??
    process.env.NEXT_PUBLIC_KINS_MINT ??
    "Tqj8yFmagrg7oorpQkVGYR52r96RFTamvWfth9bpump"
  );
}

export async function fetchKinsBalance(wallet: string): Promise<KinsBalanceResponse> {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const kinsMint = getKinsMint();

  if (!rpcUrl) {
    throw new Error("SOLANA_RPC_URL is not configured. Add it server-side to enable KINS balance lookup.");
  }

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "kins-balance",
      method: "getTokenAccountsByOwner",
      params: [
        wallet,
        { mint: kinsMint },
        { encoding: "jsonParsed" },
      ],
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as RpcTokenAccountsResponse;

  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? `Solana RPC returned HTTP ${response.status}.`);
  }

  const accounts = payload.result?.value ?? [];
  const balanceRawBigInt = accounts.reduce((total, account) => {
    const rawAmount = account.account?.data?.parsed?.info?.tokenAmount?.amount ?? "0";

    return total + BigInt(rawAmount);
  }, BigInt(0));
  const balanceUi = accounts.reduce((total, account) => {
    const tokenAmount = account.account?.data?.parsed?.info?.tokenAmount;

    if (typeof tokenAmount?.uiAmount === "number") {
      return total + tokenAmount.uiAmount;
    }

    const amount = Number(tokenAmount?.amount ?? 0);
    const decimals = tokenAmount?.decimals ?? 0;

    return total + amount / 10 ** decimals;
  }, 0);

  return {
    ok: true,
    wallet,
    kinsMint,
    balanceRaw: balanceRawBigInt.toString(),
    balanceUi,
    updatedAt: new Date().toISOString(),
  };
}
