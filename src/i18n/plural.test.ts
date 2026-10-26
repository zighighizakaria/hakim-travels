import assert from "node:assert/strict";
import { test } from "node:test";
import { ar } from "./dictionaries/ar";
import { fr } from "./dictionaries/fr";
import { pluralize } from "./plural";

test("pluriel arabe : 1, 2, 3-10, 11 et plus", () => {
  const f = ar.departuresPage.count;
  assert.equal(pluralize("ar", 1, f), "رحلة واحدة");
  assert.equal(pluralize("ar", 2, f), "رحلتان");
  assert.equal(pluralize("ar", 3, f), "3 رحلات");
  assert.equal(pluralize("ar", 10, f), "10 رحلات");
  assert.equal(pluralize("ar", 11, f), "11 رحلة");
  assert.equal(pluralize("ar", 15, f), "15 رحلة");
  assert.equal(pluralize("ar", 100, f), "100 رحلة");
  assert.equal(pluralize("ar", 0, f), "0 رحلة");
});

test("pluriel français : 0 et 1 au singulier", () => {
  const f = fr.departuresPage.count;
  assert.equal(pluralize("fr", 0, f), "0 départ");
  assert.equal(pluralize("fr", 1, f), "1 départ");
  assert.equal(pluralize("fr", 2, f), "2 départs");
});

test("la marque arabe est écrite « حكيم ترافلز »", () => {
  assert.equal(ar.meta.siteName, "حكيم ترافلز");
  assert.ok(!JSON.stringify(ar).includes("هاكيم"));
});
