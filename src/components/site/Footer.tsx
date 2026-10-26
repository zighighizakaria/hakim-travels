import { Facebook, Instagram, Music2, Youtube } from "lucide-react";
import type { ReactNode } from "react";
import { interpolate } from "@/i18n/config";
import { useT } from "@/i18n/useI18n";
import { LocalizedLink, type PublicPath } from "./LocalizedLink";
import { useSettings, useWhatsApp } from "./useSite";
import { WhatsAppIcon } from "./WhatsAppButton";

const socialClass =
  "flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10";

export function Footer() {
  const t = useT();
  const s = useSettings();
  const wa = useWhatsApp();
  const agencyName = s?.agencyName ?? t.meta.siteName;

  const navItems: { to: PublicPath; label: string }[] = [
    { to: "/{-$lang}/maroc", label: t.nav.maroc },
    { to: "/{-$lang}/international", label: t.nav.international },
    { to: "/{-$lang}/omra", label: t.nav.omra },
    { to: "/{-$lang}/departs", label: t.nav.departures },
    { to: "/{-$lang}/sur-mesure", label: t.nav.custom },
    { to: "/{-$lang}/a-propos", label: t.nav.about },
    { to: "/{-$lang}/contact", label: t.nav.contact },
  ];

  const legal: { to: PublicPath; label: string }[] = [
    { to: "/{-$lang}/mentions-legales", label: t.footer.legal },
    { to: "/{-$lang}/confidentialite", label: t.footer.privacy },
    { to: "/{-$lang}/conditions-generales", label: t.footer.terms },
  ];

  const socials: { href: string | null | undefined; label: string; icon: ReactNode }[] = [
    { href: s?.instagramUrl, label: t.footer.instagram, icon: <Instagram className="h-5 w-5" /> },
    { href: s?.facebookUrl, label: t.footer.facebook, icon: <Facebook className="h-5 w-5" /> },
    { href: s?.tiktokUrl, label: t.footer.tiktok, icon: <Music2 className="h-5 w-5" /> },
    { href: s?.youtubeUrl, label: t.footer.youtube, icon: <Youtube className="h-5 w-5" /> },
  ];
  const visibleSocials = socials.filter((x) => x.href);
  const whatsappHref = wa.general();

  const contactLines: ReactNode[] = [];
  if (s?.phoneDisplay) {
    contactLines.push(
      s.phoneE164 ? (
        <a href={`tel:${s.phoneE164}`} dir="ltr" className="transition-colors hover:text-turquoise">
          {s.phoneDisplay}
        </a>
      ) : (
        <span dir="ltr">{s.phoneDisplay}</span>
      ),
    );
  }
  if (s?.email) {
    contactLines.push(
      <a href={`mailto:${s.email}`} className="transition-colors hover:text-turquoise">
        {s.email}
      </a>,
    );
  }
  if (s?.address) contactLines.push(<span>{s.address}</span>);
  if (s?.openingHours) contactLines.push(<span>{s.openingHours}</span>);
  if (s?.instagramUrl && s.instagramHandle) {
    contactLines.push(
      <a
        href={s.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="transition-colors hover:text-turquoise"
      >
        {s.instagramHandle}
      </a>,
    );
  }

  return (
    <footer className="bg-navy text-white">
      <div className="container-page grid gap-14 py-20 md:py-24 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white p-3">
            <img
              src="/favicon.png"
              alt={t.nav.logoAlt}
              width={56}
              height={56}
              className="h-14 w-14"
              loading="lazy"
            />
            <span className="pe-2 font-display text-sm font-bold uppercase tracking-tight text-navy">
              {agencyName}
            </span>
          </div>
          <p className="mt-6 max-w-sm font-display text-2xl font-semibold leading-snug">
            {t.footer.tagline}
          </p>
          {visibleSocials.length || whatsappHref ? (
            <div className="mt-7 flex flex-wrap gap-3" aria-label={t.footer.followUs}>
              {visibleSocials.map((x) => (
                <a
                  key={x.label}
                  href={x.href ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={x.label}
                  className={socialClass}
                >
                  {x.icon}
                </a>
              ))}
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.common.whatsapp}
                  className={socialClass}
                >
                  <WhatsAppIcon />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav aria-label={t.nav.footerLabel}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            {t.footer.navTitle}
          </h2>
          <ul className="mt-6 space-y-3.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <LocalizedLink
                  to={item.to}
                  className="text-white/80 transition-colors hover:text-turquoise"
                >
                  {item.label}
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </nav>

        {contactLines.length ? (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              {t.footer.contactTitle}
            </h2>
            <ul className="mt-6 space-y-3.5 text-white/80">
              {contactLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-7 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>{interpolate(t.footer.rights, { name: agencyName })}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((l) => (
              <li key={l.to}>
                <LocalizedLink to={l.to} className="transition-colors hover:text-white">
                  {l.label}
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
