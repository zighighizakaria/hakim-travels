import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/server/db/client";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () => {
        const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
        try {
          getDb().prepare("SELECT 1").get();
          return new Response(JSON.stringify({ ok: true, db: true }), { status: 200, headers });
        } catch (error) {
          console.error("[health] base de données indisponible :", error);
          return new Response(JSON.stringify({ ok: false, db: false }), { status: 503, headers });
        }
      },
    },
  },
});
