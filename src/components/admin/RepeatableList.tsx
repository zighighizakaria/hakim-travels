import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { moveItem } from "./form";
import { abtn } from "./ui";

/**
 * Liste d'éléments répétables : ajouter, supprimer, monter, descendre.
 * `renderItem` reçoit l'élément, son index et une fonction `update(patch)`.
 */
export function RepeatableList<T extends object>({
  items,
  onChange,
  newItem,
  renderItem,
  addLabel,
  itemLabel,
  emptyText,
  max = 80,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel: string;
  /** Libellé d'un élément (« Jour », « Question »...), suivi de son numéro. */
  itemLabel: string;
  emptyText?: string;
  max?: number;
}) {
  const update = (index: number, patch: Partial<T>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-3">
      {items.length === 0 && emptyText ? (
        <p className="rounded-xl border border-dashed border-navy/20 px-4 py-5 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : null}

      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-primary">
              {itemLabel} {index + 1}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className={abtn.icon}
                onClick={() => onChange(moveItem(items, index, index - 1))}
                disabled={index === 0}
                aria-label={`Monter : ${itemLabel} ${index + 1}`}
                title="Monter"
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={abtn.icon}
                onClick={() => onChange(moveItem(items, index, index + 1))}
                disabled={index === items.length - 1}
                aria-label={`Descendre : ${itemLabel} ${index + 1}`}
                title="Descendre"
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${abtn.icon} text-destructive`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label={`Supprimer : ${itemLabel} ${index + 1}`}
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          {renderItem(item, index, (patch) => update(index, patch))}
        </div>
      ))}

      <button
        type="button"
        className={abtn.secondary}
        onClick={() => onChange([...items, newItem()])}
        disabled={items.length >= max}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {addLabel}
      </button>
    </div>
  );
}
