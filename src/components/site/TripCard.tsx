import { Link } from "@tanstack/react-router";
import { interpolate, langParam } from "@/i18n/config";
import { useLang, useT } from "@/i18n/useI18n";
import { formatDate, formatDuration, formatPrice } from "@/lib/format";
import type { TripCard as TripCardData } from "@/lib/types";
import { ImageOrFallback } from "./ImageOrFallback";
import { Reveal } from "./Reveal";
import { Arrow } from "./ui";

export function TripCard({ trip, index = 0 }: { trip: TripCardData; index?: number }) {
  const lang = useLang();
  const t = useT();
  const duration = formatDuration(trip.durationDays, trip.durationNights, lang);
  const price = formatPrice(trip.fromPriceMad, lang);
  const priceLabel = price ? interpolate(t.common.fromPrice, { price }) : t.common.priceOnRequest;

  return (
    <article className="card-surface media-zoom group h-full overflow-hidden">
      <Link
        to="/{-$lang}/voyages/$slug"
        params={{ lang: langParam(lang), slug: trip.slug }}
        className="flex h-full flex-col"
      >
        <div className="aspect-[16/10] overflow-hidden">
          <ImageOrFallback image={trip.cover} alt={trip.title} emoji={null} seed={index} />
        </div>
        <div className="flex flex-1 flex-col p-7">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-turquoise">
            {trip.destination.name}
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold text-navy">{trip.title}</h3>
          {trip.teaser ? (
            <p className="mt-2 line-clamp-3 leading-relaxed text-muted-foreground">{trip.teaser}</p>
          ) : null}
          <div className="mt-auto pt-5">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <span>{[duration, priceLabel].filter(Boolean).join(" · ")}</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                {t.common.see}
                <Arrow />
              </span>
            </div>
            {trip.nextDeparture ? (
              <p className="mt-2 text-sm text-navy/80">
                {interpolate(t.common.nextDeparture, {
                  date: formatDate(trip.nextDeparture, lang),
                })}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

export function TripGrid({ trips }: { trips: readonly TripCardData[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip, i) => (
        <Reveal key={trip.slug} delay={(i % 3) * 90}>
          <TripCard trip={trip} index={i} />
        </Reveal>
      ))}
    </div>
  );
}
