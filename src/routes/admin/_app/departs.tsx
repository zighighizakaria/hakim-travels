import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DepartureModal, type TripOption } from "@/components/admin/DepartureModal";
import { DepartureTable } from "@/components/admin/DepartureTable";
import { useAdminAction } from "@/components/admin/form";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState, PageHeader, abtn } from "@/components/admin/ui";
import {
  adminArchivePastDeparturesFn,
  adminListDeparturesFn,
} from "@/functions/admin/departures.functions";
import { adminListTripsFn } from "@/functions/admin/trips.functions";
import type { AdminDeparture } from "@/lib/types";
import { cn } from "@/lib/utils";

type Vue = "avenir" | "passes" | "archives";
const VIEWS: { key: Vue; label: string; api: "upcoming" | "past" | "archived" }[] = [
  { key: "avenir", label: "À venir", api: "upcoming" },
  { key: "passes", label: "Passés", api: "past" },
  { key: "archives", label: "Archivés", api: "archived" },
];

export const Route = createFileRoute("/admin/_app/departs")({
  validateSearch: (search: Record<string, unknown>): { vue?: Vue | undefined } => ({
    vue: search["vue"] === "passes" || search["vue"] === "archives" ? search["vue"] : undefined,
  }),
  loaderDeps: ({ search }) => ({ vue: search.vue ?? "avenir" }),
  loader: async ({ deps }) => {
    const api = VIEWS.find((v) => v.key === deps.vue)?.api ?? "upcoming";
    const [departures, trips] = await Promise.all([
      adminListDeparturesFn({ data: { view: api } }),
      adminListTripsFn({ data: {} }),
    ]);
    return { departures, trips };
  },
  component: DeparturesPage,
});

function DeparturesPage() {
  const { departures, trips } = Route.useLoaderData();
  const vue: Vue = Route.useSearch().vue ?? "avenir";
  const { run, pending } = useAdminAction();
  const [editing, setEditing] = useState<AdminDeparture | "new" | null>(null);

  const tripOptions: TripOption[] = trips.map((t) => ({
    id: t.id,
    label: `${t.titleFr} (${t.destinationName})${t.status === "draft" ? " - brouillon" : ""}`,
  }));

  return (
    <>
      <PageHeader
        title="Départs"
        description="Dates de départ de vos voyages. Seuls les départs à venir, non annulés et non archivés sont visibles sur le site."
        actions={
          <button
            type="button"
            className={abtn.primary}
            onClick={() => setEditing("new")}
            disabled={trips.length === 0}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouveau départ
          </button>
        }
      />

      <div
        role="tablist"
        aria-label="Filtrer les départs"
        className="mb-5 inline-flex rounded-xl border border-border bg-card p-1"
      >
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            to="/admin/departs"
            search={{ vue: v.key }}
            role="tab"
            aria-selected={vue === v.key}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              vue === v.key ? "bg-primary text-primary-foreground" : "text-navy hover:bg-muted",
            )}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {vue === "passes" && departures.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3">
          <p className="text-sm text-amber-950">
            Ces départs sont terminés et déjà masqués sur le site.
          </p>
          <ConfirmButton
            buttonClassName={abtn.primary}
            confirmClassName={abtn.primary}
            title="Archiver tous les départs passés ?"
            confirmLabel="Archiver"
            disabled={pending}
            message={
              <p>
                {departures.length} départ{departures.length > 1 ? "s" : ""} passé
                {departures.length > 1 ? "s" : ""} seront déplacés dans l'onglet « Archivés ».
              </p>
            }
            onConfirm={async () => {
              await run(() => adminArchivePastDeparturesFn(), {
                success: (r) =>
                  `${r.archived} départ${r.archived > 1 ? "s" : ""} archivé${r.archived > 1 ? "s" : ""}.`,
              });
            }}
          >
            Archiver les départs passés
          </ConfirmButton>
        </div>
      ) : null}

      {trips.length === 0 ? (
        <EmptyState
          title="Créez d'abord un voyage"
          text="Un départ est toujours rattaché à un voyage."
          action={
            <Link to="/admin/voyages/nouveau" className={abtn.primary}>
              Nouveau voyage
            </Link>
          }
        />
      ) : departures.length === 0 ? (
        <EmptyState
          title={
            vue === "avenir"
              ? "Aucun départ à venir"
              : vue === "passes"
                ? "Aucun départ passé à archiver"
                : "Aucun départ archivé"
          }
          text={
            vue === "avenir"
              ? "Ajoutez un départ pour qu'il apparaisse sur le site avec son bouton WhatsApp."
              : undefined
          }
        />
      ) : (
        <DepartureTable departures={departures} onEdit={(d) => setEditing(d)} />
      )}

      {editing ? (
        <DepartureModal
          departure={editing === "new" ? null : editing}
          trips={tripOptions}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}
