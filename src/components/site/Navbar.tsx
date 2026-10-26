import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/useI18n";
import { cn } from "@/lib/utils";
import { LangSwitcher } from "./LangSwitcher";
import { LocalizedLink, type PublicPath } from "./LocalizedLink";
import { useSettings, useWhatsApp } from "./useSite";
import { WhatsAppIcon } from "./WhatsAppButton";
import { btn } from "./ui";

export function Navbar() {
  const t = useT();
  const settings = useSettings();
  const wa = useWhatsApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const items: { to: PublicPath; label: string }[] = [
    { to: "/{-$lang}", label: t.nav.home },
    { to: "/{-$lang}/maroc", label: t.nav.maroc },
    { to: "/{-$lang}/international", label: t.nav.international },
    { to: "/{-$lang}/omra", label: t.nav.omra },
    { to: "/{-$lang}/departs", label: t.nav.departures },
    { to: "/{-$lang}/sur-mesure", label: t.nav.custom },
    { to: "/{-$lang}/contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const agencyName = settings?.agencyName ?? t.meta.siteName;
  const whatsappHref = wa.general();

  return (
    <header
      className={cn(
        // Fond toujours présent : les hero sont tantôt clairs, tantôt foncés, le texte navy doit rester lisible.
        "fixed inset-x-0 top-0 z-50 border-b bg-background/85 backdrop-blur-xl transition-all duration-300",
        scrolled || open
          ? "border-border/70 shadow-[0_1px_20px_-12px_rgba(6,43,79,0.4)]"
          : "border-transparent",
      )}
    >
      <nav
        aria-label={t.nav.mainLabel}
        className="container-page flex h-[72px] items-center justify-between gap-4 md:h-20"
      >
        <LocalizedLink
          to="/{-$lang}"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={t.nav.homeLabel}
        >
          <img
            src="/favicon.png"
            alt={t.nav.logoAlt}
            width={48}
            height={48}
            className="h-11 w-11 md:h-12 md:w-12"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-[0.95rem] font-bold uppercase tracking-tight text-navy">
              {agencyName}
            </span>
            <span className="mt-1 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {t.meta.baseline}
            </span>
          </span>
        </LocalizedLink>

        <ul className="hidden items-center gap-0.5 xl:flex">
          {items.map((item) => (
            <li key={item.to}>
              <LocalizedLink
                to={item.to}
                exact={item.to === "/{-$lang}"}
                activeClassName="text-primary"
                className="whitespace-nowrap rounded-full px-2.5 py-2 text-[0.9rem] font-medium text-navy/80 transition-colors hover:text-primary"
              >
                {item.label}
              </LocalizedLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 xl:flex">
          <LangSwitcher />
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.common.whatsapp}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-[#128C4A] transition-colors hover:border-[#25D366]/50"
            >
              <WhatsAppIcon />
            </a>
          ) : null}
          <LocalizedLink to="/{-$lang}/sur-mesure" className={btn.small}>
            {t.nav.plan}
          </LocalizedLink>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <LangSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-navy"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="max-h-[calc(100svh-72px)] overflow-y-auto border-t border-border bg-background xl:hidden">
          <ul className="container-page flex flex-col py-4">
            {items.map((item) => (
              <li key={item.to}>
                <LocalizedLink
                  to={item.to}
                  exact={item.to === "/{-$lang}"}
                  activeClassName="text-primary"
                  onClick={() => setOpen(false)}
                  className="block border-b border-border/60 py-4 font-display text-xl font-semibold text-navy"
                >
                  {item.label}
                </LocalizedLink>
              </li>
            ))}
            <li className="pt-5">
              <LocalizedLink
                to="/{-$lang}/sur-mesure"
                onClick={() => setOpen(false)}
                className={cn(btn.primary, "w-full")}
              >
                {t.nav.plan}
              </LocalizedLink>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
