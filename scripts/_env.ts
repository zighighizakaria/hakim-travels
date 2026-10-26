/**
 * À importer en premier dans chaque script : charge .env (s'il existe) sans écraser l'environnement.
 * Les scripts se lancent depuis la racine du projet.
 */
try {
  process.loadEnvFile();
} catch {
  // pas de fichier .env : on utilise les variables déjà définies
}

export {};
