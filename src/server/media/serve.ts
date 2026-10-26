import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import { Readable } from "node:stream";
import { getEnv } from "../env";
import { MIME_BY_EXT, resolveUploadPath } from "./storage";

const SECURITY_HEADERS = { "X-Content-Type-Options": "nosniff" } as const;

function text(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", ...SECURITY_HEADERS },
  });
}

/**
 * GET /uploads/* : lit un fichier de UPLOADS_DIR en streaming.
 * `splat` est le segment générique de la route ; `root` est surchargeable pour les tests.
 */
export async function serveUpload(
  splat: string | undefined,
  request: Request,
  root: string = getEnv().uploadsDir,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") return text(405, "Method Not Allowed");

  let relative = splat ?? "";
  try {
    relative = decodeURIComponent(relative);
  } catch {
    return text(400, "Bad Request");
  }

  // Anti-traversée : « .. », NUL, chemins absolus ; le chemin résolu doit rester sous root.
  const target = resolveUploadPath(root, relative);
  if (!target) return text(400, "Bad Request");

  const ext = relative.slice(relative.lastIndexOf(".") + 1).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) return text(404, "Not Found");

  let stat;
  try {
    stat = await fs.stat(target);
  } catch {
    return text(404, "Not Found");
  }
  if (!stat.isFile()) return text(404, "Not Found");

  const etag = `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
  const headers = new Headers({
    "Content-Type": mime,
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: etag,
    ...SECURITY_HEADERS,
  });

  const ifNoneMatch = request.headers.get("If-None-Match");
  if (ifNoneMatch && ifNoneMatch.split(",").some((v) => v.trim() === etag || v.trim() === "*")) {
    return new Response(null, { status: 304, headers });
  }

  headers.set("Content-Length", String(stat.size));
  if (request.method === "HEAD") return new Response(null, { status: 200, headers });

  const stream = Readable.toWeb(createReadStream(target)) as unknown as ReadableStream<Uint8Array>;
  return new Response(stream, { status: 200, headers });
}
