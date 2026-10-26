import { Link, createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DemoBadge } from "@/components/admin/DemoBadge";
import { useAdminAction } from "@/components/admin/form";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TripForm } from "@/components/admin/TripForm";
import { BackLabel, PageHeader, abtn } from "@/components/admin/ui";
import { adminListDeparturesFn } from "@/functions/admin/departures.functions";
import { adminListDestinationsFn } from "@/functions/admin/destinations.functions";
import { adminListImagesFn } from "@/functions/admin/media.functions";
import {
  adminDeleteTripFn,
  adminDuplicateTripFn,
  adminGetTripFn,
} from "@/functions/admin/trips.functions";

export const Route = createFileRoute("/admin/_app/voyages/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) throw notFound();
    const [trip, destinations, images, upcoming, past, archived] = await Promise.all([
      adminGetTripFn({ data: { id } }),
      adminListDestinationsFn(),
      adminListImagesFn(),
      adminListDeparturesFn({ data: { view: "upcoming", tripId: id } }),
      adminListDeparturesFn({ data: { view: "past", tripId: id } }),
      adminListDeparturesFn({ data: { view: "archived", tripId: id } }),
    ]);
    return { trip, destinations, images, departures: { upcoming, past, archived } };
  },
  component: EditTripPage,
});

function EditTripPage() {
  const { trip, destinations, images, departures } = Route.useLoaderData();
  const router = useRouter();
  const { run, pending } = useAdminAction();

  return (
    <>
      <PageHeader
        back={
          <Link to="/admin/voyages">
            <BackLabel>Retour aux voyages</BackLabel>
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-3">
            {trip.titleFr}
            <StatusBadge status={trip.status} />
            {trip.isDemo ? <DemoBadge /> : null}
          </span>
        }
        actions={
          <>
            {trip.status === "published" ? (
              <a
                href={`/voyages/${trip.slug}`}
                target="_blank"
                rel="noreferrer"
                className={abtn.secondary}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Voir sur le site
              </a>
            ) : null}
            <button
              type="button"
              className={abtn.secondary}
              disabled={pending}
              onClick={async () => {
                const copy = await run(() => adminDuplicateTripFn({ data: { id: trip.id } }), {
                  success: "Voyage dupliqué en brouillon.",
                });
                if (copy) {
                  await router.navigate({
                    to: "/admin/voyages/$id",
                    params: { id: String(copy.id) },
                  });
                }
              }}
            >
              Dupliquer
            </button>
            <ConfirmButton
              title="Supprimer ce voyage ?"
              confirmLabel="Supprimer le voyage"
              disabled={pending}
              message={
                <>
                  <p>
                    « {trip.titleFr} » sera supprimé définitivement, avec son programme, sa FAQ et
                    tous ses départs.
                  </p>
                  <p className="mt-2 font-semibold">Cette action est irréversible.</p>
                </>
              }
              onConfirm={async () => {
                const done = await run(() => adminDeleteTripFn({ data: { id: trip.id } }), {
                  success: "Voyage supprimé.",
                  invalidate: false,
                });
                if (done) {
                  await router.navigate({ to: "/admin/voyages" });
                  await router.invalidate();
                }
              }}
            >
              Supprimer
            </ConfirmButton>
          </>
        }
      />
      <TripForm
        key={trip.id}
        trip={trip}
        destinations={destinations}
        images={images}
        departures={departures}
      />
    </>
  );
}
