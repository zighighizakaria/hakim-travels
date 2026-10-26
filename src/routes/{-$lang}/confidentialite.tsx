import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/site/LegalDocument";
import { useSettings, useWhatsApp } from "@/components/site/useSite";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";
import { useT } from "@/i18n/useI18n";

export const Route = createFileRoute("/{-$lang}/confidentialite")({
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.privacy;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/confidentialite",
      title,
      description,
      noindex: true,
    });
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const t = useT();
  const s = useSettings();
  const wa = useWhatsApp();
  const page = t.privacyPage;

  // Coordonnées issues des réglages : seules celles qui existent sont affichées.
  const whatsappHref = wa.general();
  const contacts: { key: string; node: ReactNode }[] = [];
  if (s?.email) {
    contacts.push({
      key: "email",
      node: (
        <a href={`mailto:${s.email}`} dir="ltr" className="text-primary hover:underline">
          {s.email}
        </a>
      ),
    });
  }
  if (s?.phoneDisplay) {
    contacts.push({
      key: "phone",
      node: s.phoneE164 ? (
        <a href={`tel:${s.phoneE164}`} dir="ltr" className="text-primary hover:underline">
          {s.phoneDisplay}
        </a>
      ) : (
        <span dir="ltr">{s.phoneDisplay}</span>
      ),
    });
  }
  if (whatsappHref) {
    contacts.push({
      key: "whatsapp",
      node: (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {t.common.whatsapp}
        </a>
      ),
    });
  }
  if (s?.address) contacts.push({ key: "address", node: <span>{s.address}</span> });

  return (
    <LegalDocument
      eyebrow={page.eyebrow}
      title={page.title}
      subtitle={page.subtitle}
      sections={page.sections}
    >
      {contacts.length ? (
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">{page.contactTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{page.contactIntro}</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            {contacts.map((c) => (
              <li key={c.key}>{c.node}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </LegalDocument>
  );
}
