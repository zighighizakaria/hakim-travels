import { pageUrl } from "@/lib/seo";
import type { Lang, SitemapEntry } from "@/lib/types";

/**
 * Pages publiques statiques indexables (sans préfixe de langue).
 * Les pages légales (noindex) et l'administration n'y figurent jamais.
 */
export const STATIC_SITEMAP_PATHS: readonly string[] = [
  "/",
  "/maroc",
  "/international",
  "/omra",
  "/voyages",
  "/destinations",
  "/departs",
  "/sur-mesure",
  "/contact",
  "/a-propos",
];

const LANGS: readonly Lang[] = ["fr", "ar"];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** « 2030-06-15 17:03:00 » (SQLite, UTC) -> « 2030-06-15 » (format W3C accepté par les moteurs). */
function lastmodOf(updatedAt: string | undefined): string | null {
  const match = updatedAt?.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

/**
 * Sitemap XML : une entrée par langue et par page, chacune avec ses liens `xhtml:link`
 * hreflang fr, ar et x-default (= fr). `entries` = voyages et destinations publiés (listSitemapEntries).
 */
export function buildSitemapXml(siteUrl: string, entries: readonly SitemapEntry[]): string {
  const latest = entries
    .map((e) => lastmodOf(e.updatedAt))
    .filter((d): d is string => d !== null)
    .sort()
    .at(-1);
  const pages: Array<{ path: string; lastmod: string | null }> = [
    ...STATIC_SITEMAP_PATHS.map((path) => ({ path, lastmod: latest ?? null })),
    ...entries.map((e) => ({ path: e.path, lastmod: lastmodOf(e.updatedAt) })),
  ];

  const urls = pages.flatMap(({ path, lastmod }) => {
    const alternates = [
      ...LANGS.map(
        (l) =>
          `    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeXml(pageUrl(siteUrl, path, l))}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(pageUrl(siteUrl, path, "fr"))}"/>`,
    ].join("\n");
    return LANGS.map((lang) =>
      [
        "  <url>",
        `    <loc>${escapeXml(pageUrl(siteUrl, path, lang))}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        alternates,
        "  </url>",
      ].join("\n"),
    );
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

/** robots.txt : tout est autorisé sauf l'administration ; le sitemap est indiqué en URL absolue. */
export function buildRobotsTxt(siteUrl: string): string {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}
