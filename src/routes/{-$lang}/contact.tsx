import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { useSettings, useWhatsApp } from "@/components/site/useSite";
import { WhatsAppButton, WhatsAppIcon } from "@/components/site/WhatsAppButton";
import { btn } from "@/components/site/ui";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";
import { useT } from "@/i18n/useI18n";

export const Route = createFileRoute("/{-$lang}/contact")({
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.contact;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/contact",
      title,
      description,
    });
  },
  component: ContactPage,
});

type Method = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  href: string | null;
  external?: boolean;
};

function ContactPage() {
  const t = useT();
  const s = useSettings();
  const wa = useWhatsApp();
  const page = t.contactPage;

  const whatsappHref = wa.general();
  const methods: Method[] = [];
  if (whatsappHref && s?.phoneDisplay) {
    methods.push({
      icon: <WhatsAppIcon className="h-5 w-5" />,
      label: page.whatsapp,
      value: <span dir="ltr">{s.phoneDisplay}</span>,
      href: whatsappHref,
      external: true,
    });
  }
  if (s?.phoneDisplay) {
    methods.push({
      icon: <Phone className="h-5 w-5" />,
      label: page.phone,
      value: <span dir="ltr">{s.phoneDisplay}</span>,
      href: s.phoneE164 ? `tel:${s.phoneE164}` : null,
    });
  }
  if (s?.email) {
    methods.push({
      icon: <Mail className="h-5 w-5" />,
      label: page.email,
      value: s.email,
      href: `mailto:${s.email}`,
    });
  }
  if (s?.address) {
    methods.push({
      icon: <MapPin className="h-5 w-5" />,
      label: page.address,
      value: s.address,
      href: s.mapsUrl,
      external: true,
    });
  }
  if (s?.openingHours) {
    methods.push({
      icon: <Clock className="h-5 w-5" />,
      label: page.hours,
      value: s.openingHours,
      href: null,
    });
  }

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} />

      <section className="section-y bg-background">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {methods.length ? (
            <Reveal>
              <ul className="space-y-4">
                {methods.map((m) => {
                  const inner = (
                    <span className="card-surface flex items-start gap-4 p-5 transition-colors duration-200 hover:border-primary/40">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist text-primary">
                        {m.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-turquoise">
                          {m.label}
                        </span>
                        <span className="mt-1 block break-words text-navy">{m.value}</span>
                      </span>
                    </span>
                  );
                  return (
                    <li key={m.label}>
                      {m.href ? (
                        <a
                          href={m.href}
                          target={m.external ? "_blank" : undefined}
                          rel={m.external ? "noopener noreferrer" : undefined}
                          className="block"
                        >
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ) : null}

          <Reveal delay={120}>
            <div className="card-surface flex flex-col items-start gap-4 p-6 md:p-10">
              <p className="max-w-md leading-relaxed text-muted-foreground">{page.askText}</p>
              <WhatsAppButton href={whatsappHref} className={btn.whatsapp}>
                {t.common.writeOnWhatsapp}
              </WhatsAppButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
