# Routes

TanStack Start utilise le **routage par fichiers** : chaque fichier de ce dossier définit une route.
`routeTree.gen.ts` est généré automatiquement (dev et build) : ne le modifiez jamais à la main.
Il n'y a ni `src/pages/` ni `app/layout.tsx` : la seule racine est `src/routes/__root.tsx`.

## Conventions

| Fichier             | URL                                                 |
| ------------------- | --------------------------------------------------- |
| `index.tsx`         | `/`                                                 |
| `a-propos.tsx`      | `/a-propos`                                         |
| `voyages/index.tsx` | `/voyages`                                          |
| `voyages.$slug.tsx` | `/voyages/:slug` (paramètre : `$` seul, sans `{}`)  |
| `{-$lang}/...`      | segment optionnel (ici la langue)                   |
| `uploads.$.ts`      | `/uploads/*` (splat : `params._splat`)              |
| `sitemap[.]xml.ts`  | `/sitemap.xml` (le point s'échappe avec `[.]`)      |
| `route.tsx`         | layout du dossier (rend ses enfants via `<Outlet>`) |
| `_app/`             | groupe sans segment d'URL (layout protégé)          |

Dans un shell, mettez des guillemets simples autour des chemins contenant `$` : `'src/routes/{-$lang}/index.tsx'`.

## Structure réelle

### Racine

```
__root.tsx           <html lang dir> (déduits du pathname), loader getSiteConfig (siteUrl + réglages), 404 et erreurs traduits
uploads.$.ts         GET : sert UPLOADS_DIR en streaming
api.health.ts        GET : { ok, db } (200 / 503)
sitemap[.]xml.ts     GET : sitemap FR/AR avec hreflang (voyages et destinations publiés)
robots[.]txt.ts      GET : Allow /, Disallow /admin, Sitemap absolu
```

Les server routes restent en **GET** ; toute mutation passe par une server function (`src/functions/`).

### Public : `{-$lang}/` (français sans préfixe, arabe sous `/ar`)

```
route.tsx                 valide le paramètre (fr -> 301 vers l'URL sans préfixe, autre -> 404), polices arabes, mise en page
index.tsx                 accueil (JSON-LD TravelAgency)
maroc.tsx                 univers Maroc
international.tsx         univers International
omra.tsx                  univers Omra
voyages.index.tsx         liste (?univers=&region=)
voyages.$slug.tsx         fiche voyage (JSON-LD BreadcrumbList + TouristTrip avec une offre par départ)
destinations.index.tsx    liste des destinations
destinations.$slug.tsx    fiche destination (JSON-LD BreadcrumbList)
departs.tsx               agenda des départs (?univers=&region=&mois=AAAA-MM)
sur-mesure.tsx            appel à l'action WhatsApp (sans formulaire)
contact.tsx, a-propos.tsx
mentions-legales.tsx, confidentialite.tsx, conditions-generales.tsx    (noindex)
```

Le `head()` de chaque page appelle `buildSeo` (`src/lib/seo.ts`) ; `siteUrl` vient du loader racine, jamais de `process.env`.

### Admin : `admin/` (français, `noindex` partout)

```
connexion.tsx                       connexion (redirige si déjà connecté)
_app/route.tsx                      garde de session -> /admin/connexion?redirect=, layout du back-office
_app/index.tsx                      tableau de bord
_app/voyages.index.tsx, voyages.nouveau.tsx, voyages.$id.tsx
_app/departs.tsx                    ?vue=avenir|passes|archives
_app/destinations.index.tsx, destinations.nouveau.tsx, destinations.$id.tsx
_app/medias.tsx, avis.tsx, reglages.tsx, compte.tsx
```

### Liens

```tsx
<Link to="/{-$lang}/voyages/$slug" params={{ lang: langParam(lang), slug }}>
```

Préférez le composant `LocalizedLink` (`src/components/site/LocalizedLink.tsx`) pour les liens du site public.
