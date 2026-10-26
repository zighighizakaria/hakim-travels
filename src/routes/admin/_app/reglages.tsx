import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { BilingualField } from "@/components/admin/BilingualField";
import { TextField } from "@/components/admin/Field";
import { useAdminAction, validate, type FieldErrors } from "@/components/admin/form";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { Card, PageHeader, abtn } from "@/components/admin/ui";
import { adminListImagesFn } from "@/functions/admin/media.functions";
import { adminGetSettingsFn, adminSaveSettingsFn } from "@/functions/admin/settings.functions";
import { settingsInputSchema } from "@/lib/schemas";
import type { AdminSettings } from "@/lib/types";

export const Route = createFileRoute("/admin/_app/reglages")({
  loader: async () => {
    const [settings, images] = await Promise.all([adminGetSettingsFn(), adminListImagesFn()]);
    return { settings, images };
  },
  component: SettingsPage,
});

type State = {
  agencyName: string;
  phoneDisplay: string;
  phoneE164: string;
  whatsappNumber: string;
  email: string;
  addressFr: string;
  addressAr: string;
  openingHoursFr: string;
  openingHoursAr: string;
  mapsUrl: string;
  instagramUrl: string;
  instagramHandle: string;
  instagramFollowersLabel: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  legalCompanyName: string;
  legalIce: string;
  legalRc: string;
  legalLicenseNumber: string;
  heroImageId: number | null;
  ogImageId: number | null;
};

const s = (v: string | null | undefined) => v ?? "";

function initialState(x: AdminSettings): State {
  return {
    agencyName: x.agencyName,
    phoneDisplay: s(x.phoneDisplay),
    phoneE164: s(x.phoneE164),
    whatsappNumber: s(x.whatsappNumber),
    email: s(x.email),
    addressFr: s(x.addressFr),
    addressAr: s(x.addressAr),
    openingHoursFr: s(x.openingHoursFr),
    openingHoursAr: s(x.openingHoursAr),
    mapsUrl: s(x.mapsUrl),
    instagramUrl: s(x.instagramUrl),
    instagramHandle: s(x.instagramHandle),
    instagramFollowersLabel: s(x.instagramFollowersLabel),
    facebookUrl: s(x.facebookUrl),
    tiktokUrl: s(x.tiktokUrl),
    youtubeUrl: s(x.youtubeUrl),
    legalCompanyName: s(x.legalCompanyName),
    legalIce: s(x.legalIce),
    legalRc: s(x.legalRc),
    legalLicenseNumber: s(x.legalLicenseNumber),
    heroImageId: x.heroImageId,
    ogImageId: x.ogImageId,
  };
}

