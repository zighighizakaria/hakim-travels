/**
 * Lecture défensive des paramètres de recherche de l'URL (`?univers=&region=&mois=`).
 * Une valeur invalide est ignorée plutôt que de provoquer une erreur.
 */
import type { Universe } from "./types";

const UNIVERSES: readonly Universe[] = ["maroc", "international", "omra"];

export function parseUniverseParam(value: unknown): Universe | undefined {
  return typeof value === "string" && (UNIVERSES as readonly string[]).includes(value)
    ? (value as Universe)
    : undefined;
}

export function parseSlugParam(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value) ? value : undefined;
}

/** `YYYY-MM` */
export function parseMonthParam(value: unknown): string | undefined {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : undefined;
}
