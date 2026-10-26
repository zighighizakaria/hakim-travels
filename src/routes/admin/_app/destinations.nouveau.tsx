import { Link, createFileRoute } from "@tanstack/react-router";
import { DestinationForm } from "@/components/admin/DestinationForm";
import { BackLabel, PageHeader } from "@/components/admin/ui";
import { adminListImagesFn } from "@/functions/admin/media.functions";
import { parseUniverseParam } from "@/lib/search";
import type { Universe } from "@/lib/types";

export const Route = createFileRoute("/admin/_app/destinations/nouveau")({
  validateSearch: (search: Record<string, unknown>): { univers?: Universe | undefined } => ({
    univers: parseUniverseParam(search["univers"]),
  }),
  loader: () => adminListImagesFn(),
  component: NewDestinationPage,
});

function NewDestinationPage() {
  const images = Route.useLoaderData();
  const { univers } = Route.useSearch();
  return (
    <>
      <PageHeader
        back={
          <Link to="/admin/destinations">
            <BackLabel>Retour aux destinations</BackLabel>
          </Link>
        }
        title="Nouvelle destination"
        description="Une région du Maroc, un pays ou l'Omra. Vous pourrez ensuite y rattacher des voyages."
      />
      <DestinationForm destination={null} images={images} initialUniverse={univers ?? "maroc"} />
    </>
  );
}
