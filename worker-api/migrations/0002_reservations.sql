CREATE TABLE IF NOT EXISTS catalog_revisions (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  payload_json TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  published_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_one_draft
  ON catalog_revisions(status) WHERE status = 'draft';
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_one_published
  ON catalog_revisions(status) WHERE status = 'published';

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'needs_contact', 'quoted', 'awaiting_payment', 'paid', 'cancelled', 'completed')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  adults INTEGER NOT NULL CHECK (adults BETWEEN 1 AND 40),
  children INTEGER NOT NULL DEFAULT 0 CHECK (children BETWEEN 0 AND 40),
  accommodation TEXT,
  diving_experience TEXT,
  customer_notes TEXT,
  internal_notes TEXT,
  customer_message TEXT,
  estimated_total_cents INTEGER NOT NULL DEFAULT 0,
  current_quote_version INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_reservations_status_updated
  ON reservations(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_email
  ON reservations(customer_email);

CREATE TABLE IF NOT EXISTS reservation_items (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  catalog_item_id TEXT,
  tour_id TEXT,
  name_snapshot TEXT NOT NULL,
  requested_date TEXT NOT NULL,
  price_snapshot_cents INTEGER NOT NULL CHECK (price_snapshot_cents >= 0),
  pricing_basis TEXT NOT NULL CHECK (pricing_basis IN ('per_person', 'per_group')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

CREATE INDEX IF NOT EXISTS idx_reservation_items_reservation
  ON reservation_items(reservation_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_reservation_items_requested_date
  ON reservation_items(requested_date, reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_items_catalog
  ON reservation_items(catalog_item_id, reservation_id);

CREATE TABLE IF NOT EXISTS quote_versions (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent_update', 'payable', 'superseded', 'paid', 'expired')),
  customer_message TEXT,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  expires_at TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  sent_at TEXT,
  UNIQUE (reservation_id, version),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

CREATE INDEX IF NOT EXISTS idx_quote_versions_reservation
  ON quote_versions(reservation_id, version DESC);

CREATE TABLE IF NOT EXISTS quote_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL,
  reservation_item_id TEXT,
  catalog_item_id TEXT,
  label TEXT NOT NULL,
  service_date TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 100),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (quote_id) REFERENCES quote_versions(id)
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id, sort_order);

CREATE TABLE IF NOT EXISTS discounts (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('none', 'percentage', 'fixed')),
  value INTEGER NOT NULL DEFAULT 0 CHECK (value >= 0),
  amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),
  reason TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES quote_versions(id)
);

CREATE TABLE IF NOT EXISTS customer_access_tokens (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  quote_id TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

CREATE INDEX IF NOT EXISTS idx_customer_tokens_reservation
  ON customer_access_tokens(reservation_id, active);

CREATE TABLE IF NOT EXISTS staff_members (
  email TEXT PRIMARY KEY,
  display_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS message_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reservation_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id TEXT NOT NULL,
  actor TEXT NOT NULL,
  event_type TEXT NOT NULL,
  detail_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

CREATE INDEX IF NOT EXISTS idx_reservation_events_reservation
  ON reservation_events(reservation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS email_delivery_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id TEXT NOT NULL,
  recipient TEXT NOT NULL,
  template_key TEXT NOT NULL,
  provider_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_detail TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  scope TEXT NOT NULL,
  key TEXT NOT NULL,
  response_json TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (scope, key)
);

ALTER TABLE payment_intents ADD COLUMN reservation_id TEXT;
ALTER TABLE payment_intents ADD COLUMN quote_id TEXT;
ALTER TABLE payment_intents ADD COLUMN quote_version INTEGER;

CREATE INDEX IF NOT EXISTS idx_payment_intents_reservation
  ON payment_intents(reservation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_intents_quote
  ON payment_intents(quote_id);
