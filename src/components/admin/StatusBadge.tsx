import { cn } from "@/lib/utils";

export type BadgeStatus =
  "draft" | "published" | "hidden" | "open" | "full" | "cancelled" | "archived";

const STYLES: Record<BadgeStatus, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-amber-100 text-amber-900" },
  published: { label: "Publié", className: "bg-emerald-100 text-emerald-900" },
  hidden: { label: "Non publié", className: "bg-slate-200 text-slate-700" },
  open: { label: "Ouvert", className: "bg-emerald-100 text-emerald-900" },
  full: { label: "Complet", className: "bg-orange-100 text-orange-900" },
  cancelled: { label: "Annulé", className: "bg-red-100 text-red-800" },
  archived: { label: "Archivé", className: "bg-slate-200 text-slate-700" },
};

/** Pastille de statut : brouillon, publié, ouvert, complet, annulé, archivé. */
export function StatusBadge({ status, label }: { status: BadgeStatus; label?: string }) {
  const style = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        style.className,
      )}
    >
      {label ?? style.label}
    </span>
  );
}
