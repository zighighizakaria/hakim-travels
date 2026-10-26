import { createFileRoute } from "@tanstack/react-router";
import { CTASection } from "@/components/site/CTASection";
import { UniverseTabs } from "@/components/site/Filters";
import { PageHero } from "@/components/site/PageHero";
import { TripGrid } from "@/components/site/TripCard";
import { listTripsFn } from "@/functions/public.functions";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";
import { useT } from "@/i18n/useI18n";
import { parseSlugParam, parseUniverseParam } from "@/lib/search";
import type { Universe } from "@/lib/types";

type TripsSearch = { univers?: Universe | undefined; region?: string | undefined };

export const Route = createFileRoute("/{-$lang}/voyages/")({
  validateSearch: (search: Record<string, unknown>): TripsSearch => ({
    univers: parseUniverseParam(search["univers"]),
    region: parseSlugParam(search["region"]),
  }),
  loaderDeps: ({ search }) => ({ univers: search.univers, region: search.region }),
  loader: ({ params, deps }) =>
    listTripsFn({
      data: {
        lang: parseLang(params.lang as string | undefined),
        universe: deps.univers,
        region: deps.region,
      },
    }),
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.trips;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/voyages",
      title,
      description,
    });
  },
  component: TripsPage,
});

function TripsPage() {
  const t = useT();
  const trips = Route.useLoaderData();
  const { univers } = Route.useSearch();

  return (
    <>
      <PageHero
        eyebrow={t.tripsPage.eyebrow}
        title={t.tripsPage.title}
        subtitle={t.tripsPage.subtitle}
      />

      <section className="section-y bg-background">
        <div className="container-page">
          <UniverseTabs current={univers} />
          <div className="mt-10">
            {trips.length ? (
              <TripGrid trips={trips} />
            ) : (
              <p className="text-muted-foreground">{t.tripsPage.empty}</p>
            )}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
