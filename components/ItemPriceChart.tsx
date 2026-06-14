"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatMarketPrice } from "@/lib/format";
import type { ItemStatPoint } from "@/lib/types";

export function ItemPriceChart({
  points,
  currency,
}: {
  points: ItemStatPoint[];
  currency?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dfb859" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#2f8c76" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgb(223 184 89 / 0.12)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#a9a08c"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                stroke="#a9a08c"
                tick={{ fontSize: 12 }}
                tickLine={false}
                width={72}
                tickFormatter={(value) => formatMarketPrice(Number(value), currency)}
              />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid rgb(223 184 89 / 0.32)",
                  borderRadius: 4,
                  color: "#f0e6ca",
                }}
                formatter={(value, name) => {
                  if (name === "salesCount") {
                    return [Number(value).toLocaleString("en-US"), "Listing count"];
                  }

                  return [
                    formatMarketPrice(Number(value), currency),
                    name === "floorPrice" ? "Floor" : "Avg unit",
                  ];
                }}
              />
              <Area
                type="monotone"
                dataKey="avgUnitPrice"
                stroke="#dfb859"
                strokeWidth={2}
                fill="url(#priceFill)"
              />
              <Line
                type="monotone"
                dataKey="floorPrice"
                stroke="#69d8b2"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Bar
                dataKey="salesCount"
                fill="rgb(120 151 255 / 0.28)"
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Uses Kintara daily averages first. TODO: generate local OHLC candles and
          listing-count history from stored snapshots.
        </p>
      </CardContent>
    </Card>
  );
}
