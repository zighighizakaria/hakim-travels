import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  departuresQuerySchema,
  langInputSchema,
  slugInputSchema,
  tripsQuerySchema,
  universePageInputSchema,
} from "@/lib/schemas";
import type {
  DeparturesPageData,
  DestinationCard,
  DestinationPageData,
  HomePageData,
  SiteConfig,
  TripCard,
  TripDetail,
  UniversePageData,
} from "@/lib/types";
import { today } from "@/server/db/sql";
import { getSiteUrl } from "@/server/env";
import { listUpcomingDepartures, listUpcomingMonths } from "@/server/repositories/departures.repo";
import {
  getPublicDestinationBySlug,
  listPublicDestinations,
} from "@/server/repositories/destinations.repo";
import { listPublishedReviews } from "@/server/repositories/reviews.repo";
import { getPublicSettings } from "@/server/repositories/settings.repo";
import { getPublicTripBySlug, listPublicTrips } from "@/server/repositories/trips.repo";

/** Fonctions publiques : lecture seule (GET), validées par zod, brouillons jamais exposés. */

export const getSiteConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteConfig> => {
    return {
      siteUrl: getSiteUrl(),
      settings: { fr: getPublicSettings("fr"), ar: getPublicSettings("ar") },
    };
  },
);

export const getHomePage = createServerFn({ method: "GET" })
  .validator(langInputSchema)
  .handler(async ({ data }): Promise<HomePageData> => {
    const now = today();
    return {
      regions: listPublicDestinations(data.lang, { universe: "maroc" }),
      featuredTrips: listPublicTrips(data.lang, { featured: true, limit: 6, today: now }),
      upcomingDepartures: listUpcomingDepartures(data.lang, now, { limit: 6 }),
      international: listPublicDestinations(data.lang, { universe: "international" }),
      omra: listPublicDestinations(data.lang, { universe: "omra" }),
      reviews: listPublishedReviews(data.lang, 6),
    };
  });

export const getUniversePage = createServerFn({ method: "GET" })
  .validator(universePageInputSchema)
  .handler(async ({ data }): Promise<UniversePageData> => {
    const now = today();
    return {
      universe: data.universe,
      destinations: listPublicDestinations(data.lang, { universe: data.universe }),
      trips: listPublicTrips(data.lang, { universe: data.universe, today: now }),
      departures: listUpcomingDepartures(data.lang, now, { universe: data.universe, limit: 24 }),
    };
  });

export const listTripsFn = createServerFn({ method: "GET" })
  .validator(tripsQuerySchema)
  .handler(async ({ data }): Promise<TripCard[]> =>
    listPublicTrips(data.lang, { universe: data.universe, destinationSlug: data.region }),
  );

export const getTripFn = createServerFn({ method: "GET" })
  .validator(slugInputSchema)
  .handler(async ({ data }): Promise<TripDetail> => {
    const trip = getPublicTripBySlug(data.lang, data.slug, today());
    if (!trip) throw notFound();
    return trip;
  });

export const listDestinationsFn = createServerFn({ method: "GET" })
  .validator(langInputSchema)
  .handler(async ({ data }): Promise<DestinationCard[]> => listPublicDestinations(data.lang));

export const getDestinationFn = createServerFn({ method: "GET" })
  .validator(slugInputSchema)
  .handler(async ({ data }): Promise<DestinationPageData> => {
    const destination = getPublicDestinationBySlug(data.lang, data.slug);
    if (!destination) throw notFound();
    const now = today();
    return {
      destination,
      trips: listPublicTrips(data.lang, { destinationSlug: data.slug, today: now }),
      departures: listUpcomingDepartures(data.lang, now, { destinationSlug: data.slug }),
    };
  });

export const listDeparturesFn = createServerFn({ method: "GET" })
  .validator(departuresQuerySchema)
  .handler(async ({ data }): Promise<DeparturesPageData> => {
    const now = today();
    return {
      departures: listUpcomingDepartures(data.lang, now, {
        universe: data.universe,
        destinationSlug: data.region,
        month: data.month,
      }),
      months: listUpcomingMonths(now, { universe: data.universe, destinationSlug: data.region }),
      regions: listPublicDestinations(data.lang, { universe: data.universe }),
    };
  });
