ALTER TABLE reservation_items ADD COLUMN adults INTEGER NOT NULL DEFAULT 1 CHECK (adults BETWEEN 0 AND 40);
ALTER TABLE reservation_items ADD COLUMN children INTEGER NOT NULL DEFAULT 0 CHECK (children BETWEEN 0 AND 40);

UPDATE reservation_items
SET adults = COALESCE((SELECT reservations.adults FROM reservations WHERE reservations.id = reservation_items.reservation_id), 1),
    children = COALESCE((SELECT reservations.children FROM reservations WHERE reservations.id = reservation_items.reservation_id), 0);
