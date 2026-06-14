"use client";

import { useMemo, useState, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Coins, Gem, RefreshCcw, ShieldAlert } from "lucide-react";
import { CancelListingModal } from "./CancelListingModal";
import { CheckoutModal } from "./CheckoutModal";
import { CreateListingModal } from "./CreateListingModal";
import { InventoryGrid } from "./InventoryGrid";
import { MyListingsPanel } from "./MyListingsPanel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { nextCheckoutState, type CheckoutState } from "@/lib/checkoutStateMachine";
import type { MockInventoryItem, MockListing, MockPlayerProfile } from "@/lib/kintaraOfficial/types";
import { formatNumber } from "@/lib/format";

type MockMePayload = { ok: boolean; mode: string; profile?: MockPlayerProfile };
type MockInventoryPayload = { ok: boolean; mode: string; inventory: MockInventoryItem[] };
type MockListingsPayload = { ok: boolean; mode: string; listings: MockListing[] };

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const payload = await response.json();

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error ?? "Mock integration unavailable.");
  }

  return payload as T;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error ?? "Mock action failed.");
  }

  return payload as T;
}

export function MockOfficialIntegrationPanel() {
  const [selectedItem, setSelectedItem] = useState<MockInventoryItem>();
  const [listingToCancel, setListingToCancel] = useState<MockListing>();
  const [checkoutListing, setCheckoutListing] = useState<MockListing>();
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [actionError, setActionError] = useState<string>();

  const meQuery = useQuery({
    queryKey: ["mock-account-me"],
    queryFn: () => readJson<MockMePayload>("/api/account/me"),
  });
  const inventoryQuery = useQuery({
    queryKey: ["mock-account-inventory"],
    queryFn: () => readJson<MockInventoryPayload>("/api/account/inventory"),
  });
  const listingsQuery = useQuery({
    queryKey: ["mock-account-listings"],
    queryFn: () => readJson<MockListingsPayload>("/api/account/listings"),
  });
  const activeListings = useMemo(
    () => (listingsQuery.data?.listings ?? []).filter((listing) => listing.status === "active"),
    [listingsQuery.data?.listings],
  );

  async function refresh() {
    await Promise.all([
      meQuery.refetch(),
      inventoryQuery.refetch(),
      listingsQuery.refetch(),
    ]);
  }

  async function createListing(
    item: MockInventoryItem,
    input: { quantity: number; price: number; currency: "gold" | "token" },
  ) {
    setActionError(undefined);

    try {
      await postJson("/api/account/listings/create", {
        itemId: item.itemId,
        quantity: input.quantity,
        price: input.price,
        currency: input.currency,
        slotKind: item.slotKind,
        slotIndex: item.slotIndex,
      });
      setSelectedItem(undefined);
      await refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Mock listing creation failed.");
    }
  }

  async function cancelListing(listing: MockListing) {
    setActionError(undefined);

    try {
      await postJson("/api/account/listings/cancel", { listingId: listing.listingId });
      setListingToCancel(undefined);
      await refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Mock cancellation failed.");
    }
  }

  async function runMockCheckout(listing: MockListing) {
    setActionError(undefined);
    setCheckoutListing(listing);
    setCheckoutState("reserving");

    try {
      const reserve = await postJson<{ reservation: { reservationId: string } }>(
        "/api/checkout/reserve",
        { listingId: listing.listingId },
      );
      setCheckoutState(nextCheckoutState("reserving", "reserve_ok"));
      await wait(450);

      setCheckoutState("quote_pending");
      const quote = await postJson<{ quote: { quoteId: string } }>("/api/checkout/token-quote", {
        reservationId: reserve.reservation.reservationId,
      });
      setCheckoutState(nextCheckoutState("quote_pending", "quote_ok"));
      await wait(450);

      setCheckoutState("transaction_submitted");
      await wait(450);

      setCheckoutState("confirming_server");
      await postJson("/api/checkout/token-confirm", {
        reservationId: reserve.reservation.reservationId,
        quoteId: quote.quote.quoteId,
      });
      setCheckoutState("completed");
      await refresh();
    } catch (error) {
      setCheckoutState("failed");
      setActionError(error instanceof Error ? error.message : "Mock checkout failed.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Mock Official Integration
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive">Mock Mode</Badge>
          <Badge variant="outline">No Real Inventory Changes</Badge>
          <Badge variant="outline">No Real Transactions</Badge>
          <Badge variant="outline">Marketplace Writes Disabled</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border-2 border-amber-400/45 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          This panel simulates future official Kintara flows with local memory only.
          It never calls Kintara write endpoints and never calls wallet transaction methods.
        </div>

        {actionError ? (
          <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            {actionError}
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-4">
          <MockStat label="Player" value={meQuery.data?.profile?.username ?? "..."} icon={Boxes} />
          <MockStat label="Mock Gold" value={formatNumber(meQuery.data?.profile?.goldBalance)} icon={Coins} />
          <MockStat label="Mock KINS" value={formatNumber(meQuery.data?.profile?.kinsBalancePlaceholder, 2)} icon={Gem} />
          <MockStat label="My Listings" value={formatNumber(activeListings.length)} icon={RefreshCcw} />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Mock Inventory</h3>
            <Button variant="outline" onClick={refresh}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          <InventoryGrid
            items={inventoryQuery.data?.inventory ?? []}
            onMockList={setSelectedItem}
          />
        </section>

        <section>
          <h3 className="mb-3 text-lg font-semibold">Mock My Listings</h3>
          <MyListingsPanel
            listings={activeListings}
            onCancel={setListingToCancel}
            onCheckout={runMockCheckout}
          />
        </section>

        {selectedItem ? (
          <CreateListingModal
            item={selectedItem}
            onClose={() => setSelectedItem(undefined)}
            onConfirm={(input) => createListing(selectedItem, input)}
          />
        ) : null}

        {listingToCancel ? (
          <CancelListingModal
            listing={listingToCancel}
            onClose={() => setListingToCancel(undefined)}
            onConfirm={() => cancelListing(listingToCancel)}
          />
        ) : null}

        {checkoutListing && checkoutState !== "idle" ? (
          <CheckoutModal
            listing={checkoutListing}
            state={checkoutState}
            onClose={() => {
              setCheckoutListing(undefined);
              setCheckoutState("idle");
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function MockStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border-2 bg-muted/25 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 truncate text-xl font-semibold">{value}</p>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
