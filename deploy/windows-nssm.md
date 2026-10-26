# Windows : service avec NSSM

[NSSM](https://nssm.cc) installe le serveur Node comme un service Windows qui démarre avec la machine et redémarre en cas d'arrêt.
Rappel : **un seul processus** (SQLite). Un seul service, jamais deux instances sur la même base.

Prérequis : Node.js 22.18 ou plus, projet installé (`npm ci`), `.env` rempli, `npm run build` fait.

Dans une invite de commandes administrateur (adaptez les chemins) :

```bat
nssm install HakimTravels "C:\Program Files\nodejs\node.exe"
nssm set HakimTravels AppDirectory "C:\hakim-travels"
nssm set HakimTravels AppParameters "--env-file-if-exists=.env --disable-warning=ExperimentalWarning .output\server\index.mjs"
nssm set HakimTravels AppEnvironmentExtra NODE_ENV=production
nssm set HakimTravels Start SERVICE_AUTO_START
nssm set HakimTravels AppStdout "C:\hakim-travels\data\service.log"
nssm set HakimTravels AppStderr "C:\hakim-travels\data\service.log"
nssm set HakimTravels AppRotateFiles 1
nssm set HakimTravels AppRotateBytes 5000000
nssm start HakimTravels
```

- `AppDirectory` est important : les chemins relatifs du `.env` (`./data/...`) partent de ce dossier.
- Redémarrer après une mise à jour : `nssm restart HakimTravels` (après `npm ci`, `npm run build`, `npm run db:migrate`).
- Arrêter avant `npm run db:reset` ou toute manipulation du fichier de base : `nssm stop HakimTravels` (sinon erreur `EPERM`).
- Pas de TLS dans Node : placez un reverse proxy devant (IIS avec ARR, nginx pour Windows ou Caddy) qui envoie `X-Forwarded-For` / `X-Forwarded-Proto`, puis mettez `TRUST_PROXY=1` et `SITE_URL=https://...` dans `.env`.
