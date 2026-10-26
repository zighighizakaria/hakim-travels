/**
 * SEO : balises <head> (title, description, Open Graph, Twitter, canonical, hreflang, robots)
 * et données structurées JSON-LD. Fichier partagé client/serveur : n'importe jamais src/server.
 * `siteUrl` vient toujours des données du loader racine (getSiteConfig), jamais de process.env.
 */
import { localizePath } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { formatDateRange } from "./format";
import type { Lang, PublicSettings, SiteConfig, TripDetail } from "./types";

/** Image de partage par défaut (dans `public/`). */
export const DEFAULT_OG_IMAGE = "/og-default.jpg";

const OG_LOCALE: Record<Lang, string> = { fr: "fr_MA", ar: "ar_MA" };

export type JsonLd = Record<string, unknown>;

export type BuildSeoInput = {
  /** Origine du site, sans slash final (SiteConfig.siteUrl). */
  siteUrl: string;
  lang: Lang;
  /** Chemin sans préfixe de langue, sans query : `/`, `/voyages/mon-voyage`... */
  path: string;
  /** Titre de la page (sans le nom du site) ; null = titre par défaut du site. */
  title: string | null;
  description: string;
  /** URL de l'image de partage, relative ou absolue ; défaut : `/og-default.jpg`. */
  image?: string | null | undefined;
  type?: "website" | "article" | undefined;
  noindex?: boolean | undefined;
  jsonLd?: JsonLd | JsonLd[] | undefined;
};

export type SeoHead = {
  meta: Array<
    { title: string } | { name: string; content: string } | { property: string; content: string }
  >;
  links: Array<{ rel: string; href: string; hrefLang?: string }>;
  scripts: Array<{ type: string; children: string }>;
};

/** Rend une URL absolue à partir de l'origine du site. */
export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** URL absolue d'une page dans une langue donnée (`/ar/...` pour l'arabe, sans préfixe pour le français). */
export function pageUrl(siteUrl: string, path: string, lang: Lang): string {
  return `${siteUrl}${localizePath(path, lang)}`;
}

/** JSON sûr à l'intérieur d'un <script> : aucun `<`, `>`, `&` ni séparateur de ligne brut. */
export function jsonLdString(data: JsonLd): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function buildSeo(input: BuildSeoInput): SeoHead {
  const { siteUrl, lang, path, description } = input;
  const dict = getDict(lang);
  const fullTitle = input.title ? `${input.title} | ${dict.meta.siteName}` : dict.meta.defaultTitle;
  const canonical = pageUrl(siteUrl, path, lang);
  const image = absoluteUrl(siteUrl, input.image || DEFAULT_OG_IMAGE);
  const other: Lang = lang === "fr" ? "ar" : "fr";

  const meta: SeoHead["meta"] = [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: image },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:locale", content: OG_LOCALE[lang] },
    { property: "og:locale:alternate", content: OG_LOCALE[other] },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
  if (input.noindex) meta.push({ name: "robots", content: "noindex" });

  const links: SeoHead["links"] = [
    { rel: "canonical", href: canonical },
    { rel: "alternate", hrefLang: "fr", href: pageUrl(siteUrl, path, "fr") },
    { rel: "alternate", hrefLang: "ar", href: pageUrl(siteUrl, path, "ar") },
    { rel: "alternate", hrefLang: "x-default", href: pageUrl(siteUrl, path, "fr") },
  ];

  const lds =
    input.jsonLd === undefined ? [] : Array.isArray(input.jsonLd) ? input.jsonLd : [input.jsonLd];
  const scripts: SeoHead["scripts"] = lds.map((ld) => ({
    type: "application/ld+json",
    children: jsonLdString({ "@context": "https://schema.org", ...ld }),
  }));

  return { meta, links, scripts };
}

/* -------------------------------------------------------------------------- */
/* Lecture des réglages dans un head() (loader racine)                         */
/* -------------------------------------------------------------------------- */

type MatchLike = { routeId: string; loaderData?: unknown };

function siteConfigFrom(matches: ReadonlyArray<MatchLike>): SiteConfig | undefined {
  const root = matches.find((m) => m.routeId === "__root__");
  return root?.loaderData as SiteConfig | undefined;
}

/** `siteUrl` et image de partage des réglages, à répartir dans `buildSeo`. */
export function siteSeoBase(
  matches: ReadonlyArray<MatchLike>,
  lang: Lang,
): { siteUrl: string; image: string | null } {
  const config = siteConfigFrom(matches);
  return {
    siteUrl: config?.siteUrl ?? "",
    image: config?.settings[lang].ogImage?.url ?? null,
  };
}

/** Réglages publics de la langue courante (null si le loader racine n'a rien renvoyé). */
export function siteSettings(matches: ReadonlyArray<MatchLike>, lang: Lang): PublicSettings | null {
  return siteConfigFrom(matches)?.settings[lang] ?? null;
}

/* -------------------------------------------------------------------------- */
/* JSON-LD                                                                     */
/* -------------------------------------------------------------------------- */

function compact(obj: JsonLd): JsonLd {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  );
}

/** Agence de voyage (page d'accueil). */
export function travelAgencyLd(siteUrl: string, lang: Lang, settings: PublicSettings): JsonLd {
  const sameAs = [
    settings.instagramUrl,
    settings.facebookUrl,
    settings.tiktokUrl,
    settings.youtubeUrl,
  ].filter((u): u is string => Boolean(u));
  return compact({
    "@type": "TravelAgency",
    name: settings.agencyName || getDict(lang).meta.siteName,
    url: pageUrl(siteUrl, "/", lang),
    logo: absoluteUrl(siteUrl, "/favicon.png"),
    image: absoluteUrl(siteUrl, settings.ogImage?.url ?? DEFAULT_OG_IMAGE),
    description: getDict(lang).meta.defaultDescription,
    telephone: settings.phoneE164 ?? settings.phoneDisplay,
    email: settings.email,
    address: settings.address
      ? { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "MA" }
      : null,
    sameAs: sameAs.length ? sameAs : null,
  });
}

export type Crumb = { name: string; path: string };

/** Fil d'Ariane : la première étape est l'accueil. */
export function breadcrumbLd(siteUrl: string, lang: Lang, crumbs: Crumb[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: pageUrl(siteUrl, c.path, lang),
    })),
  };
}

/** Voyage (TouristTrip) avec une offre par départ visible. */
export function touristTripLd(
  siteUrl: string,
  lang: Lang,
  trip: TripDetail,
  settings: PublicSettings | null,
): JsonLd {
  const url = pageUrl(siteUrl, `/voyages/${trip.slug}`, lang);
  const offers = trip.departures.map((d) =>
    compact({
      "@type": "Offer",
      name: `${d.departureCity} - ${formatDateRange(d.startDate, d.endDate, lang)}`,
      url,
      price: d.priceMad,
      priceCurrency: "MAD",
      availability:
        d.status === "full" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      validFrom: d.startDate,
    }),
  );
  return compact({
    "@type": "TouristTrip",
    name: trip.title,
    description: trip.seoDescription ?? trip.teaser,
    url,
    image: trip.cover ? absoluteUrl(siteUrl, trip.cover.url) : null,
    provider: {
      "@type": "TravelAgency",
      name: settings?.agencyName || getDict(lang).meta.siteName,
      url: pageUrl(siteUrl, "/", lang),
    },
    offers: offers.length ? offers : null,
  });
}
