import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { loc, locText } from "../db/sql";
import { getDb } from "../db/client";
import { listUpcomingDepartures } from "./departures.repo";
import { getPublicDestinationBySlug, listPublicDestinations } from "./destinations.repo";
import { getPublicTripBySlug } from "./trips.repo";
import { freshDb, makeDeparture, makeDestination, makeTrip } from "../test-fixtures";

beforeEach(() => {
  freshDb();
});

test("loc : la valeur _ar si elle n'est pas vide, sinon _fr", () => {
  const row = {
    name_fr: "Nord",
    name_ar: "الشمال",
    tagline_fr: "Bleu",
    tagline_ar: null,
    intro_fr: "Texte",
    intro_ar: "   ",
  };
  assert.equal(loc(row, "name", "ar"), "الشمال");
  assert.equal(loc(row, "name", "fr"), "Nord");
  assert.equal(loc(row, "tagline", "ar"), "Bleu");
  assert.equal(loc(row, "intro", "ar"), "Texte");
  assert.equal(loc(row, "absent", "ar"), null);
  assert.equal(locText(row, "absent", "fr"), "");
});

test("destination : repli AR -> FR champ par champ", () => {
  makeDestination({
    slug: "nord",
    nameFr: "Nord",
    nameAr: "الشمال",
    taglineFr: "Médinas bleues",
    teaserFr: "Teaser FR",
    teaserAr: "ملخص",
    highlights: [
      { textFr: "Médina bleue", textAr: "المدينة الزرقاء" },
      { textFr: "Cascades", textAr: null },
    ],
    faqs: [{ questionFr: "Question ?", questionAr: null, answerFr: "Réponse", answerAr: "جواب" }],
  });

  const ar = getPublicDestinationBySlug("ar", "nord");
  assert.equal(ar?.name, "الشمال");
  assert.equal(ar?.tagline, "Médinas bleues"); // pas de tagline_ar : repli FR
  assert.equal(ar?.teaser, "ملخص");
  assert.deepEqual(
    ar?.highlights.map((h) => h.text),
    ["المدينة الزرقاء", "Cascades"],
  );
  assert.deepEqual(ar?.faq, [{ question: "Question ?", answer: "جواب" }]);

  const fr = getPublicDestinationBySlug("fr", "nord");
  assert.equal(fr?.name, "Nord");
  assert.equal(fr?.teaser, "Teaser FR");
  assert.deepEqual(
    fr?.highlights.map((h) => h.text),
    ["Médina bleue", "Cascades"],
  );
});

test("une valeur _ar blanche (espaces) retombe sur le français", () => {
  makeDestination({ slug: "sud", nameFr: "Sud", nameAr: "الجنوب" });
  getDb().prepare("UPDATE destinations SET name_ar = '   ' WHERE slug = 'sud'").run();
  assert.equal(listPublicDestinations("ar")[0]?.name, "Sud");
});

test("voyage et départ : repli AR -> FR", () => {
  const destination = makeDestination({ slug: "d", nameFr: "Destination", nameAr: "وجهة" });
  const trip = makeTrip(destination, {
    slug: "voyage",
    titleFr: "Titre FR",
    titleAr: "عنوان",
    teaserFr: "Teaser",
    whatsappMessageFr: "Bonjour {trip}",
  });
  makeDeparture(trip, {
    startDate: "2030-07-01",
    departureCityFr: "Casablanca",
    departureCityAr: "الدار البيضاء",
  });
  makeDeparture(trip, { startDate: "2030-07-02", departureCityFr: "Rabat" });

  const ar = getPublicTripBySlug("ar", "voyage", "2030-06-15");
  assert.equal(ar?.title, "عنوان");
  assert.equal(ar?.teaser, "Teaser"); // pas de teaser_ar
  assert.equal(ar?.destination.name, "وجهة");
  assert.equal(ar?.whatsappMessage, "Bonjour {trip}"); // message FR faute d'AR
  assert.deepEqual(
    ar?.departures.map((d) => d.departureCity),
    ["الدار البيضاء", "Rabat"],
  );

  const rows = listUpcomingDepartures("ar", "2030-06-15");
  assert.equal(rows[0]?.tripTitle, "عنوان");
  assert.equal(listUpcomingDepartures("fr", "2030-06-15")[0]?.tripTitle, "Titre FR");
});
