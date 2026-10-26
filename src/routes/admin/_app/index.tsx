import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CalendarDays, Images, MapPin, Plane, Star } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { useAdminAction } from "@/components/admin/form";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, EmptyState, PageHeader, abtn } from "@/components/admin/ui";
import { adminDashboardFn, adminDeleteDemoDataFn } from "@/functions/admin/dashboard.functions";
import { adminArchivePastDeparturesFn } from "@/functions/admin/departures.functions";
import { formatDateRange, formatPrice } from "@/lib/format";
import type { AdminDeparture } from "@/lib/types";

export const Route = createFileRoute("/admin/_app/")({
  loader: () => adminDashboardFn(),
  component: Dashboard,
});

const plural = (n: number, one: string, many = `${one}s`) => (n > 1 ? many : one);

function DepartureLine({ d }: { d: AdminDeparture }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
      <div className="min-w-0">
        <Link
          to="/admin/voyages/$id"
          params={{ id: String(d.tripId) }}
          className="block truncate font-semibold text-navy hover:text-primary hover:underline"
        >
          {d.tripTitle}
        </Link>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(d.startDate, d.endDate, "fr")} - départ de {d.departureCityFr}
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm">
        {d.seatsLeft !== null ? (
          <span className="font-semibold text-navy">
            {d.seatsLeft} {plural(d.seatsLeft, "place")}
          </span>
        ) : null}
        <span className="text-muted-foreground">
          {formatPrice(d.priceMad, "fr") ?? "Prix sur demande"}
        </span>
        <StatusBadge status={d.status === "open" && d.seatsLeft === 0 ? "full" : d.status} />
      </div>
    </li>
  );
}

function Dashboard() {
  const data = Route.useLoaderData();
  const { run, pending } = useAdminAction();
  const { counts, demo } = data;
  const hasDemo = demo.trips + demo.destinations + demo.images > 0;

  const stats = [
    {
      label: "Voyages",
      value: counts.trips,
      hint: `${counts.publishedTrips} ${plural(counts.publishedTrips, "publié")}`,
      icon: Plane,
      to: "/admin/voyages" as const,
    },
    {
      label: "Départs à venir",
      value: counts.upcomingDepartures,
      hint: "non annulés",
      icon: CalendarDays,
      to: "/admin/departs" as const,
    },
    {
      label: "Destinations",
      value: counts.destinations,
      hint: "régions et pays",
      icon: MapPin,
      to: "/admin/destinations" as const,
    },
    {
      label: "Avis clients",
      value: counts.reviews,
      hint: "au total",
      icon: Star,
      to: "/admin/avis" as const,
    },
    {
      label: "Images",
      value: counts.images,
      hint: "dans la bibliothèque",
      icon: Images,
      to: "/admin/medias" as const,
    },
  ];

  const archivedLabel = (n: number) => `${n} ${plural(n, "départ")} ${plural(n, "archivé")}.`;

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activité : voyages, prochains départs et points à vérifier."
        actions={
          <>
            <Link to="/admin/voyages/nouveau" className={abtn.primary}>
              Nouveau voyage
            </Link>
            <Link to="/admin/departs" className={abtn.secondary}>
              Gérer les départs
            </Link>
          </>
        }
      />

      <ul className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              to={s.to}
              className="block rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-primary/50"
            >
              <s.icon className="h-5 w-5 text-turquoise" aria-hidden="true" />
              <p className="mt-2 font-display text-3xl font-bold text-navy">{s.value}</p>
              <p className="text-sm font-semibold text-navy">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </Link>
          </li>
        ))}
      </ul>

      {data.pastUnarchived > 0 ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div>
              <p className="font-semibold text-amber-950">
                {data.pastUnarchived}{" "}
                {plural(data.pastUnarchived, "départ passé", "départs passés")} non{" "}
                {plural(data.pastUnarchived, "archivé")}
              </p>
              <p className="text-sm text-amber-900">
                Ils n'apparaissent plus sur le site. Archivez-les pour garder la liste claire.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/departs" search={{ vue: "passes" }} className={abtn.secondary}>
              Voir la liste
            </Link>
            <button
              type="button"
              disabled={pending}
              className={abtn.primary}
              onClick={() =>
                run(() => adminArchivePastDeparturesFn(), {
                  success: (r) => archivedLabel(r.archived),
                })
              }
            >
              Archiver les départs passés
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Prochains départs"
          description="Les 8 prochains départs."
          actions={
            <Link
              to="/admin/departs"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Tout voir
            </Link>
          }
        >
          {data.nextDepartures.length === 0 ? (
            <EmptyState
              title="Aucun départ à venir"
              text="Ajoutez un départ à un voyage pour qu'il apparaisse sur le site."
              action={
                <Link to="/admin/departs" className={abtn.primary}>
                  Ajouter un départ
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {data.nextDepartures.map((d) => (
                <DepartureLine key={d.id} d={d} />
              ))}
            </ul>
          )}
        </Card>

        <Card title="Places presque épuisées" description="Départs ouverts avec 3 places ou moins.">
          {data.lowSeats.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun départ n'est presque complet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.lowSeats.map((d) => (
                <DepartureLine key={d.id} d={d} />
              ))}
            </ul>
          )}
        </Card>
      </div>

      {hasDemo ? (
        <Card
          className="mt-6"
          title="Données de démonstration"
          description="Le site contient des exemples pour montrer son fonctionnement. Supprimez-les quand vous êtes prêt à publier vos propres contenus."
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-foreground">
              {demo.trips} {plural(demo.trips, "voyage")}, {demo.destinations}{" "}
              {plural(demo.destinations, "destination")} et {demo.images}{" "}
              {plural(demo.images, "image")} de démonstration.
            </p>
            <ConfirmButton
              title="Supprimer les données de démonstration ?"
              confirmLabel="Oui, tout supprimer"
              disabled={pending}
              message={
                <>
                  <p>
                    Cela supprime {demo.trips} {plural(demo.trips, "voyage")}, {demo.destinations}{" "}
                    {plural(demo.destinations, "destination")} et {demo.images}{" "}
                    {plural(demo.images, "image")} de démonstration, avec leurs départs.
                  </p>
                  <p className="mt-2 font-semibold">
                    Vos propres contenus ne sont pas touchés. Cette action est définitive.
                  </p>
                </>
              }
              onConfirm={async () => {
                await run(() => adminDeleteDemoDataFn(), {
                  success: (r) =>
                    `Données de démonstration supprimées (${r.trips} ${plural(r.trips, "voyage")}, ${r.destinations} ${plural(r.destinations, "destination")}, ${r.images} ${plural(r.images, "image")}).`,
                });
              }}
            >
              Supprimer les données de démonstration
            </ConfirmButton>
          </div>
        </Card>
      ) : null}
    </>
  );
}
