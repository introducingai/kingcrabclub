"use client";

import Link from "next/link";
import { Coins, Gem, Lock } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ListingCard } from "./ListingCard";
import { formatDate, formatMarketPrice, formatUsdKins, shortAddress } from "@/lib/format";
import type { MarketListing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MarketTable({
  listings,
  highlightedIds = new Set(),
}: {
  listings: MarketListing[];
  highlightedIds?: Set<string>;
}) {
  return (
    <>
      <div className="hidden rounded-lg border-2 bg-card/70 shadow-glow lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => {
              const CurrencyIcon = listing.currency === "token" ? Gem : Coins;

              return (
                <TableRow
                  key={listing.id}
                  className={cn(
                    highlightedIds.has(listing.id) &&
                      "border-emerald-400/50 bg-emerald-400/8",
                  )}
                >
                  <TableCell>
                    <Link
                      href={`/market/${encodeURIComponent(listing.itemType)}`}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 bg-muted text-primary">
                        {listing.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={listing.iconUrl}
                            alt=""
                            className="h-full w-full rounded-md object-cover"
                          />
                        ) : (
                          <Gem className="h-5 w-5" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {listing.itemName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {listing.category ?? listing.itemType}
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>{listing.quantity}</TableCell>
                  <TableCell>{shortAddress(listing.seller)}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <CurrencyIcon className="h-4 w-4 text-primary" />
                      {listing.currency}
                    </span>
                  </TableCell>
                  <TableCell>{formatListingTotal(listing)}</TableCell>
                  <TableCell>
                    {formatListingUnit(listing)}
                  </TableCell>
                  <TableCell>
                    {listing.reserved ? (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Reserved
                      </Badge>
                    ) : (
                      <Badge variant="outline">Open</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(listing.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isNew={highlightedIds.has(listing.id)}
          />
        ))}
      </div>
    </>
  );
}

function formatListingTotal(listing: MarketListing) {
  if (listing.currency === "token" && listing.priceKind === "usd") {
    return formatUsdKins(listing.priceUsd ?? listing.price, 4);
  }

  return formatMarketPrice(listing.price, listing.currency);
}

function formatListingUnit(listing: MarketListing) {
  if (listing.currency === "token" && listing.priceKind === "usd") {
    return formatUsdKins(listing.unitPriceUsd ?? listing.unitPrice, 4);
  }

  return formatMarketPrice(listing.unitPrice, listing.currency);
}
