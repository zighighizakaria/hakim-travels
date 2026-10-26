import type { ReactNode } from "react";
import type { AdminDestinationListItem, Universe } from "@/lib/types";

export const UNIVERSE_LABEL: Record<Universe, string> = {
  maroc: "Maroc",
  international: "International",
  omra: "Omra",
};

export const UNIVERSE_ORDER: Universe[] = ["maroc", "international", "omra"];

/** Titre d'un groupe de destinations (« Maroc : régions », « International : pays »...). */
export const UNIVERSE_GROUP_LABEL: Record<Universe, string> = {
  maroc: "Maroc (régions)",
  international: "International (pays)",
  omra: "Omra",
};

/** Options `<option>` regroupées par univers, pour un `<select>` de destinations. */
export function destinationOptions(destinations: AdminDestinationListItem[]): ReactNode {
  return UNIVERSE_ORDER.map((universe) => {
    const group = destinations.filter((d) => d.universe === universe);
    if (group.length === 0) return null;
    return (
      <optgroup key={universe} label={UNIVERSE_GROUP_LABEL[universe]}>
        {group.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nameFr}
          </option>
        ))}
      </optgroup>
    );
  });
}
