import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/site/LegalDocument";
import { useSettings } from "@/components/site/useSite";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";
import { useT } from "@/i18n/useI18n";

export const Route = createFileRoute("/{-$lang}/mentions-legales")({
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.legal;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/mentions-legales",
      title,
      description,
      noindex: true,
    });
  },
  component: LegalPage,
});

function LegalPage() {
  const t = useT();
  const s = useSettings();
  const page = t.legalPage;
  const labels = t.legalLabels;

  // Seuls les champs renseignés dans les réglages sont affichés.
  const rows = [
    { label: labels.company, value: s?.legalCompanyName ?? s?.agencyName },
    { label: labels.ice, value: s?.legalIce },
    { label: labels.rc, value: s?.legalRc },
    { label: labels.license, value: s?.legalLicenseNumber },
    { label: labels.address, value: s?.address },
    { label: labels.phone, value: s?.phoneDisplay, ltr: true },
    { label: labels.email, value: s?.email, ltr: true },
  ].filter((r): r is { label: string; value: string; ltr?: boolean } => Boolean(r.value));

  return (
    <LegalDocument
      eyebrow={page.eyebrow}
      title={page.title}
      subtitle={page.subtitle}
      sections={page.sections}
      intro={
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">{page.publisherTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{page.publisherIntro}</p>
          {rows.length ? (
            <dl className="mt-5 border-t border-border">
              {rows.map((r) => (
                <div
                  key={r.label}
                  className="grid gap-1 border-b border-border py-3 sm:grid-cols-[220px_1fr] sm:gap-6"
                >
                  <dt className="font-semibold text-navy">{r.label}</dt>
                  <dd className="text-muted-foreground" dir={r.ltr ? "ltr" : undefined}>
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      }
    />
  );
}
