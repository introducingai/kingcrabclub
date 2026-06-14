import type { ListingQuery } from "./types";

export type SavedSearch = {
  id: string;
  name: string;
  filters: ListingQuery;
  createdAt: string;
};

const SAVED_SEARCHES_KEY = "kintara.saved-searches.v1";
const ALERT_RULES_KEY = "kintara.alert-rules.v1";

export type LocalAlertRule = {
  id: string;
  type: "price_below" | "new_floor_listing" | "item_token" | "item_gold" | "seller_activity";
  label: string;
  enabled: false;
  payload?: Record<string, unknown>;
  createdAt: string;
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);

    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("kintara-saved-searches-change"));
}

export function getSavedSearches() {
  return readStorage<SavedSearch[]>(SAVED_SEARCHES_KEY, []);
}

export function saveSearch(filters: ListingQuery, name?: string) {
  const search: SavedSearch = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name || filters.q || filters.category || "Market search",
    filters,
    createdAt: new Date().toISOString(),
  };
  const next = [search, ...getSavedSearches()].slice(0, 25);

  writeStorage(SAVED_SEARCHES_KEY, next);

  return next;
}

export function removeSavedSearch(id: string) {
  const next = getSavedSearches().filter((search) => search.id !== id);
  writeStorage(SAVED_SEARCHES_KEY, next);

  return next;
}

export function getAlertRules() {
  return readStorage<LocalAlertRule[]>(ALERT_RULES_KEY, []);
}

export function seedDisabledAlertRules() {
  const existing = getAlertRules();

  if (existing.length > 0) {
    return existing;
  }

  const rules: LocalAlertRule[] = [
    "price_below",
    "new_floor_listing",
    "item_token",
    "item_gold",
    "seller_activity",
  ].map((type) => ({
    id: type,
    type: type as LocalAlertRule["type"],
    label: type.replace(/_/g, " "),
    enabled: false,
    createdAt: new Date().toISOString(),
  }));

  writeStorage(ALERT_RULES_KEY, rules);

  return rules;
}
