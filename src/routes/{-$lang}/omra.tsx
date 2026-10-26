import { createFileRoute } from "@tanstack/react-router";
import medinaImg from "@/assets/gallery-4.jpg";
import { DepartureList, NoDepartures } from "@/components/site/DepartureList";
import { FAQ } from "@/components/site/FAQ";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { TripGrid } from "@/components/site/TripCard";
import { useWhatsApp } from "@/components/site/useSite";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { SectionHead, btn } from "@/components/site/ui";
import { getUniversePage } from "@/functions/public.functions";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";
import { useT } from "@/i18n/useI18n";

export const Route = createFileRoute("/{-$lang}/omra")({
  loader: ({ params }) =>
    getUniversePage({
      data: { lang: parseLang(params.lang as string | undefined), universe: "omra" },
    }),
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.omra;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/omra",
      title,
      description,
    });
  },
  component: OmraPage,
});

function OmraPage() {
  const t = useT();
  const wa = useWhatsApp();
  const data = Route.useLoaderData();
  const cover = data.destinations[0]?.cover ?? null;
  const copy = t.universePages.omra;
  const page = t.omraPage;

  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        image={cover}
        imageAlt={page.imageAlt}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton href={wa.omra()} className={btn.primary}>
            {page.ctaInfo}
          </WhatsAppButton>
        </div>
      </PageHero>

      <section className="section-y bg-background">
        <div className="container-page grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <h2 className="display-section text-navy">{page.introTitle}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{page.introText}</p>
            <ul className="mt-10 border-t border-border">
              {page.features.map((f) => (
                <li
                  key={f.title}
                  className="grid gap-1 border-b border-border py-5 sm:grid-cols-[170px_1fr] sm:gap-6"
                >
                  <span className="font-display font-semibold text-navy">{f.title}</span>
                  <span className="leading-relaxed text-muted-foreground">{f.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">{page.note}</p>
          </Reveal>

          <Reveal delay={120}>
            <div className="h-full min-h-72 overflow-hidden rounded-3xl">
              <img
                src={medinaImg}
                alt={page.medinaAlt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-mist">
        <div className="container-page">
          <Reveal>
            <SectionHead title={page.stepsTitle} />
          </Reveal>
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {page.steps.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 80}>
                <div className="card-surface h-full p-6">
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-turquoise">
                    {s.label}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold text-navy">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-y bg-background">
        <div className="container-page">
          <Reveal>
            <SectionHead title={page.departuresTitle} />
          </Reveal>
          <div className="mt-10">
            {data.departures.length ? (
              <DepartureList departures={data.departures} />
            ) : (
              <NoDepartures />
            )}
          </div>
        </div>
      </section>

      {data.trips.length ? (
        <section className="section-y bg-mist">
          <div className="container-page">
            <Reveal>
              <SectionHead title={page.formulasTitle} />
            </Reveal>
            <div className="mt-10">
              <TripGrid trips={data.trips} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-y bg-background">
        <div className="container-page grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <FAQ items={page.faq} title={page.faqTitle} />
          </Reveal>
          <Reveal delay={100}>
            <h2 className="display-section text-navy">{page.askTitle}</h2>
            <div className="mt-8">
              <div className="card-surface flex flex-col items-start gap-4 p-6 md:p-10">
                <p className="max-w-md leading-relaxed text-muted-foreground">{page.askText}</p>
                <WhatsAppButton href={wa.omra()} className={btn.whatsapp}>
                  {t.common.writeOnWhatsapp}
                </WhatsAppButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
