import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { TextField } from "@/components/admin/Field";
import { useAdminAction, validate, type FieldErrors } from "@/components/admin/form";
import { Card, PageHeader, abtn } from "@/components/admin/ui";
import { changePasswordFn, logoutFn } from "@/functions/auth.functions";
import { changePasswordInputSchema } from "@/lib/schemas";

export const Route = createFileRoute("/admin/_app/compte")({
  component: AccountPage,
});

function AccountPage() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    const result = validate(changePasswordInputSchema, {
      currentPassword: current,
      newPassword: next,
    });
    const found: FieldErrors = result.ok ? {} : { ...result.errors };
    if (current === "" && !found["currentPassword"]) {
      found["currentPassword"] = "Saisissez votre mot de passe actuel.";
    }
    if (result.ok && next !== confirm) {
      found["confirm"] = "Les deux mots de passe ne sont pas identiques.";
    }
    if (result.ok && next === current) {
      found["newPassword"] = "Le nouveau mot de passe doit être différent de l'ancien.";
    }
    if (Object.keys(found).length > 0 || !result.ok) {
      setErrors(found);
      return;
    }
    setErrors({});
    const done = await run(() => changePasswordFn({ data: result.data }), {
      success: "Mot de passe modifié. Vos autres appareils ont été déconnectés.",
      invalidate: false,
    });
    if (done) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  };

  const logout = async () => {
    const done = await run(() => logoutFn(), { invalidate: false });
    if (done) {
      await router.invalidate();
      await router.navigate({ to: "/admin/connexion", search: {} });
    } else {
      toast.error("La déconnexion a échoué. Réessayez.");
    }
  };

  return (
    <>
      <PageHeader
        title="Mon compte"
        description="Vos informations de connexion à l'administration."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Mes informations">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-navy">Nom</dt>
              <dd className="text-foreground">{user.name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Adresse e-mail</dt>
              <dd className="text-foreground">{user.email}</dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-border pt-5">
            <button type="button" className={abtn.secondary} onClick={logout} disabled={pending}>
              Se déconnecter
            </button>
          </div>
        </Card>

        <Card
          title="Changer mon mot de passe"
          description="Au moins 10 caractères. Les autres appareils connectés seront déconnectés."
        >
          <form onSubmit={submit} noValidate className="space-y-4">
            <TextField
              label="Mot de passe actuel"
              type="password"
              required
              autoComplete="current-password"
              value={current}
              onChange={setCurrent}
              error={errors["currentPassword"]}
            />
            <TextField
              label="Nouveau mot de passe"
              type="password"
              required
              autoComplete="new-password"
              value={next}
              onChange={setNext}
              error={errors["newPassword"]}
            />
            <TextField
              label="Confirmer le nouveau mot de passe"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={setConfirm}
              error={errors["confirm"]}
            />
            <button type="submit" className={abtn.primary} disabled={pending}>
              {pending ? "Enregistrement..." : "Changer le mot de passe"}
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
