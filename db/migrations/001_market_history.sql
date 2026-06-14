CREATE TABLE IF NOT EXISTS market_listing_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  capturedAt TEXT NOT NULL,
  listingId TEXT NOT NULL,
  itemType TEXT NOT NULL,
  sellerName TEXT,
  quantity INTEGER NOT NULL,
  currency TEXT NOT NULL,
  price REAL NOT NULL,
  unitPrice REAL NOT NULL,
  status TEXT NOT NULL,
  createdAtRaw TEXT,
  rawJson TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_market_listing_snapshots_capturedAt
  ON market_listing_snapshots (capturedAt);

CREATE INDEX IF NOT EXISTS idx_market_listing_snapshots_itemType_capturedAt
  ON market_listing_snapshots (itemType, capturedAt);

CREATE INDEX IF NOT EXISTS idx_market_listing_snapshots_sellerName_capturedAt
  ON market_listing_snapshots (sellerName, capturedAt);

CREATE TABLE IF NOT EXISTS market_item_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  capturedAt TEXT NOT NULL,
  itemType TEXT NOT NULL,
  activeListings INTEGER NOT NULL,
  listedQuantity INTEGER NOT NULL,
  tokenListings INTEGER NOT NULL,
  goldListings INTEGER NOT NULL,
  tokenFloorUnit REAL,
  goldFloorUnit REAL,
  tokenMedianUnit REAL,
  goldMedianUnit REAL,
  tokenAvgUnit REAL,
  goldAvgUnit REAL,
  tokenListedValue REAL NOT NULL,
  goldListedValue REAL NOT NULL,
  tokenListedValueUsd REAL
);

CREATE INDEX IF NOT EXISTS idx_market_item_metrics_itemType_capturedAt
  ON market_item_metrics (itemType, capturedAt);

CREATE UNIQUE INDEX IF NOT EXISTS idx_market_item_metrics_unique_bucket
  ON market_item_metrics (itemType, capturedAt);

CREATE TABLE IF NOT EXISTS market_seller_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  capturedAt TEXT NOT NULL,
  sellerName TEXT NOT NULL,
  activeListings INTEGER NOT NULL,
  listedQuantity INTEGER NOT NULL,
  tokenListings INTEGER NOT NULL,
  goldListings INTEGER NOT NULL,
  tokenListedValue REAL NOT NULL,
  goldListedValue REAL NOT NULL,
  uniqueItemTypes INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_market_seller_metrics_sellerName_capturedAt
  ON market_seller_metrics (sellerName, capturedAt);

CREATE UNIQUE INDEX IF NOT EXISTS idx_market_seller_metrics_unique_bucket
  ON market_seller_metrics (sellerName, capturedAt);

CREATE TABLE IF NOT EXISTS market_events (
  id TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL,
  type TEXT NOT NULL,
  listingId TEXT,
  itemType TEXT,
  sellerName TEXT,
  currency TEXT,
  message TEXT NOT NULL,
  payloadJson TEXT
);

CREATE INDEX IF NOT EXISTS idx_market_events_createdAt
  ON market_events (createdAt);

CREATE INDEX IF NOT EXISTS idx_market_events_itemType_createdAt
  ON market_events (itemType, createdAt);

CREATE INDEX IF NOT EXISTS idx_market_events_sellerName_createdAt
  ON market_events (sellerName, createdAt);
