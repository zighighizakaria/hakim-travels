import { createFileRoute } from "@tanstack/react-router";
import { serveUpload } from "@/server/media/serve";

/**
 * Sert les fichiers de UPLOADS_DIR (ajoutés à chaud, donc hors publicAssets de nitro).
 * Server route en GET uniquement : les mutations passent par des server functions.
 */
export const Route = createFileRoute("/uploads/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => serveUpload(params._splat, request),
    },
  },
});
