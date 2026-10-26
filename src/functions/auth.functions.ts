import { createServerFn } from "@tanstack/react-start";
import { changePasswordInputSchema, loginInputSchema } from "@/lib/schemas";
import type { AdminUserInfo } from "@/lib/types";
import { endSession, getClientIp, getSessionUser, startSession } from "@/server/auth/session";
import { getDummyHash, hashPassword, verifyPassword } from "@/server/auth/password";
import { isRateLimited, recordFailure, resetFailures } from "@/server/auth/rate-limit";
import { DomainError } from "@/server/db/sql";
import {
  findUserByEmail,
  findUserById,
  setPassword,
  touchLastLogin,
} from "@/server/repositories/users.repo";
import { adminMiddleware } from "./middleware";

export type LoginResult = { ok: true } | { ok: false; error: "invalid" | "rate_limited" };

/** Connexion (POST : couverte par le CSRF des server functions). 5 échecs / 15 min par IP + e-mail. */
export const loginFn = createServerFn({ method: "POST" })
  .validator(loginInputSchema)
  .handler(async ({ data }): Promise<LoginResult> => {
    const ip = getClientIp();
    if (isRateLimited(ip, data.email)) return { ok: false, error: "rate_limited" };

    const user = findUserByEmail(data.email);
    // Même coût de calcul que l'adresse existe ou non.
    const valid = await verifyPassword(
      data.password,
      user ? user.passwordHash : await getDummyHash(),
    );
    if (!user || !valid) {
      recordFailure(ip, data.email);
      return { ok: false, error: "invalid" };
    }

    resetFailures(ip, data.email);
    await startSession(user);
    touchLastLogin(user.id);
    return { ok: true };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true }> => {
    await endSession();
    return { ok: true };
  },
);

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminUserInfo | null> => getSessionUser(),
);

/** Change le mot de passe : les autres sessions sont révoquées (session_version + 1), celle-ci est renouvelée. */
export const changePasswordFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(changePasswordInputSchema)
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const user = findUserById(context.user.id);
    if (!user || !(await verifyPassword(data.currentPassword, user.passwordHash))) {
      throw new DomainError("Mot de passe actuel incorrect.", "bad_password");
    }
    const sessionVersion = setPassword(user.id, await hashPassword(data.newPassword));
    await startSession({ id: user.id, sessionVersion });
    return { ok: true };
  });
