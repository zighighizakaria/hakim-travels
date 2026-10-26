import type { DestinationInput } from "@/lib/schemas";
import type {
  AdminDestination,
  AdminDestinationListItem,
  DestinationCard,
  DestinationDetail,
  FaqItem,
  Lang,
  TextItem,
  Universe,
} from "@/lib/types";
import { getDb } from "../db/client";
import { DomainError, all, bool, flag, get, loc, locText, run, withDbErrors } from "../db/sql";
import { tx } from "../db/tx";
import { galleryOf, getImageRef, getImageRefs } from "./images.repo";

type DestinationRow = {
  id: number;
  universe: Universe;
  slug: string;
  name_fr: string;
  name_ar: string | null;
  emoji: string | null;
  tagline_fr: string | null;
  tagline_ar: string | null;
  teaser_fr: string | null;
  teaser_ar: string | null;
  intro_fr: string | null;
  intro_ar: string | null;
  cover_image_id: number | null;
  seo_title_fr: string | null;
  seo_title_ar: string | null;
  seo_description_fr: string | null;
  seo_description_ar: string | null;
  is_published: number;
  is_featured: number;
  sort_order: number;
  is_demo: number;
  created_at: string;
  updated_at: string;
  trip_count: number;
};

type ItemRow = {
  kind: string;
  label_fr: string | null;
  label_ar: string | null;
  text_fr: string;
  text_ar: string | null;
};

type FaqRow = {
  question_fr: string;
  question_ar: string | null;
  answer_fr: string;
  answer_ar: string | null;
};

const SELECT = `SELECT d.*,
  (SELECT COUNT(*) FROM trips t WHERE t.destination_id = d.id AND t.status = 'published') AS trip_count
  FROM destinations d`;

const SELECT_ADMIN = `SELECT d.*, (SELECT COUNT(*) FROM trips t WHERE t.destination_id = d.id) AS trip_count
  FROM destinations d`;

function nullable(value: number | null): number | null {
  return value === null ? null : Number(value);
}

/* -------------------------------------------------------------------------- */
/* Public                                                                      */
/* -------------------------------------------------------------------------- */

function toCard(
  row: DestinationRow,
  lang: Lang,
  covers: Map<number, import("@/lib/types").ImageRef>,
): DestinationCard {
  return {
    id: Number(row.id),
    slug: row.slug,
    universe: row.universe,
    name: locText(row, "name", lang),
    emoji: row.emoji,
    tagline: loc(row, "tagline", lang),
    teaser: loc(row, "teaser", lang),
    cover: row.cover_image_id === null ? null : (covers.get(Number(row.cover_image_id)) ?? null),
    tripCount: Number(row.trip_count),
    isFeatured: bool(row.is_featured),
  };
}

export function listPublicDestinations(
  lang: Lang,
  f: { universe?: Universe | undefined; featured?: boolean | undefined } = {},
): DestinationCard[] {
  const where = ["d.is_published = 1"];
  const params: string[] = [];
  if (f.universe) {
    where.push("d.universe = ?");
    params.push(f.universe);
  }
  if (f.featured) where.push("d.is_featured = 1");
  const rows = all<DestinationRow>(
    getDb(),
    `${SELECT} WHERE ${where.join(" AND ")} ORDER BY d.sort_order, d.id`,
    ...params,
  );
  const covers = getImageRefs(
    rows.map((r) => nullable(r.cover_image_id)),
    lang,
  );
  return rows.map((r) => toCard(r, lang, covers));
}

function readItems(
  destinationId: number,
  lang: Lang,
): { highlights: TextItem[]; practical: TextItem[] } {
  const rows = all<ItemRow>(
    getDb(),
    "SELECT * FROM destination_items WHERE destination_id = ? ORDER BY position, id",
    destinationId,
  );
  const highlights: TextItem[] = [];
  const practical: TextItem[] = [];
  for (const r of rows) {
    const item: TextItem = { label: loc(r, "label", lang), text: locText(r, "text", lang) };
    (r.kind === "highlight" ? highlights : practical).push(item);
  }
  return { highlights, practical };
}

