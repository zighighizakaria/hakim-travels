import { Link } from "@tanstack/react-router";
import type { MouseEventHandler, ReactNode } from "react";
import { langParam } from "@/i18n/config";
import { useLang } from "@/i18n/useI18n";

/** Pages publiques sans paramètre propre : le préfixe de langue est ajouté automatiquement. */
export type PublicPath =
  | "/{-$lang}"
  | "/{-$lang}/maroc"
  | "/{-$lang}/international"
  | "/{-$lang}/omra"
  | "/{-$lang}/departs"
  | "/{-$lang}/voyages"
  | "/{-$lang}/destinations"
  | "/{-$lang}/sur-mesure"
  | "/{-$lang}/contact"
  | "/{-$lang}/a-propos"
  | "/{-$lang}/mentions-legales"
  | "/{-$lang}/confidentialite"
  | "/{-$lang}/conditions-generales";

export function LocalizedLink({
  to,
  search,
  exact,
  activeClassName,
  className,
  onClick,
  children,
  ...aria
}: {
  to: PublicPath;
  search?: Record<string, string | undefined>;
  /** Style actif seulement sur correspondance exacte (accueil). */
  exact?: boolean;
  activeClassName?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const lang = useLang();
  return (
    <Link
      to={to}
      params={{ lang: langParam(lang) } as never}
      search={search as never}
      activeOptions={{ exact: exact ?? false }}
      activeProps={activeClassName ? { className: activeClassName } : {}}
      className={className}
      onClick={onClick}
      {...aria}
    >
      {children}
    </Link>
  );
}
