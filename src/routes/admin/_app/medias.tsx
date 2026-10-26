import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DemoBadge } from "@/components/admin/DemoBadge";
import { TextField } from "@/components/admin/Field";
import { errorMessage, useAdminAction } from "@/components/admin/form";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Modal } from "@/components/admin/Modal";
import { Card, EmptyState, PageHeader, abtn } from "@/components/admin/ui";
import {
  adminDeleteImageFn,
  adminImageUsageFn,
  adminListImagesFn,
  adminUpdateImageFn,
} from "@/functions/admin/media.functions";
import { imageAltInputSchema } from "@/lib/schemas";
import type { AdminImage, ImageUsage } from "@/lib/types";

export const Route = createFileRoute("/admin/_app/medias")({
  loader: () => adminListImagesFn(),
  component: MediaPage,
});

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

const USE_LABEL = {
  destination: "Destination",
  trip: "Voyage",
  settings: "Réglages",
} as const;

function ImageModal({ image, onClose }: { image: AdminImage; onClose: () => void }) {
  const { run, pending } = useAdminAction();
  const [altFr, setAltFr] = useState(image.altFr ?? "");
  const [altAr, setAltAr] = useState(image.altAr ?? "");
  const [usage, setUsage] = useState<ImageUsage | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    adminImageUsageFn({ data: { id: image.id } })
      .then((u) => {
        if (!cancelled) setUsage(u);
      })
      .catch((error: unknown) => {
        if (!cancelled) toast.error(errorMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, [image.id]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = imageAltInputSchema.safeParse({ id: image.id, altFr, altAr });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = "Trop long : 300 caractères maximum.";
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const done = await run(() => adminUpdateImageFn({ data: parsed.data }), {
      success: "Description enregistrée.",
    });
    if (done) onClose();
  };

  const used = usage?.total ?? 0;

  return (
    <Modal open onClose={onClose} title="Détail de l'image" size="lg">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <img
            src={image.url}
            alt={image.altFr ?? image.originalName ?? ""}
            className="w-full rounded-xl border border-border bg-muted object-contain"
          />
          <p className="mt-2 break-all text-xs text-muted-foreground">
            {image.originalName ?? image.path} - {formatSize(image.sizeBytes)}
            {image.width && image.height ? ` - ${image.width} x ${image.height} px` : ""}
          </p>
        </div>
        <form onSubmit={save} className="space-y-4" noValidate>
          <TextField
            label="Description en français"
            optional
            value={altFr}
            onChange={setAltFr}
            error={errors["altFr"]}
            hint="Décrit l'image pour les personnes malvoyantes et pour Google."
          />
          <TextField
            label="Description en arabe"
            optional
            value={altAr}
            onChange={setAltAr}
            error={errors["altAr"]}
            dir="rtl"
            lang="ar"
          />
          <button type="submit" className={abtn.primary} disabled={pending}>
            {pending ? "Enregistrement..." : "Enregistrer les descriptions"}
          </button>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-navy">Utilisation</p>
            {usage === null ? (
              <p className="mt-1 text-sm text-muted-foreground">Vérification...</p>
            ) : usage.total === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Cette image n'est utilisée nulle part.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-foreground">
                  Utilisée à {usage.total} endroit{usage.total > 1 ? "s" : ""} :
                </p>
                <ul className="mt-1 list-disc ps-5 text-sm text-muted-foreground">
                  {usage.uses.map((u) => (
                    <li key={`${u.kind}-${u.id}`}>
                      {USE_LABEL[u.kind]} : {u.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-4">
              <ConfirmButton
                title="Supprimer cette image ?"
                confirmLabel="Supprimer l'image"
                disabled={usage === null || pending}
                message={
                  used > 0 ? (
                    <>
                      <p>
                        Cette image est utilisée à <strong>{used}</strong> endroit
                        {used > 1 ? "s" : ""}. En la supprimant, elle disparaîtra de ces pages.
                      </p>
                      <p className="mt-2 font-semibold">Cette action est irréversible.</p>
                    </>
                  ) : (
                    <p>Cette image sera supprimée définitivement.</p>
                  )
                }
                onConfirm={async () => {
                  const result = await run(
                    () => adminDeleteImageFn({ data: { id: image.id, force: used > 0 } }),
                    { success: "Image supprimée." },
                  );
                  if (result?.ok) onClose();
                  else if (result && !result.ok) {
                    toast.error("Cette image est utilisée : rouvrez la fenêtre pour voir où.");
                  }
                }}
              >
                Supprimer cette image
              </ConfirmButton>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function MediaPage() {
  const images = Route.useLoaderData();
  const [selected, setSelected] = useState<AdminImage | null>(null);

  return (
    <>
      <PageHeader
        title="Médias"
        description="La bibliothèque d'images du site. Téléversez vos photos ici ou directement depuis un voyage ou une destination."
      />

      <Card title="Ajouter des images" className="mb-6">
        <ImageUploader />
      </Card>

      {images.length === 0 ? (
        <EmptyState
          title="La bibliothèque est vide"
          text="Ajoutez vos premières photos ci-dessus."
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {images.length} image{images.length > 1 ? "s" : ""}. Cliquez sur une image pour modifier
            sa description ou la supprimer.
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image) => (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setSelected(image)}
                  className="group block w-full overflow-hidden rounded-xl border border-border bg-card text-start shadow-soft transition-colors hover:border-primary/50"
                >
                  <span className="relative block aspect-[4/3] bg-muted">
                    <img
                      src={image.url}
                      alt={image.altFr ?? image.originalName ?? ""}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {image.isDemo ? (
                      <span className="absolute start-1.5 top-1.5">
                        <DemoBadge />
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate px-2.5 py-2 text-xs text-muted-foreground">
                    {image.altFr ?? image.originalName ?? `Image ${image.id}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {selected ? (
        <ImageModal key={selected.id} image={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  );
}
