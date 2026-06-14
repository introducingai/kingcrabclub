export type WatchedItem = {
  itemType: string;
  addedAt: string;
};

const WATCHLIST_KEY = "kintara.watchlist.v1";
const SELLER_WATCHLIST_KEY = "kintara.seller-watchlist.v1";

export type WatchedSeller = {
  sellerName: string;
  addedAt: string;
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
  window.dispatchEvent(new CustomEvent("kintara-watchlist-change"));
}

export function getWatchlist() {
  return readStorage<WatchedItem[]>(WATCHLIST_KEY, []);
}

export function isWatched(itemType: string) {
  return getWatchlist().some((item) => item.itemType === itemType);
}

export function addWatchedItem(itemType: string) {
  const watchlist = getWatchlist();

  if (watchlist.some((item) => item.itemType === itemType)) {
    return watchlist;
  }

  const next = [{ itemType, addedAt: new Date().toISOString() }, ...watchlist];
  writeStorage(WATCHLIST_KEY, next);

  return next;
}

export function removeWatchedItem(itemType: string) {
  const next = getWatchlist().filter((item) => item.itemType !== itemType);
  writeStorage(WATCHLIST_KEY, next);

  return next;
}

export function getSellerWatchlist() {
  return readStorage<WatchedSeller[]>(SELLER_WATCHLIST_KEY, []);
}

export function isSellerWatched(sellerName: string) {
  return getSellerWatchlist().some((seller) => seller.sellerName === sellerName);
}

export function addWatchedSeller(sellerName: string) {
  const watchlist = getSellerWatchlist();

  if (watchlist.some((seller) => seller.sellerName === sellerName)) {
    return watchlist;
  }

  const next = [{ sellerName, addedAt: new Date().toISOString() }, ...watchlist];
  writeStorage(SELLER_WATCHLIST_KEY, next);

  return next;
}

export function removeWatchedSeller(sellerName: string) {
  const next = getSellerWatchlist().filter((seller) => seller.sellerName !== sellerName);
  writeStorage(SELLER_WATCHLIST_KEY, next);

  return next;
}
