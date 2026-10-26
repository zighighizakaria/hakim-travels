import { Link } from "@tanstack/react-router";
import { langParam } from "@/i18n/config";
import { pluralize } from "@/i18n/plural";
import { useLang, useT } from "@/i18n/useI18n";
import type { DestinationCard as DestinationCardData } from "@/lib/types";
import { ImageOrFallback } from "./ImageOrFallback";
import { Reveal } from "./Reveal";
import { Arrow } from "./ui";

export function DestinationCard({
  destination,
  index = 0,
}: {
  destination: DestinationCardData;
  index?: number;
}) {
  const lang = useLang();
  const t = useT();
  return (
    <Link
      to="/{-$lang}/destinations/$slug"
      params={{ lang: langParam(lang), slug: destination.slug }}
      className="media-zoom group relative block h-full overflow-hidden rounded-3xl"
    >
      <div className="aspect-[3/4]">
        <ImageOrFallback
          image={destination.cover}
          alt={destination.name}
          emoji={destination.emoji}
          seed={index}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent transition-opacity duration-300 group-hover:from-navy/90" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        {destination.tagline ? (
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-turquoise">
            {destination.tagline}
          </p>
        ) : null}
        <h3 className="mt-1.5 flex items-center gap-2 font-display text-2xl font-bold text-white transition-transform duration-300 group-hover:-translate-y-1 md:text-3xl">
          {destination.cover && destination.emoji ? (
            <span aria-hidden="true">{destination.emoji}</span>
          ) : null}
          {destination.name}
        </h3>
        {destination.teaser ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/75">
            {destination.teaser}
          </p>
        ) : null}
        <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          {destination.tripCount > 0
            ? pluralize(lang, destination.tripCount, t.common.tripCount)
            : t.common.explore}
          <Arrow />
        </span>
      </div>
    </Link>
  );
}

export function RegionGrid({ destinations }: { destinations: readonly DestinationCardData[] }) {
  if (!destinations.length) return null;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {destinations.map((destination, i) => (
        <Reveal key={destination.slug} delay={i * 90}>
          <DestinationCard destination={destination} index={i} />
        </Reveal>
      ))}
    </div>
  );
}
