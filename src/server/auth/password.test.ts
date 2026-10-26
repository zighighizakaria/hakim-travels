import assert from "node:assert/strict";
import { test } from "node:test";
import { generatePassword, hashPassword, verifyPassword } from "./password";

test("hashPassword produit un hash scrypt$N$r$p$sel$hash", async () => {
  const hash = await hashPassword("un-mot-de-passe-solide");
  const parts = hash.split("$");
  assert.equal(parts.length, 6);
  assert.deepEqual(parts.slice(0, 4), ["scrypt", "16384", "8", "1"]);
  assert.ok(!hash.includes("un-mot-de-passe-solide"));
});

test("verifyPassword accepte le bon mot de passe et refuse le mauvais", async () => {
  const hash = await hashPassword("Bonjour2026!");
  assert.equal(await verifyPassword("Bonjour2026!", hash), true);
  assert.equal(await verifyPassword("bonjour2026!", hash), false);
  assert.equal(await verifyPassword("", hash), false);
});

test("deux hashs du même mot de passe diffèrent (sel aléatoire)", async () => {
  const [a, b] = await Promise.all([hashPassword("identique"), hashPassword("identique")]);
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("identique", a), true);
  assert.equal(await verifyPassword("identique", b), true);
});

test("verifyPassword refuse les formats invalides sans lever d'erreur", async () => {
  assert.equal(await verifyPassword("x", ""), false);
  assert.equal(await verifyPassword("x", "bcrypt$1$2$3$a$b"), false);
  assert.equal(await verifyPassword("x", "scrypt$16384$8$1$onlyfive"), false);
  assert.equal(await verifyPassword("x", "scrypt$abc$8$1$c2VsCg==$aGFzaAo="), false);
  // paramètres démesurés : refusés avant tout calcul
  assert.equal(await verifyPassword("x", "scrypt$1073741824$8$1$c2VsCg==$aGFzaAo="), false);
});

test("les mots de passe Unicode (arabe) sont normalisés et vérifiables", async () => {
  const hash = await hashPassword("كلمة-سر-قوية-123");
  assert.equal(await verifyPassword("كلمة-سر-قوية-123", hash), true);
  assert.equal(await verifyPassword("كلمة-سر-قوية-124", hash), false);
});

test("generatePassword respecte la longueur et varie", () => {
  const a = generatePassword(24);
  assert.equal(a.length, 24);
  assert.match(a, /^[A-Za-z0-9]+$/);
  assert.notEqual(a, generatePassword(24));
});
