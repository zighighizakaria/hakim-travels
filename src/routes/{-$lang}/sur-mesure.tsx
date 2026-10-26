import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { useWhatsApp } from "@/components/site/useSite";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { btn } from "@/components/site/ui";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";
import { useT } from "@/i18n/useI18n";

export const Route = createFileRoute("/{-$lang}/sur-mesure")({
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.custom;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/sur-mesure",
      title,
      description,
    });
  },
  component: CustomPage,
});

function CustomPage() {
  const t = useT();
  const wa = useWhatsApp();
  const page = t.customPage;

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} />

      <section className="section-y bg-background">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-navy">{page.stepsTitle}</h2>
            <ol className="mt-6 border-t border-border">
              {page.steps.map((s, i) => (
                <li key={s.title} className="border-b border-border py-5">
                  <span className="font-display text-sm font-semibold tracking-[0.18em] text-turquoise">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1.5 font-display text-lg font-semibold text-navy">{s.title}</h3>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-muted-foreground">
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="font-display text-2xl font-bold text-navy">{page.forTitle}</h2>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {page.forItems.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-navy"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div className="card-surface mt-10 flex flex-col items-start gap-4 p-6 md:p-10">
              <h2 className="font-display text-xl font-bold text-navy">{page.askTitle}</h2>
              <p className="max-w-md leading-relaxed text-muted-foreground">{page.askText}</p>
              <WhatsAppButton href={wa.custom()} className={btn.whatsapp}>
                {t.common.writeOnWhatsapp}
              </WhatsAppButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
