import { useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { adminSaveDestinationFn } from "@/functions/admin/destinations.functions";
import { destinationInputSchema } from "@/lib/schemas";
import type { AdminDestination, AdminImage, Universe } from "@/lib/types";
import { BilingualField } from "./BilingualField";
import {
  FaqEditor,
  LabeledItemsEditor,
  type FaqState,
  type LabeledItemState,
} from "./ContentLists";
import { CheckboxField, NumberField, SelectField, TextField } from "./Field";
import { numOrNull, slugify, useAdminAction, validate, type FieldErrors } from "./form";
import { GalleryPicker, ImagePicker } from "./ImagePicker";
import { Card, abtn } from "./ui";

type State = {
  universe: Universe;
  slug: string;
  nameFr: string;
  nameAr: string;
  emoji: string;
  taglineFr: string;
  taglineAr: string;
  teaserFr: string;
  teaserAr: string;
  introFr: string;
  introAr: string;
  coverImageId: number | null;
  seoTitleFr: string;
  seoTitleAr: string;
  seoDescriptionFr: string;
  seoDescriptionAr: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: string;
  highlights: LabeledItemState[];
  practical: LabeledItemState[];
  faqs: FaqState[];
  imageIds: number[];
};

const s = (v: string | null | undefined) => v ?? "";

function initialState(d: AdminDestination | null, universe: Universe): State {
  if (!d) {
    return {
      universe,
      slug: "",
      nameFr: "",
      nameAr: "",
      emoji: "",
      taglineFr: "",
      taglineAr: "",
      teaserFr: "",
      teaserAr: "",
      introFr: "",
      introAr: "",
      coverImageId: null,
      seoTitleFr: "",
      seoTitleAr: "",
      seoDescriptionFr: "",
      seoDescriptionAr: "",
      isPublished: true,
      isFeatured: false,
      sortOrder: "0",
      highlights: [],
      practical: [],
      faqs: [],
      imageIds: [],
    };
  }
  const labeled = (list: AdminDestination["highlights"]): LabeledItemState[] =>
    list.map((i) => ({
      labelFr: s(i.labelFr),
      labelAr: s(i.labelAr),
      textFr: i.textFr,
      textAr: s(i.textAr),
    }));
  return {
    universe: d.universe,
    slug: d.slug,
    nameFr: d.nameFr,
    nameAr: s(d.nameAr),
    emoji: s(d.emoji),
    taglineFr: s(d.taglineFr),
    taglineAr: s(d.taglineAr),
    teaserFr: s(d.teaserFr),
    teaserAr: s(d.teaserAr),
    introFr: s(d.introFr),
    introAr: s(d.introAr),
    coverImageId: d.coverImageId,
    seoTitleFr: s(d.seoTitleFr),
    seoTitleAr: s(d.seoTitleAr),
    seoDescriptionFr: s(d.seoDescriptionFr),
    seoDescriptionAr: s(d.seoDescriptionAr),
    isPublished: d.isPublished,
    isFeatured: d.isFeatured,
    sortOrder: String(d.sortOrder),
    highlights: labeled(d.highlights),
    practical: labeled(d.practical),
    faqs: d.faqs.map((f) => ({
      questionFr: f.questionFr,
      questionAr: s(f.questionAr),
      answerFr: f.answerFr,
      answerAr: s(f.answerAr),
    })),
    imageIds: d.imageIds,
  };
}

/** Formulaire d'une destination (région du Maroc, pays ou Omra). */
export function DestinationForm({
  destination,
  images,
  initialUniverse = "maroc",
}: {
  destination: AdminDestination | null;
  images: AdminImage[];
  initialUniverse?: Universe;
}) {
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const [state, setState] = useState<State>(() => initialState(destination, initialUniverse));
  const [slugTouched, setSlugTouched] = useState(destination !== null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    const result = validate(destinationInputSchema, {
      ...state,
      sortOrder: numOrNull(state.sortOrder) ?? 0,
    });
    if (!result.ok) {
      setErrors(result.errors);
      toast.error("Certains champs sont à corriger : ils sont signalés en rouge.");
      const first = document.querySelector('[aria-invalid="true"]');
      if (first instanceof HTMLElement)
        first.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setErrors({});
    const saved = await run(
      () =>
        adminSaveDestinationFn({
          data: destination ? { id: destination.id, data: result.data } : { data: result.data },
        }),
      {
        success: destination ? "Destination enregistrée." : "Destination créée.",
        invalidate: destination !== null,
      },
    );
    if (saved && !destination) {
      await router.invalidate();
      await router.navigate({ to: "/admin/destinations/$id", params: { id: String(saved.id) } });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card title="Identité">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Univers"
              required
              value={state.universe}
              onChange={(v) => set("universe", v as Universe)}
              error={errors["universe"]}
              hint="Maroc : une région. International : un pays. Omra : le pèlerinage."
            >
              <option value="maroc">Maroc (région)</option>
              <option value="international">International (pays)</option>
              <option value="omra">Omra</option>
            </SelectField>
            <TextField
              label="Emoji"
              optional
              value={state.emoji}
              onChange={(v) => set("emoji", v)}
              error={errors["emoji"]}
              maxLength={16}
              hint="Un petit symbole affiché à côté du nom, par exemple 🏜️."
            />
          </div>
          <BilingualField
            label="Nom"
            valueFr={state.nameFr}
            valueAr={state.nameAr}
            onChangeFr={(v) =>
              setState((cur) => ({
                ...cur,
                nameFr: v,
                slug: slugTouched ? cur.slug : slugify(v),
              }))
            }
            onChangeAr={(v) => set("nameAr", v)}
            errorFr={errors["nameFr"]}
            errorAr={errors["nameAr"]}
            placeholderFr="Sud et Désert"
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
            maxLength={80}
            hint={`Générée à partir du nom, modifiable. Page : /destinations/${state.slug || "..."}`}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-end pb-2">
              <CheckboxField
                label="Publiée"
                hint="Visible sur le site."
                checked={state.isPublished}
                onChange={(v) => set("isPublished", v)}
              />
            </div>
            <div className="flex items-end pb-2">
              <CheckboxField
                label="Mise en avant"
                hint="Affichée en priorité."
                checked={state.isFeatured}
                onChange={(v) => set("isFeatured", v)}
              />
            </div>
            <NumberField
              label="Ordre d'affichage"
              value={state.sortOrder}
              onChange={(v) => set("sortOrder", v)}
              error={errors["sortOrder"]}
              hint="Plus petit = plus haut."
            />
          </div>
        </div>
      </Card>

      <Card title="Présentation">
        <div className="space-y-5">
          <BilingualField
            label="Accroche"
            optionalFr
            valueFr={state.taglineFr}
            valueAr={state.taglineAr}
            onChangeFr={(v) => set("taglineFr", v)}
            onChangeAr={(v) => set("taglineAr", v)}
            errorFr={errors["taglineFr"]}
            errorAr={errors["taglineAr"]}
            hint="Une courte phrase sous le nom."
          />
          <BilingualField
            label="Résumé"
            optionalFr
            multiline
            rows={3}
            valueFr={state.teaserFr}
            valueAr={state.teaserAr}
            onChangeFr={(v) => set("teaserFr", v)}
            onChangeAr={(v) => set("teaserAr", v)}
            errorFr={errors["teaserFr"]}
            errorAr={errors["teaserAr"]}
            hint="Affiché sur les cartes de destinations."
          />
          <BilingualField
            label="Introduction"
            optionalFr
            multiline
            rows={7}
            valueFr={state.introFr}
            valueAr={state.introAr}
            onChangeFr={(v) => set("introFr", v)}
            onChangeAr={(v) => set("introAr", v)}
            errorFr={errors["introFr"]}
            errorAr={errors["introAr"]}
          />
        </div>
      </Card>

      <Card title="Points forts" description="Ce qu'il ne faut pas manquer dans cette destination.">
        <LabeledItemsEditor
          items={state.highlights}
          onChange={(v) => set("highlights", v)}
          errors={errors}
          prefix="highlights"
          itemLabel="Point fort"
          addLabel="Ajouter un point fort"
          emptyText="Aucun point fort."
        />
      </Card>

      <Card
        title="Infos pratiques"
        description="Meilleure période, formalités, climat, monnaie, conseils..."
      >
        <LabeledItemsEditor
          items={state.practical}
          onChange={(v) => set("practical", v)}
          errors={errors}
          prefix="practical"
          itemLabel="Info"
          addLabel="Ajouter une info pratique"
          emptyText="Aucune info pratique."
        />
      </Card>

      <Card title="Questions fréquentes">
        <FaqEditor items={state.faqs} onChange={(v) => set("faqs", v)} errors={errors} />
      </Card>

      <Card title="Images">
        <div className="space-y-6">
          <ImagePicker
            label="Image de couverture"
            images={images}
            value={state.coverImageId}
            onChange={(id) => set("coverImageId", id)}
            error={errors["coverImageId"]}
          />
          <GalleryPicker
            label="Galerie"
            images={images}
            values={state.imageIds}
            onChange={(ids) => set("imageIds", ids)}
          />
        </div>
      </Card>

      <details className="rounded-2xl border border-border bg-card shadow-soft">
        <summary className="cursor-pointer px-5 py-4 text-base font-semibold text-navy">
          Référencement (moteurs de recherche)
        </summary>
        <div className="space-y-5 border-t border-border p-5">
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
        </div>
      </details>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <p className="text-sm text-muted-foreground">
          {Object.keys(errors).length > 0
            ? "Corrigez les champs signalés en rouge, puis enregistrez."
            : state.isPublished
              ? "Cette destination est visible sur le site."
              : "Cette destination est masquée sur le site."}
        </p>
        <button type="submit" className={abtn.primary} disabled={pending}>
          {pending
            ? "Enregistrement..."
            : destination
              ? "Enregistrer la destination"
              : "Créer la destination"}
        </button>
      </div>
    </form>
  );
}
