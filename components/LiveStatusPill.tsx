"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { formatRelativeSeconds } from "@/lib/format";
import { cn } from "@/lib/utils";

type LiveStatusPillProps = {
  updatedAt?: string | number;
  isError?: boolean;
  stale?: boolean;
  warning?: string;
};

export function LiveStatusPill({
  updatedAt,
  isError,
  stale,
  warning,
}: LiveStatusPillProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  const { label, tone } = useMemo(() => {
    if (isError) {
      return { label: "Offline", tone: "offline" as const };
    }

    const timestamp = updatedAt
      ? typeof updatedAt === "number"
        ? updatedAt
        : new Date(updatedAt).getTime()
      : 0;
    if (!timestamp) {
      return { label: "Stale", tone: "stale" as const };
    }

    const age = Math.floor((now - timestamp) / 1000);

    if (stale || age > 30) {
      return { label: "Offline", tone: "offline" as const };
    }

    if (age >= 10) {
      return { label: "Stale", tone: "stale" as const };
    }

    return { label: "Live", tone: "live" as const };
  }, [isError, now, stale, updatedAt]);

  return (
    <div
      title={warning}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]",
        tone === "live" && "border-emerald-400/40 bg-emerald-400/12 text-emerald-200",
        tone === "stale" && "border-amber-400/45 bg-amber-400/12 text-amber-200",
        tone === "offline" && "border-destructive/45 bg-destructive/12 text-destructive",
      )}
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          tone === "live" && "bg-emerald-300 shadow-[0_0_12px_rgb(110_231_183/0.7)]",
          tone === "stale" && "bg-amber-300 shadow-[0_0_12px_rgb(252_211_77/0.55)]",
          tone === "offline" && "bg-destructive",
        )}
      />
      <Activity className="h-3.5 w-3.5" />
      {label}
      <span className="normal-case tracking-normal text-current/75">
        {formatRelativeSeconds(updatedAt)}
      </span>
    </div>
  );
}
