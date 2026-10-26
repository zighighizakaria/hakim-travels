# Hakim Travels : architecture cible

Sortie de Lovable, application Node full-stack, SQLite, bilingue FR/AR.

Versions vérifiées dans `node_modules` : react-start 1.168.32, react-router 1.170.18, start-plugin-core 1.171.24, nitro 3.0.260603-beta, vite 8.1.5, zod 3.25.76, Node 22.20 (`node:sqlite` disponible).

## Décisions client (non négociables)

1. Aucune dépendance Lovable. Front, back et base de données sont à nous.
2. Base SQLite via le module natif `node:sqlite` (`DatabaseSync`), sans better-sqlite3.
3. Déploiement sur un serveur Node : une seule app full-stack (front SSR et couche serveur séparée dans `src/server/`).
4. FR et AR dès la V1, l'arabe en RTL. FR par défaut, sans préfixe d'URL ; AR sous `/ar/...`.
5. Pas de réservation en ligne, pas de paiement, pas de formulaire. Tout passe par WhatsApp avec un message prérempli, par voyage et par départ, dans la langue courante.
6. Trois univers : Maroc (régions administrables), International, Omra. Le Maroc est mis en avant sur l'accueil.
7. Un voyage a des départs datés. Les départs passés disparaissent automatiquement du site public.
8. Back-office `/admin` en français, avec 1 ou 2 comptes admin aux mêmes droits.
9. Le domaine est fourni par la variable `SITE_URL`.

## 0. Points d'API vérifiés

- **Optional path params `{-$lang}` : supportés.** Le layout `src/routes/{-$lang}/route.tsx` valide le paramètre :
  - absent : `fr` ;
  - `ar` : `ar` ;
  - `fr` : redirection 301 vers le chemin sans préfixe ;
  - toute autre valeur : `notFound()`.
    Les routes statiques (`/admin`, `/sitemap.xml`…) gagnent sur ce segment optionnel.
- **Server functions.** Forme : `createServerFn({ method }).middleware([...]).validator(schema).handler(...)`. Utiliser `.validator()`, car `inputValidator` est déprécié. Le POST accepte un `FormData` en entrée, ce qui sert pour l'upload.
- **Server routes.** Forme : `createFileRoute('/x')({ server: { handlers: { GET: ({ request, params }) => Response } } })`. Le paramètre splat s'appelle `params._splat`. Le point s'échappe ainsi : `sitemap[.]xml.ts`.
- **Sessions.** `useSession`, `getSession` et `clearSession` viennent de `@tanstack/react-start/server`. Le cookie est scellé (chiffré et signé). `password` = `SESSION_SECRET`, au moins 32 caractères. On y ajoute `session_version` en base pour pouvoir révoquer les sessions.
- **CSRF.** On garde `createCsrfMiddleware` dans `src/start.ts`, avec en repli `origin: (o) => o === new URL(process.env.SITE_URL!).origin`, évalué uniquement dans une fonction. Les server routes ne sont **pas** couvertes par ce middleware : **toute mutation passe donc par une server function**, upload compris. Les server routes restent en GET.
- **Fichier `.env`.** En dev et au build, le plugin `load-env` de TanStack le charge. En production : `node --env-file-if-exists=.env`. Les scripts utilisent `process.loadEnvFile()` dans un try/catch.
- **Point d'entrée serveur.**
  - Supprimer `src/server.ts`.
  - **Ne jamais créer `src/server/index.ts`** : TanStack résout `./server` depuis `src`, et ce fichier deviendrait l'entrée HTTP.
- **Import de `node:sqlite`.** Écrire `const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as typeof import('node:sqlite')`, avec un `import type` uniquement.
  - Raison : les externals de nitro ne listent pas `sqlite` sans préfixe.
  - Les lignes renvoyées ont un prototype null : toujours les mapper en DTO simples.
- **Uploads.** Le `publicAssets` de nitro est figé au build, donc inutilisable pour des fichiers ajoutés en cours d'exécution. On les sert via la server route `src/routes/uploads.$.ts`, qui lit `UPLOADS_DIR` en streaming.
- **Protection des imports.**
  - `**/*.server.*` est interdit côté client par défaut. On ajoute `**/src/server/**`.
  - Les fichiers `src/functions/*` n'importent `@/server/...` que dans leurs handlers.
