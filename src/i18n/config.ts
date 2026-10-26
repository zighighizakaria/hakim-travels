/**
 * Configuration i18n : langues, direction, préfixes d'URL.
 * FR est la langue par défaut et n'a pas de préfixe ; l'arabe vit sous `/ar/...`.
 * Fichier partagé client/serveur : n'importe jamais src/server.
 */
import type { Lang, Universe } from "@/lib/types";

export type { Lang, Universe };

export const LANGS: readonly Lang[] = ["fr", "ar"];
export const DEFAULT_LANG: Lang = "fr";

export function dirOf(lang: Lang): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

/** Valeur du paramètre optionnel `{-$lang}` : `'ar'` pour l'arabe, `undefined` pour le français. */
export function langParam(lang: Lang): "ar" | undefined {
  return lang === "ar" ? "ar" : undefined;
}

/** Interprète le paramètre `{-$lang}` de l'URL. */
export function parseLang(param: string | undefined): Lang {
  return param === "ar" ? "ar" : DEFAULT_LANG;
}

/** Langue déduite uniquement du pathname (SSR et client identiques). */
export function langFromPathname(pathname: string): Lang {
  return /^\/ar(\/|$)/.test(pathname) ? "ar" : DEFAULT_LANG;
}

/** Retire un éventuel préfixe de langue (`/ar`, `/fr`) d'un pathname. */
export function stripLangPrefix(pathname: string): string {
  const stripped = pathname.replace(/^\/(ar|fr)(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

/** `localizePath('/maroc', 'ar')` -> `/ar/maroc` ; `localizePath('/', 'ar')` -> `/ar` ; FR : inchangé. */
export function localizePath(path: string, lang: Lang): string {
  const clean = stripLangPrefix(path.startsWith("/") ? path : `/${path}`);
  if (lang !== "ar") return clean;
  return clean === "/" ? "/ar" : `/ar${clean}`;
}

/** Remplace les `{clés}` d'un texte du dictionnaire. Les clés inconnues deviennent une chaîne vide. */
export function interpolate(
  template: string,
  vars: Record<string, string | number | null | undefined>,
): string {
  return template.replace(/\{(\w+)\}/g, (_m, key: string) => String(vars[key] ?? ""));
}
