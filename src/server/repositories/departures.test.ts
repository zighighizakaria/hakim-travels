import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  archivePastDepartures,
  listUpcomingDepartures,
  listUpcomingMonths,
  setDepartureArchived,
} from "./departures.repo";
import { getPublicTripBySlug, listPublicTrips } from "./trips.repo";
import { freshDb, makeDeparture, makeDestination, makeTrip } from "../test-fixtures";

const TODAY = "2030-06-15";

beforeEach(() => {
  freshDb();
});

test("règles de visibilité : seuls les départs à venir, non archivés, non annulés d'un voyage publié sont publics", () => {
  const destination = makeDestination();
  const trip = makeTrip(destination);
  const draftTrip = makeTrip(destination, { status: "draft" });

  const today = makeDeparture(trip, { startDate: TODAY, endDate: TODAY });
  const past = makeDeparture(trip, { startDate: "2030-06-14", endDate: "2030-06-14" });
  const archived = makeDeparture(trip, { startDate: "2030-06-20", endDate: "2030-06-21" });
  setDepartureArchived(archived, true);
  const cancelled = makeDeparture(trip, {
    startDate: "2030-06-22",
    endDate: "2030-06-23",
    status: "cancelled",
  });
  const onDraft = makeDeparture(draftTrip, { startDate: "2030-06-25", endDate: "2030-06-26" });
  const future = makeDeparture(trip, { startDate: "2030-08-01", endDate: "2030-08-03" });

  const ids = listUpcomingDepartures("fr", TODAY).map((d) => d.id);
  assert.deepEqual(ids, [today, future]);
  for (const hidden of [past, archived, cancelled, onDraft]) assert.ok(!ids.includes(hidden));
});

test("un départ ouvert sans place restante s'affiche « complet »", () => {
  const trip = makeTrip(makeDestination());
  const soldOut = makeDeparture(trip, { startDate: "2030-07-01", seatsTotal: 20, seatsLeft: 0 });
  const flaggedFull = makeDeparture(trip, { startDate: "2030-07-02", status: "full" });
  const open = makeDeparture(trip, { startDate: "2030-07-03", seatsTotal: 20, seatsLeft: 5 });

  const byId = new Map(listUpcomingDepartures("fr", TODAY).map((d) => [d.id, d]));
  assert.equal(byId.get(soldOut)?.status, "full");
  assert.equal(byId.get(flaggedFull)?.status, "full");
  assert.equal(byId.get(open)?.status, "open");
});

test("prix « à partir de » : MIN des départs visibles ouverts, sinon prix du voyage, sinon null", () => {
  const destination = makeDestination();
  const withDepartures = makeTrip(destination, { priceFromMad: 1000 });
  makeDeparture(withDepartures, { startDate: "2030-07-01", priceMad: 900 });
  makeDeparture(withDepartures, { startDate: "2030-07-02", priceMad: 800 });
  makeDeparture(withDepartures, { startDate: "2030-07-03", priceMad: 300, status: "cancelled" });
  makeDeparture(withDepartures, { startDate: "2030-07-04", priceMad: 200, status: "full" });
  makeDeparture(withDepartures, { startDate: "2030-06-01", endDate: "2030-06-02", priceMad: 100 });

  const fallback = makeTrip(destination, { priceFromMad: 1500 });
  const onRequest = makeTrip(destination);

  const byId = new Map(listPublicTrips("fr", { today: TODAY }).map((t) => [t.id, t]));
  assert.equal(byId.get(withDepartures)?.fromPriceMad, 800);
  assert.equal(byId.get(withDepartures)?.upcomingCount, 3); // 07-01, 07-02 et le « full » du 07-04
  assert.equal(byId.get(fallback)?.fromPriceMad, 1500);
  assert.equal(byId.get(onRequest)?.fromPriceMad, null);
});

test("un voyage brouillon n'est visible ni en liste ni en fiche", () => {
  const destination = makeDestination();
  const draft = makeTrip(destination, { slug: "brouillon", status: "draft" });
  makeDeparture(draft, { startDate: "2030-07-01" });
  const published = makeTrip(destination, { slug: "publie" });

  assert.deepEqual(
    listPublicTrips("fr", { today: TODAY }).map((t) => t.id),
    [published],
  );
  assert.equal(getPublicTripBySlug("fr", "brouillon", TODAY), null);
  assert.equal(getPublicTripBySlug("fr", "inconnu", TODAY), null);
  assert.equal(getPublicTripBySlug("fr", "publie", TODAY)?.slug, "publie");
});

test("la fiche voyage ne liste que les départs visibles à la date donnée", () => {
  const trip = makeTrip(makeDestination(), { slug: "fiche" });
  makeDeparture(trip, { startDate: "2030-06-01", endDate: "2030-06-02" });
  const upcoming = makeDeparture(trip, { startDate: "2030-07-10", endDate: "2030-07-12" });

  const detail = getPublicTripBySlug("fr", "fiche", TODAY);
  assert.deepEqual(
    detail?.departures.map((d) => d.id),
    [upcoming],
  );
  // une semaine plus tard, le départ a disparu sans aucune tâche planifiée
  assert.equal(getPublicTripBySlug("fr", "fiche", "2030-07-11")?.departures.length, 0);
});

test("filtres par univers, destination et mois ; mois disponibles", () => {
  const maroc = makeDestination({ universe: "maroc", slug: "nord" });
  const intl = makeDestination({ universe: "international", slug: "turquie" });
  const a = makeDeparture(makeTrip(maroc), { startDate: "2030-07-05", endDate: "2030-07-06" });
  const b = makeDeparture(makeTrip(intl), { startDate: "2030-09-05", endDate: "2030-09-10" });

  assert.deepEqual(
    listUpcomingDepartures("fr", TODAY, { universe: "maroc" }).map((d) => d.id),
    [a],
  );
  assert.deepEqual(
    listUpcomingDepartures("fr", TODAY, { destinationSlug: "turquie" }).map((d) => d.id),
    [b],
  );
  assert.deepEqual(
    listUpcomingDepartures("fr", TODAY, { month: "2030-09" }).map((d) => d.id),
    [b],
  );
  assert.deepEqual(listUpcomingMonths(TODAY), ["2030-07", "2030-09"]);
  assert.deepEqual(listUpcomingMonths(TODAY, { universe: "international" }), ["2030-09"]);
  assert.equal(listUpcomingDepartures("fr", TODAY, { limit: 1 }).length, 1);
});

test("archivePastDepartures archive uniquement les départs passés non archivés", () => {
  const trip = makeTrip(makeDestination());
  makeDeparture(trip, { startDate: "2030-06-01", endDate: "2030-06-02" });
  makeDeparture(trip, { startDate: "2030-06-10", endDate: "2030-06-11" });
  const future = makeDeparture(trip, { startDate: "2030-07-01" });

  assert.equal(archivePastDepartures(TODAY), 2);
  assert.equal(archivePastDepartures(TODAY), 0);
  assert.deepEqual(
    listUpcomingDepartures("fr", TODAY).map((d) => d.id),
    [future],
  );
});
