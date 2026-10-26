import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { TextField } from "@/components/admin/Field";
import { errorMessage } from "@/components/admin/form";
import { abtn } from "@/components/admin/ui";
import { getCurrentUser, loginFn } from "@/functions/auth.functions";
import { cn } from "@/lib/utils";

type ConnexionSearch = { redirect?: string | undefined };

/** N'accepte que des chemins internes de l'administration (jamais d'adresse externe). */
function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/admin") || value.startsWith("//") || value.includes("\\"))
    return undefined;
  if (value.startsWith("/admin/connexion")) return undefined;
  return value;
}

export const Route = createFileRoute("/admin/connexion")({
  validateSearch: (search: Record<string, unknown>): ConnexionSearch => ({
    redirect: safeRedirect(search["redirect"]),
  }),
  beforeLoad: async ({ search }) => {
    const user = await getCurrentUser();
    if (user) throw redirect({ href: search.redirect ?? "/admin" });
  },
  head: () => ({
    meta: [
      { title: "Connexion - Administration Hakim Travels" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const { redirect: target } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError("Saisissez votre adresse e-mail et votre mot de passe.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await loginFn({ data: { email, password } });
      if (!result.ok) {
        setError(
          result.error === "rate_limited"
            ? "Trop de tentatives. Patientez quelques minutes avant de réessayer."
            : "Adresse e-mail ou mot de passe incorrect.",
        );
        return;
      }
      toast.success("Connexion réussie.");
      await router.invalidate();
      await router.navigate({ href: target ?? "/admin" });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy via-primary to-ocean px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-card p-7 shadow-lift sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <img src="/favicon.png" alt="" className="h-11 w-11 rounded-xl bg-muted p-1.5" />
          <div className="leading-tight">
            <p className="font-display text-lg font-bold text-navy">Hakim Travels</p>
            <p className="text-sm text-muted-foreground">Espace d'administration</p>
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-navy">Connexion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connectez-vous pour gérer les voyages, les départs et le contenu du site.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <TextField
            label="Adresse e-mail"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="username"
            autoFocus
            required
          />
          <TextField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
          />
          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={busy} className={cn(abtn.primary, "w-full py-3")}>
            {busy ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
