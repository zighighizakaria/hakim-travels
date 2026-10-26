import { Link } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import { langParam, type Lang } from "@/i18n/config";
import { useLang, useT } from "@/i18n/useI18n";
import { cn } from "@/lib/utils";

/**
 * Bascule FR/AR en restant sur la page courante (même route, mêmes paramètres et même recherche).
 * Le libellé est toujours dans la langue cible, quelle que soit la langue courante.
 */
export function LangSwitcher({ className, onClick }: { className?: string; onClick?: () => void }) {
  const lang = useLang();
  const t = useT();
  const next: Lang = lang === "fr" ? "ar" : "fr";

  return (
    <Link
      to="."
      params={((p: Record<string, unknown>) => ({ ...p, lang: langParam(next) })) as never}
      search={((s: Record<string, unknown>) => s) as never}
      lang={next}
      hrefLang={next}
      aria-label={t.lang.switchLabel}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-semibold text-navy transition-colors hover:border-primary/40 hover:text-primary",
        className,
      )}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {t.lang[next]}
    </Link>
  );
}
