# Hakim Travels : analyse de l'existant

Date : 26/10/2026. Base analysée : export Lovable (template `tanstack_start_ts_current`).

## 1. Ce qu'est le projet aujourd'hui

Une **vitrine statique** : 11 pages, ~2 900 lignes de code métier, aucune base de données, aucun back-office, aucune authentification.

| Élément             | État                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Stack               | TanStack Start (React 19, SSR), Vite 8, Tailwind 4, shadcn/ui, Zod. Build Nitro vers Cloudflare par défaut                       |
| Contenu             | Tout est codé en dur dans `src/data/site.ts` (472 lignes) : 4 destinations, 4 voyages, contact, galerie, témoignages             |
| Images              | Importées dans `src/assets/` : une nouvelle image impose de toucher au code et de redéployer                                     |
| Back-office         | **Absent**                                                                                                                       |
| Base de données     | **Absente** (le commentaire de `site.ts` prévoit « un CMS / Lovable Cloud plus tard »)                                           |
| Formulaire de devis | **Factice** : il valide les champs avec Zod puis affiche « Merci ! » sans rien envoyer ni enregistrer. Les demandes sont perdues |
| Conversion          | Seul canal réel : les liens WhatsApp (`wa.me`) avec message prérempli                                                            |

### Pages

`/`, `/voyages`, `/voyages/$slug`, `/destinations`, `/destinations/$slug`, `/omra`, `/sur-mesure`, `/contact`, `/a-propos`, `/mentions-legales`, plus la 404.

## 2. Écart avec le métier réel de l'agence

C'est le constat principal : le prototype ne parle pas de l'activité que vous m'avez décrite.

1. **Aucun voyage au Maroc.** Le cœur de l'agence (circuits organisés vers le Nord, le Sud, les montagnes) n'existe nulle part. Le site ne présente que Turquie, Bali, Égypte et Omra. Le hero, les meta descriptions et le sitemap ne parlent que d'international.
2. **Pas de notion de « départ » (sortie datée).** Un voyage organisé a des départs : date, prix, places restantes, point de rendez-vous, statut (ouvert, complet, passé). Le modèle actuel n'a qu'un texte libre `availability: "Départs à confirmer"`. Impossible donc d'afficher « prochaines sorties » ou de retirer automatiquement les sorties passées.
3. **Tous les contenus sont des placeholders** : prix `null` partout, durée « à confirmer », email et adresse « à compléter », 3 faux témoignages, liens Facebook et TikTok qui pointent vers Instagram, 17 mentions « à confirmer / à compléter » dans les pages.
4. **Mélange Destination / Voyage.** `Trip.destination` est une chaîne recopiée (« Turquie ») à côté de `destinationSlug`, la galerie et la FAQ sont dupliquées entre destination et voyage, et la mise en avant est codée par un champ `featured: "large" | "small" | "omra"` qui suppose exactement 1 grand, 2 petits et 1 Omra (`FeaturedTrips.tsx` plante avec `!` si ce n'est pas le cas).

## 3. Points techniques

### À corriger

- `<html lang="en">` dans `src/routes/__root.tsx:115` alors que le site est en français ; page 404 et page d'erreur en anglais.
- `sitemap.xml` avec des URLs relatives (`/voyages`) : invalide pour Google, il faut des URLs absolues avec le domaine. Il est aussi écrit à la main, donc désynchronisé dès qu'on ajoute un voyage.
- Canonical et `og:url` relatifs, pas d'`og:image`.
- Footer : « Politique de confidentialité » et « Conditions générales » mènent tous deux à `/mentions-legales`.
- `LoadingScreen` impose environ 2 s d'écran de chargement à chaque visite de l'accueil, ce qui nuit au SEO (LCP) et à la conversion mobile.
- Le formulaire ne collecte aucun consentement (loi 09-08 / CNDP au Maroc) alors qu'il demande nom, téléphone et email.

### Dette

- 45 composants shadcn/ui installés, **1 seul utilisé** (`accordion` via `FAQ.tsx`). Le site a son propre mini-kit dans `components/site/ui.tsx`. Même chose pour les dépendances : recharts, cmdk, vaul, embla, react-day-picker, input-otp, react-hook-form, etc. sont inutilisés.
- `@tanstack/react-query` est branché dans le root mais ne sert à rien tant qu'il n'y a pas de données distantes (il servira dès qu'on aura une base).
- Pas de tests, pas de dépôt git local (le dossier est un export).
- Images JPEG non optimisées (jusqu'à 350 Ko), pas de `srcset` ni de format WebP/AVIF.

### Ce qui est bien et à garder

- Identité visuelle soignée et cohérente avec le logo (navy, turquoise, leaf, sun), typographies Sora et Manrope.
- Parcours WhatsApp bien pensé : message prérempli par voyage, CTA mobile collant sur la fiche voyage.
- SSR avec `head()` par route, JSON-LD `TravelAgency` sur l'accueil, `notFound()` propre sur les slugs inconnus.
- Fiche voyage complète (programme jour par jour, inclus / non inclus, galerie, FAQ) : bonne base pour le modèle de données.
- Contenus centralisés dans un seul fichier : la migration vers une base sera mécanique.
- Accessibilité correcte (alt, aria-label, `prefers-reduced-motion` respecté).

## 4. Ce qu'il manque pour la cible décrite

| Besoin      | Manque                                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Front clair | Rubrique Maroc (Nord, Sud, montagnes), page « Prochains départs » / agenda, filtres (Maroc / international / Omra, mois, budget), prix réels |
| Back-office | Auth admin, CRUD voyages, CRUD départs datés, upload d'images, gestion destinations, archivage automatique des sorties passées               |
| Données     | Base de données et stockage des images                                                                                                       |
| Leads       | Enregistrement des demandes de devis, notification (email ou WhatsApp) à l'agence, liste des demandes dans le back-office                    |
| Légal / SEO | Consentement CNDP, CGV réelles, sitemap dynamique avec domaine, `lang="fr"`                                                                  |

## 5. Questions à trancher en session de grilling

1. **Hébergement et backend** : rester sur Lovable Cloud (Supabase intégré, l'édition Lovable continue de fonctionner) ou sortir de Lovable (Supabase direct, autre CMS) ?
2. **Modèle de données** : Destination, puis Voyage (le circuit), puis Départ (date, prix, places) ? Les voyages Maroc et internationaux suivent-ils le même modèle ?
3. **Réservation** : simple demande d'information, réservation avec places décomptées, ou paiement en ligne (CMI) ?
4. **Qui administre** : un seul compte ou plusieurs rôles ? Niveau technique de la personne qui saisira les voyages ?
5. **Cycle de vie d'une sortie** : suppression ou archivage (utile pour le SEO et l'historique) ?
6. **Langues** : français seul, ou aussi arabe et darija (avec RTL) ?
7. **Contenus réels** : qui fournit photos, prix, programmes, témoignages, adresse et email ?
8. **Domaine et déploiement** : domaine final, hébergement (Cloudflare via Lovable ou autre) ?
