import { X } from "lucide-react";
import { Button } from "./ui/button";
import { formatMarketPrice } from "@/lib/format";
import type { MockListing } from "@/lib/kintaraOfficial/types";

export function CancelListingModal({
  listing,
  onClose,
  onConfirm,
}: {
  listing: MockListing;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="kintara-panel w-full max-w-lg rounded-lg p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Mock Cancel Listing</h3>
          <Button variant="ghost" className="h-9 w-9 px-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-3 font-semibold">{listing.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatMarketPrice(listing.price, listing.currency)} / fake local cancellation only.
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onConfirm}>Confirm mock cancel</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
