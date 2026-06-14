import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dbPath = process.env.MARKET_HISTORY_DB_PATH ?? join(root, ".data", "kintara-market-history.sqlite");
const migrationPath = join(root, "db", "migrations", "001_market_history.sql");

mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA busy_timeout = 5000;");
db.exec(readFileSync(migrationPath, "utf8"));
db.close();

console.log(`Market history database ready: ${dbPath}`);
