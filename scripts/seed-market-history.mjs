import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dbPath = process.env.MARKET_HISTORY_DB_PATH ?? join(root, ".data", "kintara-market-history.sqlite");
const migrationPath = join(root, "db", "migrations", "001_market_history.sql");
const capturedAt = new Date();

capturedAt.setSeconds(0, 0);
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA busy_timeout = 5000;");
db.exec(readFileSync(migrationPath, "utf8"));

const existing = db
  .prepare("SELECT COUNT(*) AS count FROM market_item_metrics WHERE itemType = ?")
  .get("wood");

if (!existing?.count) {
  db.prepare(`
    INSERT INTO market_item_metrics (
      capturedAt, itemType, activeListings, listedQuantity, tokenListings, goldListings,
      tokenFloorUnit, goldFloorUnit, tokenMedianUnit, goldMedianUnit, tokenAvgUnit, goldAvgUnit,
      tokenListedValue, goldListedValue, tokenListedValueUsd
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    capturedAt.toISOString(),
    "wood",
    0,
    0,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    null,
  );

  console.log("Seeded empty wood market metric sample.");
} else {
  console.log("Market history seed skipped; data already exists.");
}

db.close();
