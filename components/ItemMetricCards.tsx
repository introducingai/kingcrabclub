import { BarChart3, Boxes, Coins, Gem, ListChecks, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatCompact, formatMarketPrice, formatNumber, formatUsd, formatUsdKins } from "@/lib/format";
import type { ItemMetrics, ItemStatsResponse } from "@/lib/types";

export function ItemMetricCards({
  metrics,
  salesStats,
}: {
  metrics?: ItemMetrics;
  salesStats?: {
    gold?: ItemStatsResponse;
    token?: ItemStatsResponse;
  };
}) {
  const avgGold = salesStats?.gold?.average30d;
  const avgToken = salesStats?.token?.average30d;
  const salesCount =
    (salesStats?.gold?.salesCount ?? 0) + (salesStats?.token?.salesCount ?? 0);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Active Listings"
        value={formatNumber(metrics?.activeListings)}
        icon={ListChecks}
      />
      <MetricCard
        label="Listed Supply"
        value={formatNumber(metrics?.listedQuantity)}
        icon={Boxes}
        subvalue={`${formatNumber(metrics?.sellers)} sellers`}
      />
      <MetricCard
        label="Token Floor"
        value={
          metrics?.cheapestTokenListing?.priceKind === "usd"
            ? formatUsdKins(metrics.tokenFloorUnit, 4)
            : formatMarketPrice(metrics?.tokenFloorUnit, "token")
        }
        icon={Gem}
        subvalue={formatUsd(metrics?.tokenFloorUsd, 4)}
      />
      <MetricCard
        label="Gold Floor"
        value={formatMarketPrice(metrics?.goldFloorUnit, "gold")}
        icon={Coins}
      />
      <MetricCard
        label="Token Listed Value"
        value={
          metrics && metrics.tokenListedValue > 0
            ? formatMarketPrice(metrics.tokenListedValue, "token")
            : metrics && metrics.tokenListedValueUsd
              ? formatUsdKins(metrics.tokenListedValueUsd, 2)
            : "N/A"
        }
        icon={Gem}
        subvalue={formatUsd(metrics?.tokenListedValueUsd, 2)}
      />
      <MetricCard
        label="Gold Listed Value"
        value={formatMarketPrice(metrics?.goldListedValue, "gold")}
        icon={Coins}
      />
      <MetricCard
        label="30D Avg Sale"
        value={[
          avgGold ? formatMarketPrice(avgGold, "gold") : undefined,
          avgToken ? formatMarketPrice(avgToken, "token") : undefined,
        ]
          .filter(Boolean)
          .join(" / ") || "N/A"}
        icon={BarChart3}
      />
      <MetricCard
        label="30D Sales"
        value={formatCompact(salesCount, 1)}
        icon={ReceiptText}
      />
    </section>
  );
}

function MetricCard({
  label,
  value,
  subvalue,
  icon: Icon,
}: {
  label: string;
  value: string;
  subvalue?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="truncate text-2xl font-semibold">{value}</p>
        {subvalue ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">{subvalue}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
