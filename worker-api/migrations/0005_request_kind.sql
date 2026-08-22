ALTER TABLE reservations ADD COLUMN request_kind TEXT NOT NULL DEFAULT 'tour'
  CHECK (request_kind IN ('tour', 'course', 'transfer'));
