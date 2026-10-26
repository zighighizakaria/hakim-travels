import assert from "node:assert/strict";
import { test } from "node:test";
import { buildRobotsTxt, buildSitemapXml } from "./sitemap";

const SITE = "https://www.exemple.ma";

test("sitemap : URLs absolues, paires hreflang fr/ar/x-default, aucune URL admin", () => {
  const xml = buildSitemapXml(SITE, [
    { path: "/voyages/merzouga", updatedAt: "2030-06-15 10:00:00" },
    { path: "/destinations/sud", updatedAt: "2030-06-01 08:00:00" },
  ]);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes(`<loc>${SITE}/</loc>`));
  assert.ok(xml.includes(`<loc>${SITE}/ar</loc>`));
  assert.ok(xml.includes(`<loc>${SITE}/voyages/merzouga</loc>`));
  assert.ok(xml.includes(`<loc>${SITE}/ar/voyages/merzouga</loc>`));
  assert.ok(xml.includes('hreflang="x-default" href="https://www.exemple.ma/voyages/merzouga"'));
  assert.ok(xml.includes("<lastmod>2030-06-15</lastmod>"));
  assert.ok(!xml.includes("/admin"));
  // pages légales noindex : absentes
  assert.ok(!xml.includes("mentions-legales"));
  // chaque <loc> est absolu
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g))
    assert.ok(m[1]!.startsWith(`${SITE}/`) || m[1] === SITE);
  // 10 pages statiques + 2 entrées, chacune en 2 langues
  assert.equal((xml.match(/<url>/g) ?? []).length, (10 + 2) * 2);
});

test("robots.txt : Allow /, Disallow /admin, Sitemap absolu", () => {
  const txt = buildRobotsTxt(SITE);
  assert.ok(txt.includes("Allow: /\n"));
  assert.ok(txt.includes("Disallow: /admin\n"));
  assert.ok(txt.includes(`Sitemap: ${SITE}/sitemap.xml`));
});
