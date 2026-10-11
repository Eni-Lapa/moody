import path from "path";
import sqlite3 from "sqlite3";
import { DAYS_OF_WEEK } from "@/constants/moods";

const dbPath =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "moods.db");

function logError(context: string) {
  return (err: Error | null) => {
    if (err) console.error(`[db] ${context}:`, err.message);
  };
}

export const db = new sqlite3.Database(dbPath, logError("open"));

// Run statements one at a time, in the order they are issued, so the schema
// and seed below are in place before any request reaches the database.
db.serialize();

db.exec(
  `CREATE TABLE IF NOT EXISTS days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    order_index INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS day_moods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id INTEGER NOT NULL,
    mood_name TEXT,
    FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE,
    UNIQUE(day_id)
  );`,
  logError("create schema")
);

// Idempotent: a restart leaves existing rows and moods untouched.
const insertDay = db.prepare(
  "INSERT OR IGNORE INTO days (name, order_index) VALUES (?, ?)"
);
DAYS_OF_WEEK.forEach((day, index) =>
  insertDay.run(day, index + 1, logError("seed days"))
);
insertDay.finalize();

db.run(
  "INSERT OR IGNORE INTO day_moods (day_id, mood_name) SELECT id, NULL FROM days",
  logError("seed day_moods")
);
