/**
 * Pluriel par langue (Intl.PluralRules). Le dictionnaire fournit une forme par catégorie ;
 * l'arabe distingue 1 (« رحلة واحدة »), 2 (« رحلتان »), 3-10 (« رحلات ») et 11 et plus (« رحلة »).
 * Fichier partagé client/serveur : n'importe jamais src/server.
 */
import { interpolate } from "./config";
import type { Lang } from "@/lib/types";

export type PluralForms = {
  one: string;
  two: string;
  few: string;
  many: string;
  other: string;
};

const rules: Record<Lang, Intl.PluralRules> = {
  fr: new Intl.PluralRules("fr"),
  ar: new Intl.PluralRules("ar"),
};

/** Catégorie de pluriel utilisée : `zero` (arabe, 0) est traité comme `other`. */
export function pluralCategory(lang: Lang, n: number): keyof PluralForms {
  const category = rules[lang].select(n);
  return category === "zero" ? "other" : category;
}

/** Choisit la forme du dictionnaire selon `n` et remplace `{n}`. */
export function pluralize(lang: Lang, n: number, forms: PluralForms): string {
  return interpolate(forms[pluralCategory(lang, n)], { n });
}
