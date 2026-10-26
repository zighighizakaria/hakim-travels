import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { idInputSchema, tripInputSchema, withOptionalId } from "@/lib/schemas";
import type { AdminTrip, AdminTripListItem } from "@/lib/types";
import {
  adminGetTrip,
  adminListTrips,
  deleteTrip,
  duplicateTrip,
  saveTrip,
} from "@/server/repositories/trips.repo";
import { adminMiddleware } from "../middleware";

const listFilter = z.object({
  destinationId: z.number().int().positive().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const adminListTripsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator(listFilter)
  .handler(async ({ data }): Promise<AdminTripListItem[]> => adminListTrips(data));

export const adminGetTripFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator(idInputSchema)
  .handler(async ({ data }): Promise<AdminTrip> => {
    const trip = adminGetTrip(data.id);
    if (!trip) throw notFound();
    return trip;
  });

export const adminSaveTripFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(withOptionalId(tripInputSchema))
  .handler(async ({ data }): Promise<{ id: number }> => ({ id: saveTrip(data.data, data.id) }));

export const adminDuplicateTripFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(idInputSchema)
  .handler(async ({ data }): Promise<{ id: number }> => ({ id: duplicateTrip(data.id) }));

export const adminDeleteTripFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(idInputSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    deleteTrip(data.id);
    return { ok: true };
  });
