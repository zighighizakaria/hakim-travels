import { createFileRoute } from "@tanstack/react-router";
import { CTASection } from "@/components/site/CTASection";
import { PageHero } from "@/components/site/PageHero";
import { RegionGrid } from "@/components/site/RegionGrid";
import { Reveal } from "@/components/site/Reveal";
import { SectionHead } from "@/components/site/ui";
import { listDestinationsFn } from "@/functions/public.functions";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";
import { useT } from "@/i18n/useI18n";
import type { Universe } from "@/lib/types";

const ORDER: readonly Universe[] = ["maroc", "international", "omra"];

export const Route = createFileRoute("/{-$lang}/destinations/")({
  loader: ({ params }) =>
    listDestinationsFn({ data: { lang: parseLang(params.lang as string | undefined) } }),
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.destinations;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/destinations",
      title,
      description,
    });
  },
  component: DestinationsPage,
});

function DestinationsPage() {
  const t = useT();
  const destinations = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow={t.destinationsPage.eyebrow}
        title={t.destinationsPage.title}
        subtitle={t.destinationsPage.subtitle}
      />
      {ORDER.map((universe) => {
        const items = destinations.filter((d) => d.universe === universe);
        if (!items.length) return null;
        return (
          <section key={universe} className="section-y bg-background even:bg-mist">
            <div className="container-page">
              <Reveal>
                <SectionHead title={t.universes[universe]} />
              </Reveal>
              <div className="mt-10">
                <RegionGrid destinations={items} />
              </div>
            </div>
          </section>
        );
      })}
      <CTASection />
    </>
  );
}
