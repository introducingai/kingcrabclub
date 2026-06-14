"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { addWatchedItem, isWatched, removeWatchedItem } from "@/lib/watchlist";

export function WatchlistButton({ itemType }: { itemType: string }) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(isWatched(itemType));
  }, [itemType]);

  function toggle() {
    if (watched) {
      removeWatchedItem(itemType);
      setWatched(false);
      return;
    }

    addWatchedItem(itemType);
    setWatched(true);
  }

  return (
    <Button variant={watched ? "default" : "outline"} onClick={toggle}>
      <Star className="h-4 w-4" />
      {watched ? "Watching" : "Watch item"}
    </Button>
  );
}
