export type MarketCurrency = "all" | "gold" | "token";

export type MarketSort = "latest" | "cheap" | "expensive";

export type ListingQuery = {
  sort?: MarketSort;
  currency?: MarketCurrency;
  category?: string;
  limit?: number;
  offset?: number;
  q?: string;
  mine?: boolean;
};

export type MarketListing = {
  id: string;
  itemType: string;
  itemName: string;
  category?: string;
  iconUrl?: string;
  quantity: number;
  seller?: string;
  currency: "gold" | "token" | string;
  price: number;
  unitPrice: number;
  priceUsd?: number;
  unitPriceUsd?: number;
  priceKind?: "gold" | "token" | "usd" | "unknown";
  reserved?: boolean;
  createdAt?: string;
  raw: unknown;
};

export type ListingsResponse = {
  listings: MarketListing[];
  total?: number;
  sourceMessage?: string;
};

export type MarketEventType =
  | "listing_created"
  | "listing_removed"
  | "listing_reserved"
  | "listing_unreserved"
  | "floor_price_changed"
  | "new_floor_listing"
  | "large_stack_listed";

export type MarketEvent = {
  id: string;
  type: MarketEventType;
  listingId?: string | number;
  itemType?: string;
  currency?: "gold" | "token";
  message: string;
  createdAt: string;
  payload?: Record<string, unknown>;
};

export type MarketSummary = {
  activeListings: number;
  tokenListings: number;
  goldListings: number;
  uniqueItemTypes: number;
  topItemFloors: Array<{
    itemType: string;
    itemName: string;
    currency: string;
    floorPrice: number;
    listingId: string;
  }>;
  biggestListings: MarketListing[];
};

export type LiveMarketResponse = {
  ok: true;
  generatedAt: string;
  listings: MarketListing[];
  summary: MarketSummary;
  events: MarketEvent[];
  stale: boolean;
  warning?: string;
};

export type ItemStatPoint = {
  date: string;
  avgUnitPrice: number;
  floorPrice?: number;
  salesCount?: number;
  volume?: number;
};

export type ItemStatsResponse = {
  itemType: string;
  currency?: string;
  points: ItemStatPoint[];
  floorPrice?: number;
  average30d?: number;
  salesCount?: number;
  sourceMessage?: string;
};

export type TokenStats = {
  priceUsd?: number;
  liquidityUsd?: number;
  volume24h?: number;
  priceChange24h?: number;
  fdv?: number;
  marketCap?: number;
  pairUrl?: string;
  sourceMessage?: string;
};

export type DexScreenerPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  priceUsd?: string;
  liquidity?: {
    usd?: number;
  };
  volume?: {
    h24?: number;
  };
  priceChange?: {
    h24?: number;
  };
  fdv?: number;
  marketCap?: number;
};

export type DexScreenerTokenResponse = {
  pairs?: DexScreenerPair[];
};

export type ApiErrorPayload = {
  ok?: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  status?: number;
  source?: string;
};

export type ApiEnvelope<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
  source?: string;
};

export type ItemMetrics = {
  itemType: string;
  activeListings: number;
  listedQuantity: number;
  tokenListings: number;
  goldListings: number;
  tokenListedQuantity: number;
  goldListedQuantity: number;
  tokenFloorUnit?: number;
  goldFloorUnit?: number;
  tokenMedianUnit?: number;
  goldMedianUnit?: number;
  tokenAvgUnit?: number;
  goldAvgUnit?: number;
  tokenListedValue: number;
  goldListedValue: number;
  tokenFloorUsd?: number;
  tokenListedValueUsd?: number;
  cheapestTokenListing?: MarketListing;
  cheapestGoldListing?: MarketListing;
  sellers: number;
  updatedAt: string;
};

export type ItemMetricHistorySample = {
  itemType: string;
  capturedAt: string;
  tokenFloorUnit?: number;
  goldFloorUnit?: number;
  tokenListedValue: number;
  goldListedValue: number;
  tokenListedValueUsd?: number;
  listedQuantity: number;
  activeListings: number;
  tokenListings?: number;
  goldListings?: number;
  tokenMedianUnit?: number;
  goldMedianUnit?: number;
  tokenAvgUnit?: number;
  goldAvgUnit?: number;
};

export type MarketSellerMetricSample = {
  capturedAt: string;
  sellerName: string;
  activeListings: number;
  listedQuantity: number;
  tokenListings: number;
  goldListings: number;
  tokenListedValue: number;
  goldListedValue: number;
  uniqueItemTypes: number;
};

export type ItemMarketResponse = {
  ok: true;
  itemType: string;
  metrics: ItemMetrics;
  salesStats: {
    gold: ItemStatsResponse;
    token: ItemStatsResponse;
  };
  history: ItemMetricHistorySample[];
  orderBook: {
    token: MarketListing[];
    gold: MarketListing[];
  };
  events?: MarketEvent[];
  generatedAt: string;
};
