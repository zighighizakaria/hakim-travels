import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { DomainError } from "../db/sql";
import { readImageSize, resolveUploadPath, saveUpload, sniffImageType } from "./storage";

const bytes = (...values: number[]) => Uint8Array.from(values);
const ascii = (text: string) => Array.from(text, (c) => c.charCodeAt(0));
const pad = (head: number[], total = 32) =>
  bytes(...head, ...new Array(Math.max(0, total - head.length)).fill(0));

const JPEG = pad([0xff, 0xd8, 0xff, 0xe0]);
const PNG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WEBP = pad([...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP"), ...ascii("VP8 ")]);
const AVIF = pad([
  0,
  0,
  0,
  0x1c,
  ...ascii("ftyp"),
  ...ascii("avif"),
  0,
  0,
  0,
  0,
  ...ascii("mif1"),
  ...ascii("avif"),
]);

test("sniffImageType reconnaît JPEG, PNG, WEBP et AVIF par leurs octets magiques", () => {
  assert.deepEqual(sniffImageType(JPEG), { mime: "image/jpeg", ext: "jpg" });
  assert.deepEqual(sniffImageType(PNG), { mime: "image/png", ext: "png" });
  assert.deepEqual(sniffImageType(WEBP), { mime: "image/webp", ext: "webp" });
  assert.deepEqual(sniffImageType(AVIF), { mime: "image/avif", ext: "avif" });
});

test("sniffImageType refuse SVG, HTML, GIF, HEIC et les fichiers trop courts", () => {
  const svg = new TextEncoder().encode(
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
  );
  const html = new TextEncoder().encode("<!doctype html><html><body>x</body></html>");
  const gif = pad(ascii("GIF89a"));
  const heic = pad([0, 0, 0, 0x18, ...ascii("ftyp"), ...ascii("heic")]);
  for (const sample of [svg, html, gif, heic, bytes(0xff, 0xd8), new Uint8Array(0)]) {
    assert.equal(sniffImageType(sample), null);
  }
});

test("le type est déterminé par les octets, pas par le nom du fichier", () => {
  // un script renommé en .jpg reste refusé
  assert.equal(
    sniffImageType(new TextEncoder().encode("<?php system($_GET['c']); ?>............")),
    null,
  );
});

test("readImageSize lit les dimensions PNG", () => {
  const png = new Uint8Array(33);
  png.set(PNG.slice(0, 8));
  const view = new DataView(png.buffer);
  view.setUint32(16, 640);
  view.setUint32(20, 480);
  assert.deepEqual(readImageSize(png, "image/png"), { width: 640, height: 480 });
  assert.equal(readImageSize(new Uint8Array(4), "image/png"), null);
});

test("resolveUploadPath refuse tout ce qui sort de la racine", () => {
  const root = path.resolve(os.tmpdir(), "ht-root");
  const ok = resolveUploadPath(root, "2030/01/a.jpg");
  assert.equal(ok, path.join(root, "2030", "01", "a.jpg"));
  for (const bad of [
    "../x.jpg",
    "a/../../x.jpg",
    "/etc/passwd",
    "C:/Windows/win.ini",
    "a\\..\\b.jpg",
    "a\0.jpg",
    "",
    "a//b.jpg",
    "./a.jpg",
    "..",
  ]) {
    assert.equal(resolveUploadPath(root, bad), null, `devrait refuser ${JSON.stringify(bad)}`);
  }
});

const dirs: string[] = [];
after(() => {
  for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
});

function tmp(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ht-upload-"));
  dirs.push(dir);
  return dir;
}

const file = (data: Uint8Array, name = "photo.jpg") => ({
  name,
  size: data.byteLength,
  arrayBuffer: async () =>
    data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer,
});

test("saveUpload écrit sous AAAA/MM/<uuid>.<ext> et renvoie un chemin relatif en /", async () => {
  const root = tmp();
  const saved = await saveUpload(file(JPEG, "Mon Image.JPG"), { uploadsDir: root, maxBytes: 1024 });
  assert.match(saved.path, /^\d{4}\/\d{2}\/[0-9a-f-]{36}\.jpg$/);
  assert.equal(saved.mime, "image/jpeg");
  assert.equal(saved.originalName, "Mon Image.JPG");
  assert.ok(fs.existsSync(path.join(root, ...saved.path.split("/"))));
});

test("saveUpload refuse un fichier trop gros, vide ou d'un type interdit", async () => {
  const root = tmp();
  await assert.rejects(
    saveUpload(file(new Uint8Array(2048).fill(1)), { uploadsDir: root, maxBytes: 1024 }),
    (e: unknown) => e instanceof DomainError && e.code === "too_large",
  );
  await assert.rejects(
    saveUpload(file(new Uint8Array(0)), { uploadsDir: root, maxBytes: 1024 }),
    (e: unknown) => e instanceof DomainError && e.code === "empty",
  );
  await assert.rejects(
    saveUpload(
      file(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'></svg>"), "x.jpg"),
      {
        uploadsDir: root,
        maxBytes: 1024,
      },
    ),
    (e: unknown) => e instanceof DomainError && e.code === "bad_type",
  );
  assert.deepEqual(fs.readdirSync(root), []); // rien n'a été écrit
});
