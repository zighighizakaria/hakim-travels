import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { getEnv } from "../env";
import { runMigrations } from "./migrate";

// node:sqlite est importé via getBuiltinModule : les externals de nitro ne connaissent pas « sqlite » sans préfixe.
const { DatabaseSync: Database } = process.getBuiltinModule(
  "node:sqlite",
) as typeof import("node:sqlite");

declare global {
  var __htDb: DatabaseSync | undefined;
}

/** Ouvre une base (ou ":memory:"), applique les PRAGMA puis les migrations (sauf `migrate: false`). */
export function openDatabase(file: string, opts: { migrate?: boolean } = {}): DatabaseSync {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec("PRAGMA synchronous = NORMAL");
  if (opts.migrate !== false) runMigrations(db);
  return db;
}

/**
 * Connexion unique du processus, conservée sur globalThis pour survivre au HMR en dev.
 * Tout l'accès SQL passe par ici (bascule possible vers better-sqlite3 si besoin).
 */
export function getDb(): DatabaseSync {
  if (!globalThis.__htDb) {
    globalThis.__htDb = openDatabase(getEnv().databasePath);
  }
  return globalThis.__htDb;
}

/** Remplace la connexion courante (tests, scripts). */
export function setDatabase(db: DatabaseSync): void {
  globalThis.__htDb = db;
}

export function closeDb(): void {
  if (globalThis.__htDb) {
    try {
      globalThis.__htDb.close();
    } finally {
      globalThis.__htDb = undefined;
    }
  }
}
