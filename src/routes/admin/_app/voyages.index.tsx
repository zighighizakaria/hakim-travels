import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { ExternalLink, Plus } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DemoBadge } from "@/components/admin/DemoBadge";
import { SelectField } from "@/components/admin/Field";
import { useAdminAction } from "@/components/admin/form";
import { UNIVERSE_LABEL } from "@/components/admin/labels";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState, PageHeader, abtn } from "@/components/admin/ui";
import {
  adminDeleteTripFn,
  adminDuplicateTripFn,
  adminListTripsFn,
} from "@/functions/admin/trips.functions";
import { formatDate } from "@/lib/format";
import { parseUniverseParam } from "@/lib/search";
import type { AdminTripListItem, Universe } from "@/lib/types";

type Search = { univers?: Universe | undefined; statut?: "draft" | "published" | undefined };

export const Route = createFileRoute("/admin/_app/voyages/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    univers: parseUniverseParam(search["univers"]),
    statut:
      search["statut"] === "draft" || search["statut"] === "published"
        ? search["statut"]
        : undefined,
  }),
  loader: () => adminListTripsFn({ data: {} }),
  component: TripsPage,
});

function TripRow({ trip }: { trip: AdminTripListItem }) {
  const router = useRouter();
  const { run, pending } = useAdminAction();

  return (
    <li className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/voyages/$id"
            params={{ id: String(trip.id) }}
            className="font-semibold text-navy hover:text-primary hover:underline"
          >
            {trip.titleFr}
          </Link>
          <StatusBadge status={trip.status} />
          {trip.isFeatured ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              En avant
            </span>
          ) : null}
          {trip.isDemo ? <DemoBadge /> : null}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {UNIVERSE_LABEL[trip.universe]} - {trip.destinationName} -{" "}
          {trip.upcomingCount > 0 && trip.nextDeparture
            ? `${trip.upcomingCount} départ${trip.upcomingCount > 1 ? "s" : ""} à venir, prochain le ${formatDate(trip.nextDeparture, "fr")}`
            : "aucun départ à venir"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/admin/voyages/$id" params={{ id: String(trip.id) }} className={abtn.smPrimary}>
          Modifier
        </Link>
        {trip.status === "published" ? (
          <a
            href={`/voyages/${trip.slug}`}
            target="_blank"
            rel="noreferrer"
            className={abtn.smSecondary}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Voir sur le site
          </a>
        ) : null}
        <button
          type="button"
          className={abtn.smSecondary}
          disabled={pending}
          onClick={async () => {
            const copy = await run(() => adminDuplicateTripFn({ data: { id: trip.id } }), {
              success: "Voyage dupliqué en brouillon. Vérifiez le titre et l'adresse de la page.",
            });
            if (copy) {
              await router.navigate({ to: "/admin/voyages/$id", params: { id: String(copy.id) } });
            }
          }}
        >
          Dupliquer
        </button>
        <ConfirmButton
          buttonClassName={abtn.smDanger}
          title="Supprimer ce voyage ?"
          confirmLabel="Supprimer le voyage"
          disabled={pending}
          message={
            <>
              <p>
                « {trip.titleFr} » sera supprimé définitivement, avec son programme, sa FAQ et tous
                ses départs.
              </p>
              <p className="mt-2 font-semibold">Cette action est irréversible.</p>
            </>
          }
          onConfirm={async () => {
            await run(() => adminDeleteTripFn({ data: { id: trip.id } }), {
              success: "Voyage supprimé.",
            });
          }}
        >
          Supprimer
        </ConfirmButton>
      </div>
    </li>
  );
}

function TripsPage() {
  const trips = Route.useLoaderData();
  const { univers, statut } = Route.useSearch();
  const navigate = Route.useNavigate();

  const filtered = trips.filter(
    (t) => (!univers || t.universe === univers) && (!statut || t.status === statut),
  );

  return (
    <>
      <PageHeader
        title="Voyages"
        description="Tous les voyages de l'agence, publiés ou en brouillon."
        actions={
          <Link to="/admin/voyages/nouveau" className={abtn.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouveau voyage
          </Link>
        }
      />

      <div className="mb-5 grid gap-3 sm:max-w-xl sm:grid-cols-2">
        <SelectField
          label="Univers"
          value={univers ?? ""}
          onChange={(v) => void navigate({ search: { univers: parseUniverseParam(v), statut } })}
        >
          <option value="">Tous les univers</option>
          <option value="maroc">Maroc</option>
          <option value="international">International</option>
          <option value="omra">Omra</option>
        </SelectField>
        <SelectField
          label="Statut"
          value={statut ?? ""}
          onChange={(v) =>
            void navigate({
              search: { univers, statut: v === "draft" || v === "published" ? v : undefined },
            })
          }
        >
          <option value="">Tous les statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
        </SelectField>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          title="Aucun voyage pour le moment"
          text="Créez votre premier voyage : il restera en brouillon tant que vous ne le publiez pas."
          action={
            <Link to="/admin/voyages/nouveau" className={abtn.primary}>
              Nouveau voyage
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun voyage ne correspond à ces filtres" />
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card px-5 shadow-soft">
          {filtered.map((t) => (
            <TripRow key={t.id} trip={t} />
          ))}
        </ul>
      )}
    </>
  );
}
