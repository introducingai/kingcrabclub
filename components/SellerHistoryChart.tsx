"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatNumber } from "@/lib/format";
import type { MarketSellerMetricSample } from "@/lib/types";

export function SellerHistoryChart({
  metrics,
}: {
  metrics: MarketSellerMetricSample[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Listing Count</CardTitle>
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgb(223 184 89 / 0.12)" vertical={false} />
                <XAxis dataKey="capturedAt" stroke="#a9a08c" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis stroke="#a9a08c" tick={{ fontSize: 12 }} tickLine={false} width={58} />
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid rgb(223 184 89 / 0.32)",
                    borderRadius: 6,
                    color: "#f0e6ca",
                  }}
                  formatter={(value, name) => [formatNumber(Number(value)), labelFor(name)]}
                />
                <Area
                  type="monotone"
                  dataKey="activeListings"
                  stroke="#dfb859"
                  fill="rgb(223 184 89 / 0.18)"
                  strokeWidth={2}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="listedQuantity"
                  stroke="#69d8b2"
                  fill="rgb(105 216 178 / 0.12)"
                  strokeWidth={2}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8 text-center">
            <p className="font-semibold">No persisted seller history yet</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The live market route stores minute-bucketed seller metrics as it observes listings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function labelFor(name: unknown) {
  return String(name)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}
