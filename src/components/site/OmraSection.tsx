import type { DestinationCard } from "@/lib/types";
import { useT } from "@/i18n/useI18n";
import { ImageOrFallback } from "./ImageOrFallback";
import { LocalizedLink } from "./LocalizedLink";
import { Reveal } from "./Reveal";
import { useWhatsApp } from "./useSite";
import { WhatsAppButton } from "./WhatsAppButton";
import { btn } from "./ui";

/** Bloc Omra de l'accueil. L'image vient de la destination Omra (dégradé de repli sinon). */
export function OmraSection({ destination }: { destination: DestinationCard | undefined }) {
  const t = useT();
  const wa = useWhatsApp();
  return (
    <section className="section-y bg-navy text-white">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl">
            <ImageOrFallback
              image={destination?.cover}
              alt={destination?.name ?? t.universes.omra}
              emoji="🕋"
              seed={1}
            />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="eyebrow">{t.home.omra.eyebrow}</p>
          <h2 className="display-section mt-3 text-white">{t.home.omra.title}</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/72">{t.home.omra.text}</p>

          <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {t.omraPage.features.map((f) => (
              <li key={f.title} className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
                <span className="font-display font-semibold text-white">{f.title}</span>
                <span className="text-[0.95rem] leading-relaxed text-white/65">{f.text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LocalizedLink to="/{-$lang}/omra" className={btn.primary}>
              {t.home.omra.cta}
            </LocalizedLink>
            <WhatsAppButton href={wa.omra()} className={btn.ghostLight}>
              {t.home.omra.ask}
            </WhatsAppButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
