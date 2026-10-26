import { createServerFn } from "@tanstack/react-start";
import { settingsInputSchema } from "@/lib/schemas";
import type { AdminSettings } from "@/lib/types";
import { adminGetSettings, saveSettings } from "@/server/repositories/settings.repo";
import { adminMiddleware } from "../middleware";

export const adminGetSettingsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<AdminSettings> => adminGetSettings());

export const adminSaveSettingsFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(settingsInputSchema)
  .handler(async ({ data }): Promise<AdminSettings> => {
    saveSettings(data);
    return adminGetSettings();
  });
