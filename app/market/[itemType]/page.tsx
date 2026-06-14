"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ItemActivityFeed } from "@/components/ItemActivityFeed";
import { ItemMetricCards } from "@/components/ItemMetricCards";
import { ItemOrderBook } from "@/components/ItemOrderBook";
import { ItemPriceHistoryChart } from "@/components/ItemPriceHistoryChart";
import { LiveStatusPill } from "@/components/LiveStatusPill";
import { WatchlistButton } from "@/components/WatchlistButton";
import { fetchMarketEvents } from "@/lib/liveMarketApi";
import { formatRelativeSeconds } from "@/lib/format";
import type { ItemMarketResponse } from "@/lib/types";

async function fetchItemMarket(itemType: string): Promise<ItemMarketResponse> {
  const response = await fetch(`/api/market/item/${encodeURIComponent(itemType)}`);
  const payload = (await response.json().catch(() => ({}))) as
    | ItemMarketResponse
    | { ok?: false; error?: string; status?: number; source?: string };

  if (!response.ok || payload.ok !== true) {
    const status = "status" in payload ? payload.status : response.status;
    const source = "source" in payload && payload.source ? ` from ${payload.source}` : "";

    throw new Error(
      `HTTP ${status}${source}: ${
        "error" in payload ? payload.error : "Item market data unavailable."
      }`,
    );
  }

  return payload;
}

export default function ItemDetailPage() {
  const params = useParams<{ itemType: string }>();
  const itemType = decodeURIComponent(params.itemType);
  const itemQuery = useQuery({
    queryKey: ["item-market-terminal", itemType],
    queryFn: () => fetchItemMarket(itemType),
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? 30000 : 10000,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
  });
  const eventsQuery = useQuery({
    queryKey: ["item-market-events"],
    queryFn: fetchMarketEvents,
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? 30000 : 10000,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
  });
  const data = itemQuery.data;
  const itemName =
    data?.metrics.cheapestGoldListing?.itemName ??
    data?.metrics.cheapestTokenListing?.itemName ??
    itemType;
  const updatedAt = data?.generatedAt ?? itemQuery.dataUpdatedAt;
  const isOlderThan30 = useMemo(() => {
    const timestamp =
      typeof updatedAt === "number" ? updatedAt : updatedAt ? new Date(updatedAt).getTime() : 0;

    return timestamp ? Date.now() - timestamp > 30000 : false;
  }, [updatedAt]);
  const warning =
    itemQuery.isError && data ? (itemQuery.error as Error).message : undefined;

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-primary">Item terminal</p>
            <h1 className="mt-3 break-words text-3xl font-semibold sm:text-4xl">
              {itemName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{itemType}</p>
            <div className="mt-4">
              <WatchlistButton itemType={itemType} />
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <LiveStatusPill
              updatedAt={updatedAt}
              isError={itemQuery.isError && !data}
              stale={isOlderThan30}
              warning={warning}
            />
            <p className="text-sm text-muted-foreground">
              Last updated{" "}
              <span className="font-semibold text-foreground">
                {formatRelativeSeconds(updatedAt)}
              </span>
            </p>
          </div>
        </div>
      </section>

      {warning ? (
        <section className="rounded-lg border-2 border-amber-400/45 bg-amber-400/10 p-4 text-sm text-amber-100">
          Showing last good item snapshot. {warning}
        </section>
      ) : null}

      {itemQuery.isError && !data ? (
        <EmptyState
          tone="error"
          title="Item market data unavailable"
          message={(itemQuery.error as Error).message}
        />
      ) : (
        <>
          <ItemMetricCards
            metrics={data?.metrics}
            salesStats={data?.salesStats}
          />

          <ItemPriceHistoryChart data={data} />

          <ItemOrderBook
            tokenListings={data?.orderBook.token ?? []}
            goldListings={data?.orderBook.gold ?? []}
            tokenFloorId={data?.metrics.cheapestTokenListing?.id}
            goldFloorId={data?.metrics.cheapestGoldListing?.id}
          />

          <ItemActivityFeed
            events={data?.events?.length ? data.events : eventsQuery.data ?? []}
            itemType={itemType}
          />
        </>
      )}
    </div>
  );
}
