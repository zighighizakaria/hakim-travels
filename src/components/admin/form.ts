import { useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

/**
 * Aides communes aux formulaires du back-office : validation zod en français,
 * messages d'erreur serveur lisibles, exécution d'une mutation (toast + rechargement des données).
 */

export type FieldErrors = Record<string, string>;

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

/** Messages zod par défaut traduits. Les messages explicites des schémas restent prioritaires. */
const frErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined" || issue.received === "null") {
        return { message: "Champ obligatoire." };
      }
      if (issue.expected === "integer") return { message: "Entrez un nombre entier." };
      if (issue.expected === "number") return { message: "Entrez un nombre." };
      return { message: "Valeur invalide." };
    case "too_small":
      if (issue.type === "string") {
        return {
          message:
            issue.minimum <= 1
              ? "Champ obligatoire."
              : `Au moins ${String(issue.minimum)} caractères.`,
        };
      }
      if (issue.type === "number") {
        return { message: `La valeur doit être supérieure ou égale à ${String(issue.minimum)}.` };
      }
      return { message: "Valeur trop petite." };
    case "too_big":
      if (issue.type === "string") {
        return { message: `Trop long : ${String(issue.maximum)} caractères maximum.` };
      }
      if (issue.type === "number") {
        return { message: `La valeur doit être inférieure ou égale à ${String(issue.maximum)}.` };
      }
      if (issue.type === "array") {
        return { message: `Trop d'éléments : ${String(issue.maximum)} maximum.` };
      }
      return { message: "Valeur trop grande." };
    case "invalid_enum_value":
      return { message: "Choisissez une valeur dans la liste." };
    case "invalid_string":
      return { message: "Format invalide." };
    default:
      return { message: ctx.defaultError };
  }
};

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

/** Valide `input` avec un schéma zod ; les erreurs sont indexées par chemin (`days.0.titleFr`). */
export function validate<S extends z.ZodTypeAny>(
  schema: S,
  input: unknown,
): ValidationResult<z.output<S>> {
  const result = schema.safeParse(input, { errorMap: frErrorMap });
  if (result.success) return { ok: true, data: result.data as z.output<S> };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_";
    if (!(key in errors)) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

/** Vrai si une erreur concerne la clé `prefix` ou un de ses sous-champs. */
export function hasErrorUnder(errors: FieldErrors, prefixes: string[]): boolean {
  return Object.keys(errors).some((key) =>
    prefixes.some((prefix) => key === prefix || key.startsWith(`${prefix}.`)),
  );
}

/* -------------------------------------------------------------------------- */
/* Conversions de saisie                                                       */
/* -------------------------------------------------------------------------- */

/** Champ numérique : vide devient `null`, sinon le nombre (NaN si illisible : zod le signalera). */
export function numOrNull(value: string): number | null {
  const v = value.trim();
  if (v === "") return null;
  return Number(v.replace(",", "."));
}

export function numToStr(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

/** Identifiant d'URL à partir d'un titre : sans accents, minuscules, tirets. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Déplace un élément d'une liste (monter/descendre). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  if (item === undefined) return list;
  next.splice(to, 0, item);
  return next;
}

/* -------------------------------------------------------------------------- */
/* Erreurs serveur                                                             */
/* -------------------------------------------------------------------------- */

function statusOf(error: unknown): number | null {
  if (error && typeof error === "object") {
    const e = error as { status?: unknown; statusCode?: unknown };
    if (typeof e.status === "number") return e.status;
    if (typeof e.statusCode === "number") return e.statusCode;
  }
  return null;
}

export function isUnauthorized(error: unknown): boolean {
  return statusOf(error) === 401;
}

/** Message lisible (français) pour une erreur renvoyée par une server function. */
export function errorMessage(error: unknown): string {
  if (isUnauthorized(error)) return "Votre session a expiré. Reconnectez-vous.";
  const status = statusOf(error);
  if (status === 403) return "Action refusée (origine non autorisée).";
  if (error instanceof Error && error.message) {
    const text = error.message.trim();
    if (text.startsWith("[")) {
      try {
        const issues = JSON.parse(text) as { message?: unknown }[];
        const messages = issues.map((i) => (typeof i.message === "string" ? i.message : null));
        const found = messages.filter((m): m is string => m !== null);
        if (found.length) return found.join(" ");
      } catch {
        /* message ordinaire */
      }
    }
    if (!/^(failed to fetch|networkerror|load failed)/i.test(text)) return text;
    return "Connexion impossible. Vérifiez votre réseau puis réessayez.";
  }
  return "Une erreur est survenue. Réessayez dans un instant.";
}

/* -------------------------------------------------------------------------- */
/* Exécution d'une action                                                      */
/* -------------------------------------------------------------------------- */

type RunOptions<T> = {
  /** Message de succès (toast). */
  success?: string | ((result: T) => string);
  /** Recharge les données de la page après succès (par défaut : oui). */
  invalidate?: boolean;
};

/**
 * Exécute une mutation : état « en cours », toast de succès ou d'erreur, rechargement des loaders.
 * Renvoie le résultat, ou `undefined` en cas d'échec (l'erreur est déjà affichée).
 */
export function useAdminAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async <T>(fn: () => Promise<T>, options: RunOptions<T> = {}): Promise<T | undefined> => {
      setPending(true);
      try {
        const result = await fn();
        if (options.success) {
          toast.success(
            typeof options.success === "function" ? options.success(result) : options.success,
          );
        }
        if (options.invalidate !== false) await router.invalidate();
        return result;
      } catch (error) {
        if (isUnauthorized(error)) {
          toast.error(errorMessage(error));
          await router.navigate({
            to: "/admin/connexion",
            search: { redirect: window.location.pathname + window.location.search },
          });
          return undefined;
        }
        toast.error(errorMessage(error));
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [router],
  );

  return { run, pending };
}
