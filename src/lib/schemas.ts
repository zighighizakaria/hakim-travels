import { z } from "zod";

/**
 * Schémas zod des entrées admin et publiques. Partagé client/serveur : n'importe jamais src/server.
 * Les chaînes vides deviennent `null` (colonnes facultatives).
 */

const req = (max = 200) => z.string().trim().min(1, "Champ obligatoire.").max(max);
const opt = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v): string | null => (v ? v : null));

const optInt = (min: number, max: number) =>
  z
    .number()
    .int()
    .min(min)
    .max(max)
    .nullish()
    .transform((v): number | null => v ?? null);

const id = z.number().int().positive();
const optId = id.nullish().transform((v): number | null => v ?? null);

export const langSchema = z.enum(["fr", "ar"]);
export const universeSchema = z.enum(["maroc", "international", "omra"]);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Champ obligatoire.")
  .max(80)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "Lettres minuscules, chiffres et tirets uniquement.");

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (AAAA-MM-JJ).")
  .refine((v) => {
    const d = new Date(`${v}T12:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Date invalide.");

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mois invalide (AAAA-MM).");

const httpUrl = (max = 500) =>
  opt(max).refine(
    (v) => v === null || /^https?:\/\//i.test(v),
    "L'adresse doit commencer par http:// ou https://.",
  );

const listMax = 80;
const sortOrder = z.number().int().min(-100000).max(100000).default(0);

/* -------------------------------------------------------------------------- */
/* Éléments répétables                                                         */
/* -------------------------------------------------------------------------- */

export const itemInputSchema = z.object({
  labelFr: opt(200),
  labelAr: opt(200),
  textFr: req(2000),
  textAr: opt(2000),
});

export const simpleItemInputSchema = z.object({
  textFr: req(2000),
  textAr: opt(2000),
});

export const faqInputSchema = z.object({
  questionFr: req(500),
  questionAr: opt(500),
  answerFr: req(5000),
  answerAr: opt(5000),
});

export const dayInputSchema = z.object({
  labelFr: req(100),
  labelAr: opt(100),
  titleFr: req(300),
  titleAr: opt(300),
  bodyFr: z.string().trim().max(5000).default(""),
  bodyAr: opt(5000),
});

/* -------------------------------------------------------------------------- */
/* Destinations                                                                */
/* -------------------------------------------------------------------------- */

export const destinationInputSchema = z.object({
  universe: universeSchema,
  slug: slugSchema,
  nameFr: req(150),
  nameAr: opt(150),
  emoji: opt(16),
  taglineFr: opt(300),
  taglineAr: opt(300),
  teaserFr: opt(1000),
  teaserAr: opt(1000),
  introFr: opt(20000),
  introAr: opt(20000),
  coverImageId: optId,
  seoTitleFr: opt(200),
  seoTitleAr: opt(200),
  seoDescriptionFr: opt(400),
  seoDescriptionAr: opt(400),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder,
  highlights: z.array(itemInputSchema).max(listMax).default([]),
  practical: z.array(itemInputSchema).max(listMax).default([]),
  faqs: z.array(faqInputSchema).max(listMax).default([]),
  imageIds: z.array(id).max(200).default([]),
});
export type DestinationInput = z.infer<typeof destinationInputSchema>;

/* -------------------------------------------------------------------------- */
/* Voyages                                                                     */
/* -------------------------------------------------------------------------- */

export const tripInputSchema = z.object({
  destinationId: id,
  slug: slugSchema,
  titleFr: req(200),
  titleAr: opt(200),
  teaserFr: z.string().trim().max(1000).default(""),
  teaserAr: opt(1000),
  presentationFr: z.string().trim().max(20000).default(""),
  presentationAr: opt(20000),
  durationDays: optInt(1, 365),
  durationNights: optInt(0, 365),
  priceFromMad: optInt(0, 100_000_000),
  priceNoteFr: opt(300),
  priceNoteAr: opt(300),
  coverImageId: optId,
  whatsappMessageFr: opt(1000),
  whatsappMessageAr: opt(1000),
  seoTitleFr: opt(200),
  seoTitleAr: opt(200),
  seoDescriptionFr: opt(400),
  seoDescriptionAr: opt(400),
  status: z.enum(["draft", "published"]).default("draft"),
  isFeatured: z.boolean().default(false),
  sortOrder,
  days: z.array(dayInputSchema).max(listMax).default([]),
  highlights: z.array(simpleItemInputSchema).max(listMax).default([]),
  included: z.array(simpleItemInputSchema).max(listMax).default([]),
  excluded: z.array(simpleItemInputSchema).max(listMax).default([]),
  faqs: z.array(faqInputSchema).max(listMax).default([]),
  imageIds: z.array(id).max(200).default([]),
});
export type TripInput = z.infer<typeof tripInputSchema>;

/* -------------------------------------------------------------------------- */
/* Départs                                                                     */
/* -------------------------------------------------------------------------- */

export const departureInputSchema = z
  .object({
    tripId: id,
    startDate: dateSchema,
    endDate: dateSchema,
    departureCityFr: req(150),
    departureCityAr: opt(150),
    meetingPointFr: opt(300),
    meetingPointAr: opt(300),
    priceMad: optInt(0, 100_000_000),
    childPriceMad: optInt(0, 100_000_000),
    seatsTotal: optInt(0, 100000),
    seatsLeft: optInt(0, 100000),
    status: z.enum(["open", "full", "cancelled"]).default("open"),
    noteFr: opt(1000),
    noteAr: opt(1000),
  })
  .superRefine((v, ctx) => {
    if (v.endDate < v.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "La date de fin doit suivre la date de début.",
      });
    }
    if (v.seatsTotal !== null && v.seatsLeft !== null && v.seatsLeft > v.seatsTotal) {
      ctx.addIssue({
        code: "custom",
        path: ["seatsLeft"],
        message: "Les places restantes dépassent le total.",
      });
    }
  });
export type DepartureInput = z.infer<typeof departureInputSchema>;

export const departureQuickUpdateSchema = z.object({
  id,
  seatsLeft: z.number().int().min(0).max(100000).optional(),
  status: z.enum(["open", "full", "cancelled"]).optional(),
});

export const departureListQuerySchema = z.object({
  view: z.enum(["upcoming", "past", "archived"]).default("upcoming"),
  tripId: id.optional(),
});

export const departureArchiveSchema = z.object({ id, archived: z.boolean() });

/* -------------------------------------------------------------------------- */
/* Avis                                                                        */
/* -------------------------------------------------------------------------- */

export const reviewInputSchema = z.object({
  authorName: req(150),
  authorCity: opt(150),
  tripId: optId,
  rating: optInt(1, 5),
  quoteFr: req(3000),
  quoteAr: opt(3000),
  travelLabel: opt(150),
  sourceUrl: httpUrl(),
  isPublished: z.boolean().default(false),
  sortOrder,
});
export type ReviewInput = z.infer<typeof reviewInputSchema>;

/* -------------------------------------------------------------------------- */
/* Réglages                                                                    */
/* -------------------------------------------------------------------------- */

export const settingsInputSchema = z.object({
  agencyName: req(150),
  phoneDisplay: opt(40),
  phoneE164: opt(20).refine(
    (v) => v === null || /^\+[0-9]{8,15}$/.test(v),
    "Format attendu : +212600000000.",
  ),
  whatsappNumber: opt(20).refine(
    (v) => v === null || /^[0-9]{8,15}$/.test(v),
    "Chiffres uniquement, avec l'indicatif (ex. 212600000000).",
  ),
  email: opt(200).refine(
    (v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Adresse e-mail invalide.",
  ),
  addressFr: opt(500),
  addressAr: opt(500),
  openingHoursFr: opt(500),
  openingHoursAr: opt(500),
  mapsUrl: httpUrl(),
  instagramUrl: httpUrl(),
  instagramHandle: opt(100),
  instagramFollowersLabel: opt(50),
  facebookUrl: httpUrl(),
  tiktokUrl: httpUrl(),
  youtubeUrl: httpUrl(),
  legalCompanyName: opt(200),
  legalIce: opt(50),
  legalRc: opt(50),
  legalLicenseNumber: opt(50),
  heroImageId: optId,
  ogImageId: optId,
});
export type SettingsInput = z.infer<typeof settingsInputSchema>;

export const imageAltInputSchema = z.object({
  id,
  altFr: opt(300),
  altAr: opt(300),
});
export type ImageAltInput = z.infer<typeof imageAltInputSchema>;

export const imageDeleteInputSchema = z.object({ id, force: z.boolean().default(false) });

/* -------------------------------------------------------------------------- */
/* Authentification                                                            */
/* -------------------------------------------------------------------------- */

export const loginInputSchema = z.object({
  email: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(500),
});

export const changePasswordInputSchema = z.object({
  currentPassword: z.string().min(1).max(500),
  newPassword: z.string().min(10, "Le mot de passe doit contenir au moins 10 caractères.").max(500),
});

/* -------------------------------------------------------------------------- */
/* Entrées publiques et identifiants                                           */
/* -------------------------------------------------------------------------- */

export const idInputSchema = z.object({ id });
/** Entrée d'enregistrement : `id` absent = création. */
export const withOptionalId = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ id: id.optional(), data });
export const langInputSchema = z.object({ lang: langSchema });
export const universePageInputSchema = z.object({ lang: langSchema, universe: universeSchema });
export const slugInputSchema = z.object({ lang: langSchema, slug: slugSchema });
export const tripsQuerySchema = z.object({
  lang: langSchema,
  universe: universeSchema.optional(),
  region: slugSchema.optional(),
});
export const departuresQuerySchema = z.object({
  lang: langSchema,
  universe: universeSchema.optional(),
  region: slugSchema.optional(),
  month: monthSchema.optional(),
});
