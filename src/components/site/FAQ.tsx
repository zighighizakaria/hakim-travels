import { useT } from "@/i18n/useI18n";
import type { FaqItem } from "@/lib/types";

export function FAQ({ items, title }: { items: readonly FaqItem[]; title?: string }) {
  const t = useT();
  if (!items.length) return null;
  return (
    <div>
      <h2 className="display-section text-navy">{title ?? t.tripPage.faq}</h2>
      <div className="mt-8">
        {items.map((item, i) => (
          <details key={i} className="group border-b border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-start font-display text-lg font-semibold text-navy [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="shrink-0 text-2xl leading-none text-primary transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-5 text-[0.98rem] leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