function SettingsPage() {
  const { settings, images } = Route.useLoaderData();
  const { run, pending } = useAdminAction();
  const [state, setState] = useState<State>(() => initialState(settings));
  const [errors, setErrors] = useState<FieldErrors>({});
  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setState((cur) => ({ ...cur, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    const result = validate(settingsInputSchema, state);
    if (!result.ok) {
      setErrors(result.errors);
      toast.error("Certains champs sont à corriger : ils sont signalés en rouge.");
      return;
    }
    setErrors({});
    await run(() => adminSaveSettingsFn({ data: result.data }), {
      success: "Réglages enregistrés. Le site est à jour.",
    });
  };

  return (
    <>
      <PageHeader
        title="Réglages du site"
        description="Coordonnées, réseaux sociaux et mentions légales affichés sur le site. Un champ laissé vide n'est pas affiché."
      />
      <form onSubmit={submit} noValidate className="space-y-6">
        <Card title="Coordonnées">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Nom de l'agence"
              required
              value={state.agencyName}
              onChange={(v) => set("agencyName", v)}
              error={errors["agencyName"]}
            />
            <TextField
              label="Adresse e-mail"
              optional
              type="email"
              value={state.email}
              onChange={(v) => set("email", v)}
              error={errors["email"]}
            />
            <TextField
              label="Téléphone (affichage)"
              optional
              value={state.phoneDisplay}
              onChange={(v) => set("phoneDisplay", v)}
              error={errors["phoneDisplay"]}
              placeholder="06 25 77 64 85"
              hint="Tel qu'il apparaît sur le site."
            />
            <TextField
              label="Téléphone (format international)"
              optional
              value={state.phoneE164}
              onChange={(v) => set("phoneE164", v)}
              error={errors["phoneE164"]}
              placeholder="+212625776485"
              hint="Utilisé pour le lien « Appeler ». Commence par +212."
            />
            <TextField
              label="Numéro WhatsApp"
              optional
              value={state.whatsappNumber}
              onChange={(v) => set("whatsappNumber", v)}
              error={errors["whatsappNumber"]}
              placeholder="212625776485"
              hint="Chiffres uniquement, avec l'indicatif du pays, sans + ni espaces."
              className="sm:col-span-2"
            />
          </div>
        </Card>

        <Card title="Adresse et horaires">
          <div className="space-y-5">
            <BilingualField
              label="Adresse"
              optionalFr
              multiline
              rows={2}
              valueFr={state.addressFr}
              valueAr={state.addressAr}
              onChangeFr={(v) => set("addressFr", v)}
              onChangeAr={(v) => set("addressAr", v)}
              errorFr={errors["addressFr"]}
              errorAr={errors["addressAr"]}
            />
            <BilingualField
              label="Horaires d'ouverture"
              optionalFr
              multiline
              rows={2}
              valueFr={state.openingHoursFr}
              valueAr={state.openingHoursAr}
              onChangeFr={(v) => set("openingHoursFr", v)}
              onChangeAr={(v) => set("openingHoursAr", v)}
              errorFr={errors["openingHoursFr"]}
              errorAr={errors["openingHoursAr"]}
              hint="Par exemple : Du lundi au samedi, 9h - 19h."
            />
            <TextField
              label="Lien de la carte (Google Maps)"
              optional
              type="url"
              value={state.mapsUrl}
              onChange={(v) => set("mapsUrl", v)}
              error={errors["mapsUrl"]}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </Card>

        <Card title="Réseaux sociaux">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Instagram (lien)"
              optional
              type="url"
              value={state.instagramUrl}
              onChange={(v) => set("instagramUrl", v)}
              error={errors["instagramUrl"]}
              placeholder="https://www.instagram.com/..."
            />
            <TextField
              label="Instagram (nom du compte)"
              optional
              value={state.instagramHandle}
              onChange={(v) => set("instagramHandle", v)}
              error={errors["instagramHandle"]}
              placeholder="@hakim.travels_agency"
            />
            <TextField
              label="Nombre d'abonnés Instagram"
              optional
              value={state.instagramFollowersLabel}
              onChange={(v) => set("instagramFollowersLabel", v)}
              error={errors["instagramFollowersLabel"]}
              placeholder="12 k"
              hint="Texte libre, affiché tel quel."
            />
            <TextField
              label="Facebook (lien)"
              optional
              type="url"
              value={state.facebookUrl}
              onChange={(v) => set("facebookUrl", v)}
              error={errors["facebookUrl"]}
            />
            <TextField
              label="TikTok (lien)"
              optional
              type="url"
              value={state.tiktokUrl}
              onChange={(v) => set("tiktokUrl", v)}
              error={errors["tiktokUrl"]}
            />
            <TextField
              label="YouTube (lien)"
              optional
              type="url"
              value={state.youtubeUrl}
              onChange={(v) => set("youtubeUrl", v)}
              error={errors["youtubeUrl"]}
            />
          </div>
        </Card>

        <Card
          title="Mentions légales"
          description="Affichées sur la page « Mentions légales ». À renseigner avec les informations officielles de la société."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Raison sociale"
              optional
              value={state.legalCompanyName}
              onChange={(v) => set("legalCompanyName", v)}
              error={errors["legalCompanyName"]}
              className="sm:col-span-2"
            />
            <TextField
              label="ICE"
              optional
              value={state.legalIce}
              onChange={(v) => set("legalIce", v)}
              error={errors["legalIce"]}
            />
            <TextField
              label="Registre du commerce (RC)"
              optional
              value={state.legalRc}
              onChange={(v) => set("legalRc", v)}
              error={errors["legalRc"]}
            />
            <TextField
              label="Numéro de licence"
              optional
              value={state.legalLicenseNumber}
              onChange={(v) => set("legalLicenseNumber", v)}
              error={errors["legalLicenseNumber"]}
            />
          </div>
        </Card>

        <Card title="Images du site">
          <div className="space-y-6">
            <ImagePicker
              label="Image de l'accueil (bandeau principal)"
              images={images}
              value={state.heroImageId}
              onChange={(id) => set("heroImageId", id)}
              error={errors["heroImageId"]}
              hint="Laissez vide pour garder l'image par défaut."
            />
            <ImagePicker
              label="Image de partage (réseaux sociaux)"
              images={images}
              value={state.ogImageId}
              onChange={(id) => set("ogImageId", id)}
              error={errors["ogImageId"]}
              hint="Affichée quand le lien du site est partagé sur WhatsApp, Facebook, etc."
            />
          </div>
        </Card>

        <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <p className="text-sm text-muted-foreground">
            {Object.keys(errors).length > 0
              ? "Corrigez les champs signalés en rouge, puis enregistrez."
              : "Les modifications sont visibles sur le site dès l'enregistrement."}
          </p>
          <button type="submit" className={abtn.primary} disabled={pending}>
            {pending ? "Enregistrement..." : "Enregistrer les réglages"}
          </button>
        </div>
      </form>
    </>
  );
}
