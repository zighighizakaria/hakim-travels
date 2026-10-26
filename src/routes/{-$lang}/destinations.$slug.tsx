import { createFileRoute } from "@tanstack/react-router";
import { CTASection } from "@/components/site/CTASection";
import { DepartureList } from "@/components/site/DepartureList";
import { FAQ } from "@/components/site/FAQ";
import { ImageOrFallback } from "@/components/site/ImageOrFallback";
import { LocalizedLink } from "@/components/site/LocalizedLink";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { TripGrid } from "@/components/site/TripCard";
import { btn } from "@/components/site/ui";
import { getDestinationFn } from "@/functions/public.functions";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { useT } from "@/i18n/useI18n";
import { breadcrumbLd, buildSeo, siteSeoBase } from "@/lib/seo";

export const Route = createFileRoute("/{-$lang}/destinations/$slug")({
  loader: ({ params }) =>
    getDestinationFn({
      data: { lang: parseLang(params.lang as string | undefined), slug: params.slug },
    }),
  head: ({ loaderData, params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const base = siteSeoBase(matches, lang);
    const path = `/destinations/${params.slug}`;
    if (!loaderData)
      return buildSeo({
        ...base,
        lang,
        path,
        title: getDict(lang).meta.notFound.title,
        description: getDict(lang).notFound.text,
        noindex: true,
      });
    const d = loaderData.destination;
    const meta = getDict(lang).meta;
    return buildSeo({
      ...base,
      lang,
      path,
      title: d.seoTitle ?? d.name,
      description: d.seoDescription ?? d.teaser ?? d.tagline ?? meta.defaultDescription,
      image: d.cover?.url ?? base.image,
      jsonLd: breadcrumbLd(base.siteUrl, lang, [
        { name: getDict(lang).nav.home, path: "/" },
        { name: meta.destinations.title, path: "/destinations" },
        { name: d.name, path },
      ]),
    });
  },
  notFoundComponent: DestinationNotFound,
  component: DestinationPage,
});

function DestinationNotFound() {
  const t = useT();
  return (
    <div className="container-page flex min-h-[60svh] flex-col items-center justify-center gap-5 pt-24 text-center">
      <h1 className="display-section text-navy">{t.destinationsPage.notFoundTitle}</h1>
      <LocalizedLink to="/{-$lang}/destinations" className={btn.primary}>
        {t.destinationsPage.notFoundCta}
      </LocalizedLink>
    </div>
  );
}

function DestinationPage() {
  const { destination, trips, departures } = Route.useLoaderData();
  const t = useT();
  const page = t.destinationsPage;

  return (
    <>
      <PageHero
        eyebrow={t.universes[destination.universe]}
        title={destination.name}
        subtitle={destination.tagline ?? destination.teaser}
        image={destination.cover}
        imageAlt={destination.name}
      />

      {destination.intro || destination.highlights.length ? (
        <section className="section-y bg-background">
          <div className="container-page grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
            {destination.intro ? (
              <Reveal>
                <h2 className="display-section text-navy">{page.intro}</h2>
                <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
                  {destination.intro}
                </p>
              </Reveal>
            ) : null}
            {destination.highlights.length ? (
              <Reveal delay={100}>
                <h2 className="font-display text-2xl font-bold text-navy">{page.highlights}</h2>
                <ul className="mt-5 space-y-0 border-t border-border">
                  {destination.highlights.map((h, i) => (
                    <li key={i} className="border-b border-border py-4 text-navy/80">
                      {h.label ? (
                        <span className="font-semibold text-navy">{h.label} : </span>
                      ) : null}
                      {h.text}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : null}

      {destination.gallery.length ? (
        <section className="bg-mist py-16 md:py-24">
          <div className="container-page">
            <Reveal>
              <h2 className="display-section text-navy">{page.gallery}</h2>
            </Reveal>
            <div className="-mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0">
              {destination.gallery.map((img, i) => (
                <Reveal
                  key={img.id}
                  delay={i * 80}
                  className="w-[72%] shrink-0 snap-start md:w-auto"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-3xl">
                    <ImageOrFallback image={img} alt={`${destination.name} ${i + 1}`} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {departures.length ? (
        <section className="section-y bg-background">
          <div className="container-page">
            <Reveal>
              <h2 className="display-section text-navy">{page.departures}</h2>
            </Reveal>
            <div className="mt-8">
              <DepartureList departures={departures} />
            </div>
          </div>
        </section>
      ) : null}

      {trips.length ? (
        <section className="section-y bg-mist">
          <div className="container-page">
            <Reveal>
              <h2 className="display-section text-navy">{page.trips}</h2>
            </Reveal>
            <div className="mt-8">
              <TripGrid trips={trips} />
            </div>
          </div>
        </section>
      ) : null}

      {destination.practical.length || destination.faq.length ? (
        <section className="section-y bg-background">
          <div className="container-page grid gap-14 lg:grid-cols-2 lg:gap-20">
            {destination.practical.length ? (
              <Reveal>
                <h2 className="display-section text-navy">{page.practical}</h2>
                <dl className="mt-8 border-t border-border">
                  {destination.practical.map((row, i) => (
                    <div key={i} className="grid gap-1 border-b border-border py-4 sm:grid-cols-2">
                      <dt className="font-semibold text-navy">{row.label}</dt>
                      <dd className="text-muted-foreground">{row.text}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ) : null}
            {destination.faq.length ? (
              <Reveal delay={100}>
                <FAQ items={destination.faq} title={page.faq} />
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : null}

      <CTASection />
    </>
  );
}
