import { Link, useRouter } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { adminSaveTripFn } from "@/functions/admin/trips.functions";
import { tripInputSchema } from "@/lib/schemas";
import type { AdminDeparture, AdminDestinationListItem, AdminImage, AdminTrip } from "@/lib/types";
import { BilingualField } from "./BilingualField";
import { FaqEditor, SimpleItemsEditor, type FaqState, type SimpleItemState } from "./ContentLists";
import { DepartureModal } from "./DepartureModal";
import { DepartureTable } from "./DepartureTable";
import { CheckboxField, NumberField, SelectField, TextField } from "./Field";
import {
  hasErrorUnder,
  numOrNull,
  numToStr,
  slugify,
  useAdminAction,
  validate,
  type FieldErrors,
} from "./form";
import { GalleryPicker, ImagePicker } from "./ImagePicker";
import { destinationOptions } from "./labels";
import { RepeatableList } from "./RepeatableList";
import { Card, EmptyState, Tabs, abtn, type TabItem } from "./ui";

type DayState = {
  labelFr: string;
  labelAr: string;
  titleFr: string;
  titleAr: string;
  bodyFr: string;
  bodyAr: string;
};

type State = {
  destinationId: string;
  slug: string;
  titleFr: string;
  titleAr: string;
  teaserFr: string;
  teaserAr: string;
  presentationFr: string;
  presentationAr: string;
  durationDays: string;
  durationNights: string;
  priceFromMad: string;
  priceNoteFr: string;
  priceNoteAr: string;
  coverImageId: number | null;
  whatsappMessageFr: string;
  whatsappMessageAr: string;
  seoTitleFr: string;
  seoTitleAr: string;
  seoDescriptionFr: string;
  seoDescriptionAr: string;
  status: "draft" | "published";
  isFeatured: boolean;
  sortOrder: string;
  days: DayState[];
  highlights: SimpleItemState[];
  included: SimpleItemState[];
  excluded: SimpleItemState[];
  faqs: FaqState[];
  imageIds: number[];
};

const s = (v: string | null | undefined) => v ?? "";

function initialState(trip: AdminTrip | null, destinationId: number | null): State {
  if (!trip) {
    return {
      destinationId: destinationId === null ? "" : String(destinationId),
      slug: "",
      titleFr: "",
      titleAr: "",
      teaserFr: "",
      teaserAr: "",
      presentationFr: "",
      presentationAr: "",
      durationDays: "",
      durationNights: "",
      priceFromMad: "",
      priceNoteFr: "",
      priceNoteAr: "",
      coverImageId: null,
      whatsappMessageFr: "",
      whatsappMessageAr: "",
      seoTitleFr: "",
      seoTitleAr: "",
      seoDescriptionFr: "",
      seoDescriptionAr: "",
      status: "draft",
      isFeatured: false,
      sortOrder: "0",
      days: [],
      highlights: [],
      included: [],
      excluded: [],
      faqs: [],
      imageIds: [],
    };
  }
  const simple = (list: { textFr: string; textAr: string | null }[]): SimpleItemState[] =>
    list.map((i) => ({ textFr: i.textFr, textAr: s(i.textAr) }));
  return {
    destinationId: String(trip.destinationId),
    slug: trip.slug,
    titleFr: trip.titleFr,
    titleAr: s(trip.titleAr),
    teaserFr: trip.teaserFr,
    teaserAr: s(trip.teaserAr),
    presentationFr: trip.presentationFr,
    presentationAr: s(trip.presentationAr),
    durationDays: numToStr(trip.durationDays),
    durationNights: numToStr(trip.durationNights),
    priceFromMad: numToStr(trip.priceFromMad),
    priceNoteFr: s(trip.priceNoteFr),
    priceNoteAr: s(trip.priceNoteAr),
    coverImageId: trip.coverImageId,
    whatsappMessageFr: s(trip.whatsappMessageFr),
    whatsappMessageAr: s(trip.whatsappMessageAr),
    seoTitleFr: s(trip.seoTitleFr),
    seoTitleAr: s(trip.seoTitleAr),
    seoDescriptionFr: s(trip.seoDescriptionFr),
    seoDescriptionAr: s(trip.seoDescriptionAr),
    status: trip.status,
    isFeatured: trip.isFeatured,
    sortOrder: String(trip.sortOrder),
    days: trip.days.map((d) => ({
      labelFr: d.labelFr,
      labelAr: s(d.labelAr),
      titleFr: d.titleFr,
      titleAr: s(d.titleAr),
      bodyFr: d.bodyFr,
      bodyAr: s(d.bodyAr),
    })),
    highlights: simple(trip.highlights),
    included: simple(trip.included),
    excluded: simple(trip.excluded),
    faqs: trip.faqs.map((f) => ({
      questionFr: f.questionFr,
      questionAr: s(f.questionAr),
      answerFr: f.answerFr,
      answerAr: s(f.answerAr),
    })),
    imageIds: trip.imageIds,
  };
}

