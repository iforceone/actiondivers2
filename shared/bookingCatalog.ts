export type PricingBasis = 'per_person' | 'per_group';

export interface BookingCatalogItem {
  id: string;
  tourId: string;
  category: 'Island' | 'Mainland';
  name: string;
  description: string;
  priceCents: number;
  pricingBasis: PricingBasis;
  active: boolean;
  sortOrder: number;
}

export interface BookingCatalog {
  version: number;
  publishedAt: string | null;
  items: BookingCatalogItem[];
}

const item = (
  id: string,
  tourId: string,
  category: BookingCatalogItem['category'],
  name: string,
  priceCents: number,
  sortOrder: number,
  pricingBasis: PricingBasis = 'per_person',
  description = '',
): BookingCatalogItem => ({ id, tourId, category, name, description, priceCents, pricingBasis, active: true, sortOrder });

export const DEFAULT_BOOKING_CATALOG: BookingCatalog = {
  version: 1,
  publishedAt: null,
  items: [
    item('dive-single', 'scuba-diving', 'Island', 'Single Tank (Mexico Rocks)', 11625, 10),
    item('dive-two', 'scuba-diving', 'Island', 'Two Tank Dive', 14438, 20),
    item('dive-holchan', 'hol-chan-shark-ray-alley', 'Island', 'Hol Chan Combo Dive', 13313, 30),
    item('dive-night', 'scuba-diving', 'Island', 'Night Dive (Love Tunnel)', 15563, 40),
    item('course-refresher', 'diving-courses', 'Island', 'Refresher', 20875, 50),
    item('course-resort', 'diving-courses', 'Island', 'Resort Course', 21188, 60),
    item('course-discover', 'diving-courses', 'Island', 'Scuba Discovery', 21188, 70),
    item('course-referral', 'diving-courses', 'Island', 'Open Water Referral (2 Days)', 48000, 80),
    item('course-scubadiver', 'diving-courses', 'Island', 'Scuba Diver', 43688, 90),
    item('course-owcert', 'diving-courses', 'Island', 'Open Water Certification (3 Days)', 56438, 100),
    item('course-advanced', 'diving-courses', 'Island', 'Advanced Open Water', 49313, 110),
    item('snorkel-hol', 'hol-chan-shark-ray-alley', 'Island', 'Hol Chan & Shark Ray Alley Snorkeling', 9000, 120),
    item('snorkel-mex', 'mexico-rocks', 'Island', 'Mexico Rocks Snorkeling', 7500, 130),
    item('snorkel-manatee', 'caye-caulker-manatee', 'Island', 'Caye Caulker, Manatee & Tarpon Feeding', 17500, 140),
    item('snorkel-sailing', 'caye-caulker-manatee', 'Island', 'Sailing: Hol Chan & Caye Caulker', 17500, 150),
    item('snorkel-bacalar', 'bacalar-chico', 'Island', 'Bacalar Chico Full-Day Adventure', 17500, 160),
    item('fish-reef-half', 'fishing', 'Island', 'Reef Fishing (Half Day)', 30938, 170, 'per_group'),
    item('fish-reef-full', 'fishing', 'Island', 'Reef Fishing (Full Day)', 56250, 180, 'per_group'),
    item('fish-deep-half', 'fishing', 'Island', 'Deep Sea Fishing (Half Day)', 90000, 190, 'per_group'),
    item('fish-deep-full', 'fishing', 'Island', 'Deep Sea Fishing (Full Day)', 180000, 200, 'per_group'),
    item('fish-flat-half', 'fishing', 'Island', 'Flat Fishing (Half Day)', 39375, 210, 'per_group'),
    item('fish-flat-full', 'fishing', 'Island', 'Flat Fishing (Full Day)', 60000, 220, 'per_group'),
    item('bbq-full', 'beach-bbq', 'Island', 'Beach Bar-B-Q (1–4 people)', 56250, 230, 'per_group'),
    item('main-altun', 'altun-ha-cave-tubing', 'Mainland', 'Altun Ha & Cave Tubing', 33750, 240),
    item('main-xunantunich', 'xunantunich-cave-tubing', 'Mainland', 'Xunantunich & Cave Tubing', 33750, 250),
    item('main-cave', 'cave-tubing-ziplining', 'Mainland', 'Cave Tubing & Zip-lining', 33750, 260),
    item('main-lamanai', 'lamanai', 'Mainland', 'Lamanai Temple Tour', 28125, 270),
    item('main-atm', 'atm-caves', 'Mainland', 'ATM Caves Expedition', 45000, 280),
  ],
};

export const catalogItemsForTour = (tourId: string, catalog = DEFAULT_BOOKING_CATALOG) =>
  catalog.items.filter((catalogItem) => catalogItem.active && catalogItem.tourId === tourId).sort((a, b) => a.sortOrder - b.sortOrder);

export const formatUsd = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
