import { Outlet, createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { LocalizedLink } from "@/components/site/LocalizedLink";
import { btn } from "@/components/site/ui";
import { parseLang, stripLangPrefix } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { useT } from "@/i18n/useI18n";

const ARABIC_FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@500;600;700&family=Tajawal:wght@400;500;700&display=swap";

/**
 * Layout des pages publiques. Le segment optionnel `{-$lang}` vaut :
 * - absent : français ;
 * - `ar` : arabe ;
 * - `fr` : redirection 301 vers la même page sans préfixe ;
 * - autre : 404.
 */
export const Route = createFileRoute("/{-$lang}")({
  beforeLoad: ({ params, location }) => {
    const lang = params.lang as string | undefined;
    if (lang === undefined || lang === "ar") return;
    if (lang === "fr") {
      const path = stripLangPrefix(location.pathname).replace(/^\/+/, "/");
      const hash = location.hash ? `#${location.hash.replace(/^#/, "")}` : "";
      throw redirect({ href: `${path}${location.searchStr}${hash}`, statusCode: 301 });
    }
    throw notFound();
  },
  head: ({ params }) => {
    const lang = parseLang(params.lang as string | undefined);
    const t = getDict(lang);
    return {
      // Valeurs par défaut (page introuvable, erreurs) : chaque page les remplace via buildSeo.
      meta: [
        { title: t.meta.defaultTitle },
        { name: "description", content: t.meta.defaultDescription },
      ],
      // Polices arabes : chargées uniquement sur les pages en arabe.
      links:
        lang === "ar"
          ? [
              { rel: "preconnect", href: "https://fonts.googleapis.com" },
              {
                rel: "preconnect",
                href: "https://fonts.gstatic.com",
                crossOrigin: "anonymous" as const,
              },
              { rel: "stylesheet", href: ARABIC_FONTS },
            ]
          : [],
    };
  },
  component: PublicLayout,
  notFoundComponent: PublicNotFound,
});

function PublicLayout() {
  return (
    <PageShell>
      <Outlet />
    </PageShell>
  );
}

function PublicNotFound() {
  const t = useT();
  return (
    <div className="container-page flex min-h-[70svh] flex-col items-center justify-center gap-5 pt-24 text-center">
      <p className="font-display text-7xl font-bold text-navy">404</p>
      <h1 className="display-section text-navy">{t.notFound.title}</h1>
      <p className="max-w-md text-muted-foreground">{t.notFound.text}</p>
      <LocalizedLink to="/{-$lang}" className={btn.primary}>
        {t.notFound.home}
      </LocalizedLink>
    </div>
  );
}
