"use client";

import Link from "next/link";
import { Activity, ExternalLink, Gem } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatCompact, formatUsd } from "@/lib/format";
import type { TokenStats } from "@/lib/types";

export function TokenStatsCard({
  stats,
  isLoading,
  error,
}: {
  stats?: TokenStats;
  isLoading?: boolean;
  error?: Error | null;
}) {
  const mint =
    process.env.NEXT_PUBLIC_KINS_MINT ??
    "Tqj8yFmagrg7oorpQkVGYR52r96RFTamvWfth9bpump";
  const change = stats?.priceChange24h;
  const changeTone =
    typeof change === "number" && change < 0 ? "text-destructive" : "text-accent-foreground";

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-primary" />
          KINS Market
        </CardTitle>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          Solana
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-lg border-2 bg-muted/70" />
        ) : error ? (
          <div className="rounded-lg border-2 border-destructive/45 bg-destructive/10 p-4">
            <p className="text-sm font-semibold text-destructive">Token data unavailable</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {error.message}
            </p>
          </div>
        ) : !stats?.pairUrl && !stats?.priceUsd ? (
          <div className="rounded-lg border-2 border-dashed bg-muted/35 p-4">
            <p className="text-sm font-semibold">No KINS pair found</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {stats?.sourceMessage ?? "DexScreener did not return a Solana pair."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Metric label="Price" value={formatUsd(stats?.priceUsd)} />
              <Metric
                label="24h Change"
                value={
                  typeof change === "number" ? `${change.toFixed(2)}%` : "N/A"
                }
                valueClassName={changeTone}
              />
              <Metric label="Liquidity" value={formatUsd(stats?.liquidityUsd, 2)} />
              <Metric label="24h Volume" value={formatUsd(stats?.volume24h, 2)} />
              <Metric label="FDV" value={`$${formatCompact(stats?.fdv)}`} />
              <Metric label="KINS Valuation" value={`$${formatCompact(stats?.marketCap)}`} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {stats?.pairUrl ? (
                <Link
                  href={stats.pairUrl}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm text-primary transition hover:bg-primary/10"
                >
                  DexScreener
                  <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
              <Link
                href={`https://solscan.io/token/${mint}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm text-primary transition hover:bg-primary/10"
              >
                Solscan
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border-2 bg-muted/35 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 truncate text-base font-semibold ${valueClassName ?? ""}`}>
        {value}
      </p>
    </div>
  );
}
