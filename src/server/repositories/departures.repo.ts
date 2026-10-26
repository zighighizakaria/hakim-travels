import type { DepartureInput } from "@/lib/schemas";
import type {
  AdminDashboard,
  AdminDeparture,
  DemoCounts,
  DepartureRow,
  Lang,
  Universe,
} from "@/lib/types";
import { getDb } from "../db/client";
import {
  DomainError,
  all,
  assertIsoDate,
  bool,
  flag,
  get,
  loc,
  locText,
  run,
  withDbErrors,
} from "../db/sql";

type DepartureDbRow = {
  id: number;
  trip_id: number;
  start_date: string;
  end_date: string;
  departure_city_fr: string;
  departure_city_ar: string | null;
  meeting_point_fr: string | null;
  meeting_point_ar: string | null;
  price_mad: number | null;
  child_price_mad: number | null;
  seats_total: number | null;
  seats_left: number | null;
  status: "open" | "full" | "cancelled";
  note_fr: string | null;
  note_ar: string | null;
  archived: number;
  is_demo: number;
  created_at: string;
  updated_at: string;
  t_slug: string;
  t_title_fr: string;
  t_title_ar: string | null;
  d_slug: string;
  d_name_fr: string;
  d_name_ar: string | null;
  d_universe: Universe;
};

const SELECT = `SELECT dp.*, t.slug AS t_slug, t.title_fr AS t_title_fr, t.title_ar AS t_title_ar,
    d.slug AS d_slug, d.name_fr AS d_name_fr, d.name_ar AS d_name_ar, d.universe AS d_universe
  FROM departures dp
  JOIN trips t ON t.id = dp.trip_id
  JOIN destinations d ON d.id = t.destination_id`;

/**
 * Règle de visibilité publique d'un départ (alias `dp`) :
 * non archivé, non annulé, date de début >= aujourd'hui (Africa/Casablanca).
 * `today` est validé (AAAA-MM-JJ) avant d'être injecté dans le SQL.
 */
export function visibleDepartureSql(today: string): string {
  return `dp.archived = 0 AND dp.status <> 'cancelled' AND dp.start_date >= '${assertIsoDate(today)}'`;
}

function nullable(value: number | null): number | null {
  return value === null ? null : Number(value);
}

function toRow(r: DepartureDbRow, lang: Lang): DepartureRow {
  const seatsLeft = nullable(r.seats_left);
  return {
    id: Number(r.id),
    tripId: Number(r.trip_id),
    tripSlug: r.t_slug,
    tripTitle: locText({ title_fr: r.t_title_fr, title_ar: r.t_title_ar }, "title", lang),
    destinationSlug: r.d_slug,
    destinationName: locText({ name_fr: r.d_name_fr, name_ar: r.d_name_ar }, "name", lang),
    universe: r.d_universe,
    startDate: r.start_date,
    endDate: r.end_date,
    departureCity: locText(r, "departure_city", lang),
    meetingPoint: loc(r, "meeting_point", lang),
    priceMad: nullable(r.price_mad),
    childPriceMad: nullable(r.child_price_mad),
    seatsLeft,
    seatsTotal: nullable(r.seats_total),
    // Un départ ouvert sans place restante s'affiche « Complet ».
    status: r.status === "full" || seatsLeft === 0 ? "full" : "open",
    note: loc(r, "note", lang),
  };
}

type PublicFilter = {
  universe?: Universe | undefined;
  destinationSlug?: string | undefined;
  /** AAAA-MM */
  month?: string | undefined;
  tripId?: number | undefined;
  limit?: number | undefined;
};

function publicWhere(
  today: string,
  f: PublicFilter,
): { where: string; params: (string | number)[] } {
  const where = ["t.status = 'published'", "d.is_published = 1", visibleDepartureSql(today)];
  const params: (string | number)[] = [];
  if (f.universe) {
    where.push("d.universe = ?");
    params.push(f.universe);
  }
  if (f.destinationSlug) {
    where.push("d.slug = ?");
    params.push(f.destinationSlug);
  }
  if (f.month) {
    where.push("substr(dp.start_date, 1, 7) = ?");
    params.push(f.month);
  }
  if (f.tripId !== undefined) {
    where.push("dp.trip_id = ?");
    params.push(f.tripId);
  }
  return { where: where.join(" AND "), params };
}

