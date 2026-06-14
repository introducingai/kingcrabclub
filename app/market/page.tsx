"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Coins, Gem, PackageSearch, ScrollText } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { LiveStatusPill } from "@/components/LiveStatusPill";
import { MarketFilters } from "@/components/MarketFilters";
import { MarketTable } from "@/components/MarketTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchLiveMarket } from "@/lib/liveMarketApi";
import { formatNumber, formatRelativeSeconds } from "@/lib/format";
import { saveSearch } from "@/lib/savedSearches";
import type { ListingQuery, MarketCurrency, MarketSort } from "@/lib/types";

export default function MarketPage() {
  return (
    <Suspense fallback={<MarketLoading />}>
      <MarketPageContent />
    </Suspense>
  );
}

function MarketPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ListingQuery>({
    sort: (searchParams.get("sort") as MarketSort) || "latest",
    currency: (searchParams.get("currency") as MarketCurrency) || "all",
    category: searchParams.get("category") ?? "",
    q: searchParams.get("q") ?? "",
    limit: 100,
    offset: Number(searchParams.get("offset") ?? 0),
  });
  const liveQuery = useQuery({
    queryKey: ["market-live", filters],
    queryFn: () => fetchLiveMarket(filters),
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? 15000 : 2500,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
  });
  const listings = useMemo(
    () => liveQuery.data?.listings ?? [],
    [liveQuery.data?.listings],
  );
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          listings
            .map((listing) => listing.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ).sort(),
    [listings],
  );
  const tokenListings = listings.filter((listing) => listing.currency === "token").length;
  const goldListings = listings.filter((listing) => listing.currency === "gold").length;
  const uniqueTypes = new Set(listings.map((listing) => listing.itemType)).size;
  const statValue = (value: number) =>
    liveQuery.isLoading ? "..." : formatNumber(value);
  const highlightedIds = useMemo(
    () =>
      new Set(
        (liveQuery.data?.events ?? [])
          .filter(
            (event) =>
              event.type === "listing_created" &&
              event.listingId &&
              Date.now() - new Date(event.createdAt).getTime() < 30000,
          )
          .map((event) => String(event.listingId)),
      ),
    [liveQuery.data?.events],
  );
  const updatedAt = liveQuery.data?.generatedAt ?? liveQuery.dataUpdatedAt;
  const warning =
    liveQuery.data?.warning ??
    (liveQuery.isError ? (liveQuery.error as Error).message : undefined);

  return (
    <div className="space-y-6">
      <section className="kintara-panel rounded-lg p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Marketplace Browser</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Read-only listing discovery with live server-side Kintara snapshots.
            </p>
          </div>
          <LiveStatusPill
            updatedAt={updatedAt}
            isError={liveQuery.isError && !liveQuery.data}
            stale={liveQuery.data?.stale}
            warning={warning}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active listings" value={statValue(listings.length)} icon={ScrollText} />
        <StatCard label="KINS listings" value={statValue(tokenListings)} icon={Gem} />
        <StatCard label="Gold listings" value={statValue(goldListings)} icon={Coins} />
        <StatCard
          label="Unique item types"
          value={statValue(uniqueTypes)}
          icon={PackageSearch}
        />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 bg-card/70 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Last updated{" "}
            <span className="font-semibold text-foreground">
              {formatRelativeSeconds(updatedAt)}
            </span>
          </p>
          {warning ? (
            <p className="text-sm font-semibold text-amber-200">
              Showing last good snapshot. {warning}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <MarketFilters value={filters} categories={categories} onChange={setFilters} />
          </div>
          <Button
            variant="outline"
            className="shrink-0"
            onClick={() => saveSearch(filters)}
          >
            Save search
          </Button>
        </div>
      </section>

      {liveQuery.isError && !liveQuery.data ? (
        <EmptyState
          tone="error"
          title="Marketplace unavailable"
          message={(liveQuery.error as Error).message}
        />
      ) : listings.length > 0 ? (
        <MarketTable listings={listings} highlightedIds={highlightedIds} />
      ) : (
        <EmptyState
          title={liveQuery.isLoading ? "Loading listings" : "No listings returned."}
          message={
            liveQuery.isLoading
              ? "Contacting the read-only server proxy."
              : "The request succeeded, but the marketplace endpoint returned an empty listing array for these filters."
          }
        />
      )}
    </div>
  );
}

function MarketLoading() {
  return (
    <div className="space-y-6">
      <section className="kintara-panel rounded-lg p-6">
        <h1 className="text-3xl font-semibold">Marketplace Browser</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Loading saved market filters.
        </p>
      </section>
      <EmptyState title="Loading market" message="Preparing read-only marketplace view." />
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
