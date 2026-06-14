import Link from "next/link";
import { Boxes, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatMarketPrice, formatNumber } from "@/lib/format";
import type { MarketSummary } from "@/lib/types";

export function MarketPulseCard({ summary }: { summary?: MarketSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Pulse</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-2">
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <TrendingDown className="h-4 w-4 text-primary" />
            Top item floors
          </h3>
          <div className="mt-3 space-y-2">
            {(summary?.topItemFloors ?? []).slice(0, 5).map((floor) => (
              <Link
                key={`${floor.itemType}-${floor.currency}`}
                href={`/market/${encodeURIComponent(floor.itemType)}`}
                className="flex items-center justify-between gap-3 rounded-lg border-2 bg-muted/25 px-3 py-2 text-sm transition hover:border-primary/60"
              >
                <span className="truncate font-medium">{floor.itemName}</span>
                <span className="shrink-0 text-primary">
                  {formatMarketPrice(floor.floorPrice, floor.currency)}
                </span>
              </Link>
            ))}
            {summary?.topItemFloors.length === 0 ? (
              <p className="rounded-lg border-2 border-dashed p-3 text-sm text-muted-foreground">
                No floor data yet.
              </p>
            ) : null}
          </div>
        </section>
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Boxes className="h-4 w-4 text-primary" />
            Biggest listings
          </h3>
          <div className="mt-3 space-y-2">
            {(summary?.biggestListings ?? []).slice(0, 5).map((listing) => (
              <Link
                key={listing.id}
                href={`/market/${encodeURIComponent(listing.itemType)}`}
                className="flex items-center justify-between gap-3 rounded-lg border-2 bg-muted/25 px-3 py-2 text-sm transition hover:border-primary/60"
              >
                <span className="truncate font-medium">{listing.itemName}</span>
                <span className="shrink-0 text-primary">
                  x{formatNumber(listing.quantity)}
                </span>
              </Link>
            ))}
            {summary?.biggestListings.length === 0 ? (
              <p className="rounded-lg border-2 border-dashed p-3 text-sm text-muted-foreground">
                No stack data yet.
              </p>
            ) : null}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
