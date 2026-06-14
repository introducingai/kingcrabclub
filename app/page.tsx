"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Coins, Gem, PackageSearch, ScrollText } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { LiveStatusPill } from "@/components/LiveStatusPill";
import { ListingCard } from "@/components/ListingCard";
import { KingCrabClubConcept } from "@/components/KingCrabClubConcept";
import { MarketPulseCard } from "@/components/MarketPulseCard";
import { TelegramMirrorCard } from "@/components/TelegramMirrorCard";
import { TokenStatsCard } from "@/components/TokenStatsCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchLiveMarket } from "@/lib/liveMarketApi";
import { fetchDexScreenerKinsPairs } from "@/lib/tokenApi";
import { formatNumber, formatRelativeSeconds } from "@/lib/format";

export default function DashboardPage() {
  const liveQuery = useQuery({
    queryKey: ["dashboard-live-market"],
    queryFn: () => fetchLiveMarket({ limit: 120, sort: "latest" }),
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? 30000 : 5000,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
  });
  const tokenQuery = useQuery({
    queryKey: ["kins-token"],
    queryFn: fetchDexScreenerKinsPairs,
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? 60000 : 30000,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
  });
  const listings = liveQuery.data?.listings ?? [];
  const summary = liveQuery.data?.summary;
  const tokenListings = listings.filter((listing) => listing.currency === "token").length;
  const goldListings = listings.filter((listing) => listing.currency === "gold").length;
  const uniqueTypes = new Set(listings.map((listing) => listing.itemType)).size;
  const latestListings = listings.slice(0, 6);
  const newListingIds = new Set(
    (liveQuery.data?.events ?? [])
      .filter(
        (event) =>
          event.type === "listing_created" &&
          event.listingId &&
          Date.now() - new Date(event.createdAt).getTime() < 30000,
      )
      .map((event) => String(event.listingId)),
  );
  const statValue = (value: number) =>
    liveQuery.isLoading ? "..." : formatNumber(value);
  const updatedAt = liveQuery.data?.generatedAt ?? liveQuery.dataUpdatedAt;
  const warning =
    liveQuery.data?.warning ??
    (liveQuery.isError ? (liveQuery.error as Error).message : undefined);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="kintara-panel pixel-corners rounded-lg p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">Read-only companion</Badge>
            <Badge variant="outline">No wallet requests</Badge>
            <Badge variant="outline">No marketplace writes</Badge>
            <LiveStatusPill
              updatedAt={updatedAt}
              isError={liveQuery.isError && !liveQuery.data}
              stale={liveQuery.data?.stale}
              warning={warning}
            />
          </div>
          <div className="mt-8 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Kintara market intelligence without touching game inventory.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Browse listings, inspect item price history, and track KINS market
              conditions from a safe third-party dashboard.
            </p>
          </div>
          <Link
            href="/market"
            className="mt-8 inline-flex items-center gap-2 rounded-md border-2 border-primary/50 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Open market
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <TokenStatsCard
          stats={tokenQuery.data}
          isLoading={tokenQuery.isLoading}
          error={tokenQuery.isError ? (tokenQuery.error as Error) : null}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active listings"
          value={statValue(summary?.activeListings ?? listings.length)}
          icon={ScrollText}
        />
        <StatCard
          label="KINS listings"
          value={statValue(summary?.tokenListings ?? tokenListings)}
          icon={Gem}
        />
        <StatCard
          label="Gold listings"
          value={statValue(summary?.goldListings ?? goldListings)}
          icon={Coins}
        />
        <StatCard
          label="Unique item types"
          value={statValue(summary?.uniqueItemTypes ?? uniqueTypes)}
          icon={PackageSearch}
        />
      </section>

      <KingCrabClubConcept />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 bg-card/70 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Last updated <span className="font-semibold text-foreground">{formatRelativeSeconds(updatedAt)}</span>
        </p>
        {warning ? (
          <p className="text-sm font-semibold text-amber-200">
            Showing last good snapshot. {warning}
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <MarketPulseCard summary={summary} />
        <div className="space-y-6">
          <TelegramMirrorCard />
          <LiveActivityFeed events={liveQuery.data?.events ?? []} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Latest Listings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Recent market entries from the read-only proxy.
            </p>
          </div>
          <Link
            href="/market"
            className="hidden items-center gap-2 rounded-md border-2 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 sm:inline-flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {liveQuery.isError && !liveQuery.data ? (
          <EmptyState
            tone="error"
            title="Marketplace unavailable"
            message={(liveQuery.error as Error).message}
          />
        ) : latestListings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {latestListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isNew={newListingIds.has(listing.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={liveQuery.isLoading ? "Loading marketplace" : "No listings returned."}
            message={
              liveQuery.isLoading
                ? "Contacting the read-only server proxy."
                : "The proxy request succeeded, but Kintara returned an empty listing array."
            }
          />
        )}
      </section>
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
