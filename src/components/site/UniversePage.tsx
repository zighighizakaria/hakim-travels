import type { UniversePageData } from "@/lib/types";
import { useT } from "@/i18n/useI18n";
import { CTASection } from "./CTASection";
import { DepartureList, NoDepartures } from "./DepartureList";
import { LocalizedLink } from "./LocalizedLink";
import { PageHero } from "./PageHero";
import { RegionGrid } from "./RegionGrid";
import { Reveal } from "./Reveal";
import { TripGrid } from "./TripCard";
import { Arrow, SectionHead } from "./ui";

/** Page d'un univers : Maroc ou International (régions/pays, voyages, prochains départs). */
export function UniversePage({ data }: { data: UniversePageData }) {
  const t = useT();
  const universe = data.universe === "maroc" ? "maroc" : "international";
  const copy = t.universePages[universe];

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

      {data.destinations.length ? (
        <section className="section-y bg-background">
          <div className="container-page">
            <Reveal>
              <SectionHead title={t.universePages.regionsTitle} subtitle={copy.regionsSubtitle} />
            </Reveal>
            <div className="mt-10">
              <RegionGrid destinations={data.destinations} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-y bg-mist">
        <div className="container-page">
          <Reveal>
            <SectionHead title={t.universePages.departuresTitle} />
          </Reveal>
          <div className="mt-10">
            {data.departures.length ? (
              <DepartureList departures={data.departures} />
            ) : (
              <NoDepartures />
            )}
          </div>
          <Reveal className="mt-10 block">
            <LocalizedLink
              to="/{-$lang}/departs"
              search={{ univers: data.universe }}
              className="group inline-flex items-center gap-2 font-semibold text-primary"
            >
              {t.home.departures.cta}
              <Arrow />
            </LocalizedLink>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-background">
        <div className="container-page">
          <Reveal>
            <SectionHead title={t.universePages.tripsTitle} />
          </Reveal>
          <div className="mt-10">
            {data.trips.length ? (
              <TripGrid trips={data.trips} />
            ) : (
              <p className="text-muted-foreground">{t.common.noTrip}</p>
            )}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
