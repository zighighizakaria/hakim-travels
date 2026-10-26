import "./_env";
import { openDatabase } from "../src/server/db/client";
import { runMigrations } from "../src/server/db/migrate";
import { getEnv } from "../src/server/env";

const file = getEnv().databasePath;
const db = openDatabase(file, { migrate: false });
try {
  const applied = runMigrations(db);
  console.log(`Base : ${file}`);
  console.log(
    applied.length > 0
      ? `Migrations appliquées : ${applied.join(", ")}`
      : "Aucune migration à appliquer : la base est à jour.",
  );
} finally {
  db.close();
}
