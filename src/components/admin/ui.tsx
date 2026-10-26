import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Boutons et blocs de base du back-office (même identité que le site : bleu, turquoise, marine). */

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60";

export const abtn = {
  primary: cn(base, "bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:brightness-110"),
  secondary: cn(
    base,
    "border border-navy/20 bg-card px-4 py-2.5 text-sm text-navy hover:border-primary/50 hover:bg-muted",
  ),
  danger: cn(base, "bg-destructive px-4 py-2.5 text-sm text-white hover:brightness-110"),
  dangerOutline: cn(
    base,
    "border border-destructive/40 bg-card px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5",
  ),
  ghost: cn(base, "px-3 py-2 text-sm text-navy hover:bg-muted"),
  /** Variantes compactes pour les lignes de tableau. */
  smSecondary: cn(
    base,
    "border border-navy/20 bg-card px-3 py-1.5 text-[0.8rem] text-navy hover:border-primary/50 hover:bg-muted",
  ),
  smDanger: cn(
    base,
    "border border-destructive/40 bg-card px-3 py-1.5 text-[0.8rem] text-destructive hover:bg-destructive/5",
  ),
  smPrimary: cn(
    base,
    "bg-primary px-3 py-1.5 text-[0.8rem] text-primary-foreground hover:brightness-110",
  ),
  icon: cn(
    base,
    "h-8 w-8 border border-navy/15 bg-card p-0 text-navy hover:border-primary/50 hover:bg-muted disabled:opacity-35",
  ),
};

export function Card({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-soft", className)}>
      {title || actions ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title ? <h2 className="text-base font-semibold text-navy">{title}</h2> : null}
            {description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {back ? <div className="mb-2">{back}</div> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

/** Lien de retour (rendu par l'appelant avec un `<Link>`). */
export function BackLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string | undefined;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-navy/20 bg-card px-6 py-10 text-center">
      <p className="font-display text-base font-semibold text-navy">{title}</p>
      {text ? <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{text}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export type TabItem<K extends string> = { key: K; label: string; hasError?: boolean };

export function Tabs<K extends string>({
  tabs,
  current,
  onChange,
}: {
  tabs: TabItem<K>[];
  current: K;
  onChange: (key: K) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Sections du formulaire"
      className="-mx-4 mb-5 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0"
    >
      {tabs.map((tab) => {
        const active = tab.key === current;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative -mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-navy",
            )}
          >
            {tab.label}
            {tab.hasError ? (
              <span
                aria-label="Erreur dans cette section"
                className="ms-1.5 inline-block h-2 w-2 rounded-full bg-destructive align-middle"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