function readFaqs(destinationId: number, lang: Lang): FaqItem[] {
  return all<FaqRow>(
    getDb(),
    "SELECT * FROM faqs WHERE destination_id = ? ORDER BY position, id",
    destinationId,
  ).map((r) => ({ question: locText(r, "question", lang), answer: locText(r, "answer", lang) }));
}

/** Destination publiée uniquement ; les brouillons renvoient null. */
export function getPublicDestinationBySlug(lang: Lang, slug: string): DestinationDetail | null {
  const row = get<DestinationRow>(
    getDb(),
    `${SELECT} WHERE d.slug = ? AND d.is_published = 1`,
    slug,
  );
  if (!row) return null;
  const id = Number(row.id);
  const covers = getImageRefs([nullable(row.cover_image_id)], lang);
  return {
    ...toCard(row, lang, covers),
    intro: loc(row, "intro", lang),
    ...readItems(id, lang),
    gallery: galleryOf("destination", id, lang),
    faq: readFaqs(id, lang),
    seoTitle: loc(row, "seo_title", lang),
    seoDescription: loc(row, "seo_description", lang),
    updatedAt: row.updated_at,
  };
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                       */
/* -------------------------------------------------------------------------- */

export function adminListDestinations(): AdminDestinationListItem[] {
  return all<DestinationRow>(
    getDb(),
    `${SELECT_ADMIN} ORDER BY d.universe, d.sort_order, d.id`,
  ).map((r) => ({
    id: Number(r.id),
    universe: r.universe,
    slug: r.slug,
    nameFr: r.name_fr,
    nameAr: r.name_ar,
    emoji: r.emoji,
    isPublished: bool(r.is_published),
    isFeatured: bool(r.is_featured),
    sortOrder: Number(r.sort_order),
    isDemo: bool(r.is_demo),
    tripCount: Number(r.trip_count),
    updatedAt: r.updated_at,
  }));
}

export function adminGetDestination(id: number): AdminDestination | null {
  const db = getDb();
  const r = get<DestinationRow>(db, `${SELECT_ADMIN} WHERE d.id = ?`, id);
  if (!r) return null;

  const items = all<ItemRow>(
    db,
    "SELECT * FROM destination_items WHERE destination_id = ? ORDER BY position, id",
    id,
  );
  const toItem = (row: ItemRow) => ({
    labelFr: row.label_fr,
    labelAr: row.label_ar,
    textFr: row.text_fr,
    textAr: row.text_ar,
  });
  const faqs = all<FaqRow>(
    db,
    "SELECT * FROM faqs WHERE destination_id = ? ORDER BY position, id",
    id,
  );
  const gallery = galleryOf("destination", id, "fr");

  return {
    id: Number(r.id),
    universe: r.universe,
    slug: r.slug,
    nameFr: r.name_fr,
    nameAr: r.name_ar,
    emoji: r.emoji,
    taglineFr: r.tagline_fr,
    taglineAr: r.tagline_ar,
    teaserFr: r.teaser_fr,
    teaserAr: r.teaser_ar,
    introFr: r.intro_fr,
    introAr: r.intro_ar,
    coverImageId: nullable(r.cover_image_id),
    seoTitleFr: r.seo_title_fr,
    seoTitleAr: r.seo_title_ar,
    seoDescriptionFr: r.seo_description_fr,
    seoDescriptionAr: r.seo_description_ar,
    isPublished: bool(r.is_published),
    isFeatured: bool(r.is_featured),
    sortOrder: Number(r.sort_order),
    highlights: items.filter((i) => i.kind === "highlight").map(toItem),
    practical: items.filter((i) => i.kind === "practical").map(toItem),
    faqs: faqs.map((f) => ({
      questionFr: f.question_fr,
      questionAr: f.question_ar,
      answerFr: f.answer_fr,
      answerAr: f.answer_ar,
    })),
    imageIds: gallery.map((g) => g.id),
    isDemo: bool(r.is_demo),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    coverImage: getImageRef(nullable(r.cover_image_id), "fr"),
    gallery,
  };
}

/** Crée ou met à jour (transaction) et remplace items, FAQ et galerie. Renvoie l'identifiant. */
export function saveDestination(input: DestinationInput, id?: number): number {
  const db = getDb();
  return withDbErrors(() =>
    tx(db, () => {
      let destinationId: number;
      const values = [
        input.universe,
        input.slug,
        input.nameFr,
        input.nameAr,
        input.emoji,
        input.taglineFr,
        input.taglineAr,
        input.teaserFr,
        input.teaserAr,
        input.introFr,
        input.introAr,
        input.coverImageId,
        input.seoTitleFr,
        input.seoTitleAr,
        input.seoDescriptionFr,
        input.seoDescriptionAr,
        flag(input.isPublished),
        flag(input.isFeatured),
        input.sortOrder,
      ] as const;

      if (id === undefined) {
        destinationId = run(
          db,
          `INSERT INTO destinations (universe, slug, name_fr, name_ar, emoji, tagline_fr, tagline_ar,
             teaser_fr, teaser_ar, intro_fr, intro_ar, cover_image_id, seo_title_fr, seo_title_ar,
             seo_description_fr, seo_description_ar, is_published, is_featured, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ...values,
        ).lastId;
      } else {
        const res = run(
          db,
          `UPDATE destinations SET universe = ?, slug = ?, name_fr = ?, name_ar = ?, emoji = ?,
             tagline_fr = ?, tagline_ar = ?, teaser_fr = ?, teaser_ar = ?, intro_fr = ?, intro_ar = ?,
             cover_image_id = ?, seo_title_fr = ?, seo_title_ar = ?, seo_description_fr = ?,
             seo_description_ar = ?, is_published = ?, is_featured = ?, sort_order = ?,
             updated_at = datetime('now')
           WHERE id = ?`,
          ...values,
          id,
        );
        if (res.changes === 0) throw new DomainError("Destination introuvable.", "not_found");
        destinationId = id;
      }

      run(db, "DELETE FROM destination_items WHERE destination_id = ?", destinationId);
      const insertItem = (
        kind: "highlight" | "practical",
        list: DestinationInput["highlights"],
      ) => {
        list.forEach((item, position) =>
          run(
            db,
            `INSERT INTO destination_items (destination_id, kind, position, label_fr, label_ar, text_fr, text_ar)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            destinationId,
            kind,
            position,
            item.labelFr,
            item.labelAr,
            item.textFr,
            item.textAr,
          ),
        );
      };
      insertItem("highlight", input.highlights);
      insertItem("practical", input.practical);

      run(db, "DELETE FROM faqs WHERE destination_id = ?", destinationId);
      input.faqs.forEach((faq, position) =>
        run(
          db,
          `INSERT INTO faqs (destination_id, position, question_fr, question_ar, answer_fr, answer_ar)
           VALUES (?, ?, ?, ?, ?, ?)`,
          destinationId,
          position,
          faq.questionFr,
          faq.questionAr,
          faq.answerFr,
          faq.answerAr,
        ),
      );

      run(db, "DELETE FROM destination_images WHERE destination_id = ?", destinationId);
      [...new Set(input.imageIds)].forEach((imageId, position) =>
        run(
          db,
          "INSERT INTO destination_images (destination_id, image_id, position) VALUES (?, ?, ?)",
          destinationId,
          imageId,
          position,
        ),
      );

      return destinationId;
    }),
  );
}

/** Refus propre (au lieu d'une erreur SQL) tant que des voyages sont rattachés (FK RESTRICT). */
export function deleteDestination(
  id: number,
): { ok: true } | { ok: false; reason: "has_trips"; count: number } {
  const db = getDb();
  const count = Number(
    get<{ n: number }>(db, "SELECT COUNT(*) AS n FROM trips WHERE destination_id = ?", id)?.n ?? 0,
  );
  if (count > 0) return { ok: false, reason: "has_trips", count };
  try {
    run(db, "DELETE FROM destinations WHERE id = ?", id);
  } catch (error) {
    if (error instanceof Error && /FOREIGN KEY/.test(error.message)) {
      return { ok: false, reason: "has_trips", count: 1 };
    }
    throw error;
  }
  return { ok: true };
}
