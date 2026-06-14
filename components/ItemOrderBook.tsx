import { Coins, Gem } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { formatDate, formatMarketPrice, formatUsdKins, shortAddress } from "@/lib/format";
import type { MarketListing } from "@/lib/types";

export function ItemOrderBook({
  tokenListings,
  goldListings,
  tokenFloorId,
  goldFloorId,
}: {
  tokenListings: MarketListing[];
  goldListings: MarketListing[];
  tokenFloorId?: string;
  goldFloorId?: string;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <BookSide
        title="KINS Listings"
        icon={Gem}
        listings={tokenListings}
        floorId={tokenFloorId}
      />
      <BookSide
        title="Gold Listings"
        icon={Coins}
        listings={goldListings}
        floorId={goldFloorId}
      />
    </div>
  );
}

function BookSide({
  title,
  icon: Icon,
  listings,
  floorId,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  listings: MarketListing[];
  floorId?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            No active listings for this currency.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-3 py-3 text-left">Seller</th>
                  <th className="px-3 py-3 text-right">Qty</th>
                  <th className="px-3 py-3 text-right">Total</th>
                  <th className="px-3 py-3 text-right">Unit</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => {
                  const isFloor = listing.id === floorId;

                  return (
                    <tr
                      key={listing.id}
                      className={`border-b-2 ${
                        isFloor ? "bg-emerald-400/10" : "hover:bg-muted/35"
                      }`}
                    >
                      <td className="px-3 py-3">{shortAddress(listing.seller)}</td>
                      <td className="px-3 py-3 text-right">{listing.quantity}</td>
                      <td className="px-3 py-3 text-right">{formatListingTotal(listing)}</td>
                      <td className="px-3 py-3 text-right">{formatListingUnit(listing)}</td>
                      <td className="px-3 py-3">
                        {isFloor ? (
                          <Badge variant="secondary">Floor</Badge>
                        ) : listing.reserved ? (
                          <Badge variant="outline">Reserved</Badge>
                        ) : (
                          <Badge variant="outline">Open</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {formatDate(listing.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
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
