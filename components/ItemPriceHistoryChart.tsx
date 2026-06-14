"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
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
import { Button } from "./ui/button";
import { formatMarketPrice, formatNumber, formatUsdKins } from "@/lib/format";
import type { ItemMarketResponse } from "@/lib/types";

type ChartMode = "sales" | "floor" | "supply" | "listed-value";

const modes: Array<{ id: ChartMode; label: string }> = [
  { id: "sales", label: "Completed sales avg" },
  { id: "floor", label: "Floor price" },
  { id: "supply", label: "Listed supply" },
  { id: "listed-value", label: "Listed value" },
];

export function ItemPriceHistoryChart({ data }: { data?: ItemMarketResponse }) {
  const [mode, setMode] = useState<ChartMode>("sales");
  const salesPoints = useMemo(() => {
    const gold = data?.salesStats.gold.points ?? [];
    const token = data?.salesStats.token.points ?? [];
    const dates = Array.from(new Set([...gold, ...token].map((point) => point.date))).sort();

    return dates.map((date) => {
      const goldPoint = gold.find((point) => point.date === date);
      const tokenPoint = token.find((point) => point.date === date);

      return {
        date,
        goldAvg: goldPoint?.avgUnitPrice,
        tokenAvg: tokenPoint?.avgUnitPrice,
        goldSales: goldPoint?.salesCount,
        tokenSales: tokenPoint?.salesCount,
      };
    });
  }, [data?.salesStats.gold.points, data?.salesStats.token.points]);
  const historyPoints = data?.history ?? [];
  const activeData = mode === "sales" ? salesPoints : historyPoints;
  const hasData = activeData.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Item History</CardTitle>
        <div className="flex flex-wrap gap-2">
          {modes.map((item) => (
            <Button
              key={item.id}
              variant={mode === item.id ? "default" : "outline"}
              className="h-9 px-3 text-xs"
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {mode === "sales" ? (
                <ComposedChart data={salesPoints} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgb(223 184 89 / 0.12)" vertical={false} />
                  <XAxis dataKey="date" stroke="#a9a08c" tick={{ fontSize: 12 }} tickLine={false} />
                  <YAxis stroke="#a9a08c" tick={{ fontSize: 12 }} tickLine={false} width={74} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => {
                      if (String(name).includes("Sales")) {
                        return [formatNumber(Number(value)), String(name)];
                      }

                      return [
                        String(name).includes("token")
                          ? formatUsdKins(Number(value), 4)
                          : formatMarketPrice(Number(value), "gold"),
                        String(name).includes("token") ? "$ KINS avg" : "Gold avg",
                      ];
                    }}
                  />
                  <Area type="monotone" dataKey="goldAvg" stroke="#dfb859" fill="rgb(223 184 89 / 0.18)" connectNulls />
                  <Line type="monotone" dataKey="tokenAvg" stroke="#69d8b2" strokeWidth={2} dot={false} connectNulls />
                  <Bar dataKey="goldSales" fill="rgb(223 184 89 / 0.22)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tokenSales" fill="rgb(105 216 178 / 0.22)" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              ) : (
                <AreaChart data={historyPoints} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgb(223 184 89 / 0.12)" vertical={false} />
                  <XAxis dataKey="capturedAt" stroke="#a9a08c" tick={{ fontSize: 12 }} tickLine={false} />
                  <YAxis stroke="#a9a08c" tick={{ fontSize: 12 }} tickLine={false} width={84} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatValue(mode, Number(value), String(name)), labelFor(name)]} />
                  <Area
                    type="monotone"
                    dataKey={mode === "floor" ? "goldFloorUnit" : mode === "supply" ? "listedQuantity" : "goldListedValue"}
                    stroke="#dfb859"
                    fill="rgb(223 184 89 / 0.18)"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey={mode === "floor" ? "tokenFloorUnit" : mode === "supply" ? "activeListings" : "tokenListedValue"}
                    stroke="#69d8b2"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8 text-center">
            <p className="font-semibold">Not enough history yet</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This chart will fill as the live item route captures minute-bucketed
              snapshots. Kintara sales averages appear when the stats endpoint
              returns daily samples.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const tooltipStyle = {
  background: "#111827",
  border: "1px solid rgb(223 184 89 / 0.32)",
  borderRadius: 6,
  color: "#f0e6ca",
};

function labelFor(name: unknown) {
  return String(name)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatValue(mode: ChartMode, value: number, name: string) {
  if (mode === "supply") {
    return formatNumber(value);
  }

  if (name.toLowerCase().includes("token")) {
    return formatUsdKins(value, 4);
  }

  return formatMarketPrice(value, "gold");
}
