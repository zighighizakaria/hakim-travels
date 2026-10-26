import { useT } from "@/i18n/useI18n";
import { Reveal } from "./Reveal";
import { SectionHead } from "./ui";

export function WhyHakimTravels() {
  const t = useT();
  return (
    <section className="section-y bg-background">
      <div className="container-page">
        <Reveal>
          <SectionHead eyebrow={t.home.why.eyebrow} title={t.home.why.title} />
        </Reveal>

        <div className="mt-12 grid gap-x-12 gap-y-10 md:mt-16 md:grid-cols-2">
          {t.home.why.items.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <div className="group border-t border-border pt-6 transition-colors duration-300 hover:border-primary/50">
                <span className="font-display text-sm font-semibold tracking-[0.2em] text-turquoise">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-navy md:text-[1.7rem]">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
