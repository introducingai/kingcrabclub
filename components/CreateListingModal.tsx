"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { ListingPriceInput } from "./ListingPriceInput";
import type { MockInventoryItem, OfficialCurrency } from "@/lib/kintaraOfficial/types";

export function CreateListingModal({
  item,
  onClose,
  onConfirm,
}: {
  item: MockInventoryItem;
  onClose: () => void;
  onConfirm: (input: { quantity: number; price: number; currency: OfficialCurrency }) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(1);
  const [currency, setCurrency] = useState<OfficialCurrency>("gold");
  const invalid = quantity <= 0 || quantity > item.quantity || price <= 0 || !item.tradeable;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="kintara-panel w-full max-w-lg rounded-lg p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Mock Create Listing</h3>
          <Button variant="ghost" className="h-9 w-9 px-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Fake local listing only. No real inventory mutation occurs.
        </p>
        <div className="mt-4">
          <ListingPriceInput
            quantity={quantity}
            price={price}
            currency={currency}
            onQuantityChange={setQuantity}
            onPriceChange={setPrice}
            onCurrencyChange={setCurrency}
          />
        </div>
        <Button
          className="mt-4"
          disabled={invalid}
          onClick={() => onConfirm({ quantity, price, currency })}
        >
          Confirm mock listing
        </Button>
      </div>
    </div>
  );
}
