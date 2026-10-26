import assert from "node:assert/strict";
import { test } from "node:test";
import { resetEnvCache } from "../env";
import { decodeSession, encodeSession } from "./session";

process.env["SESSION_SECRET"] = "test-secret-0123456789-abcdefghijklmnop-XYZ";
process.env["SITE_URL"] ??= "http://localhost:3000";
resetEnvCache();

const now = 1_800_000_000;

test("un cookie de session encodé se relit à l'identique", () => {
  const value = encodeSession({ uid: 3, v: 2, exp: now + 60 });
  assert.deepEqual(decodeSession(value, now), { uid: 3, v: 2, exp: now + 60 });
});

test("un cookie falsifié ou expiré est refusé", () => {
  const value = encodeSession({ uid: 3, v: 2, exp: now + 60 });
  const [data, mac] = value.split(".");
  const forged = Buffer.from(JSON.stringify({ uid: 1, v: 2, exp: now + 60 })).toString("base64url");
  assert.equal(decodeSession(`${forged}.${mac}`, now), null);
  assert.equal(decodeSession(`${data}.${mac}x`, now), null);
  assert.equal(decodeSession(value, now + 61), null);
  assert.equal(decodeSession("n'importe quoi", now), null);
  assert.equal(decodeSession(undefined, now), null);
});
