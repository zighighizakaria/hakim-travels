# Hakim Travels

Site web et back-office de l'agence de voyage **Hakim Travels** (Maroc).

- Site public bilingue **français / arabe** (l'arabe est servi sous `/ar/...`, en RTL).
- Trois univers : **Maroc** (régions administrables), **International** et **Omra**.
- Chaque voyage a des **départs datés** ; les départs passés disparaissent seuls du site.
- Pas de paiement ni de réservation en ligne : tout passe par **WhatsApp**, avec un message prérempli par voyage et par départ.
- Back-office `/admin` (en français) pour gérer voyages, départs, destinations, médias, avis et réglages.

Une seule application Node : rendu serveur (SSR), base **SQLite** locale et fichiers téléversés sur disque. Aucun service externe n'est nécessaire.

## Stack

| Brique          | Choix                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| Framework       | TanStack Start 1.169.4 (react-router 1.170.46), React 19, rendu serveur       |
| Build / serveur | Vite 8.3.5 + Nitro (preset `node-server`) : sortie `.output/server/index.mjs` |
| Base de données | SQLite via le module natif `node:sqlite` (aucune dépendance native)           |
| Style           | Tailwind CSS 4                                                                |
| Validation      | zod                                                                           |
| Tests           | `node:test` exécuté par `tsx`                                                 |

## Prérequis

- **Node.js 22.18 ou plus** (le dépôt est testé en 22.20 ; `.nvmrc` indique la version recommandée). `node:sqlite` est livré avec Node.
- npm (livré avec Node).
- Un serveur Linux ou Windows pour la production, avec un nom de domaine et un certificat TLS (voir `deploy/`).

## Installation

```bash
npm ci
cp .env.example .env      # sous Windows : copy .env.example .env
# éditer .env (au minimum SITE_URL et SESSION_SECRET)
npm run db:migrate        # crée / met à jour le schéma de la base
npm run db:seed           # (facultatif) données de démonstration
npm run admin:create -- --email admin@exemple.ma --name "Prénom Nom"
```

`admin:create` affiche un mot de passe aléatoire (ou utilisez `--password-file chemin` pour l'écrire dans un fichier au lieu de l'afficher). Relancée avec la même adresse, la commande **réinitialise** le mot de passe et révoque les sessions ouvertes. Prévoyez 1 ou 2 comptes : ils ont les mêmes droits.

## Variables d'environnement (`.env`)

Le fichier `.env` n'est jamais versionné. Une variable vide équivaut à une variable absente.

| Variable         | Obligatoire | Défaut            | Rôle                                                                                                                                                                             |
| ---------------- | ----------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`       | oui         | -                 | URL publique du site, **sans slash final** (`https://www.exemple.ma`). Sert aux URLs absolues du SEO, du sitemap et de WhatsApp ; un `https://` active aussi le cookie `secure`. |
| `SESSION_SECRET` | oui         | -                 | Secret qui signe le cookie de session admin : **32 caractères minimum**, aléatoires. Le changer déconnecte tous les admins.                                                      |
| `DATABASE_PATH`  | non         | `./data/hakim.db` | Fichier SQLite (chemin relatif au dossier de lancement).                                                                                                                         |
| `UPLOADS_DIR`    | non         | `./data/uploads`  | Dossier des images téléversées depuis le back-office.                                                                                                                            |
| `PORT`           | non         | `3000`            | Port d'écoute du serveur de production.                                                                                                                                          |
| `HOST`           | non         | `0.0.0.0`         | Adresse d'écoute (`127.0.0.1` si seul nginx doit y accéder).                                                                                                                     |
| `TRUST_PROXY`    | non         | `0`               | `1` derrière nginx : l'IP du visiteur est lue dans `X-Forwarded-For` (limitation des tentatives de connexion). Laissez `0` sinon.                                                |
| `MAX_UPLOAD_MB`  | non         | `8`               | Taille maximale d'une image téléversée, en Mo (gardez `client_max_body_size` de nginx au-dessus).                                                                                |

Générer un secret : `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.

## Développement

```bash
npm run dev          # http://localhost:3000, rechargement à chaud
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run format       # Prettier
npm test             # tests node:test
```

Sous PowerShell ou bash, mettez des **guillemets simples** autour des chemins contenant `{-$lang}` (par exemple `'src/routes/{-$lang}/index.tsx'`).

## Build et démarrage en production

```bash
npm run build        # produit .output/
npm start            # node --env-file-if-exists=.env .output/server/index.mjs
```

- `npm start` lit `.env` automatiquement. Santé : `GET /api/health` renvoie `{ "ok": true, "db": true }`.
- **Un seul processus** : SQLite, la limitation des tentatives de connexion et le singleton de base sont en mémoire du processus. Ne lancez ni cluster ni plusieurs instances.
- Les exemples de déploiement (nginx, systemd, pm2, NSSM) sont dans `deploy/`.

## Back-office (`/admin`)

Connexion sur `/admin/connexion` ; la session dure 7 jours. Tout l'espace est en français et exclu des moteurs de recherche.

| Écran                | Rôle                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tableau de bord**  | Compteurs, prochains départs, places faibles, départs passés non archivés, bouton « Supprimer les données démo ».                                |
| **Voyages**          | Création et édition (infos, programme, inclus / non inclus, FAQ, galerie, départs), FR + AR, statut brouillon / publié, duplication.             |
| **Départs**          | Vue à venir / passés / archivés, édition rapide (places, statut), archivage en masse des départs passés.                                         |
| **Destinations**     | Régions du Maroc, destinations internationales et Omra : contenus FR + AR, publication. Une destination non publiée masque aussi ses voyages.    |
| **Médias**           | Bibliothèque d'images (téléversement, textes alternatifs, suppression).                                                                          |
| **Avis clients**     | Avis réels affichés sur l'accueil (aucun avis n'est inventé : rien ne s'affiche tant qu'il n'y en a pas).                                        |
| **Réglages du site** | Téléphone, WhatsApp, e-mail, adresse, horaires, réseaux sociaux, mentions légales (ICE, RC, licence), image d'accueil et image de partage (SEO). |
| **Mon compte**       | Changement du mot de passe.                                                                                                                      |

Les champs vides ne sont jamais affichés sur le site : renseignez-les au fil de l'eau.

Règles publiques à connaître :

- Un départ n'est visible que s'il est non archivé, non annulé, daté d'aujourd'hui ou après (fuseau Africa/Casablanca) et si son voyage est publié dans une destination publiée.
- Un départ « ouvert » avec 0 place restante s'affiche « Complet » et n'entre pas dans le prix « À partir de ».
- Le prix « À partir de » est le plus bas des départs ouverts ; à défaut, le prix indicatif du voyage ; à défaut, « Prix sur demande ».

## SEO

Chaque page publique émet titre, description, Open Graph / Twitter, URL canonique absolue, alternatives `hreflang` (fr, ar, x-default) et des données structurées (TravelAgency sur l'accueil, BreadcrumbList et TouristTrip sur les fiches). `/sitemap.xml` liste les pages publiques, les voyages et destinations publiés ; `/robots.txt` interdit `/admin`. Les pages légales sont en `noindex`. L'image de partage par défaut est `public/og-default.jpg` (1200 x 630) ; elle se remplace dans « Réglages du site ».

## Sauvegarde

Tout ce qui compte est dans le dossier `data/` (base + uploads).

```bash
npm run db:backup                 # copie cohérente à chaud dans data/backups/ (VACUUM INTO)
```

Puis copiez **aussi** `data/uploads/` (les images ne sont pas dans la base) et rapatriez le tout hors du serveur. Exemple Linux : `rsync -a data/ sauvegarde:/chemin/hakim/`. Pour restaurer : arrêter le serveur, remettre le fichier `.db` à l'emplacement de `DATABASE_PATH` et les uploads dans `UPLOADS_DIR`, puis relancer. Planifiez la sauvegarde (cron, planificateur de tâches Windows).

## Mise à jour

```bash
# 1. sauvegarde (voir ci-dessus)
# 2. récupérer le nouveau code, puis :
npm ci
npm run build
npm run db:migrate     # applique les nouvelles migrations (sans danger si déjà à jour)
# 3. redémarrer le service (systemctl restart hakim-travels, pm2 restart hakim-travels, ...)
```

## Supprimer les données de démonstration

Le jeu de démonstration (`db:seed`) marque ses lignes comme « démo ». Une fois les vrais contenus prêts :

- soit via le back-office : **Tableau de bord > Supprimer les données démo** (supprime destinations, voyages, départs et images de démo, jamais vos propres contenus) ;
- soit repartir d'une base vide : n'exécutez simplement pas `db:seed` en production.

`npm run db:reset` **supprime la base et les uploads** puis recrée la démo : réservé au développement (refusé si `NODE_ENV=production`).

## Contenus à fournir par l'agence

- **Logo HD** : déposer `public/logo.png`, puis faire pointer le logo (`src="/favicon.png"` dans `src/components/site/Navbar.tsx`, `Footer.tsx` et `src/components/admin/AdminLayout.tsx`) vers `/logo.png`.
- **Photos du Maroc** : en leur absence, un dégradé de marque sert d'image de repli ; ajoutez-les via Médias, puis sur les destinations et voyages.
- **Coordonnées légales** : e-mail, adresse, ICE, RC, numéro de licence (Réglages du site) : sans eux, les mentions légales restent incomplètes.
- **Avis réels** de voyageurs (Avis clients).
- **Relecture de l'arabe** par un arabophone : tous les textes de `src/i18n/dictionaries/ar.ts` et les contenus saisis en arabe.

## Dépannage

- **`EPERM` / `EBUSY` sous Windows** pendant `db:reset` ou une suppression de la base : un serveur (`npm start` ou `npm run dev`) tient encore le fichier. Arrêtez-le, puis relancez.
- **« SESSION_SECRET est obligatoire » / « doit contenir au moins 32 caractères »** : renseignez `.env` (ne laissez pas la valeur d'exemple `<...>`). Après changement du secret, les admins doivent se reconnecter.
- **Le serveur ne démarre pas, `EADDRINUSE`** : le port (`PORT`, 3000 par défaut) est déjà pris. Changez `PORT` ou arrêtez l'autre processus (`netstat -ano | findstr :3000` sous Windows, `ss -ltnp | grep 3000` sous Linux).
- **Impossible de se connecter derrière nginx** : vérifiez `SITE_URL` (le domaine exact, en `https://`) et `TRUST_PROXY=1`. Les envois d'une origine étrangère sont refusés (protection CSRF).
- **Upload refusé** : l'image dépasse `MAX_UPLOAD_MB`, ou nginx coupe avant (`client_max_body_size`).
- **Avertissement « SQLite is an experimental feature »** : normal en Node 22, masqué par `npm start`.
- **Page blanche ou ancien contenu après une mise à jour** : relancez `npm run build` puis redémarrez le service.