type TabKey = "infos" | "programme" | "listes" | "faq" | "galerie" | "departs";

type ListTab = "programme" | "listes" | "faq" | "galerie";

const TAB_FIELDS: Record<ListTab, string[]> = {
  programme: ["days"],
  listes: ["highlights", "included", "excluded"],
  faq: ["faqs"],
  galerie: ["imageIds"],
};

function tabOfError(errors: FieldErrors): TabKey | null {
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;
  const order: ("infos" | ListTab)[] = ["infos", "programme", "listes", "faq", "galerie"];
  for (const tab of order) {
    if (tab === "infos") {
      const other = Object.values(TAB_FIELDS).flat();
      if (keys.some((k) => !other.some((p) => k === p || k.startsWith(`${p}.`)))) return "infos";
    } else if (hasErrorUnder(errors, TAB_FIELDS[tab])) {
      return tab;
    }
  }
  return null;
}

export type TripDepartures = {
  upcoming: AdminDeparture[];
  past: AdminDeparture[];
  archived: AdminDeparture[];
};

/** Formulaire complet d'un voyage (création ou édition), organisé en onglets. */
export function TripForm({
  trip,
  destinations,
  images,
  departures,
  initialDestinationId = null,
}: {
  trip: AdminTrip | null;
  destinations: AdminDestinationListItem[];
  images: AdminImage[];
  departures?: TripDepartures;
  initialDestinationId?: number | null;
}) {
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const [state, setState] = useState<State>(() => initialState(trip, initialDestinationId));
  const [slugTouched, setSlugTouched] = useState(trip !== null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [tab, setTab] = useState<TabKey>("infos");
  const [editingDeparture, setEditingDeparture] = useState<AdminDeparture | "new" | null>(null);

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    const result = validate(tripInputSchema, {
      destinationId: state.destinationId === "" ? undefined : Number(state.destinationId),
      slug: state.slug,
      titleFr: state.titleFr,
      titleAr: state.titleAr,
      teaserFr: state.teaserFr,
      teaserAr: state.teaserAr,
      presentationFr: state.presentationFr,
      presentationAr: state.presentationAr,
      durationDays: numOrNull(state.durationDays),
      durationNights: numOrNull(state.durationNights),
      priceFromMad: numOrNull(state.priceFromMad),
      priceNoteFr: state.priceNoteFr,
      priceNoteAr: state.priceNoteAr,
      coverImageId: state.coverImageId,
      whatsappMessageFr: state.whatsappMessageFr,
      whatsappMessageAr: state.whatsappMessageAr,
      seoTitleFr: state.seoTitleFr,
      seoTitleAr: state.seoTitleAr,
      seoDescriptionFr: state.seoDescriptionFr,
      seoDescriptionAr: state.seoDescriptionAr,
      status: state.status,
      isFeatured: state.isFeatured,
      sortOrder: numOrNull(state.sortOrder) ?? 0,
      days: state.days,
      highlights: state.highlights,
      included: state.included,
      excluded: state.excluded,
      faqs: state.faqs,
      imageIds: state.imageIds,
    });
    if (!result.ok) {
      setErrors(result.errors);
      const target = tabOfError(result.errors);
      if (target) setTab(target);
      toast.error("Certains champs sont à corriger : ils sont signalés en rouge.");
      return;
    }
    setErrors({});
    const saved = await run(
      () =>
        adminSaveTripFn({
          data: trip ? { id: trip.id, data: result.data } : { data: result.data },
        }),
      {
        success: trip
          ? "Voyage enregistré."
          : "Voyage créé. Vous pouvez maintenant ajouter ses départs.",
        invalidate: trip !== null,
      },
    );
    if (saved && !trip) {
      await router.invalidate();
      await router.navigate({ to: "/admin/voyages/$id", params: { id: String(saved.id) } });
    }
  };

  // « Infos » est en erreur dès qu une clé n appartient à aucun autre onglet.
  const otherPrefixes = Object.values(TAB_FIELDS).flat();
  const infosError = Object.keys(errors).some(
    (k) => !otherPrefixes.some((p) => k === p || k.startsWith(`${p}.`)),
  );
  const tabs: TabItem<TabKey>[] = [
    { key: "infos", label: "Infos", hasError: infosError },
    { key: "programme", label: "Programme", hasError: hasErrorUnder(errors, TAB_FIELDS.programme) },
    {
      key: "listes",
      label: "Inclus / Non inclus / Points forts",
      hasError: hasErrorUnder(errors, TAB_FIELDS.listes),
    },
    { key: "faq", label: "FAQ", hasError: hasErrorUnder(errors, TAB_FIELDS.faq) },
    { key: "galerie", label: "Galerie", hasError: hasErrorUnder(errors, TAB_FIELDS.galerie) },
    { key: "departs", label: "Départs" },
  ];
  const section = (children: ReactNode) => <div className="space-y-6">{children}</div>;

  return (
    <div>
      <Tabs tabs={tabs} current={tab} onChange={setTab} />

      {tab !== "departs" ? (
        <form onSubmit={submit} noValidate>
          {tab === "infos"
            ? section(
                <>
                  <Card title="Identité du voyage">
                    <div className="space-y-5">
                      <BilingualField
                        label="Titre du voyage"
                        valueFr={state.titleFr}
                        valueAr={state.titleAr}
                        onChangeFr={(v) =>
                          setState((cur) => ({
                            ...cur,
                            titleFr: v,
                            slug: slugTouched ? cur.slug : slugify(v),
                          }))
                        }
                        onChangeAr={(v) => set("titleAr", v)}
                        errorFr={errors["titleFr"]}
                        errorAr={errors["titleAr"]}
                        placeholderFr="Week-end à Chefchaouen"
                      />
                      <TextField
                        label="Adresse de la page (slug)"
                        required
                        value={state.slug}
                        onChange={(v) => {
                          setSlugTouched(true);
                          set("slug", v);
                        }}
                        error={errors["slug"]}
                        hint={`Générée à partir du titre, modifiable. Page : /voyages/${state.slug || "..."}`}
                        maxLength={80}
                      />
                      <SelectField
                        label="Destination"
                        required
                        value={state.destinationId}
                        onChange={(v) => set("destinationId", v)}
                        error={errors["destinationId"]}
                        hint="La région (Maroc), le pays (International) ou l'Omra auquel ce voyage appartient."
                      >
                        <option value="">Choisir une destination...</option>
                        {destinationOptions(destinations)}
                      </SelectField>
                      {destinations.length === 0 ? (
                        <p className="text-sm text-destructive">
                          Aucune destination n'existe encore.{" "}
                          <Link
                            to="/admin/destinations/nouveau"
                            className="font-semibold underline"
                          >
                            Créez-en une
                          </Link>{" "}
                          avant d'enregistrer ce voyage.
                        </p>
                      ) : null}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <SelectField
                          label="Statut"
                          value={state.status}
                          onChange={(v) => set("status", v as State["status"])}
                          error={errors["status"]}
                          hint="Un brouillon n'est pas visible sur le site."
                        >
                          <option value="draft">Brouillon (non visible)</option>
                          <option value="published">Publié (visible sur le site)</option>
                        </SelectField>
                        <div className="flex items-end pb-2">
                          <CheckboxField
                            label="Mettre en avant"
                            hint="Affiché en priorité sur l'accueil."
                            checked={state.isFeatured}
                            onChange={(v) => set("isFeatured", v)}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card title="Présentation">
                    <div className="space-y-5">
                      <BilingualField
                        label="Accroche (une ou deux phrases)"
                        optionalFr
                        multiline
                        rows={2}
                        valueFr={state.teaserFr}
                        valueAr={state.teaserAr}
                        onChangeFr={(v) => set("teaserFr", v)}
                        onChangeAr={(v) => set("teaserAr", v)}
                        errorFr={errors["teaserFr"]}
                        errorAr={errors["teaserAr"]}
                        hint="Affichée sur les cartes et en haut de la page du voyage."
                      />
                      <BilingualField
                        label="Description complète"
                        optionalFr
                        multiline
                        rows={7}
                        valueFr={state.presentationFr}
                        valueAr={state.presentationAr}
                        onChangeFr={(v) => set("presentationFr", v)}
                        onChangeAr={(v) => set("presentationAr", v)}
                        errorFr={errors["presentationFr"]}
                        errorAr={errors["presentationAr"]}
                      />
                    </div>
                  </Card>

                  <Card title="Durée et prix">
                    <div className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <NumberField
                          label="Durée (jours)"
                          optional
                          min={1}
                          value={state.durationDays}
                          onChange={(v) => set("durationDays", v)}
                          error={errors["durationDays"]}
                        />
                        <NumberField
                          label="Durée (nuits)"
                          optional
                          min={0}
                          value={state.durationNights}
                          onChange={(v) => set("durationNights", v)}
                          error={errors["durationNights"]}
                        />
                        <NumberField
                          label="Prix indicatif (MAD)"
                          optional
                          min={0}
                          value={state.priceFromMad}
                          onChange={(v) => set("priceFromMad", v)}
                          error={errors["priceFromMad"]}
                          hint="Utilisé s'il n'y a pas de départ avec un prix."
                        />
                      </div>
                      <BilingualField
                        label="Précision sur le prix"
                        optionalFr
                        valueFr={state.priceNoteFr}
                        valueAr={state.priceNoteAr}
                        onChangeFr={(v) => set("priceNoteFr", v)}
                        onChangeAr={(v) => set("priceNoteAr", v)}
                        errorFr={errors["priceNoteFr"]}
                        errorAr={errors["priceNoteAr"]}
                        placeholderFr="Par personne, en chambre double"
                      />
                    </div>
                  </Card>

                  <Card title="Image de couverture">
                    <ImagePicker
                      label="Image principale du voyage"
                      images={images}
                      value={state.coverImageId}
                      onChange={(id) => set("coverImageId", id)}
                      error={errors["coverImageId"]}
                    />
                  </Card>

                  <details className="rounded-2xl border border-border bg-card shadow-soft">
                    <summary className="cursor-pointer px-5 py-4 text-base font-semibold text-navy">
                      Options avancées (message WhatsApp, référencement, ordre)
                    </summary>
                    <div className="space-y-5 border-t border-border p-5">
                      <BilingualField
                        label="Message WhatsApp personnalisé"
                        optionalFr
                        multiline
                        rows={3}
                        valueFr={state.whatsappMessageFr}
                        valueAr={state.whatsappMessageAr}
                        onChangeFr={(v) => set("whatsappMessageFr", v)}
                        onChangeAr={(v) => set("whatsappMessageAr", v)}
                        errorFr={errors["whatsappMessageFr"]}
                        errorAr={errors["whatsappMessageAr"]}
                        hint="Laissez vide pour utiliser le message automatique du site. Variables possibles : {trip}, {url}, {price}. Pour les boutons des départs, le message n'est utilisé que s'il contient {start} (et éventuellement {end}, {city}) ; sinon le message automatique du départ, avec date et ville, est envoyé."
                      />
                      <BilingualField
                        label="Titre pour les moteurs de recherche"
                        optionalFr
                        valueFr={state.seoTitleFr}
                        valueAr={state.seoTitleAr}
                        onChangeFr={(v) => set("seoTitleFr", v)}
                        onChangeAr={(v) => set("seoTitleAr", v)}
                        errorFr={errors["seoTitleFr"]}
                        errorAr={errors["seoTitleAr"]}
                      />
                      <BilingualField
                        label="Description pour les moteurs de recherche"
                        optionalFr
                        multiline
                        rows={2}
                        valueFr={state.seoDescriptionFr}
                        valueAr={state.seoDescriptionAr}
                        onChangeFr={(v) => set("seoDescriptionFr", v)}
                        onChangeAr={(v) => set("seoDescriptionAr", v)}
                        errorFr={errors["seoDescriptionFr"]}
                        errorAr={errors["seoDescriptionAr"]}
                      />
                      <NumberField
                        label="Ordre d'affichage"
                        value={state.sortOrder}
                        onChange={(v) => set("sortOrder", v)}
                        error={errors["sortOrder"]}
                        hint="Plus le nombre est petit, plus le voyage apparaît tôt."
                        className="max-w-xs"
                      />
                    </div>
                  </details>
                </>,
              )
            : null}

          {tab === "programme"
            ? section(
                <Card
                  title="Programme jour par jour"
                  description="Un bloc par jour. Le libellé est affiché en tête (par exemple « Jour 1 »)."
                >
                  <RepeatableList
                    items={state.days}
                    onChange={(days) => set("days", days)}
                    newItem={() => ({
                      labelFr: `Jour ${state.days.length + 1}`,
                      labelAr: "",
                      titleFr: "",
                      titleAr: "",
                      bodyFr: "",
                      bodyAr: "",
                    })}
                    itemLabel="Jour"
                    addLabel="Ajouter un jour"
                    emptyText="Aucun jour pour le moment. Ajoutez le premier jour du programme."
                    renderItem={(day, index, update) => (
                      <div className="space-y-4">
                        <BilingualField
                          label="Libellé du jour"
                          valueFr={day.labelFr}
                          valueAr={day.labelAr}
                          onChangeFr={(v) => update({ labelFr: v })}
                          onChangeAr={(v) => update({ labelAr: v })}
                          errorFr={errors[`days.${index}.labelFr`]}
                          errorAr={errors[`days.${index}.labelAr`]}
                          placeholderFr={`Jour ${index + 1}`}
                        />
                        <BilingualField
                          label="Titre"
                          valueFr={day.titleFr}
                          valueAr={day.titleAr}
                          onChangeFr={(v) => update({ titleFr: v })}
                          onChangeAr={(v) => update({ titleAr: v })}
                          errorFr={errors[`days.${index}.titleFr`]}
                          errorAr={errors[`days.${index}.titleAr`]}
                        />
                        <BilingualField
                          label="Détail de la journée"
                          optionalFr
                          multiline
                          rows={4}
                          valueFr={day.bodyFr}
                          valueAr={day.bodyAr}
                          onChangeFr={(v) => update({ bodyFr: v })}
                          onChangeAr={(v) => update({ bodyAr: v })}
                          errorFr={errors[`days.${index}.bodyFr`]}
                          errorAr={errors[`days.${index}.bodyAr`]}
                        />
                      </div>
                    )}
                  />
                </Card>,
              )
            : null}

          {tab === "listes"
            ? section(
                <>
                  <Card title="Points forts" description="Les atouts du voyage, en quelques mots.">
                    <SimpleItemsEditor
                      items={state.highlights}
                      onChange={(v) => set("highlights", v)}
                      errors={errors}
                      prefix="highlights"
                      itemLabel="Point fort"
                      addLabel="Ajouter un point fort"
                      emptyText="Aucun point fort."
                    />
                  </Card>
                  <Card title="Ce qui est inclus">
                    <SimpleItemsEditor
                      items={state.included}
                      onChange={(v) => set("included", v)}
                      errors={errors}
                      prefix="included"
                      itemLabel="Inclus"
                      addLabel="Ajouter un élément inclus"
                      emptyText="Rien d'inclus pour le moment."
                      placeholder="Transport en autocar climatisé"
                    />
                  </Card>
                  <Card title="Ce qui n'est pas inclus">
                    <SimpleItemsEditor
                      items={state.excluded}
                      onChange={(v) => set("excluded", v)}
                      errors={errors}
                      prefix="excluded"
                      itemLabel="Non inclus"
                      addLabel="Ajouter un élément non inclus"
                      emptyText="Rien de listé."
                      placeholder="Déjeuners"
                    />
                  </Card>
                </>,
              )
            : null}

          {tab === "faq"
            ? section(
                <Card
                  title="Questions fréquentes"
                  description="Affichées en bas de la page du voyage."
                >
                  <FaqEditor items={state.faqs} onChange={(v) => set("faqs", v)} errors={errors} />
                </Card>,
              )
            : null}

          {tab === "galerie"
            ? section(
                <Card title="Galerie photos">
                  <GalleryPicker
                    label="Photos du voyage"
                    images={images}
                    values={state.imageIds}
                    onChange={(ids) => set("imageIds", ids)}
                    hint="L'ordre ici est l'ordre d'affichage sur la page du voyage."
                  />
                </Card>,
              )
            : null}

          <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <p className="text-sm text-muted-foreground">
              {Object.keys(errors).length > 0
                ? "Corrigez les champs signalés en rouge, puis enregistrez."
                : state.status === "published"
                  ? "Ce voyage est publié."
                  : "Ce voyage est un brouillon : il n'est pas visible sur le site."}
            </p>
            <button type="submit" className={abtn.primary} disabled={pending}>
              {pending ? "Enregistrement..." : trip ? "Enregistrer le voyage" : "Créer le voyage"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {!trip || !departures ? (
            <EmptyState
              title="Enregistrez d'abord le voyage"
              text="Les départs se gèrent une fois le voyage créé."
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Les départs à venir, non annulés, apparaissent sur la page du voyage et dans
                  l'agenda des départs (uniquement si le voyage est publié).
                </p>
                <button
                  type="button"
                  className={abtn.primary}
                  onClick={() => setEditingDeparture("new")}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Ajouter un départ
                </button>
              </div>
              {departures.upcoming.length + departures.past.length + departures.archived.length ===
              0 ? (
                <EmptyState
                  title="Aucun départ pour ce voyage"
                  text="Ajoutez une date de départ pour que les visiteurs puissent vous contacter sur WhatsApp."
                />
              ) : null}
              {(
                [
                  ["À venir", departures.upcoming],
                  ["Passés (non archivés)", departures.past],
                  ["Archivés", departures.archived],
                ] as const
              ).map(([title, list]) =>
                list.length ? (
                  <div key={title}>
                    <h3 className="mb-2 font-display text-base font-semibold text-navy">
                      {title} ({list.length})
                    </h3>
                    <DepartureTable
                      departures={list}
                      showTrip={false}
                      onEdit={(d) => setEditingDeparture(d)}
                    />
                  </div>
                ) : null,
              )}
            </>
          )}
        </div>
      )}

      {editingDeparture && trip ? (
        <DepartureModal
          departure={editingDeparture === "new" ? null : editingDeparture}
          trips={[{ id: trip.id, label: trip.titleFr }]}
          fixedTripId={trip.id}
          onClose={() => setEditingDeparture(null)}
        />
      ) : null}
    </div>
  );
}
