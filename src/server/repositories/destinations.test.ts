import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { DomainError, get } from "../db/sql";
import { deleteDestination, adminGetDestination } from "./destinations.repo";
import { deleteTrip } from "./trips.repo";
import { freshDb, makeDestination, makeTrip } from "../test-fixtures";

let db: ReturnType<typeof freshDb>;

beforeEach(() => {
  db = freshDb();
});

test("deleteDestination : la clé étrangère RESTRICT protège une destination qui a des voyages", () => {
  const destination = makeDestination({ slug: "avec-voyages" });
  makeTrip(destination);
  makeTrip(destination);

  // au niveau SQL : contrainte RESTRICT
  assert.throws(
    () => db.prepare("DELETE FROM destinations WHERE id = ?").run(destination),
    /FOREIGN KEY/,
  );

  // au niveau repository : refus propre, avec le nombre de voyages
  assert.deepEqual(deleteDestination(destination), { ok: false, reason: "has_trips", count: 2 });
  assert.ok(adminGetDestination(destination));
});

test("deleteDestination : suppression possible une fois les voyages retirés, items et FAQ en cascade", () => {
  const destination = makeDestination({
    slug: "vide",
    highlights: [{ textFr: "Point fort" }],
    faqs: [{ questionFr: "Q ?", answerFr: "R" }],
  });
  const trip = makeTrip(destination);
  assert.equal(deleteDestination(destination).ok, false);

  deleteTrip(trip);
  assert.deepEqual(deleteDestination(destination), { ok: true });
  assert.equal(adminGetDestination(destination), null);
  assert.equal(get<{ n: number }>(db, "SELECT COUNT(*) AS n FROM destination_items")?.n, 0);
  assert.equal(get<{ n: number }>(db, "SELECT COUNT(*) AS n FROM faqs")?.n, 0);
});

test("un slug déjà utilisé est refusé avec un message lisible", () => {
  makeDestination({ slug: "doublon" });
  assert.throws(
    () => makeDestination({ slug: "doublon" }),
    (error: unknown) => error instanceof DomainError && error.code === "slug_taken",
  );
});
