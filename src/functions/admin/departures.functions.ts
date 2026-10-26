import { createServerFn } from "@tanstack/react-start";
import {
  departureArchiveSchema,
  departureInputSchema,
  departureListQuerySchema,
  departureQuickUpdateSchema,
  idInputSchema,
  withOptionalId,
} from "@/lib/schemas";
import type { AdminDeparture } from "@/lib/types";
import { today } from "@/server/db/sql";
import {
  adminListDepartures,
  archivePastDepartures,
  deleteDeparture,
  quickUpdateDeparture,
  saveDeparture,
  setDepartureArchived,
} from "@/server/repositories/departures.repo";
import { adminMiddleware } from "../middleware";

export const adminListDeparturesFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator(departureListQuerySchema)
  .handler(async ({ data }): Promise<AdminDeparture[]> => adminListDepartures(data, today()));

export const adminSaveDepartureFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(withOptionalId(departureInputSchema))
  .handler(async ({ data }): Promise<{ id: number }> => ({
    id: saveDeparture(data.data, data.id),
  }));

export const adminQuickUpdateDepartureFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(departureQuickUpdateSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    quickUpdateDeparture(data.id, { seatsLeft: data.seatsLeft, status: data.status });
    return { ok: true };
  });

export const adminArchiveDepartureFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(departureArchiveSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    setDepartureArchived(data.id, data.archived);
    return { ok: true };
  });

export const adminArchivePastDeparturesFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<{ archived: number }> => ({
    archived: archivePastDepartures(today()),
  }));

export const adminDeleteDepartureFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(idInputSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    deleteDeparture(data.id);
    return { ok: true };
  });
