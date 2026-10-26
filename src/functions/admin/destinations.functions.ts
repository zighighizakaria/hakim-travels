import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { destinationInputSchema, idInputSchema, withOptionalId } from "@/lib/schemas";
import type { AdminDestination, AdminDestinationListItem } from "@/lib/types";
import {
  adminGetDestination,
  adminListDestinations,
  deleteDestination,
  saveDestination,
} from "@/server/repositories/destinations.repo";
import { adminMiddleware } from "../middleware";

export const adminListDestinationsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<AdminDestinationListItem[]> => adminListDestinations());

export const adminGetDestinationFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator(idInputSchema)
  .handler(async ({ data }): Promise<AdminDestination> => {
    const destination = adminGetDestination(data.id);
    if (!destination) throw notFound();
    return destination;
  });

export const adminSaveDestinationFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(withOptionalId(destinationInputSchema))
  .handler(async ({ data }): Promise<{ id: number }> => ({
    id: saveDestination(data.data, data.id),
  }));

/** Refus propre (has_trips) tant que des voyages sont rattachés à la destination. */
export const adminDeleteDestinationFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(idInputSchema)
  .handler(async ({ data }) => deleteDestination(data.id));
