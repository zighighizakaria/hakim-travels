import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/site/LegalDocument";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";
import { useT } from "@/i18n/useI18n";

export const Route = createFileRoute("/{-$lang}/conditions-generales")({
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.terms;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/conditions-generales",
      title,
      description,
      noindex: true,
    });
  },
  component: TermsPage,
});

function TermsPage() {
  const page = useT().termsPage;
  return (
    <LegalDocument
      eyebrow={page.eyebrow}
      title={page.title}
      subtitle={page.subtitle}
      sections={page.sections}
    />
  );
}
