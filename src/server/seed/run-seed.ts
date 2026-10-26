import fs from "node:fs/promises";
import path from "node:path";
import type { DepartureInput, DestinationInput, TripInput } from "@/lib/schemas";
import type { DemoCounts } from "@/lib/types";
import { getDb } from "../db/client";
import { addDays, all, get, run, today as casablancaToday } from "../db/sql";
import { tx } from "../db/tx";
import { getEnv } from "../env";
import {
  deleteUploadFile,
  readImageSize,
  resolveUploadPath,
  sniffImageType,
  type ImageMime,
} from "../media/storage";
import { saveDeparture } from "../repositories/departures.repo";
import { saveDestination } from "../repositories/destinations.repo";
import { insertImage } from "../repositories/images.repo";
import { saveTrip } from "../repositories/trips.repo";
import {
  demoDestinations,
  demoImages,
  demoTrips,
  type AssetKey,
  type Bi,
  type DemoFaq,
} from "./demo-data";

export type SeedResult = {
  skipped: boolean;
  destinations: number;
  trips: number;
  departures: number;
  images: number;
};

/** Dossier des images de démonstration (versionné dans le dépôt). */
export function defaultSeedAssetsDir(): string {
  return path.resolve(process.cwd(), "scripts", "seed-assets");
}

export function countDemoData(): DemoCounts {
  const db = getDb();
  const n = (table: string) =>
    Number(get<{ n: number }>(db, `SELECT COUNT(*) AS n FROM ${table} WHERE is_demo = 1`)?.n ?? 0);
  return { trips: n("trips"), destinations: n("destinations"), images: n("images") };
}

const faqs = (list: DemoFaq[]) =>
  list.map((f) => ({ questionFr: f.q.fr, questionAr: f.q.ar, answerFr: f.a.fr, answerAr: f.a.ar }));

const simple = (list: Bi[]) => list.map((i) => ({ textFr: i.fr, textAr: i.ar }));

function markDemo(table: "destinations" | "trips" | "departures", id: number): void {
  run(getDb(), `UPDATE ${table} SET is_demo = 1 WHERE id = ?`, id);
}

/**
 * Insère le jeu de démonstration (idempotent : rien n'est fait si des données démo existent déjà,
 * sauf avec `force`, qui les supprime d'abord). Dates relatives à aujourd'hui.
 */
