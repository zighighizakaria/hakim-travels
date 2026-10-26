import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { abtn } from "@/components/admin/ui";
import { getCurrentUser } from "@/functions/auth.functions";

/** Garde de session : sans session valide, redirection vers la connexion (avec retour sur la page demandée). */
export const Route = createFileRoute("/admin/_app")({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: "/admin/connexion", search: { redirect: location.href } });
    }
    return { user };
  },
  head: () => ({
    meta: [
      { title: "Administration - Hakim Travels" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminShell,
  notFoundComponent: AdminNotFound,
});

function AdminShell() {
  const { user } = Route.useRouteContext();
  return (
    <AdminLayout user={user}>
      <Outlet />
    </AdminLayout>
  );
}

function AdminNotFound() {
  return (
    <div className="py-16 text-center">
      <p className="font-display text-5xl font-bold text-navy">404</p>
      <p className="mt-3 text-muted-foreground">Cette page n'existe pas ou a été supprimée.</p>
      <div className="mt-6 flex justify-center">
        <Link to="/admin" className={abtn.primary}>
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
