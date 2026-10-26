import "./_env";
import fs from "node:fs";
import path from "node:path";
import { closeDb, getDb } from "../src/server/db/client";
import { getEnv } from "../src/server/env";

/** Sauvegarde cohérente à chaud (VACUUM INTO) dans <dossier de la base>/backups/. Les uploads se copient séparément. */
const env = getEnv();
if (env.databasePath === ":memory:") {
  console.error("DATABASE_PATH=:memory: : rien à sauvegarder.");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
const dir = path.join(path.dirname(env.databasePath), "backups");
const target = path.join(dir, `hakim-${stamp}.db`);

try {
  fs.mkdirSync(dir, { recursive: true });
  getDb().prepare("VACUUM INTO ?").run(target);
  console.log(`Sauvegarde créée : ${target}`);
  console.log(`Pensez aussi à sauvegarder les images : ${env.uploadsDir}`);
} finally {
  closeDb();
}
