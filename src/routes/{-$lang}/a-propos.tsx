import { createFileRoute } from "@tanstack/react-router";
import { CTASection } from "@/components/site/CTASection";
import { InstagramGallery } from "@/components/site/InstagramGallery";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { useSettings } from "@/components/site/useSite";
import { Arrow } from "@/components/site/ui";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";
import { useT } from "@/i18n/useI18n";

export const Route = createFileRoute("/{-$lang}/a-propos")({
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.about;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/a-propos",
      title,
      description,
    });
  },
  component: AboutPage,
});

function AboutPage() {
  const t = useT();
  const s = useSettings();
  const page = t.aboutPage;

  const legalRows = [
    { label: t.legalLabels.company, value: s?.legalCompanyName },
    { label: t.legalLabels.ice, value: s?.legalIce },
    { label: t.legalLabels.rc, value: s?.legalRc },
    { label: t.legalLabels.license, value: s?.legalLicenseNumber },
  ].filter((r): r is { label: string; value: string } => Boolean(r.value));

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} />

      <section className="section-y bg-background">
        <div className="container-page grid gap-14 lg:grid-cols-[1fr_0.75fr] lg:gap-20">
          <Reveal>
            <h2 className="display-section text-navy">{page.approachTitle}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {page.approachText}
            </p>
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {t.home.why.items.map((p, i) => (
                <div key={p.title} className="border-t border-border pt-5">
                  <span className="font-display text-sm font-semibold tracking-[0.18em] text-turquoise">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold text-navy">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{p.text}</p>
                </div>
              ))}
            </div>

            {legalRows.length ? (
              <div className="mt-12">
                <h3 className="font-display text-xl font-semibold text-navy">{page.legalTitle}</h3>
                <dl className="mt-4 border-t border-border">
                  {legalRows.map((r) => (
                    <div
                      key={r.label}
                      className="grid gap-1 border-b border-border py-3 sm:grid-cols-2"
                    >
                      <dt className="font-semibold text-navy">{r.label}</dt>
                      <dd className="text-muted-foreground">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </Reveal>

          <Reveal delay={120}>
            <div className="card-surface flex flex-col items-start gap-6 p-8">
              <img
                src="/favicon.png"
                alt={t.nav.logoAlt}
                width={112}
                height={112}
                className="h-28 w-28"
              />
              {s?.instagramFollowersLabel ? (
                <div>
                  <p className="font-display text-4xl font-bold text-navy">
                    {s.instagramFollowersLabel}
                  </p>
                  <p className="mt-1 text-muted-foreground">{page.followers}</p>
                </div>
              ) : null}
              {s?.instagramUrl ? (
                <a
                  href={s.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 font-semibold text-primary"
                >
                  <span dir="ltr">{s.instagramHandle ?? "Instagram"}</span>
                  <Arrow />
                </a>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      <InstagramGallery />
      <CTASection />
    </>
  );
}
