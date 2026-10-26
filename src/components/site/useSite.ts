import { getRouteApi } from "@tanstack/react-router";
import { localizePath } from "@/i18n/config";
import { useLang, useT } from "@/i18n/useI18n";
import { formatDate, formatPrice } from "@/lib/format";
import type { DepartureRow, PublicSettings, SiteConfig } from "@/lib/types";
import {
  buildDepartureMessage,
  buildTripMessage,
  normalizeWhatsappNumber,
  whatsappUrl,
} from "@/lib/whatsapp";

const rootApi = getRouteApi("__root__");

/** Données du loader racine (réglages FR/AR + URL du site). Peut être absent si le loader a échoué. */
export function useSiteConfig(): SiteConfig | undefined {
  return rootApi.useLoaderData();
}

/** Réglages publics dans la langue courante. */
export function useSettings(): PublicSettings | undefined {
  const lang = useLang();
  return useSiteConfig()?.settings[lang];
}

/**
 * Liens WhatsApp dans la langue courante. Tous renvoient `null` si aucun numéro valide
 * n'est renseigné dans les réglages (les boutons correspondants sont alors masqués).
 */
export function useWhatsApp() {
  const lang = useLang();
  const t = useT();
  const config = useSiteConfig();
  const number = config?.settings[lang].whatsappNumber ?? null;
  const siteUrl = config?.siteUrl ?? "";
  const enabled = normalizeWhatsappNumber(number) !== null;

  const link = (message?: string): string | null => (enabled ? whatsappUrl(number, message) : null);
  const tripUrl = (slug: string) => `${siteUrl}${localizePath(`/voyages/${slug}`, lang)}`;

  return {
    enabled,
    link,
    general: () => link(t.whatsapp.general),
    omra: () => link(t.whatsapp.omra),
    custom: () => link(t.whatsapp.custom),
    trip: (trip: { slug: string; title: string }, override?: string | null) =>
      link(
        buildTripMessage({
          template: t.whatsapp.trip,
          override: override ?? null,
          trip: trip.title,
          url: tripUrl(trip.slug),
        }),
      ),
    departure: (d: DepartureRow, override?: string | null) =>
      link(
        buildDepartureMessage({
          template: t.whatsapp.departure,
          override: override ?? null,
          trip: d.tripTitle,
          start: formatDate(d.startDate, lang),
          end: formatDate(d.endDate, lang),
          city: d.departureCity,
          price: formatPrice(d.priceMad, lang) ?? t.common.priceOnRequest,
          url: tripUrl(d.tripSlug),
        }),
      ),
  };
}
