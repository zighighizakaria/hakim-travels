import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl } from "@/server/env";
import { buildRobotsTxt } from "@/server/seo/sitemap";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildRobotsTxt(getSiteUrl()), {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
