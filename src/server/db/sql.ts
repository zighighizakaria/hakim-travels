import type { DatabaseSync } from "node:sqlite";
import type { Lang } from "@/lib/types";

/** Valeurs acceptées comme paramètres liés par node:sqlite. */
export type Param = string | number | bigint | null | Uint8Array;

/**
 * Erreur « métier » : son message (en français) peut être affiché tel quel dans le back-office.
 */
export class DomainError extends Error {
  readonly code: string;
  constructor(message: string, code = "invalid") {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

/**
 * Les lignes renvoyées par node:sqlite ont un prototype null : on les type ici,
 * puis les repositories les recopient dans des DTO simples.
 */
export function all<T>(db: DatabaseSync, sql: string, ...params: Param[]): T[] {
  return db.prepare(sql).all(...params) as unknown as T[];
}

export function get<T>(db: DatabaseSync, sql: string, ...params: Param[]): T | undefined {
  return (db.prepare(sql).get(...params) as unknown as T | undefined) ?? undefined;
}

export function run(
  db: DatabaseSync,
  sql: string,
  ...params: Param[]
): { changes: number; lastId: number } {
  const res = db.prepare(sql).run(...params);
  return { changes: Number(res.changes), lastId: Number(res.lastInsertRowid) };
}

export function placeholders(count: number): string {
  return Array.from({ length: count }, () => "?").join(", ");
}

/** SQLite stocke les booléens en 0/1. */
export function bool(value: unknown): boolean {
  return value === 1 || value === true || value === "1";
}

export function flag(value: boolean): number {
  return value ? 1 : 0;
}

/** Horodatage au format SQLite (UTC), identique à datetime('now'). */
export function now(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

/** Date du jour (YYYY-MM-DD) dans le fuseau Africa/Casablanca. */
export function today(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

export function assertIsoDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Date invalide : ${value}`);
  return value;
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${assertIsoDate(isoDate)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

type Row = Record<string, unknown>;

/**
 * Valeur localisée d'une paire de colonnes `xxx_fr` / `xxx_ar` :
 * la valeur `_ar` si elle n'est pas vide (en AR), sinon la valeur `_fr`.
 */
export function loc(row: Row, field: string, lang: Lang): string | null {
  if (lang === "ar") {
    const ar = row[`${field}_ar`];
    if (typeof ar === "string" && ar.trim() !== "") return ar;
  }
  const fr = row[`${field}_fr`];
  return typeof fr === "string" ? fr : null;
}

/** Comme `loc`, pour les colonnes obligatoires (jamais null). */
export function locText(row: Row, field: string, lang: Lang): string {
  return loc(row, field, lang) ?? "";
}

export function lastInsertId(res: { lastInsertRowid: number | bigint }): number {
  return Number(res.lastInsertRowid);
}

/** Traduit les erreurs de contraintes SQLite en erreurs lisibles. */
export function translateDbError(error: unknown): unknown {
  if (error instanceof DomainError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (/UNIQUE constraint failed: (destinations|trips)\.slug/.test(message)) {
    return new DomainError("Cet identifiant d'URL (slug) est déjà utilisé.", "slug_taken");
  }
  if (/UNIQUE constraint failed: users\.email/.test(message)) {
    return new DomainError("Cette adresse e-mail est déjà utilisée.", "email_taken");
  }
  if (/FOREIGN KEY constraint failed/.test(message)) {
    return new DomainError(
      "Référence invalide : l'image, la destination ou le voyage n'existe pas.",
      "bad_reference",
    );
  }
  if (/CHECK constraint failed/.test(message)) {
    return new DomainError("Une valeur est hors des limites autorisées.", "check_failed");
  }
  return error;
}

export function withDbErrors<T>(fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    throw translateDbError(error);
  }
}
