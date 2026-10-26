import { getDb } from "../db/client";
import { get, run } from "../db/sql";

export type UserRecord = {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  sessionVersion: number;
  lastLoginAt: string | null;
};

type UserRow = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  session_version: number;
  last_login_at: string | null;
};

function toUser(row: UserRow): UserRecord {
  return {
    id: Number(row.id),
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    sessionVersion: Number(row.session_version),
    lastLoginAt: row.last_login_at,
  };
}

export function findUserByEmail(email: string): UserRecord | null {
  const row = get<UserRow>(getDb(), "SELECT * FROM users WHERE email = ?", email.trim());
  return row ? toUser(row) : null;
}

export function findUserById(id: number): UserRecord | null {
  const row = get<UserRow>(getDb(), "SELECT * FROM users WHERE id = ?", id);
  return row ? toUser(row) : null;
}

/** Crée le compte, ou réinitialise nom et mot de passe s'il existe (les sessions en cours sont révoquées). */
export function createOrResetUser(input: { email: string; name: string; passwordHash: string }): {
  id: number;
  created: boolean;
} {
  const db = getDb();
  const email = input.email.trim();
  const existing = findUserByEmail(email);
  if (existing) {
    run(
      db,
      `UPDATE users SET name = ?, password_hash = ?, session_version = session_version + 1,
         updated_at = datetime('now') WHERE id = ?`,
      input.name,
      input.passwordHash,
      existing.id,
    );
    return { id: existing.id, created: false };
  }
  const { lastId } = run(
    db,
    "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
    email,
    input.name,
    input.passwordHash,
  );
  return { id: lastId, created: true };
}

/** Change le mot de passe et incrémente session_version : toutes les sessions existantes deviennent invalides. */
export function setPassword(id: number, passwordHash: string): number {
  const db = getDb();
  run(
    db,
    `UPDATE users SET password_hash = ?, session_version = session_version + 1,
       updated_at = datetime('now') WHERE id = ?`,
    passwordHash,
    id,
  );
  const row = get<{ session_version: number }>(
    db,
    "SELECT session_version FROM users WHERE id = ?",
    id,
  );
  return Number(row?.session_version ?? 0);
}

export function touchLastLogin(id: number): void {
  run(getDb(), "UPDATE users SET last_login_at = datetime('now') WHERE id = ?", id);
}
