"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Coins, Gem, PackageSearch, ScrollText } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { MarketTable } from "@/components/MarketTable";
import { SellerHistoryChart } from "@/components/SellerHistoryChart";
import { SellerWatchlistButton } from "@/components/SellerWatchlistButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchLiveMarket, fetchMarketEvents } from "@/lib/liveMarketApi";
import { formatNumber } from "@/lib/format";
import type { MarketEvent, MarketSellerMetricSample } from "@/lib/types";

type SellerHistoryResponse = {
  ok: boolean;
  metrics?: MarketSellerMetricSample[];
  events?: MarketEvent[];
};

async function fetchSellerHistory(sellerName: string): Promise<SellerHistoryResponse> {
  const response = await fetch(
    `/api/market/seller/${encodeURIComponent(sellerName)}/history?range=30d`,
  );
  const payload = (await response.json().catch(() => ({}))) as SellerHistoryResponse;

  if (!response.ok || payload.ok === false) {
    return { ok: false, metrics: [], events: [] };
  }

  return payload;
}

export default function SellerPage() {
  const params = useParams<{ sellerName: string }>();
  const sellerName = decodeURIComponent(params.sellerName);
  const liveQuery = useQuery({
    queryKey: ["seller-live", sellerName],
    queryFn: () => fetchLiveMarket({ limit: 250, sort: "latest" }),
    refetchInterval: 10000,
    placeholderData: (previousData) => previousData,
  });
  const eventsQuery = useQuery({
    queryKey: ["seller-events"],
    queryFn: fetchMarketEvents,
    refetchInterval: 10000,
    placeholderData: (previousData) => previousData,
  });
  const historyQuery = useQuery({
    queryKey: ["seller-history", sellerName],
    queryFn: () => fetchSellerHistory(sellerName),
    refetchInterval: 30000,
    placeholderData: (previousData) => previousData,
  });
  const sellerListings = (liveQuery.data?.listings ?? []).filter(
    (listing) => listing.seller?.toLowerCase() === sellerName.toLowerCase(),
  );
  const tokenListings = sellerListings.filter((listing) => listing.currency === "token").length;
  const goldListings = sellerListings.filter((listing) => listing.currency === "gold").length;
  const itemCounts = Array.from(
    sellerListings.reduce((map, listing) => {
      map.set(listing.itemType, (map.get(listing.itemType) ?? 0) + 1);

      return map;
    }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const sellerEvents = (historyQuery.data?.events?.length ? historyQuery.data.events : eventsQuery.data ?? []).filter(
    (event) =>
      typeof event.payload?.seller === "string" &&
      event.payload.seller.toLowerCase() === sellerName.toLowerCase(),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/market"
        className="inline-flex items-center gap-2 rounded-md border-2 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to market
      </Link>

      <section className="kintara-panel rounded-lg p-6">
        <p className="text-sm uppercase tracking-[0.22em] text-primary">Public seller</p>
        <h1 className="mt-3 break-words text-3xl font-semibold sm:text-4xl">
          {sellerName}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Read-only seller activity from observed marketplace listings.
        </p>
        <div className="mt-4">
          <SellerWatchlistButton sellerName={sellerName} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active listings" value={formatNumber(sellerListings.length)} icon={ScrollText} />
        <StatCard label="KINS listings" value={formatNumber(tokenListings)} icon={Gem} />
        <StatCard label="Gold listings" value={formatNumber(goldListings)} icon={Coins} />
        <StatCard label="Item types" value={formatNumber(itemCounts.length)} icon={PackageSearch} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Most Listed Item Types</CardTitle>
          </CardHeader>
          <CardContent>
            {itemCounts.length === 0 ? (
              <p className="rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No active listings observed for this seller.
              </p>
            ) : (
              <div className="space-y-2">
                {itemCounts.map(([itemType, count]) => (
                  <Link
                    key={itemType}
                    href={`/market/${encodeURIComponent(itemType)}`}
                    className="flex items-center justify-between gap-3 rounded-lg border-2 bg-muted/25 px-3 py-2 text-sm transition hover:border-primary/60"
                  >
                    <span className="truncate font-semibold">{itemType}</span>
                    <span className="text-primary">{count}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <LiveActivityFeed events={sellerEvents} />
      </section>

      <SellerHistoryChart metrics={historyQuery.data?.metrics ?? []} />

      {liveQuery.isError && !liveQuery.data ? (
        <EmptyState
          tone="error"
          title="Seller listings unavailable"
          message={(liveQuery.error as Error).message}
        />
      ) : sellerListings.length > 0 ? (
        <MarketTable listings={sellerListings} />
      ) : (
        <EmptyState
          title={liveQuery.isLoading ? "Loading seller listings" : "No active listings"}
          message="This public seller profile only shows currently observed read-only listings."
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