- **React.** Retirer `@tanstack/react-query` (loaders + server functions + `router.invalidate()` suffisent). Le FAQ passe en `<details>/<summary>`. Plus aucun Radix.
- **Logo.** L'asset Lovable (`/__l5e/...`) ne fonctionnera plus. Il faut `public/logo.png` (fichier original à fournir). En attendant, utiliser `public/favicon.png`.
- **Pas de photos du Maroc.** En leur absence, un dégradé de marque sert d'image de repli.

## 1. vite.config.ts

```ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(async ({ command }) => {
  const plugins = [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: { files: ["**/src/server/**"], specifiers: ["server-only"] },
      },
    }),
  ];
  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(nitro({ preset: "node-server" }));
  }
  plugins.push(viteReact());
  return {
    plugins,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    server: { host: "0.0.0.0", port: 3000 },
  };
});
```

Le build produit `.output/server/index.mjs` et `.output/public`.

## 2. package.json

Nom `hakim-travels`, `engines.node >=22.18`, `.nvmrc` avec `22.20.0`.

```json
"dev": "vite dev",
"build": "vite build",
"start": "node --env-file-if-exists=.env --disable-warning=ExperimentalWarning .output/server/index.mjs",
"typecheck": "tsc --noEmit",
"lint": "eslint .",
"format": "prettier --write .",
"test": "tsx --test \"src/**/*.test.ts\"",
"db:migrate": "tsx scripts/db-migrate.ts",
"db:seed": "tsx scripts/db-seed.ts",
"db:reset": "tsx scripts/db-reset.ts",
"db:backup": "tsx scripts/db-backup.ts",
"admin:create": "tsx scripts/admin-create.ts"
```

**À retirer**

- Tous les `@radix-ui/*`.
- `@hookform/resolvers`, `react-hook-form`, `cmdk`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `recharts`, `vaul`.
- `class-variance-authority`, `date-fns`, `tw-animate-css` (et son `@import` dans `styles.css`).
- `@tanstack/react-query`, `@lovable.dev/vite-tanstack-config`.
- Les scripts `build:dev` et `preview`.

**À garder** (versions TanStack exactes, sans mise à jour)

- react, react-dom ;
- @tanstack/react-router 1.170.18, @tanstack/react-start 1.168.32, @tanstack/router-plugin 1.168.23 ;
- tailwindcss, @tailwindcss/vite, vite-tsconfig-paths ;
- clsx, tailwind-merge, lucide-react, zod, sonner ;
- nitro, vite, `overrides.rolldown`.

**À ajouter** : `tsx` (en devDependency).

**tsconfig** : `include` reçoit `scripts/**/*.ts`, et `types` vaut `["vite/client","node"]`.

**À supprimer** : `bun.lock`, `bunfig.toml`, `.lovable/`, `.wrangler/`, `components.json`, le bloc Lovable de `AGENTS.md`.

**`.gitignore`** : ajouter `data/` et `.env`. Ajouter aussi un `.gitattributes` avec `* text=auto eol=lf`.

## 3. Variables d'environnement (`.env.example`)

```
SITE_URL=http://localhost:3000          # sans slash final, https en prod
DATABASE_PATH=./data/hakim.db
UPLOADS_DIR=./data/uploads
SESSION_SECRET=<64 caractères aléatoires, minimum 32>
PORT=3000
HOST=0.0.0.0
TRUST_PROXY=0                           # 1 derrière nginx
MAX_UPLOAD_MB=8
```

`src/server/env.ts` :

- lit ces variables avec zod, de façon paresseuse (lazy), et affiche des erreurs claires en français ;
- résout les chemins avec `path.resolve(process.cwd(), …)`.

Le serveur se lance depuis la racine du projet.

## 4. i18n

**Contenus**

- Colonnes `xxx_fr TEXT NOT NULL` et `xxx_ar TEXT NULL`.
- Les repositories renvoient des DTO localisés via `loc(row, field, lang)` : la valeur `_ar` si elle n'est pas vide, sinon `_fr`.
- Les listes (programme, inclus, FAQ, points forts) sont des **tables enfants** avec une paire `_fr`/`_ar` par ligne.

**Textes d'interface**

- `src/i18n/dictionaries/fr.ts` (objet `as const`, source de vérité).
- `ar.ts`, typé `Dict` (même forme) : TypeScript impose un AR complet.
- Les pages statiques (à propos, légal, confidentialité, CGV, sur-mesure, Omra) vivent aussi dans les dictionnaires.
- L'AR est **à faire relire par un arabophone**.

**Helpers** (`src/i18n/config.ts`) : `LANGS`, `Lang`, `DEFAULT_LANG='fr'`, `dirOf`, `langParam(lang)` (renvoie `'ar' | undefined`), `localizePath`, `langFromPathname`.

