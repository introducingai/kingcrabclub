"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  getSavedSearches,
  removeSavedSearch,
  type SavedSearch,
} from "@/lib/savedSearches";
import { formatDate } from "@/lib/format";

function hrefForSearch(search: SavedSearch) {
  const params = new URLSearchParams();

  Object.entries(search.filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  });

  return `/market${params.toString() ? `?${params.toString()}` : ""}`;
}

export function SavedSearchesPanel() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    const sync = () => setSearches(getSavedSearches());

    sync();
    window.addEventListener("kintara-saved-searches-change", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("kintara-saved-searches-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Saved Searches
        </CardTitle>
      </CardHeader>
      <CardContent>
        {searches.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Save filters from the market browser.
          </div>
        ) : (
          <div className="space-y-3">
            {searches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between gap-3 rounded-lg border-2 bg-muted/25 p-3"
              >
                <Link href={hrefForSearch(search)} className="min-w-0">
                  <p className="truncate font-semibold">{search.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {JSON.stringify(search.filters)} · {formatDate(search.createdAt)}
                  </p>
                </Link>
                <Button
                  variant="ghost"
                  className="h-9 w-9 px-0"
                  onClick={() => setSearches(removeSavedSearch(search.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
