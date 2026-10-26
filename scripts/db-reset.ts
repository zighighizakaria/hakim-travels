import "./_env";
import fs from "node:fs";
import { closeDb } from "../src/server/db/client";
import { getEnv } from "../src/server/env";
import { runSeed } from "../src/server/seed/run-seed";

/**
 * Supprime la base et les uploads, recrée le schéma puis le jeu de démonstration.
 * Refusé en production. Sous Windows, le serveur doit être arrêté (sinon EPERM).
 */
if (process.env["NODE_ENV"] === "production") {
  console.error("db:reset est refusé quand NODE_ENV=production.");
  process.exit(1);
}

const env = getEnv();
if (env.databasePath === ":memory:") {
  console.error("DATABASE_PATH=:memory: : rien à réinitialiser.");
  process.exit(1);
}

try {
  for (const suffix of ["", "-wal", "-shm"]) {
    fs.rmSync(`${env.databasePath}${suffix}`, { force: true });
  }
  fs.rmSync(env.uploadsDir, { recursive: true, force: true });
} catch (error) {
  const code = (error as NodeJS.ErrnoException).code;
  if (code === "EPERM" || code === "EBUSY") {
    console.error(
      "Impossible de supprimer la base : arrêtez d'abord le serveur (npm start / npm run dev).",
    );
  } else {
    console.error(error);
  }
  process.exit(1);
}

try {
  const result = await runSeed({ force: true });
  console.log(`Base : ${env.databasePath}`);
  console.log(
    `Réinitialisée : ${result.destinations} destinations, ${result.trips} voyages, ${result.departures} départs, ${result.images} images (démo).`,
  );
} finally {
  closeDb();
}