export async function runSeed(
  opts: { force?: boolean; seedAssetsDir?: string; today?: string; uploadsDir?: string } = {},
): Promise<SeedResult> {
  const db = getDb();
  const assetsDir = opts.seedAssetsDir ?? defaultSeedAssetsDir();
  const uploadsDir = opts.uploadsDir ?? getEnv().uploadsDir;
  const today = opts.today ?? casablancaToday();

  const existing = countDemoData();
  if (existing.destinations + existing.trips > 0) {
    if (!opts.force) return { skipped: true, destinations: 0, trips: 0, departures: 0, images: 0 };
    await deleteDemoData(uploadsDir);
  }

  // Les fichiers sont copiés avant la transaction : seul le SQL est transactionnel.
  const files = new Map<
    AssetKey,
    { size: number; mime: ImageMime; width: number | null; height: number | null }
  >();
  for (const image of demoImages) {
    const target = resolveUploadPath(uploadsDir, `seed/${image.file}`);
    if (!target) throw new Error(`Chemin d'image de démo invalide : ${image.file}`);
    const buffer = await fs.readFile(path.join(assetsDir, image.file));
    const type = sniffImageType(buffer);
    if (!type) throw new Error(`Image de démo illisible : ${image.file}`);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buffer);
    const dims = readImageSize(buffer, type.mime);
    files.set(image.key, {
      size: buffer.byteLength,
      mime: type.mime,
      width: dims?.width ?? null,
      height: dims?.height ?? null,
    });
  }

  return tx(db, () => {
    const imageIds = new Map<AssetKey, number>();
    for (const image of demoImages) {
      const relative = `seed/${image.file}`;
      const known = get<{ id: number }>(db, "SELECT id FROM images WHERE path = ?", relative);
      if (known) {
        imageIds.set(image.key, Number(known.id));
        continue;
      }
      const info = files.get(image.key);
      if (!info) throw new Error(`Image de démo non préparée : ${image.key}`);
      const row = insertImage({
        path: relative,
        mime: info.mime,
        sizeBytes: info.size,
        width: info.width,
        height: info.height,
        originalName: image.file,
        altFr: image.alt.fr,
        altAr: image.alt.ar,
        isDemo: true,
      });
      imageIds.set(image.key, row.id);
    }
    const idOf = (key: AssetKey): number => {
      const id = imageIds.get(key);
      if (id === undefined) throw new Error(`Image de démo inconnue : ${key}`);
      return id;
    };

    const destinationIds = new Map<string, number>();
    demoDestinations.forEach((d, index) => {
      const input: DestinationInput = {
        universe: d.universe,
        slug: d.slug,
        nameFr: d.name.fr,
        nameAr: d.name.ar,
        emoji: d.emoji,
        taglineFr: d.tagline.fr,
        taglineAr: d.tagline.ar,
        teaserFr: d.teaser.fr,
        teaserAr: d.teaser.ar,
        introFr: d.intro.fr,
        introAr: d.intro.ar,
        coverImageId: d.cover ? idOf(d.cover) : null,
        seoTitleFr: null,
        seoTitleAr: null,
        seoDescriptionFr: null,
        seoDescriptionAr: null,
        isPublished: true,
        isFeatured: d.featured,
        sortOrder: index,
        highlights: d.highlights.map((h) => ({
          labelFr: null,
          labelAr: null,
          textFr: h.fr,
          textAr: h.ar,
        })),
        practical: d.practical.map((p) => ({
          labelFr: p.label.fr,
          labelAr: p.label.ar,
          textFr: p.text.fr,
          textAr: p.text.ar,
        })),
        faqs: faqs(d.faqs),
        imageIds: d.gallery.map(idOf),
      };
      const id = saveDestination(input);
      markDemo("destinations", id);
      destinationIds.set(d.slug, id);
    });

    let departureCount = 0;
    demoTrips.forEach((t, index) => {
      const destinationId = destinationIds.get(t.destination);
      if (destinationId === undefined)
        throw new Error(`Destination de démo inconnue : ${t.destination}`);
      const input: TripInput = {
        destinationId,
        slug: t.slug,
        titleFr: t.title.fr,
        titleAr: t.title.ar,
        teaserFr: t.teaser.fr,
        teaserAr: t.teaser.ar,
        presentationFr: t.presentation.fr,
        presentationAr: t.presentation.ar,
        durationDays: t.durationDays,
        durationNights: t.durationNights,
        priceFromMad: t.priceFromMad,
        priceNoteFr: null,
        priceNoteAr: null,
        coverImageId: t.cover ? idOf(t.cover) : null,
        whatsappMessageFr: null,
        whatsappMessageAr: null,
        seoTitleFr: null,
        seoTitleAr: null,
        seoDescriptionFr: null,
        seoDescriptionAr: null,
        status: "published",
        isFeatured: t.featured,
        sortOrder: index,
        days: t.program.map((p) => ({
          labelFr: p.label.fr,
          labelAr: p.label.ar,
          titleFr: p.title.fr,
          titleAr: p.title.ar,
          bodyFr: p.body.fr,
          bodyAr: p.body.ar,
        })),
        highlights: simple(t.highlights),
        included: simple(t.included),
        excluded: simple(t.excluded),
        faqs: faqs(t.faqs),
        imageIds: t.gallery.map(idOf),
      };
      const tripId = saveTrip(input);
      markDemo("trips", tripId);

      for (const dep of t.departures) {
        const start = addDays(today, dep.offset);
        const departure: DepartureInput = {
          tripId,
          startDate: start,
          endDate: addDays(start, Math.max(t.spanDays - 1, 0)),
          departureCityFr: dep.city.fr,
          departureCityAr: dep.city.ar,
          meetingPointFr: dep.meeting?.fr ?? null,
          meetingPointAr: dep.meeting?.ar ?? null,
          priceMad: dep.priceMad,
          childPriceMad: dep.childPriceMad ?? null,
          seatsTotal: dep.seatsTotal,
          seatsLeft: dep.seatsLeft,
          status: "open",
          noteFr: dep.note?.fr ?? null,
          noteAr: dep.note?.ar ?? null,
        };
        markDemo("departures", saveDeparture(departure));
        departureCount += 1;
      }
    });

    return {
      skipped: false,
      destinations: demoDestinations.length,
      trips: demoTrips.length,
      departures: departureCount,
      images: demoImages.length,
    };
  });
}

/**
 * Supprime tout ce qui est marqué démo : voyages (et leurs départs, programme, FAQ), départs démo restants,
 * destinations démo sans voyage réel, images démo plus utilisées (fichiers compris).
 */
export async function deleteDemoData(
  uploadsDir: string = getEnv().uploadsDir,
): Promise<DemoCounts> {
  const db = getDb();
  const removedPaths: string[] = [];

  const counts = tx(db, () => {
    const trips = run(db, "DELETE FROM trips WHERE is_demo = 1").changes;
    run(db, "DELETE FROM departures WHERE is_demo = 1");
    const destinations = run(
      db,
      "DELETE FROM destinations WHERE is_demo = 1 AND id NOT IN (SELECT destination_id FROM trips)",
    ).changes;

    const unused = all<{ id: number; path: string }>(
      db,
      `SELECT id, path FROM images WHERE is_demo = 1
         AND id NOT IN (SELECT cover_image_id FROM destinations WHERE cover_image_id IS NOT NULL)
         AND id NOT IN (SELECT cover_image_id FROM trips WHERE cover_image_id IS NOT NULL)
         AND id NOT IN (SELECT image_id FROM destination_images)
         AND id NOT IN (SELECT image_id FROM trip_images)
         AND id NOT IN (SELECT hero_image_id FROM site_settings WHERE hero_image_id IS NOT NULL)
         AND id NOT IN (SELECT og_image_id FROM site_settings WHERE og_image_id IS NOT NULL)`,
    );
    for (const image of unused) {
      run(db, "DELETE FROM images WHERE id = ?", image.id);
      removedPaths.push(image.path);
    }
    return { trips, destinations, images: unused.length };
  });

  for (const relative of removedPaths) await deleteUploadFile(relative, uploadsDir);
  return counts;
}
