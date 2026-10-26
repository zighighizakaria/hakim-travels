import { createServerFn } from "@tanstack/react-start";
import { idInputSchema, reviewInputSchema, withOptionalId } from "@/lib/schemas";
import type { AdminReview } from "@/lib/types";
import { adminListReviews, deleteReview, saveReview } from "@/server/repositories/reviews.repo";
import { adminMiddleware } from "../middleware";

export const adminListReviewsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<AdminReview[]> => adminListReviews());

export const adminSaveReviewFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(withOptionalId(reviewInputSchema))
  .handler(async ({ data }): Promise<{ id: number }> => ({ id: saveReview(data.data, data.id) }));

export const adminDeleteReviewFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(idInputSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    deleteReview(data.id);
    return { ok: true };
  });
