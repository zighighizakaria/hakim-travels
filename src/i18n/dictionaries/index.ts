import type { Lang } from "../config";
import { ar } from "./ar";
import { fr, type Dict } from "./fr";

export type { Dict };

const dictionaries: Record<Lang, Dict> = { fr, ar };

export function getDict(lang: Lang): Dict {
  return dictionaries[lang];
}
