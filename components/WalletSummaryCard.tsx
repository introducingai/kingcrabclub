"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Copy, ExternalLink, LogOut, Wallet } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { featureFlags } from "@/lib/featureFlags";
import { formatNumber, formatRelativeSeconds, shortAddress } from "@/lib/format";

type WalletState = "disconnected" | "connecting" | "connected" | "error";

type SolanaProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
};

declare global {
  interface Window {
    solana?: SolanaProvider;
  }
}

type KinsBalancePayload =
  | {
      ok: true;
      wallet: string;
      kinsMint: string;
      balanceRaw: string;
      balanceUi: number;
      updatedAt: string;
    }
  | {
      ok: false;
      error?: string;
      setupRequired?: boolean;
    };

async function fetchKinsBalance(wallet: string) {
  const response = await fetch(
    `/api/wallet/kins-balance?wallet=${encodeURIComponent(wallet)}`,
  );
  const payload = (await response.json().catch(() => ({}))) as KinsBalancePayload;

  if (!response.ok || payload.ok !== true) {
    throw new Error(
      payload.ok === false
        ? payload.error === "missing_solana_rpc_url"
          ? "SOLANA_RPC_URL is not configured. Add it server-side to enable KINS balance lookup."
          : payload.error ?? "KINS balance unavailable."
        : "KINS balance unavailable.",
    );
  }

  return payload;
}

export function WalletSummaryCard() {
  const [state, setState] = useState<WalletState>("disconnected");
  const [wallet, setWallet] = useState<string>();
  const [error, setError] = useState<string>();
  const balanceQuery = useQuery({
    queryKey: ["kins-balance", wallet],
    queryFn: () => fetchKinsBalance(wallet ?? ""),
    enabled: Boolean(wallet),
    refetchInterval: 30000,
    placeholderData: (previousData) => previousData,
  });

  async function connect() {
    if (!featureFlags.walletReadonly) {
      setState("error");
      setError("Read-only wallet connection is disabled by feature flag.");
      return;
    }

    const provider = window.solana;

    if (!provider) {
      setState("error");
      setError("No Solana wallet provider was found in this browser.");
      return;
    }

    setState("connecting");
    setError(undefined);

    try {
      // Read-only public key request only. No message signing or transactions.
      const result = await provider.connect();
      setWallet(result.publicKey.toString());
      setState("connected");
    } catch (connectError) {
      setState("error");
      setError(connectError instanceof Error ? connectError.message : "Wallet connection failed.");
    }
  }

  async function disconnect() {
    await window.solana?.disconnect().catch(() => undefined);
    setWallet(undefined);
    setState("disconnected");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Wallet Summary
        </CardTitle>
        <Badge variant="secondary">Read-only</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border-2 bg-muted/25 p-3 text-sm text-muted-foreground">
          Read-only wallet connection. No transactions requested.
        </div>

        {state === "connected" && wallet ? (
          <>
            <div className="rounded-lg border-2 bg-muted/25 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Public key
              </p>
              <p className="mt-2 break-all font-semibold">{wallet}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(wallet)}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Link
                  href={`https://solscan.io/account/${wallet}`}
                  target="_blank"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border-2 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  <ExternalLink className="h-4 w-4" />
                  Solscan
                </Link>
                <Button variant="ghost" onClick={disconnect}>
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </div>

            <div className="rounded-lg border-2 bg-muted/25 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                KINS balance
              </p>
              {balanceQuery.isError ? (
                <p className="mt-2 text-sm leading-6 text-amber-200">
                  {(balanceQuery.error as Error).message}
                </p>
              ) : (
                <>
                  <p className="mt-2 text-3xl font-semibold">
                    {balanceQuery.isLoading
                      ? "..."
                      : formatNumber(balanceQuery.data?.balanceUi, 4)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated {formatRelativeSeconds(balanceQuery.data?.updatedAt)}
                  </p>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <Button disabled={state === "connecting"} onClick={connect}>
              <Wallet className="h-4 w-4" />
              {state === "connecting" ? "Connecting" : "Connect wallet"}
            </Button>
            {state === "error" && error ? (
              <p className="rounded-lg border-2 border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>
        )}

        {wallet ? (
          <p className="text-xs text-muted-foreground">
            Connected as {shortAddress(wallet)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
