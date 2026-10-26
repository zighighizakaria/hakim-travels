import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { serveUpload } from "./serve";

const base = fs.mkdtempSync(path.join(os.tmpdir(), "ht-serve-"));
const root = path.join(base, "uploads");
fs.mkdirSync(path.join(root, "2030", "01"), { recursive: true });
fs.writeFileSync(
  path.join(root, "2030", "01", "photo.png"),
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]),
);
fs.writeFileSync(path.join(root, "2030", "01", "notes.txt"), "pas une image");
// fichier secret en dehors de la racine, que la traversée de chemin cherchera à atteindre
fs.writeFileSync(path.join(base, "secret.png"), "SECRET");
fs.writeFileSync(path.join(base, "uploads-evil.png"), "SECRET"); // préfixe commun avec « uploads »

after(() => fs.rmSync(base, { recursive: true, force: true }));

const get = (splat: string | undefined, headers: Record<string, string> = {}, method = "GET") =>
  serveUpload(splat, new Request("http://localhost/uploads/x", { method, headers }), root);

test("sert un fichier valide en streaming avec les bons en-têtes", async () => {
  const res = await get("2030/01/photo.png");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "image/png");
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.match(res.headers.get("cache-control") ?? "", /immutable/);
  assert.match(res.headers.get("cache-control") ?? "", /max-age=31536000/);
  assert.equal(res.headers.get("content-length"), "8");
  assert.ok(res.headers.get("etag"));
  assert.equal((await res.arrayBuffer()).byteLength, 8);
});

test("ETag : If-None-Match renvoie 304 sans corps", async () => {
  const first = await get("2030/01/photo.png");
  const etag = first.headers.get("etag") ?? "";
  await first.arrayBuffer();
  const res = await get("2030/01/photo.png", { "If-None-Match": etag });
  assert.equal(res.status, 304);
  assert.equal(await res.text(), "");
});

test("traversée de chemin : jamais de fichier hors de la racine", async () => {
  const attempts = [
    "../secret.png",
    "2030/../../secret.png",
    "..%2Fsecret.png",
    "%2e%2e/secret.png",
    "%2e%2e%2fsecret.png",
    "2030/01/../../../secret.png",
    "..\\secret.png",
    "2030\\01\\..\\..\\..\\secret.png",
    "/etc/passwd",
    "/secret.png",
    "C:/Windows/win.ini",
    "C:\\Windows\\win.ini",
    "../uploads-evil.png",
    "2030/01/photo.png\0.txt",
    "%00",
    "..",
    "",
  ];
  for (const attempt of attempts) {
    const res = await get(attempt);
    assert.ok(
      res.status === 400 || res.status === 404,
      `${JSON.stringify(attempt)} -> ${res.status}`,
    );
    assert.ok(!(await res.text()).includes("SECRET"));
  }
  assert.equal((await get(undefined)).status, 400);
  assert.equal((await get("%")).status, 400);
});

test("refuse les extensions non-image et les fichiers inexistants", async () => {
  assert.equal((await get("2030/01/notes.txt")).status, 404);
  assert.equal((await get("2030/01/absent.png")).status, 404);
  assert.equal((await get("2030/01")).status, 404);
});

test("GET et HEAD seulement", async () => {
  assert.equal((await get("2030/01/photo.png", {}, "HEAD")).status, 200);
  const post = await serveUpload(
    "2030/01/photo.png",
    new Request("http://localhost/uploads/x", { method: "POST" }),
    root,
  );
  assert.equal(post.status, 405);
});
