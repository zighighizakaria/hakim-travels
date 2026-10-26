import { ArrowLeft, ArrowRight, Check, ImageIcon, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdminImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FieldError } from "./Field";
import { moveItem } from "./form";
import { ImageUploader } from "./ImageUploader";
import { Modal } from "./Modal";
import { abtn } from "./ui";

/** Fusionne la bibliothèque (rechargée par le routeur) et les images tout juste téléversées. */
function useLibrary(images: AdminImage[]) {
  const [extra, setExtra] = useState<AdminImage[]>([]);
  const all = useMemo(() => {
    const known = new Set(images.map((i) => i.id));
    return [...extra.filter((i) => !known.has(i.id)), ...images];
  }, [images, extra]);
  const byId = useMemo(() => new Map(all.map((i) => [i.id, i])), [all]);
  return { all, byId, addExtra: (added: AdminImage[]) => setExtra((cur) => [...added, ...cur]) };
}

function Thumb({ image, className }: { image: AdminImage | undefined; className?: string }) {
  return image ? (
    <img
      src={image.url}
      alt={image.altFr ?? image.originalName ?? ""}
      loading="lazy"
      className={cn("h-full w-full object-cover", className)}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      <ImageIcon className="h-6 w-6" aria-hidden="true" />
    </div>
  );
}

function LibraryGrid({
  images,
  selected,
  onToggle,
}: {
  images: AdminImage[];
  selected: number[];
  onToggle: (image: AdminImage) => void;
}) {
  if (images.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        La bibliothèque est vide. Téléversez une première image ci-dessus.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {images.map((image) => {
        const on = selected.includes(image.id);
        return (
          <li key={image.id}>
            <button
              type="button"
              onClick={() => onToggle(image)}
              aria-pressed={on}
              title={image.altFr ?? image.originalName ?? `Image ${image.id}`}
              className={cn(
                "relative block aspect-[4/3] w-full overflow-hidden rounded-xl border-2 transition",
                on
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-primary/40",
              )}
            >
              <Thumb image={image} />
              {on ? (
                <span className="absolute end-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Choix d'une image unique : dans la bibliothèque ou par téléversement. */
export function ImagePicker({
  label,
  images,
  value,
  onChange,
  hint,
  error,
}: {
  label: string;
  images: AdminImage[];
  value: number | null;
  onChange: (id: number | null) => void;
  hint?: string;
  error?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const { all, byId, addExtra } = useLibrary(images);
  const current = value !== null ? byId.get(value) : undefined;

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-navy">{label}</p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {value !== null ? <Thumb image={current} /> : <Thumb image={undefined} />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={abtn.secondary} onClick={() => setOpen(true)}>
            {value === null ? "Choisir une image" : "Changer l'image"}
          </button>
          {value !== null ? (
            <button type="button" className={abtn.ghost} onClick={() => onChange(null)}>
              Retirer
            </button>
          ) : null}
        </div>
      </div>
      {hint && !error ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
      <FieldError>{error}</FieldError>

      <Modal open={open} onClose={() => setOpen(false)} title={label} size="xl">
        <div className="space-y-5">
          <ImageUploader
            multiple={false}
            compact
            onUploaded={(added) => {
              addExtra(added);
              const first = added[0];
              if (first) {
                onChange(first.id);
                setOpen(false);
              }
            }}
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-navy">Ou choisir dans la bibliothèque</p>
            <LibraryGrid
              images={all}
              selected={value === null ? [] : [value]}
              onToggle={(image) => {
                onChange(image.id);
                setOpen(false);
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

/** Galerie ordonnée : ajouter plusieurs images, réordonner, retirer. */
export function GalleryPicker({
  label,
  images,
  values,
  onChange,
  hint,
}: {
  label: string;
  images: AdminImage[];
  values: number[];
  onChange: (ids: number[]) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const { all, byId, addExtra } = useLibrary(images);

  const toggle = (image: AdminImage) =>
    onChange(
      values.includes(image.id) ? values.filter((id) => id !== image.id) : [...values, image.id],
    );

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-navy">
          {label} <span className="font-normal text-muted-foreground">({values.length})</span>
        </p>
        <button type="button" className={abtn.secondary} onClick={() => setOpen(true)}>
          Ajouter des images
        </button>
      </div>
      {hint ? <p className="mb-3 text-xs text-muted-foreground">{hint}</p> : null}

      {values.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 px-4 py-6 text-center text-sm text-muted-foreground">
          Aucune image dans la galerie.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {values.map((id, index) => (
            <li key={id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-[4/3]">
                <Thumb image={byId.get(id)} />
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <button
                  type="button"
                  className={abtn.icon}
                  disabled={index === 0}
                  onClick={() => onChange(moveItem(values, index, index - 1))}
                  aria-label={`Déplacer l'image ${index + 1} vers le début`}
                  title="Avant"
                >
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={abtn.icon}
                  disabled={index === values.length - 1}
                  onClick={() => onChange(moveItem(values, index, index + 1))}
                  aria-label={`Déplacer l'image ${index + 1} vers la fin`}
                  title="Après"
                >
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${abtn.icon} text-destructive`}
                  onClick={() => onChange(values.filter((v) => v !== id))}
                  aria-label={`Retirer l'image ${index + 1} de la galerie`}
                  title="Retirer"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        size="xl"
        footer={
          <button type="button" className={abtn.primary} onClick={() => setOpen(false)}>
            Terminer ({values.length} image{values.length > 1 ? "s" : ""})
          </button>
        }
      >
        <div className="space-y-5">
          <ImageUploader
            compact
            onUploaded={(added) => {
              addExtra(added);
              onChange([...values, ...added.map((a) => a.id).filter((id) => !values.includes(id))]);
            }}
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-navy">
              Ou cocher des images de la bibliothèque
            </p>
            <LibraryGrid images={all} selected={values} onToggle={toggle} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
