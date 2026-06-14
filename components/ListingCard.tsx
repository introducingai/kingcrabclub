import Link from "next/link";
import { Coins, Gem, Lock } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { formatDate, formatMarketPrice, formatUsdKins, shortAddress } from "@/lib/format";
import type { MarketListing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ListingCard({
  listing,
  isNew,
}: {
  listing: MarketListing;
  isNew?: boolean;
}) {
  const CurrencyIcon = listing.currency === "token" ? Gem : Coins;

  return (
    <Link href={`/market/${encodeURIComponent(listing.itemType)}`}>
      <Card
        className={cn(
          "h-full transition hover:border-primary/70 hover:bg-card",
          isNew && "border-emerald-400/60 bg-emerald-400/8",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 bg-muted text-primary">
              {listing.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.iconUrl}
                  alt=""
                  className="h-full w-full rounded-md object-cover"
                />
              ) : (
                <Gem className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-semibold">{listing.itemName}</h3>
                {listing.reserved ? (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Reserved
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {listing.category ?? listing.itemType}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Qty</p>
              <p className="font-medium">{listing.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seller</p>
              <p className="font-medium">{shortAddress(listing.seller)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="flex items-center gap-1 font-medium">
                <CurrencyIcon className="h-3.5 w-3.5 text-primary" />
                {formatListingTotal(listing)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unit</p>
              <p className="font-medium">
                {formatListingUnit(listing)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Listed {formatDate(listing.createdAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
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
