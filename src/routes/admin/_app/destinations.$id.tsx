import { Link, createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DemoBadge } from "@/components/admin/DemoBadge";
import { DestinationForm } from "@/components/admin/DestinationForm";
import { useAdminAction } from "@/components/admin/form";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BackLabel, PageHeader, abtn } from "@/components/admin/ui";
import {
  adminDeleteDestinationFn,
  adminGetDestinationFn,
} from "@/functions/admin/destinations.functions";
import { adminListImagesFn } from "@/functions/admin/media.functions";

export const Route = createFileRoute("/admin/_app/destinations/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) throw notFound();
    const [destination, images] = await Promise.all([
      adminGetDestinationFn({ data: { id } }),
      adminListImagesFn(),
    ]);
    return { destination, images };
  },
  component: EditDestinationPage,
});

function EditDestinationPage() {
  const { destination, images } = Route.useLoaderData();
  const router = useRouter();
  const { run, pending } = useAdminAction();

  return (
    <>
      <PageHeader
        back={
          <Link to="/admin/destinations">
            <BackLabel>Retour aux destinations</BackLabel>
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-3">
            {destination.emoji ? <span aria-hidden="true">{destination.emoji}</span> : null}
            {destination.nameFr}
            <StatusBadge status={destination.isPublished ? "published" : "hidden"} />
            {destination.isDemo ? <DemoBadge /> : null}
          </span>
        }
        actions={
          <>
            {destination.isPublished ? (
              <a
                href={`/destinations/${destination.slug}`}
                target="_blank"
                rel="noreferrer"
                className={abtn.secondary}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Voir sur le site
              </a>
            ) : null}
            <Link
              to="/admin/voyages/nouveau"
              search={{ destination: destination.id }}
              className={abtn.secondary}
            >
              Ajouter un voyage
            </Link>
            <ConfirmButton
              title="Supprimer cette destination ?"
              confirmLabel="Supprimer"
              disabled={pending}
              message={
                <p>
                  « {destination.nameFr} » sera supprimée définitivement. Si des voyages y sont
                  rattachés, la suppression sera refusée.
                </p>
              }
              onConfirm={async () => {
                const result = await run(
                  () => adminDeleteDestinationFn({ data: { id: destination.id } }),
                  { invalidate: false },
                );
                if (!result) return;
                if (result.ok) {
                  toast.success("Destination supprimée.");
                  await router.navigate({ to: "/admin/destinations" });
                  await router.invalidate();
                } else {
                  toast.error(
                    `Suppression impossible : ${result.count} voyage${result.count > 1 ? "s sont rattachés" : " est rattaché"} à cette destination. Déplacez-${result.count > 1 ? "les" : "le"} vers une autre destination ou supprimez-${result.count > 1 ? "les" : "le"} d'abord.`,
                  );
                }
              }}
            >
              Supprimer
            </ConfirmButton>
          </>
        }
      />
      <DestinationForm key={destination.id} destination={destination} images={images} />
    </>
  );
}