/** Prochains départs publics, triés par date. Départs passés, archivés ou annulés, voyages brouillons et destinations non publiées exclus. */
export function listUpcomingDepartures(
  lang: Lang,
  today: string,
  f: PublicFilter = {},
): DepartureRow[] {
  const { where, params } = publicWhere(today, f);
  const limit = f.limit ? "LIMIT ?" : "";
  const rows = all<DepartureDbRow>(
    getDb(),
    `${SELECT} WHERE ${where} ORDER BY dp.start_date, dp.id ${limit}`,
    ...params,
    ...(f.limit ? [f.limit] : []),
  );
  return rows.map((r) => toRow(r, lang));
}

/** Mois (AAAA-MM) ayant au moins un départ visible. */
export function listUpcomingMonths(
  today: string,
  f: Pick<PublicFilter, "universe" | "destinationSlug"> = {},
): string[] {
  const { where, params } = publicWhere(today, f);
  return all<{ month: string }>(
    getDb(),
    `SELECT DISTINCT substr(dp.start_date, 1, 7) AS month
     FROM departures dp JOIN trips t ON t.id = dp.trip_id JOIN destinations d ON d.id = t.destination_id
     WHERE ${where} ORDER BY month`,
    ...params,
  ).map((r) => r.month);
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                       */
/* -------------------------------------------------------------------------- */

function toAdmin(r: DepartureDbRow): AdminDeparture {
  return {
    id: Number(r.id),
    tripId: Number(r.trip_id),
    startDate: r.start_date,
    endDate: r.end_date,
    departureCityFr: r.departure_city_fr,
    departureCityAr: r.departure_city_ar,
    meetingPointFr: r.meeting_point_fr,
    meetingPointAr: r.meeting_point_ar,
    priceMad: nullable(r.price_mad),
    childPriceMad: nullable(r.child_price_mad),
    seatsTotal: nullable(r.seats_total),
    seatsLeft: nullable(r.seats_left),
    status: r.status,
    noteFr: r.note_fr,
    noteAr: r.note_ar,
    archived: bool(r.archived),
    isDemo: bool(r.is_demo),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    tripSlug: r.t_slug,
    tripTitle: r.t_title_fr,
    destinationName: r.d_name_fr,
    universe: r.d_universe,
  };
}

export function adminListDepartures(
  f: { view: "upcoming" | "past" | "archived"; tripId?: number | undefined },
  today: string,
): AdminDeparture[] {
  const d = assertIsoDate(today);
  const where: string[] = [];
  const params: number[] = [];
  let order = "dp.start_date, dp.id";
  if (f.view === "upcoming") {
    where.push(`dp.archived = 0 AND dp.start_date >= '${d}'`);
  } else if (f.view === "past") {
    where.push(`dp.archived = 0 AND dp.start_date < '${d}'`);
    order = "dp.start_date DESC, dp.id DESC";
  } else {
    where.push("dp.archived = 1");
    order = "dp.start_date DESC, dp.id DESC";
  }
  if (f.tripId !== undefined) {
    where.push("dp.trip_id = ?");
    params.push(f.tripId);
  }
  return all<DepartureDbRow>(
    getDb(),
    `${SELECT} WHERE ${where.join(" AND ")} ORDER BY ${order}`,
    ...params,
  ).map(toAdmin);
}

export function adminGetDeparture(id: number): AdminDeparture | null {
  const row = get<DepartureDbRow>(getDb(), `${SELECT} WHERE dp.id = ?`, id);
  return row ? toAdmin(row) : null;
}

export function saveDeparture(input: DepartureInput, id?: number): number {
  const db = getDb();
  const values = [
    input.tripId,
    input.startDate,
    input.endDate,
    input.departureCityFr,
    input.departureCityAr,
    input.meetingPointFr,
    input.meetingPointAr,
    input.priceMad,
    input.childPriceMad,
    input.seatsTotal,
    input.seatsLeft,
    input.status,
    input.noteFr,
    input.noteAr,
  ] as const;
  return withDbErrors(() => {
    if (id === undefined) {
      return run(
        db,
        `INSERT INTO departures (trip_id, start_date, end_date, departure_city_fr, departure_city_ar,
           meeting_point_fr, meeting_point_ar, price_mad, child_price_mad, seats_total, seats_left,
           status, note_fr, note_ar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ...values,
      ).lastId;
    }
    const res = run(
      db,
      `UPDATE departures SET trip_id = ?, start_date = ?, end_date = ?, departure_city_fr = ?,
         departure_city_ar = ?, meeting_point_fr = ?, meeting_point_ar = ?, price_mad = ?,
         child_price_mad = ?, seats_total = ?, seats_left = ?, status = ?, note_fr = ?, note_ar = ?,
         updated_at = datetime('now')
       WHERE id = ?`,
      ...values,
      id,
    );
    if (res.changes === 0) throw new DomainError("Départ introuvable.", "not_found");
    return id;
  });
}

/** Édition rapide : places restantes et/ou statut. */
export function quickUpdateDeparture(
  id: number,
  patch: { seatsLeft?: number | undefined; status?: "open" | "full" | "cancelled" | undefined },
): void {
  const sets: string[] = [];
  const params: (string | number)[] = [];
  if (patch.seatsLeft !== undefined) {
    sets.push("seats_left = ?");
    params.push(patch.seatsLeft);
  }
  if (patch.status !== undefined) {
    sets.push("status = ?");
    params.push(patch.status);
  }
  if (sets.length === 0) return;
  const res = withDbErrors(() =>
    run(
      getDb(),
      `UPDATE departures SET ${sets.join(", ")}, updated_at = datetime('now') WHERE id = ?`,
      ...params,
      id,
    ),
  );
  if (res.changes === 0) throw new DomainError("Départ introuvable.", "not_found");
}

export function setDepartureArchived(id: number, archived: boolean): void {
  const res = run(
    getDb(),
    "UPDATE departures SET archived = ?, updated_at = datetime('now') WHERE id = ?",
    flag(archived),
    id,
  );
  if (res.changes === 0) throw new DomainError("Départ introuvable.", "not_found");
}

/** Archive en masse les départs passés (date de début < aujourd'hui). Renvoie le nombre archivé. */
export function archivePastDepartures(today: string): number {
  return run(
    getDb(),
    `UPDATE departures SET archived = 1, updated_at = datetime('now')
     WHERE archived = 0 AND start_date < '${assertIsoDate(today)}'`,
  ).changes;
}

export function deleteDeparture(id: number): void {
  run(getDb(), "DELETE FROM departures WHERE id = ?", id);
}

/* -------------------------------------------------------------------------- */
/* Tableau de bord                                                             */
/* -------------------------------------------------------------------------- */

function count(sql: string, ...params: (string | number)[]): number {
  return Number(get<{ n: number }>(getDb(), sql, ...params)?.n ?? 0);
}

export function adminDashboard(today: string, demo: DemoCounts): AdminDashboard {
  const d = assertIsoDate(today);
  const upcoming = adminListDepartures({ view: "upcoming" }, d).filter(
    (x) => x.status !== "cancelled",
  );
  return {
    today: d,
    counts: {
      trips: count("SELECT COUNT(*) AS n FROM trips"),
      publishedTrips: count("SELECT COUNT(*) AS n FROM trips WHERE status = 'published'"),
      destinations: count("SELECT COUNT(*) AS n FROM destinations"),
      upcomingDepartures: upcoming.length,
      images: count("SELECT COUNT(*) AS n FROM images"),
      reviews: count("SELECT COUNT(*) AS n FROM reviews"),
    },
    nextDepartures: upcoming.slice(0, 8),
    lowSeats: upcoming
      .filter((x) => x.status === "open" && x.seatsLeft !== null && x.seatsLeft <= 3)
      .slice(0, 8),
    pastUnarchived: count(
      `SELECT COUNT(*) AS n FROM departures WHERE archived = 0 AND start_date < '${d}'`,
    ),
    demo,
  };
}
