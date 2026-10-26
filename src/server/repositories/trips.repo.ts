import type { TripInput } from "@/lib/schemas";
import type {
  AdminTrip,
  AdminTripListItem,
  FaqItem,
  ImageRef,
  Lang,
  SitemapEntry,
  TripCard,
  TripDay,
  TripDetail,
  Universe,
} from "@/lib/types";
import { getDb } from "../db/client";
import {
  DomainError,
  all,
  bool,
  flag,
  get,
  loc,
  locText,
  run,
  today as casablancaToday,
  withDbErrors,
} from "../db/sql";
import { tx } from "../db/tx";
import { listUpcomingDepartures, visibleDepartureSql } from "./departures.repo";
import { galleryOf, getImageRef, getImageRefs } from "./images.repo";

type TripDbRow = {
  id: number;
  destination_id: number;
  slug: string;
  title_fr: string;
  title_ar: string | null;
  teaser_fr: string;
  teaser_ar: string | null;
  presentation_fr: string;
  presentation_ar: string | null;
  duration_days: number | null;
  duration_nights: number | null;
  price_from_mad: number | null;
  price_note_fr: string | null;
  price_note_ar: string | null;
  cover_image_id: number | null;
  whatsapp_message_fr: string | null;
  whatsapp_message_ar: string | null;
  seo_title_fr: string | null;
  seo_title_ar: string | null;
  seo_description_fr: string | null;
  seo_description_ar: string | null;
  status: "draft" | "published";
  is_featured: number;
  sort_order: number;
  is_demo: number;
  created_at: string;
  updated_at: string;
  d_slug: string;
  d_name_fr: string;
  d_name_ar: string | null;
  d_universe: Universe;
  min_price: number | null;
  next_departure: string | null;
  upcoming_count: number;
};

type TripItemRow = {
  kind: "highlight" | "included" | "excluded";
  text_fr: string;
  text_ar: string | null;
};
type TripDayRow = {
  label_fr: string;
  label_ar: string | null;
  title_fr: string;
  title_ar: string | null;
  body_fr: string;
  body_ar: string | null;
};
type FaqRow = {
  question_fr: string;
  question_ar: string | null;
  answer_fr: string;
  answer_ar: string | null;
};

/** SELECT d'un voyage avec sa destination et les agrégats de départs visibles à `today`. */
function select(today: string): string {
  const visible = visibleDepartureSql(today);
  return `SELECT t.*, d.slug AS d_slug, d.name_fr AS d_name_fr, d.name_ar AS d_name_ar, d.universe AS d_universe,
    (SELECT MIN(dp.price_mad) FROM departures dp WHERE dp.trip_id = t.id AND ${visible} AND dp.status = 'open'
      AND (dp.seats_left IS NULL OR dp.seats_left > 0)) AS min_price,
    (SELECT MIN(dp.start_date) FROM departures dp WHERE dp.trip_id = t.id AND ${visible}) AS next_departure,
    (SELECT COUNT(*) FROM departures dp WHERE dp.trip_id = t.id AND ${visible}) AS upcoming_count
  FROM trips t JOIN destinations d ON d.id = t.destination_id`;
}

function nullable(value: number | null): number | null {
  return value === null ? null : Number(value);
}

function toCard(r: TripDbRow, lang: Lang, covers: Map<number, ImageRef>): TripCard {
  const minPrice = nullable(r.min_price);
  return {
    id: Number(r.id),
    slug: r.slug,
    title: locText(r, "title", lang),
    teaser: locText(r, "teaser", lang),
    destination: {
      slug: r.d_slug,
      name: locText({ name_fr: r.d_name_fr, name_ar: r.d_name_ar }, "name", lang),
      universe: r.d_universe,
    },
    durationDays: nullable(r.duration_days),
    durationNights: nullable(r.duration_nights),
    // MIN(prix) des départs visibles ouverts, sinon prix indicatif, sinon « prix sur demande » (null).
    fromPriceMad: minPrice ?? nullable(r.price_from_mad),
    priceNote: loc(r, "price_note", lang),
    cover: r.cover_image_id === null ? null : (covers.get(Number(r.cover_image_id)) ?? null),
    isFeatured: bool(r.is_featured),
    nextDeparture: r.next_departure,
    upcomingCount: Number(r.upcoming_count),
  };
}

/* -------------------------------------------------------------------------- */
/* Public                                                                      */
/* -------------------------------------------------------------------------- */

