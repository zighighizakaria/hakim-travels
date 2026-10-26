import { createFileRoute } from "@tanstack/react-router";
import { Plus, Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { BilingualField } from "@/components/admin/BilingualField";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CheckboxField, NumberField, SelectField, TextField } from "@/components/admin/Field";
import {
  numOrNull,
  numToStr,
  useAdminAction,
  validate,
  type FieldErrors,
} from "@/components/admin/form";
import { Modal } from "@/components/admin/Modal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState, PageHeader, abtn } from "@/components/admin/ui";
import {
  adminDeleteReviewFn,
  adminListReviewsFn,
  adminSaveReviewFn,
} from "@/functions/admin/reviews.functions";
import { adminListTripsFn } from "@/functions/admin/trips.functions";
import { reviewInputSchema } from "@/lib/schemas";
import type { AdminReview } from "@/lib/types";

export const Route = createFileRoute("/admin/_app/avis")({
  loader: async () => {
    const [reviews, trips] = await Promise.all([
      adminListReviewsFn(),
      adminListTripsFn({ data: {} }),
    ]);
    return { reviews, trips };
  },
  component: ReviewsPage,
});

type State = {
  authorName: string;
  authorCity: string;
  tripId: string;
  rating: string;
  quoteFr: string;
  quoteAr: string;
  travelLabel: string;
  sourceUrl: string;
  isPublished: boolean;
  sortOrder: string;
};

function initialState(r: AdminReview | null): State {
  return {
    authorName: r?.authorName ?? "",
    authorCity: r?.authorCity ?? "",
    tripId: r?.tripId ? String(r.tripId) : "",
    rating: r?.rating ? String(r.rating) : "5",
    quoteFr: r?.quoteFr ?? "",
    quoteAr: r?.quoteAr ?? "",
    travelLabel: r?.travelLabel ?? "",
    sourceUrl: r?.sourceUrl ?? "",
    isPublished: r?.isPublished ?? false,
    sortOrder: numToStr(r?.sortOrder ?? 0),
  };
}

