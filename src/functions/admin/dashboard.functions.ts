import { createServerFn } from "@tanstack/react-start";
import type { AdminDashboard, DemoCounts } from "@/lib/types";
import { today } from "@/server/db/sql";
import { adminDashboard } from "@/server/repositories/departures.repo";
import { countDemoData, deleteDemoData } from "@/server/seed/run-seed";
import { adminMiddleware } from "../middleware";

export const adminDashboardFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<AdminDashboard> => adminDashboard(today(), countDemoData()));

/** « Supprimer les données démo » : voyages, départs, destinations et images marqués démo. */
export const adminDeleteDemoDataFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<DemoCounts> => deleteDemoData());