**Hooks** (`src/i18n/useI18n.ts`) : `useLang()` et `useT()`.

**Attributs `<html>`.** `lang` et `dir` sont dérivés **uniquement du pathname**, pour éviter tout écart d'hydratation. L'admin est toujours en `fr`/`ltr`.

**Dates**

- `Intl.DateTimeFormat(ar ? 'ar-MA' : 'fr-MA', { timeZone: 'Africa/Casablanca' })`. Forcer `numberingSystem: 'latn'` si nécessaire.
- Les dates `YYYY-MM-DD` sont parsées à `T12:00:00Z`.
- « Aujourd'hui » est calculé côté serveur dans le fuseau Africa/Casablanca. Jamais de `new Date()` dans le rendu.

**Polices arabes.** Noto Kufi Arabic pour les titres et Tajawal pour le texte, chargées seulement en AR. En CSS : `html[lang=ar] { --font-sans; --font-display }`.

## 5. Schéma SQL (migration 001)

PRAGMA appliqués à chaque ouverture : `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000`, `synchronous=NORMAL`.

```sql
CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')));

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,              -- scrypt$N$r$p$saltB64$hashB64
  session_version INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE images (
  id INTEGER PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,                -- relatif à UPLOADS_DIR, séparateur /
  mime TEXT NOT NULL CHECK (mime IN ('image/jpeg','image/png','image/webp','image/avif')),
  size_bytes INTEGER NOT NULL,
  width INTEGER, height INTEGER,
  original_name TEXT,
  alt_fr TEXT, alt_ar TEXT,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE destinations (                 -- régions Maroc, pays International, Omra
  id INTEGER PRIMARY KEY,
  universe TEXT NOT NULL CHECK (universe IN ('maroc','international','omra')),
  slug TEXT NOT NULL UNIQUE CHECK (slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*'),
  name_fr TEXT NOT NULL, name_ar TEXT,
  emoji TEXT,
  tagline_fr TEXT, tagline_ar TEXT,
  teaser_fr TEXT, teaser_ar TEXT,
  intro_fr TEXT, intro_ar TEXT,
  cover_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  seo_title_fr TEXT, seo_title_ar TEXT, seo_description_fr TEXT, seo_description_ar TEXT,
  is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0,1)),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_destinations_universe ON destinations(universe, is_published, sort_order);

CREATE TABLE destination_items (
  id INTEGER PRIMARY KEY,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('highlight','practical')),
  position INTEGER NOT NULL DEFAULT 0,
  label_fr TEXT, label_ar TEXT,
  text_fr TEXT NOT NULL, text_ar TEXT
);
CREATE INDEX idx_destination_items ON destination_items(destination_id, kind, position);

CREATE TABLE destination_images (
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  image_id INTEGER NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (destination_id, image_id)
);

CREATE TABLE trips (
  id INTEGER PRIMARY KEY,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL UNIQUE,
  title_fr TEXT NOT NULL, title_ar TEXT,
  teaser_fr TEXT NOT NULL DEFAULT '', teaser_ar TEXT,
  presentation_fr TEXT NOT NULL DEFAULT '', presentation_ar TEXT,
  duration_days INTEGER CHECK (duration_days IS NULL OR duration_days > 0),
  duration_nights INTEGER CHECK (duration_nights IS NULL OR duration_nights >= 0),
  price_from_mad INTEGER CHECK (price_from_mad IS NULL OR price_from_mad >= 0),
  price_note_fr TEXT, price_note_ar TEXT,
  cover_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  whatsapp_message_fr TEXT, whatsapp_message_ar TEXT,
  seo_title_fr TEXT, seo_title_ar TEXT, seo_description_fr TEXT, seo_description_ar TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_trips_destination ON trips(destination_id);
CREATE INDEX idx_trips_public ON trips(status, is_featured, sort_order);

CREATE TABLE trip_days (
  id INTEGER PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  label_fr TEXT NOT NULL, label_ar TEXT,
  title_fr TEXT NOT NULL, title_ar TEXT,
  body_fr TEXT NOT NULL DEFAULT '', body_ar TEXT
);
CREATE INDEX idx_trip_days ON trip_days(trip_id, position);

CREATE TABLE trip_items (
  id INTEGER PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('highlight','included','excluded')),
  position INTEGER NOT NULL DEFAULT 0,
  text_fr TEXT NOT NULL, text_ar TEXT
);
CREATE INDEX idx_trip_items ON trip_items(trip_id, kind, position);

CREATE TABLE trip_images (
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  image_id INTEGER NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (trip_id, image_id)
);

CREATE TABLE faqs (
  id INTEGER PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  question_fr TEXT NOT NULL, question_ar TEXT,
  answer_fr TEXT NOT NULL, answer_ar TEXT,
  CHECK ((trip_id IS NULL) <> (destination_id IS NULL))
);
CREATE INDEX idx_faqs_trip ON faqs(trip_id, position);
CREATE INDEX idx_faqs_destination ON faqs(destination_id, position);

CREATE TABLE departures (
  id INTEGER PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL CHECK (start_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  end_date TEXT NOT NULL CHECK (end_date >= start_date),
  departure_city_fr TEXT NOT NULL, departure_city_ar TEXT,
  meeting_point_fr TEXT, meeting_point_ar TEXT,
  price_mad INTEGER CHECK (price_mad IS NULL OR price_mad >= 0),          -- NULL = sur demande
  child_price_mad INTEGER CHECK (child_price_mad IS NULL OR child_price_mad >= 0),
  seats_total INTEGER CHECK (seats_total IS NULL OR seats_total >= 0),
  seats_left INTEGER CHECK (seats_left IS NULL OR (seats_left >= 0 AND (seats_total IS NULL OR seats_left <= seats_total))),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','full','cancelled')),
  note_fr TEXT, note_ar TEXT,
  archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0,1)),
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_departures_trip ON departures(trip_id, start_date);
CREATE INDEX idx_departures_public ON departures(start_date) WHERE archived = 0 AND status <> 'cancelled';

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_city TEXT,
  trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  quote_fr TEXT NOT NULL, quote_ar TEXT,
  travel_label TEXT,
  source_url TEXT,
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_reviews_public ON reviews(is_published, sort_order);

CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  agency_name TEXT NOT NULL DEFAULT 'Hakim Travels',
  phone_display TEXT, phone_e164 TEXT,
  whatsapp_number TEXT CHECK (whatsapp_number IS NULL OR whatsapp_number NOT GLOB '*[^0-9]*'),
  email TEXT,
  address_fr TEXT, address_ar TEXT,
  opening_hours_fr TEXT, opening_hours_ar TEXT,
  maps_url TEXT,
  instagram_url TEXT, instagram_handle TEXT, instagram_followers_label TEXT,
  facebook_url TEXT, tiktok_url TEXT, youtube_url TEXT,
  legal_company_name TEXT, legal_ice TEXT, legal_rc TEXT, legal_license_number TEXT,
  hero_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  og_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO site_settings (id, phone_display, phone_e164, whatsapp_number, instagram_url, instagram_handle)
VALUES (1, '06 25 77 64 85', '+212625776485', '212625776485', 'https://www.instagram.com/hakim.travels_agency/', '@hakim.travels_agency');
```

