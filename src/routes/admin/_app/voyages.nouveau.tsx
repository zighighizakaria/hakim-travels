import { Link, createFileRoute } from "@tanstack/react-router";
import { BackLabel, PageHeader } from "@/components/admin/ui";
import { TripForm } from "@/components/admin/TripForm";
import { adminListDestinationsFn } from "@/functions/admin/destinations.functions";
import { adminListImagesFn } from "@/functions/admin/media.functions";

type Search = { destination?: number | undefined };

export const Route = createFileRoute("/admin/_app/voyages/nouveau")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const n = Number(search["destination"]);
    return { destination: Number.isInteger(n) && n > 0 ? n : undefined };
  },
  loader: async () => {
    const [destinations, images] = await Promise.all([
      adminListDestinationsFn(),
      adminListImagesFn(),
    ]);
    return { destinations, images };
  },
  component: NewTripPage,
});

function NewTripPage() {
  const { destinations, images } = Route.useLoaderData();
  const { destination } = Route.useSearch();
  return (
    <>
      <PageHeader
        back={
          <Link to="/admin/voyages">
            <BackLabel>Retour aux voyages</BackLabel>
          </Link>
        }
        title="Nouveau voyage"
        description="Remplissez les informations du voyage. Il sera enregistré en brouillon : vous le publierez quand il sera prêt."
      />
      <TripForm
        trip={null}
        destinations={destinations}
        images={images}
        initialDestinationId={destination ?? null}
      />
    </>
  );
}
