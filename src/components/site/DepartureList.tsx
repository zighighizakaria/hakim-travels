import { Link } from "@tanstack/react-router";
import { interpolate, langParam } from "@/i18n/config";
import { useLang, useT } from "@/i18n/useI18n";
import { formatDateRange, formatPrice } from "@/lib/format";
import type { DepartureRow } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { useWhatsApp } from "./useSite";
import { WhatsAppButton } from "./WhatsAppButton";
import { Arrow, btn } from "./ui";

/** Places restantes à partir desquelles on met l'urgence en avant. */
const LOW_SEATS = 5;

export function DepartureList({
  departures,
  showTrip = true,
  whatsappOverride = null,
}: {
  departures: readonly DepartureRow[];
  /** Masquer le titre du voyage (page du voyage elle-même). */
  showTrip?: boolean;
  /** Message WhatsApp propre au voyage, qui remplace le modèle de départ. */
  whatsappOverride?: string | null;
}) {
  const lang = useLang();
  const t = useT();
  const wa = useWhatsApp();

  return (
    <ul className="space-y-4">
      {departures.map((d, i) => {
        const price = formatPrice(d.priceMad, lang);
        const childPrice = formatPrice(d.childPriceMad, lang);
        const isFull = d.status === "full";
        const lowSeats = !isFull && d.seatsLeft !== null && d.seatsLeft <= LOW_SEATS;
        return (
          <Reveal key={d.id} as="li" delay={(i % 4) * 70}>
            <div className="card-surface flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div className="min-w-0">
                <p className="font-display text-xl font-bold text-navy">
                  {formatDateRange(d.startDate, d.endDate, lang)}
                </p>
                {showTrip ? (
                  <Link
                    to="/{-$lang}/voyages/$slug"
                    params={{ lang: langParam(lang), slug: d.tripSlug }}
                    className="mt-1 block font-display text-lg font-semibold text-primary hover:underline"
                  >
                    {d.tripTitle}
                  </Link>
                ) : null}
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {[
                    showTrip ? d.destinationName : null,
                    interpolate(t.common.departFrom, { city: d.departureCity }),
                    d.meetingPoint
                      ? interpolate(t.common.meetingPoint, { value: d.meetingPoint })
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {d.note ? <p className="mt-1 text-sm text-muted-foreground">{d.note}</p> : null}
              </div>

              <div className="flex shrink-0 flex-col gap-3 md:items-end">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:justify-end">
                  <span className="font-display text-lg font-bold text-navy">
                    {price ?? t.common.priceOnRequest}
                  </span>
                  {childPrice ? (
                    <span className="text-sm text-muted-foreground">
                      {interpolate(t.common.childPrice, { price: childPrice })}
                    </span>
                  ) : null}
                  {isFull ? (
                    <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                      {t.common.full}
                    </span>
                  ) : lowSeats ? (
                    <span className="rounded-full bg-sun/30 px-3 py-1 text-xs font-semibold text-navy">
                      {interpolate(t.common.seatsLeft, { n: d.seatsLeft })}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {!isFull ? (
                    <WhatsAppButton
                      href={wa.departure(d, whatsappOverride)}
                      className={cn(btn.whatsapp, "px-5 py-2.5 text-sm")}
                      iconClassName="h-4 w-4"
                    >
                      {t.common.reserveOnWhatsapp}
                    </WhatsAppButton>
                  ) : null}
                  {showTrip ? (
                    <Link
                      to="/{-$lang}/voyages/$slug"
                      params={{ lang: langParam(lang), slug: d.tripSlug }}
                      className={cn(btn.outline, "group px-5 py-2.5 text-sm")}
                    >
                      {t.common.seeTrip}
                      <Arrow />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </ul>
  );
}

export function NoDepartures() {
  const t = useT();
  return (
    <div className="card-surface p-8 text-center">
      <p className="font-display text-lg font-semibold text-navy">{t.common.noDeparture}</p>
      <p className="mt-2 text-muted-foreground">{t.common.noDepartureHint}</p>
    </div>
  );
}
