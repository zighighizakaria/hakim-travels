import { interpolate } from "@/i18n/config";
import { useT } from "@/i18n/useI18n";
import { LocalizedLink, type PublicPath } from "./LocalizedLink";
import { useSettings, useWhatsApp } from "./useSite";
import { WhatsAppButton } from "./WhatsAppButton";
import { btn } from "./ui";

/** Décor de repli quand aucune photo d'accueil n'est définie : dunes et crêtes de l'Atlas aux couleurs de la marque. */
function LandscapeFallback() {
  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-navy via-primary to-ocean"
      aria-hidden="true"
    >
      <div className="absolute -top-24 end-[-10%] h-[28rem] w-[28rem] rounded-full bg-turquoise/30 blur-3xl" />
      <div className="absolute bottom-[18%] start-[8%] h-40 w-40 rounded-full bg-sun/25 blur-2xl" />
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[38%] w-full rtl:-scale-x-100"
      >
        <path
          d="M0 220 L120 150 L210 200 L340 90 L450 190 L560 120 L690 210 L820 130 L940 200 L1060 110 L1180 190 L1300 140 L1440 200 L1440 320 L0 320 Z"
          fill="#062b4f"
          fillOpacity="0.55"
        />
        <path
          d="M0 260 C140 210 260 280 420 245 C580 210 700 285 880 250 C1060 215 1200 280 1440 240 L1440 320 L0 320 Z"
          fill="#062b4f"
          fillOpacity="0.85"
        />
      </svg>
    </div>
  );
}

export function Hero() {
  const t = useT();
  const settings = useSettings();
  const wa = useWhatsApp();
  const heroImage = settings?.heroImage ?? null;
  const followers = settings?.instagramFollowersLabel ?? null;

  const chips: { label: string; emoji: string; to: PublicPath }[] = [
    { label: t.home.hero.chips.north, emoji: "🌿", to: "/{-$lang}/maroc" },
    { label: t.home.hero.chips.south, emoji: "🏜️", to: "/{-$lang}/maroc" },
    { label: t.home.hero.chips.mountains, emoji: "⛰️", to: "/{-$lang}/maroc" },
    { label: t.home.hero.chips.international, emoji: "✈️", to: "/{-$lang}/international" },
    { label: t.home.hero.chips.omra, emoji: "🕋", to: "/{-$lang}/omra" },
  ];

  return (
    <section className="relative flex min-h-[92svh] items-end overflow-hidden pt-24">
      {heroImage ? (
        <div className="absolute inset-0">
          <img
            src={heroImage.url}
            alt={heroImage.alt ?? ""}
            width={heroImage.width ?? undefined}
            height={heroImage.height ?? undefined}
            className="ht-ken-burns h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/45 to-navy/25" />
        </div>
      ) : (
        <LandscapeFallback />
      )}

      <div className="container-page relative z-10 pb-16 md:pb-24">
        {followers ? (
          <div
            className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[0.82rem] font-medium text-white backdrop-blur-md"
            style={{ animation: "ht-fade-up 700ms ease-out 100ms both" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sun" />
            {interpolate(t.home.hero.badge, { label: followers })}
          </div>
        ) : null}

        <h1
          className="display-hero mt-6 max-w-[18ch] text-white"
          style={{ animation: "ht-fade-up 800ms cubic-bezier(0.22,1,0.36,1) 220ms both" }}
        >
          {t.home.hero.title}
        </h1>

        <p
          className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
          style={{ animation: "ht-fade-up 800ms ease-out 380ms both" }}
        >
          {t.home.hero.subtitle}
        </p>

        <div
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          style={{ animation: "ht-fade-up 800ms ease-out 520ms both" }}
        >
          <LocalizedLink to="/{-$lang}/departs" className={btn.primary}>
            {t.home.hero.ctaDepartures}
          </LocalizedLink>
          <WhatsAppButton href={wa.general()} className={btn.ghostLight}>
            {t.home.hero.ctaAdvisor}
          </WhatsAppButton>
        </div>

        <ul className="mt-12 flex flex-wrap gap-2.5 md:mt-16">
          {chips.map((c, i) => (
            <li
              key={c.label}
              style={{ animation: `ht-fade-up 600ms ease-out ${700 + i * 110}ms both` }}
            >
              <LocalizedLink
                to={c.to}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <span aria-hidden="true">{c.emoji}</span>
                {c.label}
              </LocalizedLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
