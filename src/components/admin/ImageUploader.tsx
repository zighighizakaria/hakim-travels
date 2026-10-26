import { useRouter } from "@tanstack/react-router";
import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { adminUploadImageFn } from "@/functions/admin/media.functions";
import type { AdminImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { errorMessage } from "./form";

/** Même limite que le serveur par défaut (MAX_UPLOAD_MB) : le serveur reste juge en dernier ressort. */
export const MAX_UPLOAD_MB = 8;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ACCEPTED_EXT = /\.(jpe?g|png|webp|avif)$/i;

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",");
}

/** Message clair en français si le fichier est refusé, sinon `null`. */
export function checkImageFile(file: File, maxMb = MAX_UPLOAD_MB): string | null {
  const typeOk = ACCEPTED_TYPES.includes(file.type) || (!file.type && ACCEPTED_EXT.test(file.name));
  if (!typeOk) {
    return `« ${file.name} » n'est pas une image acceptée. Formats possibles : JPEG, PNG, WebP ou AVIF.`;
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `« ${file.name} » est trop lourd (${formatMb(file.size)} Mo). Taille maximale : ${maxMb} Mo.`;
  }
  if (file.size === 0) return `« ${file.name} » est vide.`;
  return null;
}

type Line = {
  key: number;
  name: string;
  state: "waiting" | "uploading" | "done" | "error";
  message?: string;
};

/**
 * Zone de dépôt : glisser-déposer ou parcourir, plusieurs fichiers à la fois.
 * Taille et type sont contrôlés avant l'envoi.
 */
export function ImageUploader({
  onUploaded,
  multiple = true,
  maxMb = MAX_UPLOAD_MB,
  compact,
}: {
  onUploaded?: (images: AdminImage[]) => void;
  multiple?: boolean;
  maxMb?: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);

  const setLine = (key: number, patch: Partial<Line>) =>
    setLines((current) => current.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const handleFiles = async (list: FileList | File[]) => {
    const files = Array.from(list);
    if (files.length === 0 || busy) return;
    const selected = multiple ? files : files.slice(0, 1);

    const base = Date.now();
    const entries = selected.map((file, i) => ({ file, key: base + i }));
    const initial: Line[] = [];
    const valid: typeof entries = [];
    for (const entry of entries) {
      const problem = checkImageFile(entry.file, maxMb);
      if (problem) {
        initial.push({ key: entry.key, name: entry.file.name, state: "error", message: problem });
        toast.error(problem);
      } else {
        initial.push({ key: entry.key, name: entry.file.name, state: "waiting" });
        valid.push(entry);
      }
    }
    setLines(initial);
    if (valid.length === 0) return;

    setBusy(true);
    const uploaded: AdminImage[] = [];
    for (const { file, key } of valid) {
      setLine(key, { state: "uploading" });
      try {
        const body = new FormData();
        body.append("file", file);
        const image = await adminUploadImageFn({ data: body });
        uploaded.push(image);
        setLine(key, { state: "done" });
      } catch (error) {
        const message = errorMessage(error);
        setLine(key, { state: "error", message: `« ${file.name} » : ${message}` });
        toast.error(`« ${file.name} » : ${message}`);
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    if (uploaded.length > 0) {
      toast.success(
        uploaded.length === 1 ? "Image ajoutée." : `${uploaded.length} images ajoutées.`,
      );
      onUploaded?.(uploaded);
      await router.invalidate();
    }
  };

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors",
          compact ? "gap-2 px-4 py-5" : "gap-3 px-6 py-9",
          dragging ? "border-primary bg-primary/5" : "border-navy/25 bg-muted/40",
        )}
      >
        {busy ? (
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
        ) : (
          <ImagePlus className="h-7 w-7 text-primary" aria-hidden="true" />
        )}
        <p className="text-sm font-semibold text-navy">
          {multiple ? "Glissez vos images ici" : "Glissez une image ici"}
        </p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP ou AVIF, {maxMb} Mo maximum par image.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center rounded-xl border border-navy/20 bg-card px-4 py-2 text-sm font-semibold text-navy hover:border-primary/50 hover:bg-muted disabled:opacity-60"
        >
          {busy ? "Envoi en cours..." : multiple ? "Parcourir mes fichiers" : "Choisir un fichier"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple={multiple}
          className="sr-only"
          aria-label="Choisir des images à téléverser"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
          }}
        />
      </div>

      {lines.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm" aria-live="polite">
          {lines.map((line) => (
            <li
              key={line.key}
              className={cn(
                "rounded-lg px-3 py-1.5",
                line.state === "error" && "bg-destructive/10 font-medium text-destructive",
                line.state === "done" && "bg-emerald-50 text-emerald-900",
                (line.state === "waiting" || line.state === "uploading") &&
                  "bg-muted text-muted-foreground",
              )}
            >
              {line.state === "error"
                ? line.message
                : line.state === "done"
                  ? `${line.name} : ajoutée`
                  : line.state === "uploading"
                    ? `${line.name} : envoi en cours...`
                    : `${line.name} : en attente`}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
