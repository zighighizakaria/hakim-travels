import { createServerFn } from "@tanstack/react-start";
import { idInputSchema, imageAltInputSchema, imageDeleteInputSchema } from "@/lib/schemas";
import type { AdminImage, ImageUsage } from "@/lib/types";
import { DomainError } from "@/server/db/sql";
import { deleteUploadFile, saveUpload } from "@/server/media/storage";
import {
  deleteImage,
  getImageById,
  imageUsage,
  insertImage,
  listImages,
  updateImageAlt,
} from "@/server/repositories/images.repo";
import { adminMiddleware } from "../middleware";

function formText(data: FormData, key: string): string | null {
  const value = data.get(key);
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 300) : null;
}

/**
 * Upload : POST (couvert par le CSRF des server functions), FormData { file, altFr?, altAr? }.
 * Taille et type réel (octets magiques) sont vérifiés côté serveur.
 */
export const adminUploadImageFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) throw new DomainError("Formulaire attendu.", "bad_request");
    return data;
  })
  .handler(async ({ data }): Promise<AdminImage> => {
    const file = data.get("file");
    if (!(file instanceof File)) throw new DomainError("Aucun fichier reçu.", "no_file");
    const saved = await saveUpload(file);
    try {
      return insertImage({
        path: saved.path,
        mime: saved.mime,
        sizeBytes: saved.sizeBytes,
        width: saved.width,
        height: saved.height,
        originalName: saved.originalName,
        altFr: formText(data, "altFr"),
        altAr: formText(data, "altAr"),
      });
    } catch (error) {
      await deleteUploadFile(saved.path);
      throw error;
    }
  });

export const adminListImagesFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<AdminImage[]> => listImages());

export const adminImageUsageFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator(idInputSchema)
  .handler(async ({ data }): Promise<ImageUsage> => imageUsage(data.id));

export const adminUpdateImageFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(imageAltInputSchema)
  .handler(async ({ data }): Promise<AdminImage> => {
    updateImageAlt(data.id, { altFr: data.altFr, altAr: data.altAr });
    const image = getImageById(data.id);
    if (!image) throw new DomainError("Image introuvable.", "not_found");
    return image;
  });

/** Refuse la suppression d'une image utilisée, sauf avec `force` (les références sont alors retirées). */
export const adminDeleteImageFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(imageDeleteInputSchema)
  .handler(
    async ({
      data,
    }): Promise<{ ok: true } | { ok: false; reason: "in_use"; usage: ImageUsage }> => {
      const usage = imageUsage(data.id);
      if (usage.total > 0 && !data.force) return { ok: false, reason: "in_use", usage };
      const path = deleteImage(data.id);
      if (path) await deleteUploadFile(path);
      return { ok: true };
    },
  );
