"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "./ui/button";
import {
  addWatchedSeller,
  isSellerWatched,
  removeWatchedSeller,
} from "@/lib/watchlist";

export function SellerWatchlistButton({ sellerName }: { sellerName: string }) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(isSellerWatched(sellerName));
  }, [sellerName]);

  function toggle() {
    if (watched) {
      removeWatchedSeller(sellerName);
      setWatched(false);
      return;
    }

    addWatchedSeller(sellerName);
    setWatched(true);
  }

  return (
    <Button variant={watched ? "default" : "outline"} onClick={toggle}>
      <Star className="h-4 w-4" />
      {watched ? "Watching seller" : "Watch seller"}
    </Button>
  );
}
