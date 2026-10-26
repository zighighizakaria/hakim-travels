import { uploadUrl } from "@/lib/format";
import type { AdminImage, ImageRef, ImageUsage, Lang } from "@/lib/types";
import { getDb } from "../db/client";
import { all, bool, flag, get, loc, placeholders, run, withDbErrors } from "../db/sql";
import { DomainError } from "../db/sql";

export type ImageRow = {
  id: number;
  path: string;
  mime: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  original_name: string | null;
  alt_fr: string | null;
  alt_ar: string | null;
  is_demo: number;
  created_at: string;
};

export function toImageRef(row: ImageRow, lang: Lang): ImageRef {
  return {
    id: Number(row.id),
    url: uploadUrl(row.path),
    alt: loc(row, "alt", lang),
    width: row.width === null ? null : Number(row.width),
    height: row.height === null ? null : Number(row.height),
  };
}

function toAdminImage(row: ImageRow): AdminImage {
  return {
    id: Number(row.id),
    path: row.path,
    url: uploadUrl(row.path),
    mime: row.mime,
    sizeBytes: Number(row.size_bytes),
    width: row.width === null ? null : Number(row.width),
    height: row.height === null ? null : Number(row.height),
    originalName: row.original_name,
    altFr: row.alt_fr,
    altAr: row.alt_ar,
    isDemo: bool(row.is_demo),
    createdAt: row.created_at,
  };
}

/** Références d'images par identifiant (une seule requête). */
export function getImageRefs(ids: (number | null)[], lang: Lang): Map<number, ImageRef> {
  const unique = [...new Set(ids.filter((v): v is number => v !== null))];
  const map = new Map<number, ImageRef>();
  if (unique.length === 0) return map;
  const rows = all<ImageRow>(
    getDb(),
    `SELECT * FROM images WHERE id IN (${placeholders(unique.length)})`,
    ...unique,
  );
  for (const row of rows) map.set(Number(row.id), toImageRef(row, lang));
  return map;
}

export function getImageRef(id: number | null, lang: Lang): ImageRef | null {
  if (id === null) return null;
  return getImageRefs([id], lang).get(id) ?? null;
}

/** Galerie ordonnée d'une destination ou d'un voyage. */
export function galleryOf(kind: "destination" | "trip", ownerId: number, lang: Lang): ImageRef[] {
  const sql =
    kind === "destination"
      ? "SELECT i.* FROM destination_images x JOIN images i ON i.id = x.image_id WHERE x.destination_id = ? ORDER BY x.position, i.id"
      : "SELECT i.* FROM trip_images x JOIN images i ON i.id = x.image_id WHERE x.trip_id = ? ORDER BY x.position, i.id";
  return all<ImageRow>(getDb(), sql, ownerId).map((row) => toImageRef(row, lang));
}

export function insertImage(input: {
  path: string;
  mime: string;
  sizeBytes: number;
  width?: number | null | undefined;
  height?: number | null | undefined;
  originalName?: string | null | undefined;
  altFr?: string | null | undefined;
  altAr?: string | null | undefined;
  isDemo?: boolean | undefined;
}): AdminImage {
  const db = getDb();
  const { lastId } = withDbErrors(() =>
    run(
      db,
      `INSERT INTO images (path, mime, size_bytes, width, height, original_name, alt_fr, alt_ar, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.path,
      input.mime,
      input.sizeBytes,
      input.width ?? null,
      input.height ?? null,
      input.originalName ?? null,
      input.altFr ?? null,
      input.altAr ?? null,
      flag(input.isDemo ?? false),
    ),
  );
  const row = get<ImageRow>(db, "SELECT * FROM images WHERE id = ?", lastId);
  if (!row) throw new Error("Image introuvable après insertion.");
  return toAdminImage(row);
}

export function listImages(): AdminImage[] {
  return all<ImageRow>(getDb(), "SELECT * FROM images ORDER BY id DESC").map(toAdminImage);
}

export function getImageById(id: number): AdminImage | null {
  const row = get<ImageRow>(getDb(), "SELECT * FROM images WHERE id = ?", id);
  return row ? toAdminImage(row) : null;
}

export function updateImageAlt(
  id: number,
  alt: { altFr: string | null; altAr: string | null },
): void {
  const res = run(
    getDb(),
    "UPDATE images SET alt_fr = ?, alt_ar = ? WHERE id = ?",
    alt.altFr,
    alt.altAr,
    id,
  );
  if (res.changes === 0) throw new DomainError("Image introuvable.", "not_found");
}

/** Où l'image est utilisée (couvertures, galeries, réglages). */
export function imageUsage(id: number): ImageUsage {
  const db = getDb();
  const uses: ImageUsage["uses"] = [];

  const destinations = all<{ id: number; name_fr: string }>(
    db,
    `SELECT id, name_fr FROM destinations WHERE cover_image_id = ?
     UNION SELECT d.id, d.name_fr FROM destination_images x JOIN destinations d ON d.id = x.destination_id WHERE x.image_id = ?`,
    id,
    id,
  );
  for (const d of destinations)
    uses.push({ kind: "destination", id: Number(d.id), label: d.name_fr });

  const trips = all<{ id: number; title_fr: string }>(
    db,
    `SELECT id, title_fr FROM trips WHERE cover_image_id = ?
     UNION SELECT t.id, t.title_fr FROM trip_images x JOIN trips t ON t.id = x.trip_id WHERE x.image_id = ?`,
    id,
    id,
  );
  for (const t of trips) uses.push({ kind: "trip", id: Number(t.id), label: t.title_fr });

  const settings = get<{ n: number }>(
    db,
    "SELECT 1 AS n FROM site_settings WHERE hero_image_id = ? OR og_image_id = ?",
    id,
    id,
  );
  if (settings) uses.push({ kind: "settings", id: 1, label: "Réglages du site" });

  return { total: uses.length, uses };
}

/** Supprime la ligne (les références sont mises à NULL ou retirées) et renvoie le chemin du fichier à effacer. */
export function deleteImage(id: number): string | null {
  const db = getDb();
  const row = get<{ path: string }>(db, "SELECT path FROM images WHERE id = ?", id);
  if (!row) return null;
  run(db, "DELETE FROM images WHERE id = ?", id);
  return row.path;
}
