import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDuration, formatPrice } from "./format";
import {
  buildDepartureMessage,
  buildTripMessage,
  fillTemplate,
  normalizeWhatsappNumber,
  whatsappUrl,
} from "./whatsapp";

test("whatsappUrl : numéro nettoyé et message encodé", () => {
  assert.equal(whatsappUrl("+212 6 25 77 64 85"), "https://wa.me/212625776485");
  const url = whatsappUrl("212625776485", "Bonjour & merci : 100% ok ?");
  assert.equal(
    url,
    "https://wa.me/212625776485?text=Bonjour%20%26%20merci%20%3A%20100%25%20ok%20%3F",
  );
  assert.equal(new URL(url).searchParams.get("text"), "Bonjour & merci : 100% ok ?");
});

test("normalizeWhatsappNumber refuse les valeurs trop courtes", () => {
  assert.equal(normalizeWhatsappNumber("06 25"), null);
  assert.equal(normalizeWhatsappNumber(null), null);
  assert.equal(normalizeWhatsappNumber("+212625776485"), "212625776485");
});

test("fillTemplate remplace les variables, vide les absentes", () => {
  assert.equal(
    fillTemplate("Voyage {trip} le {start}.", { trip: "Ouzoud", start: "7 juillet" }),
    "Voyage Ouzoud le 7 juillet.",
  );
  assert.equal(
    fillTemplate("Prix : {price} {url}", { url: "https://x.ma/v" }),
    "Prix : https://x.ma/v",
  );
  assert.equal(fillTemplate("{inconnu} reste", { trip: "x" }), "{inconnu} reste");
});

test("buildTripMessage : le message propre au voyage remplace le modèle", () => {
  const template = "Bonjour, le voyage {trip} m'intéresse : {url}";
  assert.equal(
    buildTripMessage({ template, trip: "Ouzoud", url: "https://x.ma/voyages/ouzoud" }),
    "Bonjour, le voyage Ouzoud m'intéresse : https://x.ma/voyages/ouzoud",
  );
  assert.equal(
    buildTripMessage({ template, override: "Salam, {trip} !", trip: "Ouzoud" }),
    "Salam, Ouzoud !",
  );
  assert.equal(
    buildTripMessage({ template, override: "   ", trip: "Ouzoud" }),
    "Bonjour, le voyage Ouzoud m'intéresse :",
  );
});

test("buildDepartureMessage en arabe : texte intact après encodage", () => {
  const template =
    "السلام عليكم، أرغب في حجز {trip} المنطلقة من {city} بتاريخ {start} إلى {end}، بسعر {price}. {url}";
  const message = buildDepartureMessage({
    template,
    trip: "شلالات أوزود",
    start: "7 يوليوز 2030",
    end: "8 يوليوز 2030",
    city: "الدار البيضاء",
    price: formatPrice(250, "ar"),
    url: "https://exemple.ma/ar/voyages/cascades-ouzoud",
  });
  assert.match(message, /شلالات أوزود/);
  assert.match(message, /250 درهم/);
  const url = whatsappUrl("212625776485", message);
  assert.ok(/^[\x21-\x7e]+$/.test(url), "l'URL ne contient que de l'ASCII imprimable");
  assert.equal(new URL(url).searchParams.get("text"), message);
});

test("formatPrice et formatDuration (FR et AR)", () => {
  assert.equal(formatPrice(null, "fr"), null);
  assert.match(formatPrice(1900, "fr") ?? "", /^1\s900 MAD$/);
  assert.match(formatPrice(1900, "ar") ?? "", /^1\s900 درهم$/);
  assert.equal(formatDuration(2, 1, "fr"), "2 jours / 1 nuit");
  assert.equal(formatDuration(1, null, "fr"), "1 jour");
  assert.equal(formatDuration(null, null, "fr"), null);
  assert.equal(formatDuration(2, 1, "ar"), "يومان / ليلة واحدة");
  assert.equal(formatDuration(4, 3, "ar"), "4 أيام / 3 ليالٍ");
});

test("buildDepartureMessage : un message de voyage sans {start} ne masque pas le départ", () => {
  const base = {
    template: "Réserver {trip} le {start} depuis {city}",
    trip: "Ouzoud",
    start: "7 juillet",
    city: "Rabat",
  };
  assert.equal(
    buildDepartureMessage({ ...base, override: "Infos sur {trip} svp" }),
    "Réserver Ouzoud le 7 juillet depuis Rabat",
  );
  assert.equal(
    buildDepartureMessage({ ...base, override: "Je veux {trip} du {start}" }),
    "Je veux Ouzoud du 7 juillet",
  );
});
