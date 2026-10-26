import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
// Les server routes ne sont pas couvertes : toute mutation passe par une server function.
// Repli sans Sec-Fetch-Site : l'Origin doit être celui de SITE_URL (lu dans la fonction, jamais au chargement).
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
  origin: (origin) => {
    const siteUrl = process.env["SITE_URL"];
    if (!siteUrl) return false;
    try {
      return origin === new URL(siteUrl).origin;
    } catch {
      return false;
    }
  },
});

// Le corps des server functions (upload compris) est lu AVANT l'adminMiddleware :
// on refuse ici les corps trop gros, pour qu'un POST anonyme ne puisse pas saturer la mémoire.
const bodySizeMiddleware = createMiddleware().server(async ({ next, request, handlerType }) => {
  if (handlerType !== "serverFn" || request.method !== "POST") return next();
  const maxMb = Number(process.env["MAX_UPLOAD_MB"] ?? 8) || 8;
  const limit = (maxMb + 1) * 1024 * 1024; // marge pour l'enveloppe multipart
  const length = request.headers.get("content-length");
  const isMultipart = (request.headers.get("content-type") ?? "").includes("multipart/form-data");
  if (length === null && isMultipart) return new Response("Length Required", { status: 411 });
  if (length !== null && Number(length) > limit) {
    return new Response("Payload Too Large", { status: 413 });
  }
  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, bodySizeMiddleware, csrfMiddleware],
}));
