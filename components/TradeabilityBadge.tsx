import { Badge } from "./ui/badge";

export function TradeabilityBadge({
  tradeable,
  reason,
}: {
  tradeable: boolean;
  reason?: string;
}) {
  return (
    <span title={reason}>
      <Badge variant={tradeable ? "secondary" : "outline"}>
        {tradeable ? "Tradeable" : "Non-tradeable"}
      </Badge>
    </span>
  );
}
