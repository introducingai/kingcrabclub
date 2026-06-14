import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { formatMarketPrice } from "@/lib/format";
import type { OfficialCurrency } from "@/lib/kintaraOfficial/types";

export function ListingPriceInput({
  quantity,
  price,
  currency,
  onQuantityChange,
  onPriceChange,
  onCurrencyChange,
}: {
  quantity: number;
  price: number;
  currency: OfficialCurrency;
  onQuantityChange: (value: number) => void;
  onPriceChange: (value: number) => void;
  onCurrencyChange: (value: OfficialCurrency) => void;
}) {
  const unitPrice = quantity > 0 ? price / quantity : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Input
        aria-label="Quantity"
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => onQuantityChange(Number(event.target.value))}
      />
      <Input
        aria-label="Total price"
        type="number"
        min={1}
        value={price}
        onChange={(event) => onPriceChange(Number(event.target.value))}
      />
      <Select
        aria-label="Currency"
        value={currency}
        onChange={(event) => onCurrencyChange(event.target.value as OfficialCurrency)}
      >
        <option value="gold">Gold</option>
        <option value="token">KINS</option>
      </Select>
      <p className="text-sm text-muted-foreground sm:col-span-3">
        Unit preview: {formatMarketPrice(unitPrice, currency)}
      </p>
    </div>
  );
}
