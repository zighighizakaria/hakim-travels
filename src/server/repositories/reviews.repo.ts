import type { ReviewInput } from "@/lib/schemas";
import type { AdminReview, Lang, Review } from "@/lib/types";
import { getDb } from "../db/client";
import { DomainError, all, bool, flag, get, locText, run, withDbErrors } from "../db/sql";

type ReviewRow = {
  id: number;
  author_name: string;
  author_city: string | null;
  trip_id: number | null;
  rating: number | null;
  quote_fr: string;
  quote_ar: string | null;
  travel_label: string | null;
  source_url: string | null;
  is_published: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  trip_slug: string | null;
  trip_title_fr: string | null;
};

const SELECT = `SELECT r.*, t.slug AS trip_slug, t.title_fr AS trip_title_fr
  FROM reviews r LEFT JOIN trips t ON t.id = r.trip_id`;

/** Uniquement les avis publiés. */
export function listPublishedReviews(lang: Lang, limit?: number): Review[] {
  const rows = all<ReviewRow>(
    getDb(),
    `${SELECT} WHERE r.is_published = 1 ORDER BY r.sort_order, r.id DESC ${limit ? "LIMIT ?" : ""}`,
    ...(limit ? [limit] : []),
  );
  return rows.map((r) => ({
    id: Number(r.id),
    authorName: r.author_name,
    authorCity: r.author_city,
    rating: r.rating === null ? null : Number(r.rating),
    quote: locText(r, "quote", lang),
    travelLabel: r.travel_label,
    sourceUrl: r.source_url,
    tripSlug: r.trip_slug,
  }));
}

function toAdmin(r: ReviewRow): AdminReview {
  return {
    id: Number(r.id),
    authorName: r.author_name,
    authorCity: r.author_city,
    tripId: r.trip_id === null ? null : Number(r.trip_id),
    rating: r.rating === null ? null : Number(r.rating),
    quoteFr: r.quote_fr,
    quoteAr: r.quote_ar,
    travelLabel: r.travel_label,
    sourceUrl: r.source_url,
    isPublished: bool(r.is_published),
    sortOrder: Number(r.sort_order),
    tripTitle: r.trip_title_fr,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function adminListReviews(): AdminReview[] {
  return all<ReviewRow>(getDb(), `${SELECT} ORDER BY r.sort_order, r.id DESC`).map(toAdmin);
}

export function adminGetReview(id: number): AdminReview | null {
  const row = get<ReviewRow>(getDb(), `${SELECT} WHERE r.id = ?`, id);
  return row ? toAdmin(row) : null;
}

export function saveReview(input: ReviewInput, id?: number): number {
  const db = getDb();
  const values = [
    input.authorName,
    input.authorCity,
    input.tripId,
    input.rating,
    input.quoteFr,
    input.quoteAr,
    input.travelLabel,
    input.sourceUrl,
    flag(input.isPublished),
    input.sortOrder,
  ] as const;
  return withDbErrors(() => {
    if (id === undefined) {
      return run(
        db,
        `INSERT INTO reviews (author_name, author_city, trip_id, rating, quote_fr, quote_ar,
           travel_label, source_url, is_published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ...values,
      ).lastId;
    }
    const res = run(
      db,
      `UPDATE reviews SET author_name = ?, author_city = ?, trip_id = ?, rating = ?, quote_fr = ?, quote_ar = ?,
         travel_label = ?, source_url = ?, is_published = ?, sort_order = ?, updated_at = datetime('now')
       WHERE id = ?`,
      ...values,
      id,
    );
    if (res.changes === 0) throw new DomainError("Avis introuvable.", "not_found");
    return id;
  });
}

export function deleteReview(id: number): void {
  run(getDb(), "DELETE FROM reviews WHERE id = ?", id);
}
