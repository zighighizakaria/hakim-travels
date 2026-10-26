import { createMiddleware } from "@tanstack/react-start";
import { getSessionUser } from "@/server/auth/session";

/**
 * Protège les server functions admin : session valide (cookie scellé + session_version),
 * sinon réponse 401. Le contexte reçoit `user`.
 */
export const adminMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const user = await getSessionUser();
  if (!user) {
    throw new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return next({ context: { user } });
});
