import "./_env";
import { closeDb } from "../src/server/db/client";
import { runSeed } from "../src/server/seed/run-seed";

const force = process.argv.includes("--force");

try {
  const result = await runSeed({ force });
  if (result.skipped) {
    console.log(
      "Des données de démonstration existent déjà : rien à faire (utilisez --force pour les recréer).",
    );
  } else {
    console.log(
      `Données de démonstration créées : ${result.destinations} destinations, ${result.trips} voyages, ` +
        `${result.departures} départs, ${result.images} images.`,
    );
  }
} finally {
  closeDb();
}
