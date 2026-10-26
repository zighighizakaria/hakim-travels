import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Plane,
  Settings,
  Star,
  UserCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { logoutFn } from "@/functions/auth.functions";
import type { AdminUserInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAdminAction } from "./form";

type NavItem = {
  to:
    | "/admin"
    | "/admin/voyages"
    | "/admin/departs"
    | "/admin/destinations"
    | "/admin/medias"
    | "/admin/avis"
    | "/admin/reglages"
    | "/admin/compte";
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/voyages", label: "Voyages", icon: Plane },
  { to: "/admin/departs", label: "Départs", icon: CalendarDays },
  { to: "/admin/destinations", label: "Destinations", icon: MapPin },
  { to: "/admin/medias", label: "Médias", icon: Images },
  { to: "/admin/avis", label: "Avis clients", icon: Star },
  { to: "/admin/reglages", label: "Réglages du site", icon: Settings },
  { to: "/admin/compte", label: "Mon compte", icon: UserCircle },
];

/** Cadre du back-office : barre latérale (tiroir sur mobile), entête avec nom et déconnexion, toasts. */
export function AdminLayout({ user, children }: { user: AdminUserInfo; children: ReactNode }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const { run, pending } = useAdminAction();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const logout = async () => {
    const done = await run(() => logoutFn(), { invalidate: false });
    if (done) {
      await router.invalidate();
      await router.navigate({ to: "/admin/connexion", search: {} });
    }
  };

  const nav = (
    <nav
      aria-label="Navigation du back-office"
      className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
    >
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.exact ?? false }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          activeProps={{ className: "bg-white/15 !text-white" }}
        >
          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Barre latérale (grand écran) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Brand />
        {nav}
      </aside>

      {/* Tiroir (mobile) */}
      <div
        className={cn("fixed inset-0 z-40 lg:hidden", menuOpen ? "block" : "hidden")}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <button
          type="button"
          aria-label="Fermer le menu"
          className="absolute inset-0 bg-navy/60"
          onClick={() => setMenuOpen(false)}
        />
        <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-navy shadow-lift">
          <div className="flex items-center justify-between pe-3">
            <Brand />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
              className="rounded-lg p-2 text-white/80 hover:bg-white/10"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {nav}
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="rounded-lg p-2 text-navy hover:bg-muted lg:hidden"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-primary hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Voir le site</span>
              <span className="sr-only sm:hidden">Voir le site</span>
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <p
              className="max-w-[11rem] truncate text-sm font-semibold text-navy"
              title={user.email}
            >
              {user.name}
            </p>
            <button
              type="button"
              onClick={logout}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy/20 bg-card px-3 py-2 text-sm font-semibold text-navy hover:border-primary/50 hover:bg-muted disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Se déconnecter</span>
              <span className="sr-only sm:hidden">Se déconnecter</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

function Brand() {
  return (
    <Link to="/admin" className="flex items-center gap-3 px-5 py-5">
      <img src="/favicon.png" alt="" className="h-9 w-9 rounded-lg bg-white/90 p-1" />
      <span className="leading-tight">
        <span className="block font-display text-base font-bold text-white">Hakim Travels</span>
        <span className="block text-xs font-medium text-white/60">Administration</span>
      </span>
    </Link>
  );
}
