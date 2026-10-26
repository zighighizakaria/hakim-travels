import { createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, getRequestIP, setCookie } from "@tanstack/react-start/server";
import type { AdminUserInfo } from "@/lib/types";
import { getEnv } from "../env";
import { findUserById, type UserRecord } from "../repositories/users.repo";

/**
 * Session admin = cookie signé HMAC-SHA256 (SESSION_SECRET).
 * TanStack Start ≥ 1.169 ne fournit plus useSession : on signe nous-mêmes.
 * Le contenu n'est pas secret (id + version + expiration), il doit seulement être infalsifiable.
 */
type SessionPayload = { uid: number; v: number; exp: number };

const COOKIE_NAME = "ht_admin";
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: getEnv().siteUrl.startsWith("https://"),
  };
}

function sign(data: string): string {
  return createHmac("sha256", getEnv().sessionSecret).update(data).digest("base64url");
}

export function encodeSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function decodeSession(
  value: string | undefined,
  nowSeconds = Date.now() / 1000,
): SessionPayload | null {
  if (!value) return null;
  const [data, mac] = value.split(".");
  if (!data || !mac) return null;
  const expected = Buffer.from(sign(data));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;
    if (
      typeof payload.uid !== "number" ||
      typeof payload.v !== "number" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp < nowSeconds) return null;
    return { uid: payload.uid, v: payload.v, exp: payload.exp };
  } catch {
    return null;
  }
}

/** Utilisateur de la session courante, ou null (cookie absent, falsifié, expiré, ou version révoquée). */
export async function getSessionUser(): Promise<AdminUserInfo | null> {
  const payload = decodeSession(getCookie(COOKIE_NAME));
  if (!payload) return null;
  const user = findUserById(payload.uid);
  if (!user || user.sessionVersion !== payload.v) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export async function startSession(user: Pick<UserRecord, "id" | "sessionVersion">): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + SEVEN_DAYS_SECONDS;
  setCookie(COOKIE_NAME, encodeSession({ uid: user.id, v: user.sessionVersion, exp }), {
    ...cookieOptions(),
    maxAge: SEVEN_DAYS_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  deleteCookie(COOKIE_NAME, cookieOptions());
}

/** IP du client ; X-Forwarded-For n'est lu que derrière un proxy de confiance (TRUST_PROXY=1). */
export function getClientIp(): string {
  return getRequestIP({ xForwardedFor: getEnv().trustProxy }) ?? "unknown";
}
