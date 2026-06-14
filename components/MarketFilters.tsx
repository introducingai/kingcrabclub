"use client";

import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import type { ListingQuery, MarketCurrency, MarketSort } from "@/lib/types";

type MarketFiltersProps = {
  value: ListingQuery;
  categories: string[];
  onChange: (value: ListingQuery) => void;
};

export function MarketFilters({ value, categories, onChange }: MarketFiltersProps) {
  return (
    <div className="kintara-panel rounded-lg p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search"
            placeholder="Search item"
            value={value.q ?? ""}
            onChange={(event) => onChange({ ...value, q: event.target.value, offset: 0 })}
            className="pl-9"
          />
        </label>
        <Select
          aria-label="Category"
          value={value.category ?? ""}
          onChange={(event) =>
            onChange({ ...value, category: event.target.value, offset: 0 })
          }
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Currency"
          value={value.currency ?? "all"}
          onChange={(event) =>
            onChange({
              ...value,
              currency: event.target.value as MarketCurrency,
              offset: 0,
            })
          }
        >
          <option value="all">All currencies</option>
          <option value="gold">Gold</option>
          <option value="token">KINS</option>
        </Select>
        <Select
          aria-label="Sort"
          value={value.sort ?? "latest"}
          onChange={(event) =>
            onChange({ ...value, sort: event.target.value as MarketSort, offset: 0 })
          }
        >
          <option value="latest">Latest</option>
          <option value="cheap">Cheapest</option>
          <option value="expensive">Most expensive</option>
        </Select>
      </div>
    </div>
  );
}
