/**
 * Limitation des tentatives de connexion : 5 échecs / 15 minutes par couple IP + e-mail.
 * État en mémoire : un seul processus (SQLite), pas de cluster.
 */

export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60 * 1000;

type Entry = { failures: number; resetAt: number };

const entries = new Map<string, Entry>();

function keyOf(ip: string, email: string): string {
  return `${ip}|${email.trim().toLowerCase()}`;
}

function prune(now: number): void {
  if (entries.size < 1000) return;
  for (const [key, entry] of entries) {
    if (entry.resetAt <= now) entries.delete(key);
  }
}

/** true si la clé a atteint la limite et qu'il faut refuser la tentative. */
export function isRateLimited(ip: string, email: string, now: number = Date.now()): boolean {
  const entry = entries.get(keyOf(ip, email));
  if (!entry) return false;
  if (entry.resetAt <= now) {
    entries.delete(keyOf(ip, email));
    return false;
  }
  return entry.failures >= MAX_FAILURES;
}

export function recordFailure(ip: string, email: string, now: number = Date.now()): void {
  prune(now);
  const key = keyOf(ip, email);
  const entry = entries.get(key);
  if (!entry || entry.resetAt <= now) {
    entries.set(key, { failures: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.failures += 1;
  }
}

export function resetFailures(ip: string, email: string): void {
  entries.delete(keyOf(ip, email));
}

export function clearAllRateLimits(): void {
  entries.clear();
}
