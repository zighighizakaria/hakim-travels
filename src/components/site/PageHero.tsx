import type { ReactNode } from "react";
import type { ImageRef } from "@/lib/types";

/**
 * Bandeau de page. Avec `image` : photo plein cadre ; sans image : fond clair
 * (les pages sans photo, comme les régions du Maroc au départ, restent propres).
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  children,
}: {
  eyebrow?: string | undefined;
  title: string;
  subtitle?: string | null | undefined;
  image?: ImageRef | null | undefined;
  imageAlt?: string | undefined;
  children?: ReactNode;
}) {
  if (!image) {
    return (
      <section className="bg-mist pb-16 pt-32 md:pb-24 md:pt-44">
        <div className="container-page max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1
            className="display-hero mt-3 text-navy"
            style={{ fontSize: "clamp(2.3rem,5vw,4rem)" }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
          ) : null}
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-[62svh] items-end overflow-hidden pt-28">
      <div className="absolute inset-0">
        <img
          src={image.url}
          alt={image.alt ?? imageAlt ?? title}
          width={image.width ?? undefined}
          height={image.height ?? undefined}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/45 to-navy/25" />
      </div>
      <div className="container-page relative z-10 pb-14 md:pb-20">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1
          className="display-hero mt-3 max-w-3xl text-white"
          style={{
            fontSize: "clamp(2.3rem,5.4vw,4.4rem)",
            animation: "ht-fade-up 700ms ease-out both",
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