### Règles publiques des départs

Ces règles sont appliquées dans le repository, sans cron.

- **Visibilité** : `archived = 0 AND status <> 'cancelled' AND start_date >= :today` (Africa/Casablanca), et le voyage doit être `published`.
- **Complet** : un départ `open` avec `seats_left = 0` s'affiche « Complet ».
- **Prix « À partir de »** : `MIN(price_mad)` des départs visibles ouverts, sinon `price_from_mad`, sinon « Prix sur demande ».

L'univers n'est pas une table : c'est un enum dans le code. Celui d'un voyage vient de sa destination.

## 6. Arborescence

### À supprimer

- `src/server.ts`
- `src/lib/error-capture.ts`
- `src/lib/lovable-error-reporting.ts`
- `src/assets/logo.png.asset.json`
- `src/components/ui/`
- `src/hooks/use-mobile.tsx`
- `TravelQuoteForm.tsx`
- `LoadingScreen.tsx`
- `src/data/site.ts`, une fois migré vers le seed et les dictionnaires
- les anciennes routes, déplacées sous `{-$lang}/`
- `public/sitemap.xml` et `public/robots.txt`, qui deviennent dynamiques

### Images

Les JPEG de destinations (turquie, bali, egypte, omra) vont dans `scripts/seed-assets/`. Les images hero et galerie Instagram restent dans `src/assets/`.

### Backend : `src/server/**`

Ce dossier est interdit côté client, et ne doit **pas** contenir d'`index.ts`.

