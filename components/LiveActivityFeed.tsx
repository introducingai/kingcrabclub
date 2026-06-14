import { Activity, BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatRelativeSeconds } from "@/lib/format";
import type { MarketEvent } from "@/lib/types";

export function LiveActivityFeed({ events }: { events: MarketEvent[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-primary" />
          Live Activity
        </CardTitle>
        <span className="text-xs text-muted-foreground">{events.length} events</span>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center">
            <p className="font-semibold">No live events yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Events appear after the live feed has at least two snapshots to compare.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 8).map((event) => (
              <div
                key={event.id}
                className="rounded-lg border-2 bg-muted/28 p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 bg-background text-primary">
                    <Activity className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{event.message}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {event.type.replace(/_/g, " ")} · {formatRelativeSeconds(event.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
