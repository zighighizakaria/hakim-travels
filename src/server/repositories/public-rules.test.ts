import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { destinationInputSchema } from "@/lib/schemas";
import { saveDestination } from "./destinations.repo";
import { listUpcomingDepartures, listUpcomingMonths } from "./departures.repo";
import { getPublicTripBySlug, listPublicTrips, listSitemapEntries } from "./trips.repo";
import { freshDb, makeDeparture, makeDestination, makeTrip } from "../test-fixtures";

const TODAY = "2030-06-15";

beforeEach(() => {
  freshDb();
});

/** Remet une destination en brouillon (non publiée) en conservant son contenu. */
function unpublish(id: number, slug: string): void {
  saveDestination(
    destinationInputSchema.parse({ universe: "maroc", slug, nameFr: slug, isPublished: false }),
    id,
  );
}

test("une destination non publiée masque ses voyages et leurs départs côté public", () => {
  const visibleDest = makeDestination({ slug: "visible" });
  const hiddenDest = makeDestination({ slug: "masquee" });
  const visibleTrip = makeTrip(visibleDest, { slug: "voyage-visible" });
  const hiddenTrip = makeTrip(hiddenDest, { slug: "voyage-masque" });
  const visibleDeparture = makeDeparture(visibleTrip, { startDate: "2030-07-01" });
  makeDeparture(hiddenTrip, { startDate: "2030-07-02" });

  // Avant : tout est visible.
  assert.equal(listPublicTrips("fr", { today: TODAY }).length, 2);
  assert.equal(listUpcomingDepartures("fr", TODAY).length, 2);

  unpublish(hiddenDest, "masquee");

  assert.deepEqual(
    listPublicTrips("fr", { today: TODAY }).map((t) => t.slug),
    ["voyage-visible"],
  );
  assert.deepEqual(
    listPublicTrips("fr", { today: TODAY, destinationSlug: "masquee" }).map((t) => t.slug),
    [],
  );
  assert.equal(getPublicTripBySlug("fr", "voyage-masque", TODAY), null);
  assert.equal(getPublicTripBySlug("fr", "voyage-visible", TODAY)?.slug, "voyage-visible");
  assert.deepEqual(
    listUpcomingDepartures("fr", TODAY).map((d) => d.id),
    [visibleDeparture],
  );
  assert.deepEqual(
    listUpcomingDepartures("fr", TODAY, { destinationSlug: "masquee" }).map((d) => d.id),
    [],
  );
  assert.deepEqual(listUpcomingMonths(TODAY, { destinationSlug: "masquee" }), []);

  // Le sitemap ne référence ni la destination ni ses voyages.
  const paths = listSitemapEntries().map((e) => e.path);
  assert.ok(paths.includes("/voyages/voyage-visible"));
  assert.ok(paths.includes("/destinations/visible"));
  assert.ok(!paths.includes("/voyages/voyage-masque"));
  assert.ok(!paths.includes("/destinations/masquee"));

  // Republier la destination rend tout visible à nouveau.
  saveDestination(
    destinationInputSchema.parse({
      universe: "maroc",
      slug: "masquee",
      nameFr: "masquee",
      isPublished: true,
    }),
    hiddenDest,
  );
  assert.equal(listPublicTrips("fr", { today: TODAY }).length, 2);
  assert.equal(listUpcomingDepartures("fr", TODAY).length, 2);
});

test("le sitemap exclut les voyages brouillons", () => {
  const destination = makeDestination();
  makeTrip(destination, { slug: "brouillon", status: "draft" });
  makeTrip(destination, { slug: "publie" });
  const paths = listSitemapEntries().map((e) => e.path);
  assert.ok(paths.includes("/voyages/publie"));
  assert.ok(!paths.includes("/voyages/brouillon"));
});

test("prix « à partir de » : un départ ouvert avec 0 place restante est ignoré", () => {
  const destination = makeDestination();
  const trip = makeTrip(destination, { priceFromMad: 2000 });
  makeDeparture(trip, { startDate: "2030-07-01", priceMad: 500, seatsTotal: 20, seatsLeft: 0 });
  makeDeparture(trip, { startDate: "2030-07-02", priceMad: 900, seatsTotal: 20, seatsLeft: 4 });
  makeDeparture(trip, { startDate: "2030-07-03", priceMad: 1200 }); // places non suivies : compte

  const find = () => listPublicTrips("fr", { today: TODAY }).find((t) => t.id === trip);
  assert.equal(find()?.fromPriceMad, 900);
  // Le départ complet reste affiché dans la liste des départs.
  assert.equal(find()?.upcomingCount, 3);

  // Si seul un départ « ouvert à 0 place » existe, on retombe sur le prix indicatif du voyage.
  const only = makeTrip(destination, { priceFromMad: 1800 });
  makeDeparture(only, { startDate: "2030-07-05", priceMad: 400, seatsTotal: 10, seatsLeft: 0 });
  const onlyCard = listPublicTrips("fr", { today: TODAY }).find((t) => t.id === only);
  assert.equal(onlyCard?.fromPriceMad, 1800);
});