/** Voyages publiés d'une destination publiée uniquement (brouillons et destinations masquées ne sortent jamais). */
export function listPublicTrips(
  lang: Lang,
  f: {
    universe?: Universe | undefined;
    destinationSlug?: string | undefined;
    featured?: boolean | undefined;
    limit?: number | undefined;
    today?: string | undefined;
  } = {},
): TripCard[] {
  const where = ["t.status = 'published'", "d.is_published = 1"];
  const params: (string | number)[] = [];
  if (f.universe) {
    where.push("d.universe = ?");
    params.push(f.universe);
  }
  if (f.destinationSlug) {
    where.push("d.slug = ?");
    params.push(f.destinationSlug);
  }
  if (f.featured) where.push("t.is_featured = 1");
  const rows = all<TripDbRow>(
    getDb(),
    `${select(f.today ?? casablancaToday())} WHERE ${where.join(" AND ")}
     ORDER BY t.is_featured DESC, t.sort_order, t.id ${f.limit ? "LIMIT ?" : ""}`,
    ...params,
    ...(f.limit ? [f.limit] : []),
  );
  const covers = getImageRefs(
    rows.map((r) => nullable(r.cover_image_id)),
    lang,
  );
  return rows.map((r) => toCard(r, lang, covers));
}

function readItems(
  tripId: number,
  lang: Lang,
): { highlights: string[]; included: string[]; excluded: string[] } {
  const rows = all<TripItemRow>(
    getDb(),
    "SELECT * FROM trip_items WHERE trip_id = ? ORDER BY position, id",
    tripId,
  );
  const out = { highlights: [] as string[], included: [] as string[], excluded: [] as string[] };
  for (const r of rows) {
    const text = locText(r, "text", lang);
    if (r.kind === "highlight") out.highlights.push(text);
    else if (r.kind === "included") out.included.push(text);
    else out.excluded.push(text);
  }
  return out;
}

function readFaqs(tripId: number, lang: Lang): FaqItem[] {
  return all<FaqRow>(
    getDb(),
    "SELECT * FROM faqs WHERE trip_id = ? ORDER BY position, id",
    tripId,
  ).map((r) => ({
    question: locText(r, "question", lang),
    answer: locText(r, "answer", lang),
  }));
}

/** Fiche voyage publique. Brouillon, destination non publiée ou slug inconnu : null. Les départs listés sont les départs visibles à `today`. */
export function getPublicTripBySlug(lang: Lang, slug: string, today: string): TripDetail | null {
  const r = get<TripDbRow>(
    getDb(),
    `${select(today)} WHERE t.slug = ? AND t.status = 'published' AND d.is_published = 1`,
    slug,
  );
  if (!r) return null;
  const id = Number(r.id);
  const covers = getImageRefs([nullable(r.cover_image_id)], lang);
  const days: TripDay[] = all<TripDayRow>(
    getDb(),
    "SELECT * FROM trip_days WHERE trip_id = ? ORDER BY position, id",
    id,
  ).map((d) => ({
    label: locText(d, "label", lang),
    title: locText(d, "title", lang),
    body: locText(d, "body", lang),
  }));
  const whatsappMessage = loc(r, "whatsapp_message", lang);
  return {
    ...toCard(r, lang, covers),
    presentation: locText(r, "presentation", lang),
    ...readItems(id, lang),
    days,
    gallery: galleryOf("trip", id, lang),
    faq: readFaqs(id, lang),
    departures: listUpcomingDepartures(lang, today, { tripId: id }),
    whatsappMessage: whatsappMessage && whatsappMessage.trim() ? whatsappMessage : null,
    seoTitle: loc(r, "seo_title", lang),
    seoDescription: loc(r, "seo_description", lang),
    updatedAt: r.updated_at,
  };
}

