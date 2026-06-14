import { X } from "lucide-react";
import { Button } from "./ui/button";
import type { CheckoutState } from "@/lib/checkoutStateMachine";
import type { MockListing } from "@/lib/kintaraOfficial/types";

export function CheckoutModal({
  listing,
  state,
  onClose,
}: {
  listing: MockListing;
  state: CheckoutState;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="kintara-panel w-full max-w-lg rounded-lg p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Mock Checkout</h3>
          <Button variant="ghost" className="h-9 w-9 px-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-3 font-semibold">{listing.name}</p>
        <p className="mt-3 rounded-lg border-2 bg-muted/25 p-3 text-sm">
          State: <span className="font-semibold">{state}</span>
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Mock mode simulates wallet and server steps without requesting signatures.
        </p>
      </div>
    </div>
  );
}
