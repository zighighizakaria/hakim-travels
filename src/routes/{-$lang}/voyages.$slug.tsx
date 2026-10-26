import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { DepartureList, NoDepartures } from "@/components/site/DepartureList";
import { FAQ } from "@/components/site/FAQ";
import { ImageOrFallback } from "@/components/site/ImageOrFallback";
import { LocalizedLink } from "@/components/site/LocalizedLink";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { useWhatsApp } from "@/components/site/useSite";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { btn } from "@/components/site/ui";
import { getTripFn } from "@/functions/public.functions";
import { interpolate, parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { useLang, useT } from "@/i18n/useI18n";
import { breadcrumbLd, buildSeo, siteSeoBase, siteSettings, touristTripLd } from "@/lib/seo";
import { formatDate, formatDuration, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/{-$lang}/voyages/$slug")({
  loader: ({ params }) =>
    getTripFn({ data: { lang: parseLang(params.lang as string | undefined), slug: params.slug } }),
  head: ({ loaderData, params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const base = siteSeoBase(matches, lang);
    const path = `/voyages/${params.slug}`;
    if (!loaderData)
      return buildSeo({
        ...base,
        lang,
        path,
        title: getDict(lang).meta.notFound.title,
        description: getDict(lang).notFound.text,
        noindex: true,
      });
    const trip = loaderData;
    return buildSeo({
      ...base,
      lang,
      path,
      title: trip.seoTitle ?? `${trip.title} - ${trip.destination.name}`,
      description: trip.seoDescription ?? trip.teaser,
      image: trip.cover?.url ?? base.image,
      jsonLd: [
        breadcrumbLd(base.siteUrl, lang, [
          { name: getDict(lang).nav.home, path: "/" },
          { name: getDict(lang).meta.trips.title, path: "/voyages" },
          { name: trip.title, path },
        ]),
        touristTripLd(base.siteUrl, lang, trip, siteSettings(matches, lang)),
      ],
    });
  },
  notFoundComponent: TripNotFound,
  component: TripPage,
});

function TripNotFound() {
  const t = useT();
  return (
    <div className="container-page flex min-h-[60svh] flex-col items-center justify-center gap-5 pt-24 text-center">
      <h1 className="display-section text-navy">{t.tripPage.notFoundTitle}</h1>
      <LocalizedLink to="/{-$lang}/voyages" className={btn.primary}>
        {t.tripPage.notFoundCta}
      </LocalizedLink>
    </div>
  );
}

function TripPage() {
  const trip = Route.useLoaderData();
  const t = useT();
  const lang = useLang();
  const wa = useWhatsApp();

  const duration = formatDuration(trip.durationDays, trip.durationNights, lang);
  const price = formatPrice(trip.fromPriceMad, lang);
  const chips = [
    duration,
    price ? interpolate(t.common.fromPrice, { price }) : t.common.priceOnRequest,
    trip.nextDeparture
      ? interpolate(t.common.nextDeparture, { date: formatDate(trip.nextDeparture, lang) })
      : null,
  ].filter((x): x is string => Boolean(x));

  const whatsappHref = wa.trip(trip, trip.whatsappMessage);

  return (
    <>
      <PageHero
        eyebrow={trip.destination.name}
        title={trip.title}
        subtitle={trip.teaser}
        image={trip.cover}
        imageAlt={`${trip.destination.name} - ${trip.title}`}
      >
        <ul className="mt-7 flex flex-wrap gap-2.5">
          {chips.map((item) => (
            <li
              key={item}
              className={
                trip.cover
                  ? "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md"
                  : "rounded-full border border-border bg-card px-4 py-2 text-sm text-navy"
              }
            >
              {item}
            </li>
          ))}
        </ul>
        {trip.priceNote ? (
          <p
            className={
              trip.cover ? "mt-3 text-sm text-white/75" : "mt-3 text-sm text-muted-foreground"
            }
          >
            {trip.priceNote}
          </p>
        ) : null}
      </PageHero>

      <section className="section-y bg-background">
        <div className="container-page grid gap-14 lg:grid-cols-[1.4fr_0.9fr] lg:gap-20">
          <div>
            {trip.presentation ? (
              <Reveal>
                <h2 className="display-section text-navy">{t.tripPage.presentation}</h2>
                <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
                  {trip.presentation}
                </p>
              </Reveal>
            ) : null}

            {trip.highlights.length ? (
              <Reveal className="mt-16 block">
                <h2 className="display-section text-navy">{t.tripPage.highlights}</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {trip.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-3 rounded-2xl bg-mist p-4 text-navy/85"
                    >
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-turquoise" />
                      {h}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            <div className="mt-16" id="departs">
              <Reveal>
                <h2 className="display-section text-navy">{t.tripPage.departures}</h2>
                <p className="mt-4 text-lg text-muted-foreground">{t.tripPage.departuresIntro}</p>
              </Reveal>
              <div className="mt-8">
                {trip.departures.length ? (
                  <DepartureList
                    departures={trip.departures}
                    showTrip={false}
                    whatsappOverride={trip.whatsappMessage}
                  />
                ) : (
                  <NoDepartures />
                )}
              </div>
            </div>

            {trip.days.length ? (
              <Reveal className="mt-16 block">
                <h2 className="display-section text-navy">{t.tripPage.program}</h2>
                <ol className="mt-6 space-y-0 border-t border-border">
                  {trip.days.map((day, i) => (
                    <li
                      key={i}
                      className="grid gap-1 border-b border-border py-6 sm:grid-cols-[130px_1fr] sm:gap-6"
                    >
                      <span className="text-sm font-semibold uppercase tracking-[0.14em] text-turquoise">
                        {day.label}
                      </span>
                      <div>
                        <h3 className="font-display text-xl font-semibold text-navy">
                          {day.title}
                        </h3>
                        {day.body ? (
                          <p className="mt-1.5 whitespace-pre-line leading-relaxed text-muted-foreground">
                            {day.body}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-sm text-muted-foreground">{t.tripPage.programNote}</p>
              </Reveal>
            ) : null}

            {trip.included.length || trip.excluded.length ? (
              <div className="mt-16 grid gap-8 sm:grid-cols-2">
                {trip.included.length ? (
                  <Reveal>
                    <h2 className="font-display text-2xl font-bold text-navy">
                      {t.tripPage.included}
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {trip.included.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-navy/80">
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ) : null}
                {trip.excluded.length ? (
                  <Reveal delay={100}>
                    <h2 className="font-display text-2xl font-bold text-navy">
                      {t.tripPage.excluded}
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {trip.excluded.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-muted-foreground">
                          <X className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/70" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ) : null}
              </div>
            ) : null}

            {trip.gallery.length ? (
              <Reveal className="mt-16 block">
                <h2 className="display-section text-navy">{t.tripPage.gallery}</h2>
                <div className="-mx-5 mt-6 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:px-0">
                  {trip.gallery.map((img, i) => (
                    <div
                      key={img.id}
                      className="aspect-[4/3] w-[78%] shrink-0 snap-start overflow-hidden rounded-3xl md:w-auto"
                    >
                      <ImageOrFallback
                        image={img}
                        alt={interpolate(t.tripPage.galleryAlt, { title: trip.title, n: i + 1 })}
                      />
                    </div>
                  ))}
                </div>
              </Reveal>
            ) : null}

            {trip.faq.length ? (
              <Reveal className="mt-16 block">
                <FAQ items={trip.faq} />
              </Reveal>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card-surface p-7">
              <p className="eyebrow">{t.tripPage.asideEyebrow}</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-navy">
                {t.tripPage.asideTitle}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{t.tripPage.asideText}</p>
              <div className="mt-6 flex flex-col gap-3">
                <WhatsAppButton href={whatsappHref} className={btn.whatsapp}>
                  {t.common.whatsapp}
                </WhatsAppButton>
                <LocalizedLink to="/{-$lang}/contact" className={btn.outline}>
                  {t.common.askInfo}
                </LocalizedLink>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA mobile collant */}
      {whatsappHref ? (
        <>
          <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-border bg-background/95 p-3 pe-20 backdrop-blur-md lg:hidden">
            <LocalizedLink to="/{-$lang}/contact" className={`${btn.primary} flex-1 px-3 text-sm`}>
              {t.tripPage.mobileInfo}
            </LocalizedLink>
            <WhatsAppButton href={whatsappHref} className={`${btn.whatsapp} flex-1 px-3 text-sm`}>
              {t.common.whatsapp}
            </WhatsAppButton>
          </div>
          <div className="h-20 lg:hidden" />
        </>
      ) : null}
    </>
  );
}
