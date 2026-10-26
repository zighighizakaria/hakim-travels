import "./_env";
import fs from "node:fs";
import { parseArgs } from "node:util";
import { closeDb } from "../src/server/db/client";
import { generatePassword, hashPassword } from "../src/server/auth/password";
import { createOrResetUser } from "../src/server/repositories/users.repo";

/**
 * Crée un compte admin (ou réinitialise son mot de passe s'il existe : sessions révoquées).
 *   npm run admin:create -- --email admin@exemple.ma --name "Nom" [--password ...] [--password-file chemin]
 * Sans --password, un mot de passe aléatoire est généré. Avec --password-file, il est écrit dans ce fichier
 * au lieu d'être affiché.
 */
const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    password: { type: "string" },
    "password-file": { type: "string" },
  },
});

const email = values.email?.trim();
const name = values.name?.trim();
if (!email || !name) {
  console.error(
    'Usage : npm run admin:create -- --email adresse --name "Nom" [--password mot-de-passe] [--password-file chemin]',
  );
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Adresse e-mail invalide.");
  process.exit(1);
}
if (values.password !== undefined && values.password.length < 10) {
  console.error("Le mot de passe doit contenir au moins 10 caractères.");
  process.exit(1);
}

const generated = values.password === undefined;
const password = values.password ?? generatePassword();

try {
  const result = createOrResetUser({ email, name, passwordHash: await hashPassword(password) });
  console.log(
    result.created ? `Compte créé : ${email}` : `Compte existant réinitialisé : ${email}`,
  );
  if (generated) {
    const file = values["password-file"];
    if (file) {
      fs.writeFileSync(file, `${password}\n`, { mode: 0o600 });
      console.log(`Mot de passe généré, écrit dans : ${file}`);
    } else {
      console.log(
        `Mot de passe généré (à noter maintenant, il ne sera plus affiché) : ${password}`,
      );
    }
  }
} finally {
  closeDb();
}
