import { InventoryItemCard } from "./InventoryItemCard";
import type { MockInventoryItem } from "@/lib/kintaraOfficial/types";

export function InventoryGrid({
  items,
  onMockList,
}: {
  items: MockInventoryItem[];
  onMockList?: (item: MockInventoryItem) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        No mock inventory items.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <InventoryItemCard key={item.itemId} item={item} onMockList={onMockList} />
      ))}
    </div>
  );
}
