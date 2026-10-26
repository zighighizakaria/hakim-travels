import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl } from "@/server/env";
import { listSitemapEntries } from "@/server/repositories/trips.repo";
import { buildSitemapXml } from "@/server/seo/sitemap";

/** Sitemap des pages publiques (FR et AR, avec hreflang) : voyages et destinations publiés uniquement. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemapXml(getSiteUrl(), listSitemapEntries()), {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
