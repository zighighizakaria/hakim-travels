import type { DatabaseSync } from "node:sqlite";
import { migrations } from "./migrations";
import { all, get, run } from "./sql";
import { tx } from "./tx";

/** Applique les migrations manquantes et renvoie les versions appliquées lors de cet appel. */
export function runMigrations(db: DatabaseSync): number[] {
  const hasTable = get<{ n: number }>(
    db,
    "SELECT 1 AS n FROM sqlite_master WHERE type = 'table' AND name = 'schema_migrations'",
  );
  const done = new Set<number>(
    hasTable
      ? all<{ version: number }>(db, "SELECT version FROM schema_migrations").map((r) =>
          Number(r.version),
        )
      : [],
  );

  const applied: number[] = [];
  for (const migration of [...migrations].sort((a, b) => a.version - b.version)) {
    if (done.has(migration.version)) continue;
    tx(db, () => {
      db.exec(migration.sql);
      run(db, "INSERT INTO schema_migrations (version) VALUES (?)", migration.version);
    });
    applied.push(migration.version);
  }
  return applied;
}
