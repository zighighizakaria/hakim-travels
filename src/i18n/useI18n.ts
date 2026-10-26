import { useRouterState } from "@tanstack/react-router";
import { dirOf, langFromPathname, type Lang } from "./config";
import { getDict } from "./dictionaries";
import type { Dict } from "./dictionaries/fr";

/** Langue courante, dérivée du pathname uniquement. */
export function useLang(): Lang {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return langFromPathname(pathname);
}

/** Dictionnaire de la langue courante. */
export function useT(): Dict {
  return getDict(useLang());
}

export function useDir(): "ltr" | "rtl" {
  return dirOf(useLang());
}
