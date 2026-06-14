"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { getWatchlist, removeWatchedItem, type WatchedItem } from "@/lib/watchlist";
import {
  getSellerWatchlist,
  removeWatchedSeller,
  type WatchedSeller,
} from "@/lib/watchlist";
import { formatDate } from "@/lib/format";

export function WatchlistPanel() {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [sellers, setSellers] = useState<WatchedSeller[]>([]);

  useEffect(() => {
    const sync = () => {
      setItems(getWatchlist());
      setSellers(getSellerWatchlist());
    };

    sync();
    window.addEventListener("kintara-watchlist-change", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("kintara-watchlist-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 && sellers.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Follow item types or sellers from their detail pages.
          </div>
        ) : (
          <div className="space-y-5">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Items
              </h3>
            {items.map((item) => (
              <div
                key={item.itemType}
                className="flex items-center justify-between gap-3 rounded-lg border-2 bg-muted/25 p-3"
              >
                <Link
                  href={`/market/${encodeURIComponent(item.itemType)}`}
                  className="min-w-0"
                >
                  <p className="truncate font-semibold">{item.itemType}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {formatDate(item.addedAt)}
                  </p>
                </Link>
                <Button
                  variant="ghost"
                  className="h-9 w-9 px-0"
                  onClick={() => setItems(removeWatchedItem(item.itemType))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            </section>
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Sellers
              </h3>
              {sellers.map((seller) => (
                <div
                  key={seller.sellerName}
                  className="flex items-center justify-between gap-3 rounded-lg border-2 bg-muted/25 p-3"
                >
                  <Link
                    href={`/seller/${encodeURIComponent(seller.sellerName)}`}
                    className="min-w-0"
                  >
                    <p className="truncate font-semibold">{seller.sellerName}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {formatDate(seller.addedAt)}
                    </p>
                  </Link>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 px-0"
                    onClick={() => setSellers(removeWatchedSeller(seller.sellerName))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
