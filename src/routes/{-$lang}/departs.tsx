import { createFileRoute } from "@tanstack/react-router";
import { CTASection } from "@/components/site/CTASection";
import { DepartureList } from "@/components/site/DepartureList";
import { DepartureFilters } from "@/components/site/Filters";
import { LocalizedLink } from "@/components/site/LocalizedLink";
import { PageHero } from "@/components/site/PageHero";
import { btn } from "@/components/site/ui";
import { listDeparturesFn } from "@/functions/public.functions";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";
import { pluralize } from "@/i18n/plural";
import { useLang, useT } from "@/i18n/useI18n";
import { parseMonthParam, parseSlugParam, parseUniverseParam } from "@/lib/search";
import type { Universe } from "@/lib/types";

type DeparturesSearch = {
  univers?: Universe | undefined;
  region?: string | undefined;
  mois?: string | undefined;
};

export const Route = createFileRoute("/{-$lang}/departs")({
  validateSearch: (search: Record<string, unknown>): DeparturesSearch => ({
    univers: parseUniverseParam(search["univers"]),
    region: parseSlugParam(search["region"]),
    mois: parseMonthParam(search["mois"]),
  }),
  loaderDeps: ({ search }) => ({
    univers: search.univers,
    region: search.region,
    mois: search.mois,
  }),
  loader: ({ params, deps }) =>
    listDeparturesFn({
      data: {
        lang: parseLang(params.lang as string | undefined),
        universe: deps.univers,
        region: deps.region,
        month: deps.mois,
      },
    }),
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.departures;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/departs",
      title,
      description,
    });
  },
  component: DeparturesPage,
});

function DeparturesPage() {
  const t = useT();
  const lang = useLang();
  const { departures, months, regions } = Route.useLoaderData();
  const { univers, region, mois } = Route.useSearch();
  const page = t.departuresPage;
  const filtered = Boolean(univers || region || mois);

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} />

      <section className="section-y bg-background">
        <div className="container-page">
          <DepartureFilters
            universe={univers}
            region={region}
            month={mois}
            regions={regions}
            months={months}
          />

          <p className="mt-10 text-sm font-semibold text-muted-foreground" aria-live="polite">
            {pluralize(lang, departures.length, page.count)}
          </p>

          <div className="mt-4">
            {departures.length ? (
              <DepartureList departures={departures} />
            ) : (
              <div className="card-surface p-8 text-center">
                <p className="font-display text-lg font-semibold text-navy">{page.empty}</p>
                <p className="mt-2 text-muted-foreground">{page.emptyHint}</p>
                {filtered ? (
                  <LocalizedLink to="/{-$lang}/departs" className={`${btn.outline} mt-6`}>
                    {page.reset}
                  </LocalizedLink>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
