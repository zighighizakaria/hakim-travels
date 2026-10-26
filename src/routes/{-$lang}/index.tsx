import { createFileRoute } from "@tanstack/react-router";
import { CTASection } from "@/components/site/CTASection";
import { DepartureList } from "@/components/site/DepartureList";
import { Hero } from "@/components/site/Hero";
import { InstagramGallery } from "@/components/site/InstagramGallery";
import { LocalizedLink } from "@/components/site/LocalizedLink";
import { OmraSection } from "@/components/site/OmraSection";
import { RegionGrid } from "@/components/site/RegionGrid";
import { Reveal } from "@/components/site/Reveal";
import { SocialProof } from "@/components/site/SocialProof";
import { TripGrid } from "@/components/site/TripCard";
import { useWhatsApp } from "@/components/site/useSite";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { WhyHakimTravels } from "@/components/site/WhyHakimTravels";
import { Arrow, SectionHead, btn } from "@/components/site/ui";
import { getHomePage } from "@/functions/public.functions";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { useT } from "@/i18n/useI18n";
import { buildSeo, siteSeoBase, siteSettings, travelAgencyLd } from "@/lib/seo";

export const Route = createFileRoute("/{-$lang}/")({
  loader: ({ params }) =>
    getHomePage({ data: { lang: parseLang(params.lang as string | undefined) } }),
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const t = getDict(lang);
    const base = siteSeoBase(matches, lang);
    const settings = siteSettings(matches, lang);
    return buildSeo({
      ...base,
      lang,
      path: "/",
      title: t.meta.home.title,
      description: t.meta.home.description,
      jsonLd: settings ? travelAgencyLd(base.siteUrl, lang, settings) : undefined,
    });
  },
  component: Home,
});

function Home() {
  const t = useT();
  const wa = useWhatsApp();
  const data = Route.useLoaderData();

  return (
    <>
      <Hero />

      {data.regions.length ? (
        <section className="section-y bg-background">
          <div className="container-page">
            <Reveal>
              <SectionHead
                eyebrow={t.home.regions.eyebrow}
                title={t.home.regions.title}
                subtitle={t.home.regions.subtitle}
              />
            </Reveal>
            <div className="mt-12">
              <RegionGrid destinations={data.regions} />
            </div>
            <Reveal className="mt-10 block">
              <LocalizedLink
                to="/{-$lang}/maroc"
                className="group inline-flex items-center gap-2 font-semibold text-primary"
              >
                {t.home.regions.cta}
                <Arrow />
              </LocalizedLink>
            </Reveal>
          </div>
        </section>
      ) : null}

      {data.upcomingDepartures.length ? (
        <section className="section-y bg-mist">
          <div className="container-page">
            <Reveal>
              <SectionHead
                eyebrow={t.home.departures.eyebrow}
                title={t.home.departures.title}
                subtitle={t.home.departures.subtitle}
              />
            </Reveal>
            <div className="mt-10">
              <DepartureList departures={data.upcomingDepartures} />
            </div>
            <Reveal className="mt-10 block">
              <LocalizedLink
                to="/{-$lang}/departs"
                className="group inline-flex items-center gap-2 font-semibold text-primary"
              >
                {t.home.departures.cta}
                <Arrow />
              </LocalizedLink>
            </Reveal>
          </div>
        </section>
      ) : null}

      {data.featuredTrips.length ? (
        <section className="section-y bg-background">
          <div className="container-page">
            <Reveal>
              <SectionHead
                eyebrow={t.home.featured.eyebrow}
                title={t.home.featured.title}
                subtitle={t.home.featured.subtitle}
              />
            </Reveal>
            <div className="mt-12">
              <TripGrid trips={data.featuredTrips} />
            </div>
          </div>
        </section>
      ) : null}

      {data.international.length ? (
        <section className="section-y bg-mist">
          <div className="container-page">
            <Reveal>
              <SectionHead
                eyebrow={t.home.international.eyebrow}
                title={t.home.international.title}
                subtitle={t.home.international.subtitle}
              />
            </Reveal>
            <div className="mt-12">
              <RegionGrid destinations={data.international} />
            </div>
            <Reveal className="mt-10 block">
              <LocalizedLink
                to="/{-$lang}/international"
                className="group inline-flex items-center gap-2 font-semibold text-primary"
              >
                {t.home.international.cta}
                <Arrow />
              </LocalizedLink>
            </Reveal>
          </div>
        </section>
      ) : null}

      <OmraSection destination={data.omra[0]} />
      <WhyHakimTravels />
      <SocialProof reviews={data.reviews} />
      <InstagramGallery />

      <section className="section-y bg-background" id="sur-mesure">
        <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">{t.home.custom.eyebrow}</p>
            <h2 className="display-section mt-3 text-navy">{t.home.custom.title}</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              {t.home.custom.text}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="card-surface flex flex-col items-start gap-4 p-6 md:p-10">
              <p className="max-w-md leading-relaxed text-muted-foreground">
                {t.home.custom.whatsappText}
              </p>
              <WhatsAppButton href={wa.custom()} className={btn.whatsapp}>
                {t.common.writeOnWhatsapp}
              </WhatsAppButton>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
