import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { DomainError } from "../db/sql";
import { getEnv } from "../env";

export type ImageMime = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

export const EXT_BY_MIME: Record<ImageMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MIME_BY_EXT: Record<string, ImageMime> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

function ascii(buf: Uint8Array, start: number, end: number): string {
  let out = "";
  for (let i = start; i < end && i < buf.length; i++) out += String.fromCharCode(buf[i] ?? 0);
  return out;
}

/**
 * Détecte le type réel d'après les octets magiques (JPEG, PNG, WEBP, AVIF).
 * Le nom et le type MIME déclarés par le client ne comptent pas. SVG et le reste : null.
 */
export function sniffImageType(buf: Uint8Array): { mime: ImageMime; ext: string } | null {
  const result = (mime: ImageMime) => ({ mime, ext: EXT_BY_MIME[mime] });
  if (buf.length < 12) return null;

  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return result("image/jpeg");

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (pngSignature.every((b, i) => buf[i] === b)) return result("image/png");

  if (ascii(buf, 0, 4) === "RIFF" && ascii(buf, 8, 12) === "WEBP") return result("image/webp");

  if (ascii(buf, 4, 8) === "ftyp") {
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const boxSize = Math.min(view.getUint32(0), buf.length, 256);
    const isAvif = (brand: string) => brand === "avif" || brand === "avis";
    if (isAvif(ascii(buf, 8, 12))) return result("image/avif");
    // marques compatibles : après la version mineure (octets 12-16)
    for (let i = 16; i + 4 <= boxSize; i += 4) {
      if (isAvif(ascii(buf, i, i + 4))) return result("image/avif");
    }
  }
  return null;
}

/** Dimensions lues dans l'en-tête (JPEG, PNG, WEBP). null si introuvables (ex. AVIF). */
export function readImageSize(
  buf: Uint8Array,
  mime: ImageMime,
): { width: number; height: number } | null {
  try {
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    if (mime === "image/png") {
      return { width: view.getUint32(16), height: view.getUint32(20) };
    }
    if (mime === "image/jpeg") {
      let i = 2;
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xff) {
          i += 1;
          continue;
        }
        const marker = buf[i + 1] ?? 0;
        if (marker === 0xff) {
          i += 1;
          continue;
        }
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          i += 2;
          continue;
        }
        const length = view.getUint16(i + 2);
        const isFrame =
          marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isFrame) return { height: view.getUint16(i + 5), width: view.getUint16(i + 7) };
        i += 2 + length;
      }
      return null;
    }
    if (mime === "image/webp") {
      const chunk = ascii(buf, 12, 16);
      if (chunk === "VP8 ") {
        return {
          width: view.getUint16(26, true) & 0x3fff,
          height: view.getUint16(28, true) & 0x3fff,
        };
      }
      if (chunk === "VP8L") {
        const bits = view.getUint32(21, true);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunk === "VP8X") {
        const w = (buf[24] ?? 0) | ((buf[25] ?? 0) << 8) | ((buf[26] ?? 0) << 16);
        const h = (buf[27] ?? 0) | ((buf[28] ?? 0) << 8) | ((buf[29] ?? 0) << 16);
        return { width: w + 1, height: h + 1 };
      }
    }
  } catch {
    // en-tête tronqué : dimensions inconnues
  }
  return null;
}

/**
 * Chemin relatif fourni par l'extérieur -> chemin absolu sûr sous `root`, ou null.
 * Refuse « .. », les NUL, les chemins absolus, les antislashs et les lettres de lecteur Windows.
 */
export function resolveUploadPath(root: string, relative: string): string | null {
  if (!relative || relative.includes("\0") || relative.includes("\\")) return null;
  if (relative.startsWith("/") || /^[a-zA-Z]:/.test(relative)) return null;
  const segments = relative.split("/");
  if (segments.some((s) => s === "" || s === "." || s === "..")) return null;

  const base = path.resolve(root);
  const resolved = path.resolve(base, ...segments);
  if (!resolved.startsWith(base + path.sep)) return null;
  return resolved;
}

export type SavedUpload = {
  /** Relatif à UPLOADS_DIR, séparateur « / ». */
  path: string;
  mime: ImageMime;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  originalName: string | null;
};

export type UploadSource = { name: string; size: number; arrayBuffer(): Promise<ArrayBuffer> };

function cleanName(name: string): string | null {
  const base = name.split(/[\\/]/).pop() ?? "";
  const cleaned = base
    // eslint-disable-next-line no-control-regex -- suppression volontaire des caractères de contrôle
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 200);
  return cleaned || null;
}

/** Valide (taille, type réel) puis écrit dans UPLOADS_DIR/AAAA/MM/<uuid>.<ext>. */
export async function saveUpload(
  file: UploadSource,
  opts: { uploadsDir?: string; maxBytes?: number } = {},
): Promise<SavedUpload> {
  const maxBytes = opts.maxBytes ?? getEnv().maxUploadBytes;
  const root = opts.uploadsDir ?? getEnv().uploadsDir;

  if (file.size > maxBytes) {
    throw new DomainError(
      `Fichier trop volumineux (maximum ${Math.round(maxBytes / 1024 / 1024)} Mo).`,
      "too_large",
    );
  }
  const buffer = new Uint8Array(await file.arrayBuffer());
  if (buffer.byteLength === 0) throw new DomainError("Le fichier est vide.", "empty");
  if (buffer.byteLength > maxBytes) {
    throw new DomainError(
      `Fichier trop volumineux (maximum ${Math.round(maxBytes / 1024 / 1024)} Mo).`,
      "too_large",
    );
  }

  const type = sniffImageType(buffer);
  if (!type) {
    throw new DomainError(
      "Format non pris en charge : envoyez une image JPEG, PNG, WEBP ou AVIF.",
      "bad_type",
    );
  }

  const now = new Date();
  const relative = [
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${randomUUID()}.${type.ext}`,
  ].join("/");
  const target = resolveUploadPath(root, relative);
  if (!target) throw new Error("Chemin d'upload invalide.");

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer, { flag: "wx" });

  const size = readImageSize(buffer, type.mime);
  return {
    path: relative,
    mime: type.mime,
    sizeBytes: buffer.byteLength,
    width: size?.width ?? null,
    height: size?.height ?? null,
    originalName: cleanName(file.name),
  };
}

/** Efface le fichier (silencieux s'il n'existe plus ou si le chemin est invalide). */
export async function deleteUploadFile(relative: string, uploadsDir?: string): Promise<void> {
  const target = resolveUploadPath(uploadsDir ?? getEnv().uploadsDir, relative);
  if (!target) return;
  try {
    await fs.unlink(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
