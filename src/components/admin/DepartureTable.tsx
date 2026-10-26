import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  adminArchiveDepartureFn,
  adminDeleteDepartureFn,
  adminQuickUpdateDepartureFn,
} from "@/functions/admin/departures.functions";
import { formatDateRange, formatPrice } from "@/lib/format";
import type { AdminDeparture } from "@/lib/types";
import { ConfirmButton } from "./ConfirmButton";
import { DemoBadge } from "./DemoBadge";
import { inputClass } from "./Field";
import { useAdminAction } from "./form";
import { StatusBadge } from "./StatusBadge";
import { abtn } from "./ui";

function DepartureRow({
  departure: d,
  showTrip,
  onEdit,
}: {
  departure: AdminDeparture;
  showTrip: boolean;
  onEdit: (departure: AdminDeparture) => void;
}) {
  const { run, pending } = useAdminAction();
  const [seats, setSeats] = useState(d.seatsLeft === null ? "" : String(d.seatsLeft));
  const [seatsError, setSeatsError] = useState<string | null>(null);

  // Resynchronise le champ quand la valeur serveur change (après rechargement).
  const serverSeats = d.seatsLeft === null ? "" : String(d.seatsLeft);
  const [lastServerSeats, setLastServerSeats] = useState(serverSeats);
  if (serverSeats !== lastServerSeats) {
    setLastServerSeats(serverSeats);
    setSeats(serverSeats);
  }

  const commitSeats = async () => {
    const value = seats.trim();
    if (value === serverSeats) {
      setSeatsError(null);
      return;
    }
    const n = Number(value);
    if (value === "" || !Number.isInteger(n) || n < 0) {
      setSeatsError("Nombre entier positif attendu.");
      return;
    }
    if (d.seatsTotal !== null && n > d.seatsTotal) {
      setSeatsError(`Maximum ${d.seatsTotal}.`);
      return;
    }
    setSeatsError(null);
    const ok = await run(() => adminQuickUpdateDepartureFn({ data: { id: d.id, seatsLeft: n } }), {
      success: "Places mises à jour.",
    });
    if (!ok) setSeats(serverSeats);
  };

  const dim = d.archived || d.status === "cancelled";

  return (
    <li className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className={`min-w-0 ${dim ? "opacity-70" : ""}`}>
        {showTrip ? (
          <p className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/voyages/$id"
              params={{ id: String(d.tripId) }}
              className="font-semibold text-navy hover:text-primary hover:underline"
            >
              {d.tripTitle}
            </Link>
            {d.isDemo ? <DemoBadge /> : null}
          </p>
        ) : null}
        <p className={showTrip ? "text-sm text-muted-foreground" : "font-semibold text-navy"}>
          {formatDateRange(d.startDate, d.endDate, "fr")}
          {!showTrip && d.isDemo ? (
            <span className="ms-2 align-middle">
              <DemoBadge />
            </span>
          ) : null}
        </p>
        <p className="text-sm text-muted-foreground">
          Départ de {d.departureCityFr} - {formatPrice(d.priceMad, "fr") ?? "Prix sur demande"}
          {d.seatsTotal !== null ? ` - ${d.seatsTotal} places au total` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor={`seats-${d.id}`}
            className="mb-1 block text-xs font-semibold text-muted-foreground"
          >
            Places restantes
          </label>
          <input
            id={`seats-${d.id}`}
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={seats}
            disabled={pending}
            placeholder="Illimité"
            onChange={(event) => setSeats(event.target.value)}
            onBlur={() => void commitSeats()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
            aria-invalid={seatsError ? true : undefined}
            className={`${inputClass(Boolean(seatsError))} w-28 py-1.5`}
          />
          {seatsError ? (
            <p className="mt-1 text-xs font-medium text-destructive">{seatsError}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={`status-${d.id}`}
            className="mb-1 block text-xs font-semibold text-muted-foreground"
          >
            Statut
          </label>
          <select
            id={`status-${d.id}`}
            value={d.status}
            disabled={pending}
            onChange={(event) =>
              void run(
                () =>
                  adminQuickUpdateDepartureFn({
                    data: { id: d.id, status: event.target.value as AdminDeparture["status"] },
                  }),
                { success: "Statut mis à jour." },
              )
            }
            className={`${inputClass()} w-36 py-1.5`}
          >
            <option value="open">Ouvert</option>
            <option value="full">Complet</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        {d.archived ? (
          <StatusBadge status="archived" />
        ) : d.status === "open" && d.seatsLeft === 0 ? (
          <StatusBadge status="full" />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={abtn.smSecondary}
            onClick={() => onEdit(d)}
            disabled={pending}
          >
            Modifier
          </button>
          <button
            type="button"
            className={abtn.smSecondary}
            disabled={pending}
            onClick={() =>
              void run(
                () => adminArchiveDepartureFn({ data: { id: d.id, archived: !d.archived } }),
                {
                  success: d.archived ? "Départ désarchivé." : "Départ archivé.",
                },
              )
            }
          >
            {d.archived ? "Désarchiver" : "Archiver"}
          </button>
          <ConfirmButton
            buttonClassName={abtn.smDanger}
            title="Supprimer ce départ ?"
            confirmLabel="Supprimer"
            disabled={pending}
            message={
              <p>
                Le départ du {formatDateRange(d.startDate, d.endDate, "fr")} ({d.tripTitle}) sera
                supprimé définitivement. Pour simplement le retirer du site, utilisez plutôt «
                Archiver ».
              </p>
            }
            onConfirm={async () => {
              await run(() => adminDeleteDepartureFn({ data: { id: d.id } }), {
                success: "Départ supprimé.",
              });
            }}
          >
            Supprimer
          </ConfirmButton>
        </div>
      </div>
    </li>
  );
}

/** Liste de départs avec édition rapide (places restantes, statut), archivage et suppression. */
export function DepartureTable({
  departures,
  showTrip = true,
  onEdit,
}: {
  departures: AdminDeparture[];
  showTrip?: boolean;
  onEdit: (departure: AdminDeparture) => void;
}) {
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card px-5 shadow-soft">
      {departures.map((d) => (
        <DepartureRow key={d.id} departure={d} showTrip={showTrip} onEdit={onEdit} />
      ))}
    </ul>
  );
}
