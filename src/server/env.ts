import path from "node:path";
import { z } from "zod";

/**
 * Variables d'environnement, lues paresseusement (jamais à l'import) et validées avec zod.
 * Le serveur se lance depuis la racine du projet : les chemins relatifs sont résolus depuis process.cwd().
 */

const schema = z.object({
  SITE_URL: z
    .string({ required_error: "SITE_URL est obligatoire (ex. http://localhost:3000)." })
    .url("SITE_URL doit être une URL absolue (ex. https://www.exemple.ma).")
    .transform((v) => v.replace(/\/+$/, "")),
  DATABASE_PATH: z.string().min(1).default("./data/hakim.db"),
  UPLOADS_DIR: z.string().min(1).default("./data/uploads"),
  SESSION_SECRET: z
    .string({
      required_error: "SESSION_SECRET est obligatoire (au moins 32 caractères aléatoires).",
    })
    .min(32, "SESSION_SECRET doit contenir au moins 32 caractères.")
    .refine(
      (v) => !v.startsWith("<"),
      "SESSION_SECRET est encore la valeur d'exemple : générez un secret aléatoire.",
    ),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default("0.0.0.0"),
  TRUST_PROXY: z
    .enum(["0", "1"], { errorMap: () => ({ message: "TRUST_PROXY doit valoir 0 ou 1." }) })
    .default("0")
    .transform((v) => v === "1"),
  MAX_UPLOAD_MB: z.coerce.number().positive("MAX_UPLOAD_MB doit être positif.").max(100).default(8),
});

export type Env = {
  siteUrl: string;
  /** Chemin absolu, ou ":memory:". */
  databasePath: string;
  /** Chemin absolu. */
  uploadsDir: string;
  sessionSecret: string;
  port: number;
  host: string;
  trustProxy: boolean;
  maxUploadBytes: number;
};

let cached: Env | undefined;

export function resetEnvCache(): void {
  cached = undefined;
}

export function getEnv(): Env {
  if (cached) return cached;

  // Une variable vide équivaut à une variable absente.
  const raw: Record<string, string> = {};
  for (const key of Object.keys(schema.shape)) {
    const value = process.env[key];
    if (value !== undefined && value.trim() !== "") raw[key] = value.trim();
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "env"} : ${i.message}`);
    throw new Error(`Configuration invalide (voir .env.example) :\n${lines.join("\n")}`);
  }

  const v = parsed.data;
  cached = {
    siteUrl: v.SITE_URL,
    databasePath:
      v.DATABASE_PATH === ":memory:" ? ":memory:" : path.resolve(process.cwd(), v.DATABASE_PATH),
    uploadsDir: path.resolve(process.cwd(), v.UPLOADS_DIR),
    sessionSecret: v.SESSION_SECRET,
    port: v.PORT,
    host: v.HOST,
    trustProxy: v.TRUST_PROXY,
    maxUploadBytes: Math.round(v.MAX_UPLOAD_MB * 1024 * 1024),
  };
  return cached;
}

export function getSiteUrl(): string {
  return getEnv().siteUrl;
}
