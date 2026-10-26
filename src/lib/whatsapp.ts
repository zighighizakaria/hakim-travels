/**
 * Liens et messages WhatsApp. Tout passe par WhatsApp : pas de formulaire.
 * Les modèles vivent dans les dictionnaires i18n et utilisent {trip}, {start}, {end}, {city}, {price}, {url}.
 */

export type MessageVars = {
  trip?: string | null | undefined;
  start?: string | null | undefined;
  end?: string | null | undefined;
  city?: string | null | undefined;
  price?: string | null | undefined;
  /** URL absolue de la fiche voyage. */
  url?: string | null | undefined;
};

const PLACEHOLDER = /\{(trip|start|end|city|price|url)\}/g;

/** Chiffres uniquement (indicatif inclus, sans « + »). */
export function normalizeWhatsappNumber(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

export function whatsappUrl(number: string | null | undefined, message?: string): string {
  const base = `https://wa.me/${normalizeWhatsappNumber(number) ?? ""}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function fillTemplate(template: string, vars: MessageVars): string {
  return template
    .replace(PLACEHOLDER, (_m, key: keyof MessageVars) => vars[key] ?? "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** `override` (message propre au voyage) remplace le modèle s'il est renseigné. */
export function buildTripMessage(args: {
  template: string;
  override?: string | null | undefined;
  trip: string;
  url?: string | null | undefined;
  price?: string | null | undefined;
}): string {
  const source = args.override && args.override.trim() ? args.override : args.template;
  return fillTemplate(source, { trip: args.trip, url: args.url, price: args.price });
}

export function buildDepartureMessage(args: {
  template: string;
  override?: string | null | undefined;
  trip: string;
  start: string;
  end?: string | null | undefined;
  city?: string | null | undefined;
  price?: string | null | undefined;
  url?: string | null | undefined;
}): string {
  // Le message propre au voyage ne vaut pour un départ que s'il cite la date ({start}) :
  // sinon l'agence ne saurait pas quel départ est demandé.
  const usesOverride = Boolean(args.override?.trim() && args.override.includes("{start}"));
  const source = usesOverride ? args.override! : args.template;
  return fillTemplate(source, {
    trip: args.trip,
    start: args.start,
    end: args.end,
    city: args.city,
    price: args.price,
    url: args.url,
  });
}
