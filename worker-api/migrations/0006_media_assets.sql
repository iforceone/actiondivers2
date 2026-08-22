CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  category TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0),
  width INTEGER,
  height INTEGER,
  checksum_sha256 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE UNIQUE INDEX idx_media_assets_checksum_active
  ON media_assets(checksum_sha256)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_media_assets_status_created
  ON media_assets(status, created_at DESC);

CREATE TABLE media_asset_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id TEXT NOT NULL,
  actor TEXT NOT NULL,
  event_type TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES media_assets(id)
);

CREATE INDEX idx_media_asset_events_asset
  ON media_asset_events(asset_id, created_at DESC);