```
env.ts                         env zod lazy, getSiteUrl()
db/client.ts                   getDb() singleton globalThis.__htDb, PRAGMA, migrate auto, mkdir data/
db/migrations.ts               { version, sql }[]
db/migrate.ts                  runMigrations(db): number[]
db/tx.ts                       tx(db, fn) BEGIN IMMEDIATE / COMMIT / ROLLBACK
db/sql.ts                      bool(), now(), loc(), today()
repositories/{destinations,trips,departures,images,reviews,settings,users}.repo.ts
auth/password.ts               scrypt N=16384 r=8 p=1, timingSafeEqual
auth/session.ts                SESSION_CONFIG, getSessionUser(), startSession(), endSession()
auth/rate-limit.ts             5 échecs / 15 min par IP+email (mémoire)
media/storage.ts               saveUpload(file), deleteUploadFile(path), sniffImageType(buf)
media/serve.ts                 serveUpload(splat, request)
seo/sitemap.ts                 buildSitemapXml(siteUrl)
seed/demo-data.ts, seed/run-seed.ts
```

### Partagé client et serveur

Ces fichiers n'importent jamais `src/server`.

```
src/lib/types.ts      DTO (TripCard, TripDetail, DepartureRow, DestinationCard, DestinationDetail, PublicSettings, Review, Admin*)
src/lib/schemas.ts    zod des entrées admin
src/lib/whatsapp.ts   whatsappUrl, buildTripMessage, buildDepartureMessage
src/lib/format.ts     formatDate, formatDateRange, formatPrice, formatDuration
src/lib/seo.ts        buildSeo(...)
src/lib/root-data.ts  getRootData(matches) → { siteUrl, settings }
src/lib/utils.ts      cn
src/lib/error-page.ts page 500 FR+AR
src/i18n/{config.ts,useI18n.ts,dictionaries/fr.ts,dictionaries/ar.ts}
```

### Server functions : `src/functions/`

```
middleware.ts                  adminMiddleware → context.user, sinon 401
public.functions.ts
auth.functions.ts
admin/{destinations,trips,departures,media,reviews,settings,dashboard}.functions.ts
```

### Composants

**Site, existants à reprendre**

- `useT()` partout et liens localisés.
- Classes logiques RTL, et `rtl:rotate-180` sur les flèches.
- FAQ en `<details>`.
- Footer : réseaux sociaux tirés des settings, masqués s'ils sont vides.
- `SocialProof` : avis publiés uniquement, rien sinon.
- Hero orienté Maroc.

**Site, nouveaux** : `TripCard`, `DepartureList`, `DepartureFilters`, `UniverseTabs`, `RegionGrid`, `LangSwitcher`, `LocalizedLink`, `ImageOrFallback`, `Breadcrumbs`.

**Admin** (`src/components/admin/`) : `AdminLayout`, `Field`, `BilingualField`, `RepeatableList`, `ImagePicker`, `ImageUploader`, `ConfirmButton`, `StatusBadge`, `DemoBadge`, et le Toaster `sonner`.

### Scripts (exécutés par tsx)

```
scripts/_env.ts, db-migrate.ts, db-seed.ts (--force, idempotent), db-reset.ts (refusé si NODE_ENV=production),
db-backup.ts (VACUUM INTO data/backups/…), admin-create.ts (--email --name [--password]), seed-assets/*.jpg
```

## 7. Routes

### Racine

```
src/routes/__root.tsx            <html lang dir>, loader getSiteConfig, 404/erreurs traduites
src/routes/uploads.$.ts          GET serveUpload
src/routes/sitemap[.]xml.ts      GET, hreflang fr/ar/x-default
src/routes/robots[.]txt.ts       GET, Disallow /admin, Sitemap absolu
src/routes/api.health.ts         GET { ok, db }
```

### Public : `src/routes/{-$lang}/`

Attention aux guillemets simples en shell, à cause du `$`.

```
route.tsx                validation lang, head par défaut + police AR
index.tsx                Hero Maroc, régions Maroc, 6 prochains départs, International, Omra, avis, Instagram
maroc.tsx                régions + voyages + départs Maroc
international.tsx
omra.tsx
voyages.index.tsx        ?univers=&region=
voyages.$slug.tsx        départs à venir + WhatsApp par départ, programme, inclus, galerie, FAQ, JSON-LD
destinations.index.tsx
destinations.$slug.tsx
departs.tsx              agenda ?univers=&region=&mois=YYYY-MM
sur-mesure.tsx           CTA WhatsApp, sans formulaire
contact.tsx, a-propos.tsx, mentions-legales.tsx, confidentialite.tsx, conditions-generales.tsx
```