function ReviewModal({
  review,
  trips,
  onClose,
}: {
  review: AdminReview | null;
  trips: { id: number; titleFr: string }[];
  onClose: () => void;
}) {
  const { run, pending } = useAdminAction();
  const [state, setState] = useState<State>(() => initialState(review));
  const [errors, setErrors] = useState<FieldErrors>({});
  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setState((cur) => ({ ...cur, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = validate(reviewInputSchema, {
      authorName: state.authorName,
      authorCity: state.authorCity,
      tripId: state.tripId === "" ? null : Number(state.tripId),
      rating: state.rating === "" ? null : Number(state.rating),
      quoteFr: state.quoteFr,
      quoteAr: state.quoteAr,
      travelLabel: state.travelLabel,
      sourceUrl: state.sourceUrl,
      isPublished: state.isPublished,
      sortOrder: numOrNull(state.sortOrder) ?? 0,
    });
    if (!result.ok) {
      setErrors(result.errors);
      toast.error("Certains champs sont à corriger.");
      return;
    }
    setErrors({});
    const saved = await run(
      () =>
        adminSaveReviewFn({
          data: review ? { id: review.id, data: result.data } : { data: result.data },
        }),
      { success: review ? "Avis enregistré." : "Avis ajouté." },
    );
    if (saved) onClose();
  };

  const formId = "review-form";
  return (
    <Modal
      open
      onClose={onClose}
      title={review ? "Modifier l'avis" : "Nouvel avis"}
      size="lg"
      footer={
        <>
          <button type="button" className={abtn.secondary} onClick={onClose} disabled={pending}>
            Annuler
          </button>
          <button type="submit" form={formId} className={abtn.primary} disabled={pending}>
            {pending ? "Enregistrement..." : "Enregistrer l'avis"}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nom du client"
            required
            value={state.authorName}
            onChange={(v) => set("authorName", v)}
            error={errors["authorName"]}
          />
          <TextField
            label="Ville"
            optional
            value={state.authorCity}
            onChange={(v) => set("authorCity", v)}
            error={errors["authorCity"]}
          />
        </div>
        <BilingualField
          label="Témoignage"
          multiline
          rows={4}
          valueFr={state.quoteFr}
          valueAr={state.quoteAr}
          onChangeFr={(v) => set("quoteFr", v)}
          onChangeAr={(v) => set("quoteAr", v)}
          errorFr={errors["quoteFr"]}
          errorAr={errors["quoteAr"]}
          hint="Reprenez les mots du client, sans les modifier."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Note"
            optional
            value={state.rating}
            onChange={(v) => set("rating", v)}
            error={errors["rating"]}
          >
            <option value="">Sans note</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} / 5
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Voyage concerné"
            optional
            value={state.tripId}
            onChange={(v) => set("tripId", v)}
            error={errors["tripId"]}
          >
            <option value="">Aucun voyage en particulier</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.titleFr}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Période du voyage"
            optional
            value={state.travelLabel}
            onChange={(v) => set("travelLabel", v)}
            error={errors["travelLabel"]}
            placeholder="Août 2025"
          />
          <TextField
            label="Lien vers l'avis d'origine"
            optional
            type="url"
            value={state.sourceUrl}
            onChange={(v) => set("sourceUrl", v)}
            error={errors["sourceUrl"]}
            placeholder="https://..."
          />
          <NumberField
            label="Ordre d'affichage"
            value={state.sortOrder}
            onChange={(v) => set("sortOrder", v)}
            error={errors["sortOrder"]}
            hint="Plus petit = plus haut."
          />
        </div>
        <CheckboxField
          label="Publié sur le site"
          hint="Un avis non publié reste invisible."
          checked={state.isPublished}
          onChange={(v) => set("isPublished", v)}
        />
      </form>
    </Modal>
  );
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-4 w-4 ${i < rating ? "fill-sun text-sun" : "text-navy/20"}`}
        />
      ))}
    </span>
  );
}

function ReviewsPage() {
  const { reviews, trips } = Route.useLoaderData();
  const { run, pending } = useAdminAction();
  const [editing, setEditing] = useState<AdminReview | "new" | null>(null);

  const togglePublished = (r: AdminReview) =>
    run(
      () =>
        adminSaveReviewFn({
          data: {
            id: r.id,
            data: {
              authorName: r.authorName,
              authorCity: r.authorCity,
              tripId: r.tripId,
              rating: r.rating,
              quoteFr: r.quoteFr,
              quoteAr: r.quoteAr,
              travelLabel: r.travelLabel,
              sourceUrl: r.sourceUrl,
              isPublished: !r.isPublished,
              sortOrder: r.sortOrder,
            },
          },
        }),
      { success: r.isPublished ? "Avis dépublié." : "Avis publié." },
    );

  return (
    <>
      <PageHeader
        title="Avis clients"
        description="Seuls les avis publiés apparaissent sur le site. S'il n'y en a aucun, la section est masquée."
        actions={
          <button type="button" className={abtn.primary} onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouvel avis
          </button>
        }
      />

      {reviews.length === 0 ? (
        <EmptyState
          title="Aucun avis pour le moment"
          text="Ajoutez les vrais témoignages de vos clients."
          action={
            <button type="button" className={abtn.primary} onClick={() => setEditing("new")}>
              Nouvel avis
            </button>
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card px-5 shadow-soft">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 py-4 md:flex-row md:items-start md:justify-between"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-navy">{r.authorName}</span>
                  {r.authorCity ? (
                    <span className="text-sm text-muted-foreground">({r.authorCity})</span>
                  ) : null}
                  <Stars rating={r.rating} />
                  <StatusBadge status={r.isPublished ? "published" : "hidden"} />
                </p>
                <p className="mt-1 line-clamp-3 text-sm text-foreground">{r.quoteFr}</p>
                {r.tripTitle ? (
                  <p className="mt-1 text-xs text-muted-foreground">Voyage : {r.tripTitle}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  className={abtn.smSecondary}
                  disabled={pending}
                  onClick={() => void togglePublished(r)}
                >
                  {r.isPublished ? "Dépublier" : "Publier"}
                </button>
                <button type="button" className={abtn.smPrimary} onClick={() => setEditing(r)}>
                  Modifier
                </button>
                <ConfirmButton
                  buttonClassName={abtn.smDanger}
                  title="Supprimer cet avis ?"
                  confirmLabel="Supprimer"
                  disabled={pending}
                  message={<p>L'avis de {r.authorName} sera supprimé définitivement.</p>}
                  onConfirm={async () => {
                    await run(() => adminDeleteReviewFn({ data: { id: r.id } }), {
                      success: "Avis supprimé.",
                    });
                  }}
                >
                  Supprimer
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <ReviewModal
          review={editing === "new" ? null : editing}
          trips={trips}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}
