import type { DatabaseSync } from "node:sqlite";

/** Transaction BEGIN IMMEDIATE / COMMIT / ROLLBACK. Imbriquée : rejoint la transaction en cours. */
export function tx<T>(db: DatabaseSync, fn: () => T): T {
  if (db.isTransaction) return fn();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // la transaction a déjà été annulée par SQLite
    }
    throw error;
  }
}
