import type { ReactNode } from "react";
import { useLang, useT } from "@/i18n/useI18n";
import { formatMonth } from "@/lib/format";
import type { DestinationCard, Universe } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LocalizedLink, type PublicPath } from "./LocalizedLink";

const UNIVERSES: readonly Universe[] = ["maroc", "international", "omra"];

function Pill({
  to,
  search,
  active,
  children,
}: {
  to: PublicPath;
  search: Record<string, string | undefined>;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <LocalizedLink
      to={to}
      search={search}
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-navy hover:border-primary/40 hover:text-primary",
      )}
    >
      {children}
    </LocalizedLink>
  );
}

function clean(search: Record<string, string | undefined>): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(search).filter(([, v]) => v !== undefined));
}

/** Onglets d'univers (Tout / Maroc / International / Omra) de la liste des voyages. */
export function UniverseTabs({ current }: { current: Universe | undefined }) {
  const t = useT();
  return (
    <nav aria-label={t.tripsPage.filterLabel} className="flex flex-wrap gap-2">
      <Pill to="/{-$lang}/voyages" search={{}} active={!current}>
        {t.universes.all}
      </Pill>
      {UNIVERSES.map((u) => (
        <Pill key={u} to="/{-$lang}/voyages" search={{ univers: u }} active={current === u}>
          {t.universes[u]}
        </Pill>
      ))}
    </nav>
  );
}

/** Filtres de l'agenda des départs : univers, destination, mois. */
export function DepartureFilters({
  universe,
  region,
  month,
  regions,
  months,
}: {
  universe: Universe | undefined;
  region: string | undefined;
  month: string | undefined;
  regions: readonly DestinationCard[];
  months: readonly string[];
}) {
  const t = useT();
  const lang = useLang();
  const to = "/{-$lang}/departs" as const;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-semibold text-muted-foreground">
          {t.departuresPage.universeLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          <Pill to={to} search={clean({ mois: month })} active={!universe}>
            {t.universes.all}
          </Pill>
          {UNIVERSES.map((u) => (
            <Pill
              key={u}
              to={to}
              search={clean({ univers: u, mois: month })}
              active={universe === u}
            >
              {t.universes[u]}
            </Pill>
          ))}
        </div>
      </div>

      {regions.length > 1 ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            {t.departuresPage.regionLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill to={to} search={clean({ univers: universe, mois: month })} active={!region}>
              {t.departuresPage.allRegions}
            </Pill>
            {regions.map((r) => (
              <Pill
                key={r.slug}
                to={to}
                search={clean({ univers: universe, region: r.slug, mois: month })}
                active={region === r.slug}
              >
                {r.name}
              </Pill>
            ))}
          </div>
        </div>
      ) : null}

      {months.length ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            {t.departuresPage.monthLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill to={to} search={clean({ univers: universe, region })} active={!month}>
              {t.departuresPage.allMonths}
            </Pill>
            {months.map((m) => (
              <Pill
                key={m}
                to={to}
                search={clean({ univers: universe, region, mois: m })}
                active={month === m}
              >
                {formatMonth(m, lang)}
              </Pill>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
