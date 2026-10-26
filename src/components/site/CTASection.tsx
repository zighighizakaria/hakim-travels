import { useT } from "@/i18n/useI18n";
import { LocalizedLink } from "./LocalizedLink";
import { Reveal } from "./Reveal";
import { useWhatsApp } from "./useSite";
import { WhatsAppButton } from "./WhatsAppButton";
import { btn } from "./ui";

export function CTASection() {
  const t = useT();
  const wa = useWhatsApp();
  return (
    <section className="section-y bg-mist">
      <div className="container-page">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card px-8 py-14 text-center md:px-16 md:py-20">
            <p className="eyebrow">{t.home.cta.eyebrow}</p>
            <h2 className="display-section mx-auto mt-4 max-w-2xl text-navy">{t.home.cta.title}</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t.home.cta.text}
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <LocalizedLink to="/{-$lang}/sur-mesure" className={btn.primary}>
                {t.nav.plan}
              </LocalizedLink>
              <WhatsAppButton
                href={wa.general()}
                className={btn.outline}
                iconClassName="h-[1.15rem] w-[1.15rem] text-[#128C4A]"
              >
                {t.common.talkToAdvisor}
              </WhatsAppButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
