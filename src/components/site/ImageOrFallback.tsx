import type { ImageRef } from "@/lib/types";
import { cn } from "@/lib/utils";

const gradients = [
  "from-navy via-primary to-ocean",
  "from-primary via-ocean to-turquoise",
  "from-navy via-ocean to-leaf",
  "from-ocean via-turquoise to-leaf",
];

/**
 * Image du contenu, ou dégradé de marque quand il n'y a pas (encore) de photo.
 * Le parent fixe le ratio (`aspect-*`) : le composant remplit son conteneur.
 */
export function ImageOrFallback({
  image,
  alt,
  emoji,
  seed = 0,
  className,
  loading = "lazy",
}: {
  image: ImageRef | null | undefined;
  alt: string;
  emoji?: string | null | undefined;
  /** Sert à varier le dégradé d'une carte à l'autre. */
  seed?: number;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  if (image) {
    return (
      <img
        src={image.url}
        alt={image.alt ?? alt}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        loading={loading}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  const gradient = gradients[Math.abs(seed) % gradients.length];
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className,
      )}
    >
      <span
        className="absolute -end-12 -top-12 h-48 w-48 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <span
        className="absolute -bottom-16 -start-10 h-56 w-56 rounded-full bg-sun/15"
        aria-hidden="true"
      />
      {emoji ? (
        <span className="relative text-6xl opacity-90 drop-shadow md:text-7xl" aria-hidden="true">
          {emoji}
        </span>
      ) : null}
    </div>
  );
}
