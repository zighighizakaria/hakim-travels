/**
 * Formatage dates, prix, durées. Fuseau fixe Africa/Casablanca, chiffres latins,
 * aucun `new Date()` implicite : le rendu SSR et le rendu client donnent le même texte.
 */
import type { Lang } from "./types";

const TZ = "Africa/Casablanca";

function locale(lang: Lang): string {
  return lang === "ar" ? "ar-MA-u-nu-latn" : "fr-MA-u-nu-latn";
}

/** Les dates YYYY-MM-DD sont parsées à midi UTC pour éviter tout décalage de fuseau. */
export function parseIsoDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`);
}

export function uploadUrl(path: string): string {
  return `/uploads/${path}`;
}

export function formatDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseIsoDate(iso));
}

export function formatDateRange(startIso: string, endIso: string, lang: Lang): string {
  if (startIso === endIso) return formatDate(startIso, lang);
  // ICU de Node (SSR) met des fines espaces autour du tiret des plages sur deux mois, celui du navigateur
  // des espaces ordinaires : on uniformise pour éviter une erreur d hydratation (React #418).
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .formatRange(parseIsoDate(startIso), parseIsoDate(endIso))
    .replace(/[\u2009\u202f]/g, " ");
}

/** « 2025-03 » -> « mars 2025 » */
export function formatMonth(month: string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: TZ,
    month: "long",
    year: "numeric",
  }).format(parseIsoDate(`${month}-01`));
}

/** Renvoie null si le prix est inconnu (l'appelant affiche « Prix sur demande »). */
export function formatPrice(mad: number | null | undefined, lang: Lang): string | null {
  if (mad === null || mad === undefined) return null;
  // Séparateur de milliers explicite (espace insécable) : fr-MA et ar-MA utilisent « . », ambigu pour un prix.
  const n = String(Math.round(mad)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return lang === "ar" ? `${n} درهم` : `${n} MAD`;
}

function plural(lang: Lang, n: number): Intl.LDMLPluralRule {
  return new Intl.PluralRules(lang === "ar" ? "ar" : "fr").select(n);
}

function dayLabel(n: number, lang: Lang): string {
  if (lang === "fr") return n > 1 ? `${n} jours` : `${n} jour`;
  switch (plural(lang, n)) {
    case "one":
      return "يوم واحد";
    case "two":
      return "يومان";
    case "few":
      return `${n} أيام`;
    case "many":
      return `${n} يومًا`;
    default:
      return `${n} يوم`;
  }
}

function nightLabel(n: number, lang: Lang): string {
  if (lang === "fr") return n > 1 ? `${n} nuits` : `${n} nuit`;
  switch (plural(lang, n)) {
    case "one":
      return "ليلة واحدة";
    case "two":
      return "ليلتان";
    case "few":
      return `${n} ليالٍ`;
    default:
      return `${n} ليلة`;
  }
}

/** « 4 jours / 3 nuits » ; null si aucune durée n'est renseignée. */
export function formatDuration(
  days: number | null | undefined,
  nights: number | null | undefined,
  lang: Lang,
): string | null {
  const parts: string[] = [];
  if (days !== null && days !== undefined) parts.push(dayLabel(days, lang));
  if (nights !== null && nights !== undefined && nights > 0) parts.push(nightLabel(nights, lang));
  return parts.length ? parts.join(" / ") : null;
}
