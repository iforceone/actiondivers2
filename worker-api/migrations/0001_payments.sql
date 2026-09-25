CREATE TABLE IF NOT EXISTS payment_intents (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  merchant_order_number TEXT NOT NULL UNIQUE,
  reservation_reference TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  status TEXT NOT NULL DEFAULT 'created',
  bank_order_id TEXT UNIQUE,
  bank_form_url TEXT,
  bank_status INTEGER,
  last_error_code TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_bank_order_id
  ON payment_intents (bank_order_id);

CREATE INDEX IF NOT EXISTS idx_payment_intents_status
  ON payment_intents (status);

CREATE TABLE IF NOT EXISTS payment_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_intent_id TEXT NOT NULL,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  bank_status INTEGER,
  detail TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id)
);

CREATE INDEX IF NOT EXISTS idx_payment_events_intent
  ON payment_events (payment_intent_id, created_at);
