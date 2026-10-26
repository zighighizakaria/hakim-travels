/**
 * DTO partagés client/serveur. Objets simples et sérialisables (pas de lignes SQLite brutes).
 * Les fichiers de ce dossier n'importent jamais src/server.
 */
import type {
  DepartureInput,
  DestinationInput,
  ReviewInput,
  SettingsInput,
  TripInput,
} from "./schemas";

export type Lang = "fr" | "ar";
export type Universe = "maroc" | "international" | "omra";
export type TripStatus = "draft" | "published";
export type DepartureStatus = "open" | "full" | "cancelled";

/* -------------------------------------------------------------------------- */
/* Briques communes                                                            */
/* -------------------------------------------------------------------------- */

export type ImageRef = {
  id: number;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};

export type TextItem = { label: string | null; text: string };
export type FaqItem = { question: string; answer: string };
export type TripDay = { label: string; title: string; body: string };

/* -------------------------------------------------------------------------- */
/* Public                                                                      */
/* -------------------------------------------------------------------------- */

export type DestinationCard = {
  id: number;
  slug: string;
  universe: Universe;
  name: string;
  emoji: string | null;
  tagline: string | null;
  teaser: string | null;
  cover: ImageRef | null;
  /** Voyages publiés rattachés à cette destination. */
  tripCount: number;
  isFeatured: boolean;
};

export type DestinationDetail = DestinationCard & {
  intro: string | null;
  highlights: TextItem[];
  practical: TextItem[];
  gallery: ImageRef[];
  faq: FaqItem[];
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
};

export type DepartureRow = {
  id: number;
  tripId: number;
  tripSlug: string;
  tripTitle: string;
  destinationSlug: string;
  destinationName: string;
  universe: Universe;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  departureCity: string;
  meetingPoint: string | null;
  /** null = prix sur demande */
  priceMad: number | null;
  childPriceMad: number | null;
  seatsLeft: number | null;
  seatsTotal: number | null;
  /** « full » aussi quand le départ est ouvert avec 0 place restante. */
  status: "open" | "full";
  note: string | null;
};

export type TripCard = {
  id: number;
  slug: string;
  title: string;
  teaser: string;
  destination: { slug: string; name: string; universe: Universe };
  durationDays: number | null;
  durationNights: number | null;
  /** MIN(prix) des départs visibles ouverts, sinon prix indicatif du voyage, sinon null. */
  fromPriceMad: number | null;
  priceNote: string | null;
  cover: ImageRef | null;
  isFeatured: boolean;
  /** Date du prochain départ visible (YYYY-MM-DD). */
  nextDeparture: string | null;
  upcomingCount: number;
};

export type TripDetail = TripCard & {
  presentation: string;
  highlights: string[];
  days: TripDay[];
  included: string[];
  excluded: string[];
  gallery: ImageRef[];
  faq: FaqItem[];
  departures: DepartureRow[];
  /** Message WhatsApp personnalisé du voyage (remplace le modèle), déjà localisé. */
  whatsappMessage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
};

export type PublicSettings = {
  agencyName: string;
  phoneDisplay: string | null;
  phoneE164: string | null;
  whatsappNumber: string | null;
  email: string | null;
  address: string | null;
  openingHours: string | null;
  mapsUrl: string | null;
  instagramUrl: string | null;
  instagramHandle: string | null;
  instagramFollowersLabel: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  legalCompanyName: string | null;
  legalIce: string | null;
  legalRc: string | null;
  legalLicenseNumber: string | null;
  heroImage: ImageRef | null;
  ogImage: ImageRef | null;
};

export type Review = {
  id: number;
  authorName: string;
  authorCity: string | null;
  rating: number | null;
  quote: string;
  travelLabel: string | null;
  sourceUrl: string | null;
  tripSlug: string | null;
};

export type SiteConfig = {
  siteUrl: string;
  settings: { fr: PublicSettings; ar: PublicSettings };
};

export type HomePageData = {
  regions: DestinationCard[];
  featuredTrips: TripCard[];
  upcomingDepartures: DepartureRow[];
  international: DestinationCard[];
  omra: DestinationCard[];
  reviews: Review[];
};

export type UniversePageData = {
  universe: Universe;
  destinations: DestinationCard[];
  trips: TripCard[];
  departures: DepartureRow[];
};

export type DestinationPageData = {
  destination: DestinationDetail;
  trips: TripCard[];
  departures: DepartureRow[];
};

export type DeparturesPageData = {
  departures: DepartureRow[];
  /** Mois (YYYY-MM) ayant au moins un départ visible. */
  months: string[];
  /** Régions/destinations disponibles pour le filtre. */
  regions: DestinationCard[];
};

export type SitemapEntry = { path: string; updatedAt: string };

/* -------------------------------------------------------------------------- */
/* Admin                                                                       */
/* -------------------------------------------------------------------------- */

export type AdminUserInfo = { id: number; email: string; name: string };

export type AdminImage = {
  id: number;
  path: string;
  url: string;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  originalName: string | null;
  altFr: string | null;
  altAr: string | null;
  isDemo: boolean;
  createdAt: string;
};

export type ImageUsage = {
  total: number;
  uses: { kind: "destination" | "trip" | "settings"; id: number; label: string }[];
};

export type AdminDestinationListItem = {
  id: number;
  universe: Universe;
  slug: string;
  nameFr: string;
  nameAr: string | null;
  emoji: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  isDemo: boolean;
  tripCount: number;
  updatedAt: string;
};

export type AdminDestination = DestinationInput & {
  id: number;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  coverImage: ImageRef | null;
  gallery: ImageRef[];
};

export type AdminTripListItem = {
  id: number;
  slug: string;
  titleFr: string;
  titleAr: string | null;
  status: TripStatus;
  isFeatured: boolean;
  isDemo: boolean;
  destinationId: number;
  destinationName: string;
  universe: Universe;
  upcomingCount: number;
  nextDeparture: string | null;
  updatedAt: string;
};

export type AdminTrip = TripInput & {
  id: number;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  coverImage: ImageRef | null;
  gallery: ImageRef[];
};

export type AdminDeparture = DepartureInput & {
  id: number;
  archived: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  tripSlug: string;
  tripTitle: string;
  destinationName: string;
  universe: Universe;
};

export type AdminReview = ReviewInput & {
  id: number;
  tripTitle: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSettings = SettingsInput & {
  heroImage: ImageRef | null;
  ogImage: ImageRef | null;
  updatedAt: string;
};

export type DemoCounts = { trips: number; destinations: number; images: number };

export type AdminDashboard = {
  today: string;
  counts: {
    trips: number;
    publishedTrips: number;
    destinations: number;
    upcomingDepartures: number;
    images: number;
    reviews: number;
  };
  nextDepartures: AdminDeparture[];
  lowSeats: AdminDeparture[];
  /** Départs passés non archivés. */
  pastUnarchived: number;
  demo: DemoCounts;
};
