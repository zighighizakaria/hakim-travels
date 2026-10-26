import type { AdminSettings, Lang, PublicSettings } from "@/lib/types";
import type { SettingsInput } from "@/lib/schemas";
import { getDb } from "../db/client";
import { DomainError, get, loc, run, withDbErrors } from "../db/sql";
import { getImageRef } from "./images.repo";

type SettingsRow = {
  agency_name: string;
  phone_display: string | null;
  phone_e164: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address_fr: string | null;
  address_ar: string | null;
  opening_hours_fr: string | null;
  opening_hours_ar: string | null;
  maps_url: string | null;
  instagram_url: string | null;
  instagram_handle: string | null;
  instagram_followers_label: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  legal_company_name: string | null;
  legal_ice: string | null;
  legal_rc: string | null;
  legal_license_number: string | null;
  hero_image_id: number | null;
  og_image_id: number | null;
  updated_at: string;
};

function readRow(): SettingsRow {
  const row = get<SettingsRow>(getDb(), "SELECT * FROM site_settings WHERE id = 1");
  if (!row) throw new Error("Réglages du site introuvables (migration non appliquée ?).");
  return row;
}

export function getPublicSettings(lang: Lang): PublicSettings {
  const r = readRow();
  return {
    agencyName: r.agency_name,
    phoneDisplay: r.phone_display,
    phoneE164: r.phone_e164,
    whatsappNumber: r.whatsapp_number,
    email: r.email,
    address: loc(r, "address", lang),
    openingHours: loc(r, "opening_hours", lang),
    mapsUrl: r.maps_url,
    instagramUrl: r.instagram_url,
    instagramHandle: r.instagram_handle,
    instagramFollowersLabel: r.instagram_followers_label,
    facebookUrl: r.facebook_url,
    tiktokUrl: r.tiktok_url,
    youtubeUrl: r.youtube_url,
    legalCompanyName: r.legal_company_name,
    legalIce: r.legal_ice,
    legalRc: r.legal_rc,
    legalLicenseNumber: r.legal_license_number,
    heroImage: getImageRef(r.hero_image_id === null ? null : Number(r.hero_image_id), lang),
    ogImage: getImageRef(r.og_image_id === null ? null : Number(r.og_image_id), lang),
  };
}

export function adminGetSettings(): AdminSettings {
  const r = readRow();
  const heroId = r.hero_image_id === null ? null : Number(r.hero_image_id);
  const ogId = r.og_image_id === null ? null : Number(r.og_image_id);
  return {
    agencyName: r.agency_name,
    phoneDisplay: r.phone_display,
    phoneE164: r.phone_e164,
    whatsappNumber: r.whatsapp_number,
    email: r.email,
    addressFr: r.address_fr,
    addressAr: r.address_ar,
    openingHoursFr: r.opening_hours_fr,
    openingHoursAr: r.opening_hours_ar,
    mapsUrl: r.maps_url,
    instagramUrl: r.instagram_url,
    instagramHandle: r.instagram_handle,
    instagramFollowersLabel: r.instagram_followers_label,
    facebookUrl: r.facebook_url,
    tiktokUrl: r.tiktok_url,
    youtubeUrl: r.youtube_url,
    legalCompanyName: r.legal_company_name,
    legalIce: r.legal_ice,
    legalRc: r.legal_rc,
    legalLicenseNumber: r.legal_license_number,
    heroImageId: heroId,
    ogImageId: ogId,
    heroImage: getImageRef(heroId, "fr"),
    ogImage: getImageRef(ogId, "fr"),
    updatedAt: r.updated_at,
  };
}

export function saveSettings(input: SettingsInput): void {
  const res = withDbErrors(() =>
    run(
      getDb(),
      `UPDATE site_settings SET
         agency_name = ?, phone_display = ?, phone_e164 = ?, whatsapp_number = ?, email = ?,
         address_fr = ?, address_ar = ?, opening_hours_fr = ?, opening_hours_ar = ?, maps_url = ?,
         instagram_url = ?, instagram_handle = ?, instagram_followers_label = ?,
         facebook_url = ?, tiktok_url = ?, youtube_url = ?,
         legal_company_name = ?, legal_ice = ?, legal_rc = ?, legal_license_number = ?,
         hero_image_id = ?, og_image_id = ?, updated_at = datetime('now')
       WHERE id = 1`,
      input.agencyName,
      input.phoneDisplay,
      input.phoneE164,
      input.whatsappNumber,
      input.email,
      input.addressFr,
      input.addressAr,
      input.openingHoursFr,
      input.openingHoursAr,
      input.mapsUrl,
      input.instagramUrl,
      input.instagramHandle,
      input.instagramFollowersLabel,
      input.facebookUrl,
      input.tiktokUrl,
      input.youtubeUrl,
      input.legalCompanyName,
      input.legalIce,
      input.legalRc,
      input.legalLicenseNumber,
      input.heroImageId,
      input.ogImageId,
    ),
  );
  if (res.changes === 0) throw new DomainError("Réglages introuvables.", "not_found");
}
