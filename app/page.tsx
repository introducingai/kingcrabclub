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
      {/* KCC Hero — nightclub entrance */}
      <style>{`
        @keyframes kcc-neon-flicker {
          0%, 94%, 100% { opacity: 1; text-shadow: 0 0 18px rgba(255,45,107,0.65), 0 0 48px rgba(255,45,107,0.22); }
          95% { opacity: 0.7; text-shadow: none; }
          97% { opacity: 1; text-shadow: 0 0 18px rgba(255,45,107,0.65), 0 0 48px rgba(255,45,107,0.22); }
          98% { opacity: 0.75; text-shadow: none; }
        }
        @keyframes kcc-pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.85); }
        }
        @keyframes kcc-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .kcc-club-name { animation: kcc-neon-flicker 7s ease-in-out infinite; }
        .kcc-live-dot { animation: kcc-pulse-live 1.2s ease-in-out infinite; }
        .kcc-enter:hover { box-shadow: 0 0 48px rgba(255,45,107,0.75), 0 0 100px rgba(255,45,107,0.2) !important; transform: translateY(-2px); }
        .kcc-scan-line {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, rgba(255,45,107,0.6), rgba(0,229,200,0.4), transparent);
          animation: kcc-scan 4s linear infinite;
          pointer-events: none; z-index: 2;
        }
      `}</style>

      <section
        style={{
          background: 'linear-gradient(160deg, #07070f 0%, #0b0b1c 55%, #090913 100%)',
          border: '1px solid rgba(130,100,220,0.22)',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top neon strip */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, #ff2d6b 30%, #9d70ff 70%, transparent 100%)', boxShadow: '0 0 14px rgba(255,45,107,0.7)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 }} />
        <div className="kcc-scan-line" />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left — club entrance */}
          <div className="flex flex-col gap-7 p-8 lg:p-10">
            {/* Status row */}
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ff2d6b', border: '1px solid rgba(255,45,107,0.35)', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span className="kcc-live-dot" style={{ display: 'inline-block', width: '6px', height: '6px', background: '#ff2d6b', borderRadius: '50%' }} />
                Live Session
              </span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00e5c8', border: '1px solid rgba(0,229,200,0.28)', padding: '3px 10px' }}>
                Kintara World
              </span>
              <LiveStatusPill
                updatedAt={updatedAt}
                isError={liveQuery.isError && !liveQuery.data}
                stale={liveQuery.data?.stale}
                warning={warning}
              />
            </div>

            {/* Main heading */}
            <div>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.24em', color: '#9d70ff', textTransform: 'uppercase', marginBottom: '12px' }}>
                🦀 Est. 2026 · Kintara Season 1
              </p>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.03, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'white', margin: 0 }}>
                King Crab<br />
                <span className="kcc-club-name" style={{ color: '#ff2d6b', display: 'inline-block' }}>Club</span>
              </h1>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11.5px', color: 'rgba(184,175,217,0.72)', letterSpacing: '0.04em', lineHeight: 1.8, marginTop: '16px', maxWidth: '420px' }}>
                DJ room · market companion · social layer<br />
                for Kintara World. Queue a track. Watch the floor.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/degen"
                className="kcc-enter"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ff2d6b', color: 'white', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px 30px', boxShadow: '0 0 26px rgba(255,45,107,0.42)', transition: 'all 0.2s', textDecoration: 'none', border: 'none' }}
              >
                🦀 Enter the Club
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
              <Link
                href="/market"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'Space Mono, monospace', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8afd9', border: '1px solid rgba(130,100,220,0.32)', padding: '14px 18px', transition: 'color 0.15s, border-color 0.15s', textDecoration: 'none' }}
              >
                Browse Market →
              </Link>
            </div>

            {/* Safety tags */}
            <div className="flex flex-wrap gap-2" style={{ borderTop: '1px solid rgba(130,100,220,0.14)', paddingTop: '18px' }}>
              {['Read-only companion', 'No wallet requests', 'No marketplace writes'].map((tag) => (
                <span key={tag} style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9e94c6', border: '1px solid rgba(130,100,220,0.25)', padding: '2px 8px' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right — token stats, secondary */}
          <div style={{ borderLeft: '1px solid rgba(130,100,220,0.18)', background: 'rgba(8,8,20,0.45)' }}>
            <TokenStatsCard
              stats={tokenQuery.data}
              isLoading={tokenQuery.isLoading}
              error={tokenQuery.isError ? (tokenQuery.error as Error) : null}
            />
          </div>
        </div>
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