### Admin : `src/routes/admin/`

L'admin est en FR et en `noindex` partout.

```
connexion.tsx
_app/route.tsx                 garde de session → /admin/connexion?redirect=
_app/index.tsx                 tableau de bord (compteurs, prochains départs, places faibles, passés non archivés, "Supprimer les données démo")
_app/voyages.index.tsx, _app/voyages.nouveau.tsx, _app/voyages.$id.tsx (onglets Infos | Programme | Inclus | FAQ | Galerie | Départs)
_app/departs.tsx               ?vue=avenir|passes|archives, édition rapide, archivage en masse
_app/destinations.index.tsx, _app/destinations.nouveau.tsx, _app/destinations.$id.tsx
_app/medias.tsx, _app/avis.tsx, _app/reglages.tsx, _app/compte.tsx
```

### Liens

```tsx
<Link to="/{-$lang}/voyages/$slug" params={{ lang: langParam(lang), slug }}>
```

Pour le sélecteur de langue : `to="."` avec `params={(p) => ({ ...p, lang: next === 'fr' ? undefined : 'ar' })}`, en conservant la recherche.

## 8. Signatures

### Repositories

Ils sont synchrones et renvoient des DTO simples.

```ts
// destinations
listPublicDestinations(lang, f?: { universe?; featured? }): DestinationCard[]
getPublicDestinationBySlug(lang, slug): DestinationDetail | null
adminListDestinations(); adminGetDestination(id)
saveDestination(input, id?): number            // tx : upsert + remplace items/faqs/images
deleteDestination(id): { ok: true } | { ok: false; reason: 'has_trips'; count }
// trips
listPublicTrips(lang, f?: { universe?; destinationSlug?; featured?; limit? }): TripCard[]
getPublicTripBySlug(lang, slug, today): TripDetail | null
adminListTrips(f?); adminGetTrip(id); saveTrip(input, id?): number; duplicateTrip(id): number; deleteTrip(id)
listSitemapEntries(): { path; updatedAt }[]
// departures
listUpcomingDepartures(lang, today, f?: { universe?; destinationSlug?; month?; tripId?; limit? }): DepartureRow[]
listUpcomingMonths(today, f?): string[]
adminListDepartures({ view: 'upcoming'|'past'|'archived'; tripId? }, today)
saveDeparture(input, id?); quickUpdateDeparture(id, { seatsLeft?, status? })
setDepartureArchived(id, archived); archivePastDepartures(today): number; deleteDeparture(id)
// images
insertImage; listImages; updateImageAlt; imageUsage(id); deleteImage(id): path
// reviews
listPublishedReviews(lang, limit?); adminListReviews; saveReview; deleteReview
// settings
getPublicSettings(lang); adminGetSettings(); saveSettings(input)
// users
findUserByEmail; findUserById; createOrResetUser; setPassword (session_version+1); touchLastLogin
// seed
deleteDemoData(): { trips; destinations; images }
```

### Server functions publiques

Elles sont en GET, avec un validateur zod `{ lang: 'fr' | 'ar', ... }`.

```
getSiteConfig() → { siteUrl, settings: { fr, ar } }
getHomePage({ lang }); getUniversePage({ lang, universe })
listTripsFn({ lang, universe?, region? }); getTripFn({ lang, slug }) (notFound si absent ou brouillon)
listDestinationsFn({ lang }); getDestinationFn({ lang, slug })
listDeparturesFn({ lang, universe?, region?, month? }) → { departures, months, regions }
```

### Auth

```
loginFn(POST) → { ok } | { ok:false, error:'invalid'|'rate_limited' }
logoutFn(POST)
getCurrentUser(GET)
changePasswordFn(POST, admin, min 10 caractères)
```

### Admin

Toutes ces functions passent par `adminMiddleware`, et les mutations sont en POST.

- **Tableau de bord** : `adminDashboardFn`.
- **Destinations** : List, Get, Save, Delete.
- **Voyages** : List, Get, Save, Duplicate, Delete.
- **Départs** : List, Save, QuickUpdate, Archive, ArchivePast, Delete.
- **Médias** : `adminUploadImageFn(FormData)`, ListImages, UpdateImage, DeleteImage (avec `force`).
- **Avis** : List, Save, Delete.
- **Réglages** : Get et Save.
- **Démo** : `adminDeleteDemoDataFn`.

### Upload

