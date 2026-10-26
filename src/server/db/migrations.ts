export type Migration = { version: number; sql: string };

const migration001 = `
CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')));

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,              -- scrypt$N$r$p$saltB64$hashB64
  session_version INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE images (
  id INTEGER PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,                -- relatif à UPLOADS_DIR, séparateur /
  mime TEXT NOT NULL CHECK (mime IN ('image/jpeg','image/png','image/webp','image/avif')),
  size_bytes INTEGER NOT NULL,
  width INTEGER, height INTEGER,
  original_name TEXT,
  alt_fr TEXT, alt_ar TEXT,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE destinations (                 -- régions Maroc, pays International, Omra
  id INTEGER PRIMARY KEY,
  universe TEXT NOT NULL CHECK (universe IN ('maroc','international','omra')),
  slug TEXT NOT NULL UNIQUE CHECK (slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*'),
  name_fr TEXT NOT NULL, name_ar TEXT,
  emoji TEXT,
  tagline_fr TEXT, tagline_ar TEXT,
  teaser_fr TEXT, teaser_ar TEXT,
  intro_fr TEXT, intro_ar TEXT,
  cover_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  seo_title_fr TEXT, seo_title_ar TEXT, seo_description_fr TEXT, seo_description_ar TEXT,
  is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0,1)),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_destinations_universe ON destinations(universe, is_published, sort_order);

CREATE TABLE destination_items (
  id INTEGER PRIMARY KEY,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('highlight','practical')),
  position INTEGER NOT NULL DEFAULT 0,
  label_fr TEXT, label_ar TEXT,
  text_fr TEXT NOT NULL, text_ar TEXT
);
CREATE INDEX idx_destination_items ON destination_items(destination_id, kind, position);

CREATE TABLE destination_images (
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  image_id INTEGER NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (destination_id, image_id)
);

CREATE TABLE trips (
  id INTEGER PRIMARY KEY,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL UNIQUE,
  title_fr TEXT NOT NULL, title_ar TEXT,
  teaser_fr TEXT NOT NULL DEFAULT '', teaser_ar TEXT,
  presentation_fr TEXT NOT NULL DEFAULT '', presentation_ar TEXT,
  duration_days INTEGER CHECK (duration_days IS NULL OR duration_days > 0),
  duration_nights INTEGER CHECK (duration_nights IS NULL OR duration_nights >= 0),
  price_from_mad INTEGER CHECK (price_from_mad IS NULL OR price_from_mad >= 0),
  price_note_fr TEXT, price_note_ar TEXT,
  cover_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  whatsapp_message_fr TEXT, whatsapp_message_ar TEXT,
  seo_title_fr TEXT, seo_title_ar TEXT, seo_description_fr TEXT, seo_description_ar TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_trips_destination ON trips(destination_id);
CREATE INDEX idx_trips_public ON trips(status, is_featured, sort_order);

CREATE TABLE trip_days (
  id INTEGER PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  label_fr TEXT NOT NULL, label_ar TEXT,
  title_fr TEXT NOT NULL, title_ar TEXT,
  body_fr TEXT NOT NULL DEFAULT '', body_ar TEXT
);
CREATE INDEX idx_trip_days ON trip_days(trip_id, position);

CREATE TABLE trip_items (
  id INTEGER PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('highlight','included','excluded')),
  position INTEGER NOT NULL DEFAULT 0,
  text_fr TEXT NOT NULL, text_ar TEXT
);
CREATE INDEX idx_trip_items ON trip_items(trip_id, kind, position);

CREATE TABLE trip_images (
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  image_id INTEGER NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (trip_id, image_id)
);

CREATE TABLE faqs (
  id INTEGER PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  question_fr TEXT NOT NULL, question_ar TEXT,
  answer_fr TEXT NOT NULL, answer_ar TEXT,
  CHECK ((trip_id IS NULL) <> (destination_id IS NULL))
);
CREATE INDEX idx_faqs_trip ON faqs(trip_id, position);
CREATE INDEX idx_faqs_destination ON faqs(destination_id, position);

CREATE TABLE departures (
  id INTEGER PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL CHECK (start_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  end_date TEXT NOT NULL CHECK (end_date >= start_date),
  departure_city_fr TEXT NOT NULL, departure_city_ar TEXT,
  meeting_point_fr TEXT, meeting_point_ar TEXT,
  price_mad INTEGER CHECK (price_mad IS NULL OR price_mad >= 0),          -- NULL = sur demande
  child_price_mad INTEGER CHECK (child_price_mad IS NULL OR child_price_mad >= 0),
  seats_total INTEGER CHECK (seats_total IS NULL OR seats_total >= 0),
  seats_left INTEGER CHECK (seats_left IS NULL OR (seats_left >= 0 AND (seats_total IS NULL OR seats_left <= seats_total))),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','full','cancelled')),
  note_fr TEXT, note_ar TEXT,
  archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0,1)),
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_departures_trip ON departures(trip_id, start_date);
CREATE INDEX idx_departures_public ON departures(start_date) WHERE archived = 0 AND status <> 'cancelled';

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_city TEXT,
  trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  quote_fr TEXT NOT NULL, quote_ar TEXT,
  travel_label TEXT,
  source_url TEXT,
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_reviews_public ON reviews(is_published, sort_order);

CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  agency_name TEXT NOT NULL DEFAULT 'Hakim Travels',
  phone_display TEXT, phone_e164 TEXT,
  whatsapp_number TEXT CHECK (whatsapp_number IS NULL OR whatsapp_number NOT GLOB '*[^0-9]*'),
  email TEXT,
  address_fr TEXT, address_ar TEXT,
  opening_hours_fr TEXT, opening_hours_ar TEXT,
  maps_url TEXT,
  instagram_url TEXT, instagram_handle TEXT, instagram_followers_label TEXT,
  facebook_url TEXT, tiktok_url TEXT, youtube_url TEXT,
  legal_company_name TEXT, legal_ice TEXT, legal_rc TEXT, legal_license_number TEXT,
  hero_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  og_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO site_settings (id, phone_display, phone_e164, whatsapp_number, instagram_url, instagram_handle)
VALUES (1, '06 25 77 64 85', '+212625776485', '212625776485', 'https://www.instagram.com/hakim.travels_agency/', '@hakim.travels_agency');
`;

export const migrations: Migration[] = [{ version: 1, sql: migration001 }];
