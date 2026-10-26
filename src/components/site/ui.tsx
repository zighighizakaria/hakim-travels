import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60";

export const btn = {
  primary: cn(
    base,
    "bg-primary px-6 py-3 text-[0.95rem] text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary)_88%,black)] hover:-translate-y-0.5 shadow-[0_10px_24px_-14px_var(--primary)]",
  ),
  ghostLight: cn(
    base,
    "border border-white/40 bg-white/10 px-6 py-3 text-[0.95rem] text-white backdrop-blur-md hover:bg-white/20",
  ),
  outline: cn(
    base,
    "border border-border bg-card px-6 py-3 text-[0.95rem] text-navy hover:border-primary/40 hover:-translate-y-0.5",
  ),
  whatsapp: cn(
    base,
    "bg-[#25D366] px-6 py-3 text-[0.95rem] text-white hover:brightness-95 hover:-translate-y-0.5",
  ),
  small: cn(base, "bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:brightness-110"),
};

/** Flèche qui se retourne en RTL. À placer dans un parent `group` pour l'animation au survol. */
export function Arrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden="true"
      className={cn(
        "h-[1.1em] w-[1.1em] shrink-0 transition-transform duration-200 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1",
        className,
      )}
    />
  );
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  align = "start",
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string | undefined;
  align?: "start" | "center";
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className={cn("display-section mt-3", light ? "text-white" : "text-navy")}>{title}</h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed",
            light ? "text-white/75" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