1. Taille ≤ `MAX_UPLOAD_MB`.
2. Type détecté par les octets magiques (JPEG, PNG, WEBP, AVIF). SVG refusé.
3. Fichier écrit dans `UPLOADS_DIR/YYYY/MM/<uuid>.<ext>`.
4. URL renvoyée : `/uploads/...`.

### serveUpload

- Anti-traversée : refuser `..`, les caractères NUL et les chemins absolus. Le chemin résolu doit commencer par `root + sep`.
- Lecture en streaming.
- En-têtes : `Content-Type`, `Cache-Control` immutable 1 an, `ETag` avec réponse 304, `nosniff`.

### Session

- Configuration : `useSession({ password: SESSION_SECRET, name: 'ht_admin', maxAge: 7 j, cookie: { httpOnly, sameSite: 'lax', path: '/', secure: SITE_URL commence par https } })`.
- Données : `{ uid, v }`, contrôlées contre `session_version`.

### WhatsApp

- Modèles dans les dictionnaires, avec `{trip}`, `{start}`, `{end}`, `{city}`, `{price}`, `{url}` (URL absolue de la fiche).
- Message par voyage et message par départ.
- `trips.whatsapp_message_xx` remplace le modèle s'il est renseigné.

### SEO

`buildSeo` produit :

- `title`, `description` ;
- `og:*` absolus et `og:locale` (fr_MA / ar_MA) ;
- `twitter:image` ;
- `canonical` ;
- `hreflang` fr, ar et x-default ;
- `noindex` si besoin ;
- JSON-LD : `TravelAgency`, `BreadcrumbList`, `TouristTrip` avec `offers` par départ.

`siteUrl` vient du loader racine. Jamais de `process.env` dans un `head()`.

## 9. Seed démo

Le seed est idempotent et marque tout avec `is_demo=1`. Les dates sont relatives à aujourd'hui (+7, +14, +21, +35, +60 jours).

**Destinations**

