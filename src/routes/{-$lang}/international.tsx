import { createFileRoute } from "@tanstack/react-router";
import { UniversePage } from "@/components/site/UniversePage";
import { getUniversePage } from "@/functions/public.functions";
import { parseLang } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { buildSeo, siteSeoBase } from "@/lib/seo";

export const Route = createFileRoute("/{-$lang}/international")({
  loader: ({ params }) =>
    getUniversePage({
      data: { lang: parseLang(params.lang as string | undefined), universe: "international" },
    }),
  head: ({ params, matches }) => {
    const lang = parseLang(params.lang as string | undefined);
    const { title, description } = getDict(lang).meta.international;
    return buildSeo({
      ...siteSeoBase(matches, lang),
      lang,
      path: "/international",
      title,
      description,
    });
  },
  component: InternationalPage,
});

function InternationalPage() {
  return <UniversePage data={Route.useLoaderData()} />;
}
