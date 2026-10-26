import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { adminSaveDepartureFn } from "@/functions/admin/departures.functions";
import { departureInputSchema } from "@/lib/schemas";
import type { AdminDeparture } from "@/lib/types";
import { BilingualField } from "./BilingualField";
import { DateField, NumberField, SelectField } from "./Field";
import { numOrNull, numToStr, useAdminAction, validate, type FieldErrors } from "./form";
import { Modal } from "./Modal";
import { abtn } from "./ui";

export type TripOption = { id: number; label: string };

type State = {
  tripId: string;
  startDate: string;
  endDate: string;
  departureCityFr: string;
  departureCityAr: string;
  meetingPointFr: string;
  meetingPointAr: string;
  priceMad: string;
  childPriceMad: string;
  seatsTotal: string;
  seatsLeft: string;
  status: "open" | "full" | "cancelled";
  noteFr: string;
  noteAr: string;
};

function initialState(departure: AdminDeparture | null, tripId: number | null): State {
  if (departure) {
    return {
      tripId: String(departure.tripId),
      startDate: departure.startDate,
      endDate: departure.endDate,
      departureCityFr: departure.departureCityFr,
      departureCityAr: departure.departureCityAr ?? "",
      meetingPointFr: departure.meetingPointFr ?? "",
      meetingPointAr: departure.meetingPointAr ?? "",
      priceMad: numToStr(departure.priceMad),
      childPriceMad: numToStr(departure.childPriceMad),
      seatsTotal: numToStr(departure.seatsTotal),
      seatsLeft: numToStr(departure.seatsLeft),
      status: departure.status,
      noteFr: departure.noteFr ?? "",
      noteAr: departure.noteAr ?? "",
    };
  }
  return {
    tripId: tripId === null ? "" : String(tripId),
    startDate: "",
    endDate: "",
    departureCityFr: "",
    departureCityAr: "",
    meetingPointFr: "",
    meetingPointAr: "",
    priceMad: "",
    childPriceMad: "",
    seatsTotal: "",
    seatsLeft: "",
    status: "open",
    noteFr: "",
    noteAr: "",
  };
}

/**
 * Création ou modification d'un départ. À monter seulement quand la fenêtre doit s'afficher
 * (le formulaire repart ainsi toujours d'un état propre).
 */
export function DepartureModal({
  departure,
  trips,
  fixedTripId,
  onClose,
}: {
  departure: AdminDeparture | null;
  trips: TripOption[];
  /** Voyage imposé (depuis la fiche d'un voyage) : le choix du voyage est masqué. */
  fixedTripId?: number;
  onClose: () => void;
}) {
  const { run, pending } = useAdminAction();
  const [state, setState] = useState<State>(() => initialState(departure, fixedTripId ?? null));
  const [errors, setErrors] = useState<FieldErrors>({});
  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = validate(departureInputSchema, {
      tripId: state.tripId === "" ? undefined : Number(state.tripId),
      startDate: state.startDate,
      endDate: state.endDate,
      departureCityFr: state.departureCityFr,
      departureCityAr: state.departureCityAr,
      meetingPointFr: state.meetingPointFr,
      meetingPointAr: state.meetingPointAr,
      priceMad: numOrNull(state.priceMad),
      childPriceMad: numOrNull(state.childPriceMad),
      seatsTotal: numOrNull(state.seatsTotal),
      seatsLeft: numOrNull(state.seatsLeft),
      status: state.status,
      noteFr: state.noteFr,
      noteAr: state.noteAr,
    });
    if (!result.ok) {
      setErrors(result.errors);
      toast.error("Certains champs sont à corriger.");
      return;
    }
    setErrors({});
    const saved = await run(
      () =>
        adminSaveDepartureFn({
          data: departure ? { id: departure.id, data: result.data } : { data: result.data },
        }),
      { success: departure ? "Départ enregistré." : "Départ ajouté." },
    );
    if (saved) onClose();
  };

  const formId = "departure-form";
  return (
    <Modal
      open
      onClose={onClose}
      title={departure ? "Modifier le départ" : "Nouveau départ"}
      size="lg"
      footer={
        <>
          <button type="button" className={abtn.secondary} onClick={onClose} disabled={pending}>
            Annuler
          </button>
          <button type="submit" form={formId} className={abtn.primary} disabled={pending}>
            {pending ? "Enregistrement..." : "Enregistrer le départ"}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        {fixedTripId === undefined ? (
          <SelectField
            label="Voyage"
            required
            value={state.tripId}
            onChange={(v) => set("tripId", v)}
            error={errors["tripId"]}
          >
            <option value="">Choisir un voyage...</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </SelectField>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <DateField
            label="Date de départ"
            required
            value={state.startDate}
            onChange={(v) =>
              setState((s) => ({
                ...s,
                startDate: v,
                endDate: s.endDate === "" || s.endDate < v ? v : s.endDate,
              }))
            }
            error={errors["startDate"]}
          />
          <DateField
            label="Date de retour"
            required
            value={state.endDate}
            onChange={(v) => set("endDate", v)}
            error={errors["endDate"]}
            hint="Pour un voyage d'une journée, mettez la même date."
          />
        </div>

        <BilingualField
          label="Ville de départ"
          valueFr={state.departureCityFr}
          valueAr={state.departureCityAr}
          onChangeFr={(v) => set("departureCityFr", v)}
          onChangeAr={(v) => set("departureCityAr", v)}
          errorFr={errors["departureCityFr"]}
          errorAr={errors["departureCityAr"]}
          placeholderFr="Casablanca"
        />
        <BilingualField
          label="Lieu de rendez-vous"
          optionalFr
          valueFr={state.meetingPointFr}
          valueAr={state.meetingPointAr}
          onChangeFr={(v) => set("meetingPointFr", v)}
          onChangeAr={(v) => set("meetingPointAr", v)}
          errorFr={errors["meetingPointFr"]}
          errorAr={errors["meetingPointAr"]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Prix adulte (MAD)"
            optional
            min={0}
            value={state.priceMad}
            onChange={(v) => set("priceMad", v)}
            error={errors["priceMad"]}
            hint="Laissez vide pour afficher « Prix sur demande »."
          />
          <NumberField
            label="Prix enfant (MAD)"
            optional
            min={0}
            value={state.childPriceMad}
            onChange={(v) => set("childPriceMad", v)}
            error={errors["childPriceMad"]}
          />
          <NumberField
            label="Nombre de places au total"
            optional
            min={0}
            value={state.seatsTotal}
            onChange={(v) => set("seatsTotal", v)}
            error={errors["seatsTotal"]}
          />
          <NumberField
            label="Places restantes"
            optional
            min={0}
            value={state.seatsLeft}
            onChange={(v) => set("seatsLeft", v)}
            error={errors["seatsLeft"]}
            hint="À 0, le départ s'affiche « Complet »."
          />
        </div>

        <SelectField
          label="Statut"
          value={state.status}
          onChange={(v) => set("status", v as State["status"])}
          error={errors["status"]}
          hint="« Annulé » retire le départ du site."
        >
          <option value="open">Ouvert aux demandes</option>
          <option value="full">Complet</option>
          <option value="cancelled">Annulé</option>
        </SelectField>

        <BilingualField
          label="Note affichée avec le départ"
          optionalFr
          multiline
          rows={2}
          valueFr={state.noteFr}
          valueAr={state.noteAr}
          onChangeFr={(v) => set("noteFr", v)}
          onChangeAr={(v) => set("noteAr", v)}
          errorFr={errors["noteFr"]}
          errorAr={errors["noteAr"]}
        />
      </form>
    </Modal>
  );
}