| Univers       | Destinations                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maroc         | Nord (Chefchaouen, Akchour) ; Sud et Désert (Merzouga, Zagora) ; Montagnes et Atlas (Imlil, Ouzoud, Ifrane) ; Côte atlantique (Essaouira, Dakhla) |
| International | Turquie, Égypte, Bali (contenus repris de l'ancien `site.ts` et traduits en AR)                                                                   |
| Omra          | La Mecque et Médine                                                                                                                               |

**Voyages**

| Voyage                          | Durée     | Prix       |
| ------------------------------- | --------- | ---------- |
| Week-end Chefchaouen et Akchour | 2 j / 1 n | 650 MAD    |
| Merzouga, nuit sous les étoiles | 4 j / 3 n | 1 900 MAD  |
| Cascades d'Ouzoud               | 1 jour    | 250 MAD    |
| Imlil et Toubkal                | 2 j       | —          |
| Istanbul et Cappadoce           | —         | 9 900 MAD  |
| Égypte éternelle                | —         | —          |
| Évasion balinaise               | —         | —          |
| Omra 15 jours                   | —         | 17 500 MAD |

Chaque voyage a un programme, des inclus et non inclus, et 2 FAQ, en FR et AR. Prévoir des villes de départ Casablanca et Rabat, un départ « Complet » et un départ passé (pour tester le masquage).

**Avis** : aucun.

## 10. Lots

| Lot | Contenu                                                                                                          | Check                                                                                                                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | Sortie de Lovable et socle Node (config, deps, suppressions, FAQ en details, logo local, error-page)             | `npm run typecheck && npm run build` ; `npm start` puis HTTP 200 sur `/` ; aucune occurrence de « lovable » ; `.output/server/index.mjs` présent ; pas de `wrangler.json`                             |
| A   | Backend : DB, repositories, auth, médias, server functions, routes uploads et health, scripts, tests `node:test` | `npm run db:reset && npm run admin:create -- … && npm test && npm run typecheck && npm run build` ; `/api/health` ; `/uploads/<seed>` en 200                                                          |
| C1  | Routage i18n, dictionnaires, `{-$lang}`, `<html lang dir>`, RTL, pages légales                                   | `/` contient `lang="fr" dir="ltr"` ; `/ar` contient `lang="ar" dir="rtl"` ; `/xx/voyages` en 404 ; `/fr/voyages` en 301                                                                               |
| B   | Back-office                                                                                                      | E2E : connexion, puis région, puis voyage FR+AR avec image, puis départ, puis visible sur `/departs` ; `/admin` sans cookie redirige ; server fn admin sans session en 401 ; `Origin` étranger en 403 |
| C2  | Branchement des données publiques, WhatsApp par voyage et par départ, suppression de `site.ts`                   | `/departs?univers=maroc` sans le départ passé ; `/ar/voyages/<slug>` en AR avec `wa.me` en arabe ; slug inconnu en 404                                                                                |
| D   | SEO : `buildSeo`, JSON-LD, sitemap, robots                                                                       | URLs absolues, hreflang, pas d'admin dans le sitemap, JSON-LD parsable                                                                                                                                |
| E   | Livraison : README, exemples pm2/NSSM/systemd et nginx                                                           | `npm ci && build && db:migrate && db:seed && start` sur une copie propre                                                                                                                              |

## 11. Risques

1. **`node:sqlite` expérimental.**
   - Avertissement masqué au démarrage, Node ≥ 22.18.
   - Tout l'accès passe par `db/client.ts`, ce qui permet de basculer sur better-sqlite3 si besoin.
2. **Un seul processus**, à cause de SQLite, du rate-limit en mémoire et du singleton. Pas de cluster.
3. **HMR en dev** : garder la connexion sur `globalThis`.
4. **Windows.**
   - Utiliser `path.*` partout ; stocker les chemins en base avec `/`.
   - `db:reset` exige que le serveur soit arrêté (EPERM).
   - Le dossier `{-$lang}` exige des guillemets simples en shell.
5. **Point d'entrée serveur** : jamais de `src/server/index.ts`.
6. **Protection des imports** : un composant qui importe `@/server` casse le build, et c'est voulu.
7. **SSR et RTL** : `lang` et `dir` viennent du pathname ; dates à fuseau fixe ; pas de `new Date()` au rendu ; animations inversées en RTL.
8. **Cookies et proxy** : `secure` dérivé de `SITE_URL` ; `TRUST_PROXY` derrière nginx.
9. **`SESSION_SECRET`** : au moins 32 caractères, validé au démarrage.
10. **Uploads** : pas de redimensionnement en V1, 8 Mo maximum. Sauvegarder `data/` en entier.
11. **Contenus à fournir par le client** :
    - logo HD ;
    - photos Maroc ;
    - email, adresse, ICE, RC et licence ;
    - vrais avis ;
    - relecture de l'arabe.

    Aucun texte « à compléter » ne doit être affiché : les champs vides sont masqués.

12. **Versions TanStack figées.** `routeTree.gen.ts` est généré automatiquement : jamais édité à la main.
13. **tsconfig strict** : `exactOptionalPropertyTypes` et `noPropertyAccessFromIndexSignature` (écrire `process.env['X']`).
14. **Brouillons** : ils doivent être filtrés dans **tous** les repositories publics et dans le sitemap.

## 12. Écarts d'implémentation

Ce que le code fait différemment des sections ci-dessus (le code fait foi).

- **Session admin** : `useSession` n'existe plus dans TanStack Start 1.169. La session est un cookie `ht_admin` signé en HMAC-SHA256 avec `SESSION_SECRET` (`src/server/auth/session.ts`), contenant `{ uid, v, exp }` (7 jours), `httpOnly`, `sameSite=lax`, `secure` si `SITE_URL` est en https. `v` est comparé à `session_version` en base pour révoquer les sessions. Le cookie est signé, pas chiffré : son contenu n'est pas secret.
- **Versions** (celles de `package.json` et `node_modules`, qui remplacent celles de l'en-tête) : `@tanstack/react-start` 1.169.4, `@tanstack/react-router` 1.170.46, `@tanstack/router-plugin` 1.168.48, vite 8.3.5.
- **SEO** : `src/lib/seo.ts` (`buildSeo`, JSON-LD) remplace le helper `src/i18n/head.ts`, supprimé. Le sitemap et robots.txt sont construits par `src/server/seo/sitemap.ts`. Les liens `hreflang` sont émis en `hrefLang` (propriété React, identique en HTML). L'image de partage par défaut est `public/og-default.jpg`.
- **Pluriels** : `src/i18n/plural.ts` (`Intl.PluralRules`) ; les compteurs du dictionnaire sont des objets `{ one, two, few, many, other }`, l'arabe distinguant 1, 2, 3-10 et 11 et plus.
- **Règle publique ajoutée** : une destination non publiée masque aussi ses voyages, leurs départs et leurs entrées de sitemap. Le prix « À partir de » ignore les départs ouverts avec 0 place restante.
- **Logo** : `public/favicon.png` sert de logo tant que `public/logo.png` n'est pas fourni.
