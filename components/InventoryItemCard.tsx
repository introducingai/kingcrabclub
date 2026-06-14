import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { TradeabilityBadge } from "./TradeabilityBadge";
import { formatNumber } from "@/lib/format";
import type { MockInventoryItem } from "@/lib/kintaraOfficial/types";

export function InventoryItemCard({
  item,
  onMockList,
}: {
  item: MockInventoryItem;
  onMockList?: (item: MockInventoryItem) => void;
}) {
  return (
    <div className="rounded-lg border-2 bg-muted/25 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{item.displayName ?? item.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.itemType} / {item.category ?? "Item"} / slot {item.slotKind}:{item.slotIndex}
          </p>
        </div>
        <TradeabilityBadge tradeable={item.tradeable} reason={item.reasonNotTradeable} />
      </div>
      <p className="mt-4 text-2xl font-semibold">x{formatNumber(item.quantity)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          disabled={!item.tradeable}
          title={item.tradeable ? "Create fake local listing" : item.reasonNotTradeable ?? "Item is not tradeable"}
          onClick={() => onMockList?.(item)}
        >
          {item.tradeable ? null : <Lock className="h-4 w-4" />}
          Mock list
        </Button>
        <Button
          variant="outline"
          disabled
          title="Real sell is disabled until official write access exists."
        >
          Locked sell
        </Button>
      </div>
    </div>
  );
}
