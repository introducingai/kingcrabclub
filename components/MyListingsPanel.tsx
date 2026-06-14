import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { formatDate, formatMarketPrice } from "@/lib/format";
import type { MockListing } from "@/lib/kintaraOfficial/types";

export function MyListingsPanel({
  listings,
  onCancel,
  onCheckout,
}: {
  listings: MockListing[];
  onCancel?: (listing: MockListing) => void;
  onCheckout?: (listing: MockListing) => void;
}) {
  if (listings.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        No mock listings yet. Create one from a tradeable inventory item.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <div
          key={listing.listingId}
          className="flex flex-col gap-3 rounded-lg border-2 bg-muted/25 p-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="font-semibold">{listing.name}</p>
            <p className="text-sm text-muted-foreground">
              x{listing.quantity} / {formatMarketPrice(listing.price, listing.currency)} / {formatDate(listing.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onCancel?.(listing)}>Mock cancel</Button>
            <Button variant="outline" onClick={() => onCheckout?.(listing)}>
              <ShoppingCart className="h-4 w-4" />
              Mock checkout
            </Button>
            <Button variant="ghost" disabled title="Real checkout is disabled.">
              Locked buy
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
