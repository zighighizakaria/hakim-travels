import type { z } from "zod";
import { departureInputSchema, destinationInputSchema, tripInputSchema } from "@/lib/schemas";
import { openDatabase, setDatabase } from "./db/client";
import { saveDeparture } from "./repositories/departures.repo";
import { saveDestination } from "./repositories/destinations.repo";
import { saveTrip } from "./repositories/trips.repo";

/** Utilitaires partagés par les tests (jamais importé par l'application). */

export function freshDb() {
  const db = openDatabase(":memory:");
  setDatabase(db);
  return db;
}

let counter = 0;
const unique = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

export function makeDestination(
  over: Partial<z.input<typeof destinationInputSchema>> = {},
): number {
  const slug = `dest-${unique()}`;
  return saveDestination(
    destinationInputSchema.parse({
      universe: "maroc",
      slug,
      nameFr: `Destination ${slug}`,
      ...over,
    }),
  );
}

export function makeTrip(
  destinationId: number,
  over: Partial<z.input<typeof tripInputSchema>> = {},
): number {
  const slug = `trip-${unique()}`;
  return saveTrip(
    tripInputSchema.parse({
      destinationId,
      slug,
      titleFr: `Voyage ${slug}`,
      status: "published",
      ...over,
    }),
  );
}

export function makeDeparture(
  tripId: number,
  over: Partial<z.input<typeof departureInputSchema>> = {},
): number {
  const startDate = over.startDate ?? "2030-07-01";
  return saveDeparture(
    departureInputSchema.parse({
      tripId,
      startDate,
      endDate: startDate,
      departureCityFr: "Casablanca",
      ...over,
    }),
  );
}
