import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DemoBadge } from "@/components/admin/DemoBadge";
import { useAdminAction } from "@/components/admin/form";
import { UNIVERSE_GROUP_LABEL, UNIVERSE_ORDER } from "@/components/admin/labels";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState, PageHeader, abtn } from "@/components/admin/ui";
import {
  adminDeleteDestinationFn,
  adminListDestinationsFn,
} from "@/functions/admin/destinations.functions";
import type { AdminDestinationListItem } from "@/lib/types";

export const Route = createFileRoute("/admin/_app/destinations/")({
  loader: () => adminListDestinationsFn(),
  component: DestinationsPage,
});

function DestinationRow({ d }: { d: AdminDestinationListItem }) {
  const router = useRouter();
  const { run, pending } = useAdminAction();
  return (
    <li className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/destinations/$id"
            params={{ id: String(d.id) }}
            className="font-semibold text-navy hover:text-primary hover:underline"
          >
            {d.emoji ? <span aria-hidden="true">{d.emoji} </span> : null}
            {d.nameFr}
          </Link>
          <StatusBadge status={d.isPublished ? "published" : "hidden"} />
          {d.isFeatured ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              En avant
            </span>
          ) : null}
          {d.isDemo ? <DemoBadge /> : null}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {d.tripCount === 0
            ? "Aucun voyage rattaché"
            : `${d.tripCount} voyage${d.tripCount > 1 ? "s" : ""} rattaché${d.tripCount > 1 ? "s" : ""}`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/admin/destinations/$id" params={{ id: String(d.id) }} className={abtn.smPrimary}>
          Modifier
        </Link>
        <Link
          to="/admin/voyages/nouveau"
          search={{ destination: d.id }}
          className={abtn.smSecondary}
        >
          Ajouter un voyage
        </Link>
        {d.isPublished ? (
          <a
            href={`/destinations/${d.slug}`}
            target="_blank"
            rel="noreferrer"
            className={abtn.smSecondary}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Voir sur le site
          </a>
        ) : null}
        <ConfirmButton
          buttonClassName={abtn.smDanger}
          title="Supprimer cette destination ?"
          confirmLabel="Supprimer"
          disabled={pending}
          message={
            <p>
              « {d.nameFr} » sera supprimée définitivement. Si des voyages y sont rattachés, la
              suppression sera refusée.
            </p>
          }
          onConfirm={async () => {
            const result = await run(() => adminDeleteDestinationFn({ data: { id: d.id } }), {
              invalidate: false,
            });
            if (!result) return;
            if (result.ok) {
              toast.success("Destination supprimée.");
              await router.invalidate();
            } else {
              toast.error(
                `Suppression impossible : ${result.count} voyage${result.count > 1 ? "s sont rattachés" : " est rattaché"} à « ${d.nameFr} ». Déplacez-${result.count > 1 ? "les" : "le"} vers une autre destination ou supprimez-${result.count > 1 ? "les" : "le"} d'abord.`,
              );
            }
          }}
        >
          Supprimer
        </ConfirmButton>
      </div>
    </li>
  );
}

function DestinationsPage() {
  const destinations = Route.useLoaderData();
  return (
    <>
      <PageHeader
        title="Destinations"
        description="Les régions du Maroc, les pays à l'international et l'Omra. Chaque voyage est rattaché à une destination."
        actions={
          <Link to="/admin/destinations/nouveau" className={abtn.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouvelle destination
          </Link>
        }
      />
      {destinations.length === 0 ? (
        <EmptyState
          title="Aucune destination"
          text="Commencez par créer une région du Maroc, un pays ou l'Omra."
          action={
            <Link to="/admin/destinations/nouveau" className={abtn.primary}>
              Nouvelle destination
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {UNIVERSE_ORDER.map((universe) => {
            const group = destinations.filter((d) => d.universe === universe);
            if (group.length === 0) return null;
            return (
              <section key={universe} aria-labelledby={`grp-${universe}`}>
                <h2
                  id={`grp-${universe}`}
                  className="mb-2 font-display text-lg font-semibold text-navy"
                >
                  {UNIVERSE_GROUP_LABEL[universe]}
                </h2>
                <ul className="divide-y divide-border rounded-2xl border border-border bg-card px-5 shadow-soft">
                  {group.map((d) => (
                    <DestinationRow key={d.id} d={d} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
