import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatRelativeSeconds } from "@/lib/format";
import type { MarketEvent } from "@/lib/types";

export function ItemActivityFeed({
  events,
  itemType,
}: {
  events: MarketEvent[];
  itemType: string;
}) {
  const itemEvents = events.filter((event) => event.itemType === itemType).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Item Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {itemEvents.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center">
            <p className="font-semibold">No item events yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Activity appears when live marketplace snapshots change for {itemType}.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {itemEvents.map((event) => (
              <div key={event.id} className="rounded-lg border-2 bg-muted/25 p-3">
                <p className="text-sm font-semibold">{event.message}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {event.type.replace(/_/g, " ")} · {formatRelativeSeconds(event.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