/** Pages indexables (sans préfixe de langue) : destinations publiées et voyages publiés d'une destination publiée. */
export function listSitemapEntries(): SitemapEntry[] {
  const db = getDb();
  const trips = all<{ slug: string; updated_at: string }>(
    db,
    `SELECT t.slug, t.updated_at FROM trips t JOIN destinations d ON d.id = t.destination_id
     WHERE t.status = 'published' AND d.is_published = 1 ORDER BY t.id`,
  ).map((r) => ({ path: `/voyages/${r.slug}`, updatedAt: r.updated_at }));
  const destinations = all<{ slug: string; updated_at: string }>(
    db,
    "SELECT slug, updated_at FROM destinations WHERE is_published = 1 ORDER BY id",
  ).map((r) => ({ path: `/destinations/${r.slug}`, updatedAt: r.updated_at }));
  return [...destinations, ...trips];
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                       */
/* -------------------------------------------------------------------------- */

export function adminListTrips(
  f: { destinationId?: number | undefined; status?: "draft" | "published" | undefined } = {},
): AdminTripListItem[] {
  const where: string[] = ["1 = 1"];
  const params: (string | number)[] = [];
  if (f.destinationId !== undefined) {
    where.push("t.destination_id = ?");
    params.push(f.destinationId);
  }
  if (f.status) {
    where.push("t.status = ?");
    params.push(f.status);
  }
  return all<TripDbRow>(
    getDb(),
    `${select(casablancaToday())} WHERE ${where.join(" AND ")} ORDER BY d.universe, d.sort_order, t.sort_order, t.id`,
    ...params,
  ).map((r) => ({
    id: Number(r.id),
    slug: r.slug,
    titleFr: r.title_fr,
    titleAr: r.title_ar,
    status: r.status,
    isFeatured: bool(r.is_featured),
    isDemo: bool(r.is_demo),
    destinationId: Number(r.destination_id),
    destinationName: r.d_name_fr,
    universe: r.d_universe,
    upcomingCount: Number(r.upcoming_count),
    nextDeparture: r.next_departure,
    updatedAt: r.updated_at,
  }));
}

export function adminGetTrip(id: number): AdminTrip | null {
  const db = getDb();
  const r = get<TripDbRow>(db, `${select(casablancaToday())} WHERE t.id = ?`, id);
  if (!r) return null;
  const items = all<TripItemRow>(
    db,
    "SELECT * FROM trip_items WHERE trip_id = ? ORDER BY position, id",
    id,
  );
  const pick = (kind: TripItemRow["kind"]) =>
    items.filter((i) => i.kind === kind).map((i) => ({ textFr: i.text_fr, textAr: i.text_ar }));
  const days = all<TripDayRow>(
    db,
    "SELECT * FROM trip_days WHERE trip_id = ? ORDER BY position, id",
    id,
  );
  const faqs = all<FaqRow>(db, "SELECT * FROM faqs WHERE trip_id = ? ORDER BY position, id", id);
  const gallery = galleryOf("trip", id, "fr");

  return {
    id: Number(r.id),
    destinationId: Number(r.destination_id),
    slug: r.slug,
    titleFr: r.title_fr,
    titleAr: r.title_ar,
    teaserFr: r.teaser_fr,
    teaserAr: r.teaser_ar,
    presentationFr: r.presentation_fr,
    presentationAr: r.presentation_ar,
    durationDays: nullable(r.duration_days),
    durationNights: nullable(r.duration_nights),
    priceFromMad: nullable(r.price_from_mad),
    priceNoteFr: r.price_note_fr,
    priceNoteAr: r.price_note_ar,
    coverImageId: nullable(r.cover_image_id),
    whatsappMessageFr: r.whatsapp_message_fr,
    whatsappMessageAr: r.whatsapp_message_ar,
    seoTitleFr: r.seo_title_fr,
    seoTitleAr: r.seo_title_ar,
    seoDescriptionFr: r.seo_description_fr,
    seoDescriptionAr: r.seo_description_ar,
    status: r.status,
    isFeatured: bool(r.is_featured),
    sortOrder: Number(r.sort_order),
    days: days.map((d) => ({
      labelFr: d.label_fr,
      labelAr: d.label_ar,
      titleFr: d.title_fr,
      titleAr: d.title_ar,
      bodyFr: d.body_fr,
      bodyAr: d.body_ar,
    })),
    highlights: pick("highlight"),
    included: pick("included"),
    excluded: pick("excluded"),
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

/** Crée ou met à jour un voyage (transaction) et remplace programme, listes, FAQ et galerie. Les départs ne sont pas touchés. */
export function saveTrip(input: TripInput, id?: number): number {
  const db = getDb();
  return withDbErrors(() =>
    tx(db, () => {
      let tripId: number;
      const values = [
        input.destinationId,
        input.slug,
        input.titleFr,
        input.titleAr,
        input.teaserFr,
        input.teaserAr,
        input.presentationFr,
        input.presentationAr,
        input.durationDays,
        input.durationNights,
        input.priceFromMad,
        input.priceNoteFr,
        input.priceNoteAr,
        input.coverImageId,
        input.whatsappMessageFr,
        input.whatsappMessageAr,
        input.seoTitleFr,
        input.seoTitleAr,
        input.seoDescriptionFr,
        input.seoDescriptionAr,
        input.status,
        flag(input.isFeatured),
        input.sortOrder,
      ] as const;

      if (id === undefined) {
        tripId = run(
          db,
          `INSERT INTO trips (destination_id, slug, title_fr, title_ar, teaser_fr, teaser_ar,
             presentation_fr, presentation_ar, duration_days, duration_nights, price_from_mad,
             price_note_fr, price_note_ar, cover_image_id, whatsapp_message_fr, whatsapp_message_ar,
             seo_title_fr, seo_title_ar, seo_description_fr, seo_description_ar, status, is_featured, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ...values,
        ).lastId;
      } else {
        const res = run(
          db,
          `UPDATE trips SET destination_id = ?, slug = ?, title_fr = ?, title_ar = ?, teaser_fr = ?,
             teaser_ar = ?, presentation_fr = ?, presentation_ar = ?, duration_days = ?, duration_nights = ?,
             price_from_mad = ?, price_note_fr = ?, price_note_ar = ?, cover_image_id = ?,
             whatsapp_message_fr = ?, whatsapp_message_ar = ?, seo_title_fr = ?, seo_title_ar = ?,
             seo_description_fr = ?, seo_description_ar = ?, status = ?, is_featured = ?, sort_order = ?,
             updated_at = datetime('now')
           WHERE id = ?`,
          ...values,
          id,
        );
        if (res.changes === 0) throw new DomainError("Voyage introuvable.", "not_found");
        tripId = id;
      }

      run(db, "DELETE FROM trip_days WHERE trip_id = ?", tripId);
      input.days.forEach((day, position) =>
        run(
          db,
          `INSERT INTO trip_days (trip_id, position, label_fr, label_ar, title_fr, title_ar, body_fr, body_ar)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          tripId,
          position,
          day.labelFr,
          day.labelAr,
          day.titleFr,
          day.titleAr,
          day.bodyFr,
          day.bodyAr,
        ),
      );

      run(db, "DELETE FROM trip_items WHERE trip_id = ?", tripId);
      const insertItems = (
        kind: "highlight" | "included" | "excluded",
        list: TripInput["highlights"],
      ) =>
        list.forEach((item, position) =>
          run(
            db,
            "INSERT INTO trip_items (trip_id, kind, position, text_fr, text_ar) VALUES (?, ?, ?, ?, ?)",
            tripId,
            kind,
            position,
            item.textFr,
            item.textAr,
          ),
        );
      insertItems("highlight", input.highlights);
      insertItems("included", input.included);
      insertItems("excluded", input.excluded);

      run(db, "DELETE FROM faqs WHERE trip_id = ?", tripId);
      input.faqs.forEach((faq, position) =>
        run(
          db,
          `INSERT INTO faqs (trip_id, position, question_fr, question_ar, answer_fr, answer_ar)
           VALUES (?, ?, ?, ?, ?, ?)`,
          tripId,
          position,
          faq.questionFr,
          faq.questionAr,
          faq.answerFr,
          faq.answerAr,
        ),
      );

      run(db, "DELETE FROM trip_images WHERE trip_id = ?", tripId);
      [...new Set(input.imageIds)].forEach((imageId, position) =>
        run(
          db,
          "INSERT INTO trip_images (trip_id, image_id, position) VALUES (?, ?, ?)",
          tripId,
          imageId,
          position,
        ),
      );

      return tripId;
    }),
  );
}

/** Copie un voyage en brouillon (sans départs) avec un slug unique. */
export function duplicateTrip(id: number): number {
  const source = adminGetTrip(id);
  if (!source) throw new DomainError("Voyage introuvable.", "not_found");
  const db = getDb();
  let slug = `${source.slug}-copie`;
  for (let n = 2; get(db, "SELECT 1 AS n FROM trips WHERE slug = ?", slug); n++) {
    slug = `${source.slug}-copie-${n}`;
  }
  const {
    id: _id,
    isDemo: _isDemo,
    createdAt: _c,
    updatedAt: _u,
    coverImage: _ci,
    gallery: _g,
    ...input
  } = source;
  return saveTrip({
    ...input,
    slug,
    titleFr: `${source.titleFr} (copie)`,
    status: "draft",
    isFeatured: false,
  });
}

export function deleteTrip(id: number): void {
  run(getDb(), "DELETE FROM trips WHERE id = ?", id);
}
