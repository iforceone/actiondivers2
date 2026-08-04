export type PricingBasis = 'per_person' | 'per_group' | 'tiered_transfer';
export type BookingCategory = 'Island' | 'Mainland' | 'Course' | 'Transfer';
export type ServiceKind = 'recreational_dive' | 'course' | 'snorkeling' | 'fishing' | 'mainland' | 'transfer';
export type ConfirmationMode = 'request_only' | 'instant';
export type PriceStatus = 'current' | 'proposed';

export interface BookingItemDetails {
  certificationLevel?: string;
  lastDiveDate?: string;
  referralDocuments?: boolean;
  transferTrip?: 'one_way' | 'round_trip';
  arrivalTime?: string;
  airline?: string;
  flightNumber?: string;
  returnDate?: string;
  returnTime?: string;
  returnAirline?: string;
  returnFlightNumber?: string;
  luggage?: string;
  destination?: string;
  specialRequirements?: string;
}

export interface BookingCatalogItem {
  id: string;
  tourId: string;
  category: BookingCategory;
  serviceKind: ServiceKind;
  name: string;
  description: string;
  priceCents: number;
  pricingBasis: PricingBasis;
  noticeDays: number;
  minimumPaidParticipants?: number;
  maxParticipants?: number;
  confirmationMode: ConfirmationMode;
  priceStatus: PriceStatus;
  includedParticipants?: number;
  additionalParticipantPriceCents?: number;
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
  category: BookingCategory,
  serviceKind: ServiceKind,
  name: string,
  priceCents: number,
  sortOrder: number,
  options: Partial<BookingCatalogItem> = {},
): BookingCatalogItem => ({
  id,
  tourId,
  category,
  serviceKind,
  name,
  description: '',
  priceCents,
  pricingBasis: 'per_person',
  noticeDays: 7,
  confirmationMode: 'request_only',
  priceStatus: 'current',
  active: true,
  sortOrder,
  ...options,
});

export const DEFAULT_BOOKING_CATALOG: BookingCatalog = {
  version: 4,
  publishedAt: null,
  items: [
    item('dive-single', 'scuba-diving', 'Island', 'recreational_dive', 'Single Tank Dive (Mexico Rocks)', 11625, 10, { minimumPaidParticipants: 2 }),
    item('dive-two', 'scuba-diving', 'Island', 'recreational_dive', 'Two Tank Dive', 14438, 20, { minimumPaidParticipants: 2 }),
    item('dive-holchan', 'hol-chan-shark-ray-alley', 'Island', 'recreational_dive', 'Hol Chan Combo Dive', 13313, 30, { minimumPaidParticipants: 2 }),
    item('dive-night', 'scuba-diving', 'Island', 'recreational_dive', 'Night Dive (Love Tunnel)', 15563, 40, { minimumPaidParticipants: 2 }),
    item('course-refresher', 'courses', 'Course', 'course', 'Refresher', 20875, 50, { description: 'A morning refresher for certified divers returning after time away. Guests may then complete a recreational dive that afternoon.' }),
    item('course-discover', 'courses', 'Course', 'course', 'Discover Scuba Diving', 21188, 60, { description: 'One beginner session, scheduled in the morning or afternoon. Exact time confirmed after booking.' }),
    item('course-referral', 'courses', 'Course', 'course', 'Open Water Referral', 48000, 70, { description: 'Two training days from 9:00 AM to 12:00 PM each day. Staff must review referral documents.' }),
    item('course-scubadiver', 'courses', 'Course', 'course', 'PADI Scuba Diver', 43688, 80, { description: 'A beginner session plus one additional morning of training.' }),
    item('course-owcert', 'courses', 'Course', 'course', 'Open Water Certification', 56438, 90, { description: 'Approximately three mornings of training when starting from scratch.' }),
    item('course-advanced', 'courses', 'Course', 'course', 'Advanced Open Water', 49313, 100, { description: 'Continuing training for divers ready to progress beyond Open Water. Exact time confirmed after booking.' }),
    item('snorkel-hol', 'hol-chan-shark-ray-alley', 'Island', 'snorkeling', 'Hol Chan & Shark Ray Alley Snorkeling', 9000, 120, { minimumPaidParticipants: 4, maxParticipants: 12 }),
    item('snorkel-mex', 'mexico-rocks', 'Island', 'snorkeling', 'Mexico Rocks Snorkeling', 7500, 130, { minimumPaidParticipants: 4, maxParticipants: 12 }),
    item('snorkel-manatee', 'caye-caulker-manatee', 'Island', 'snorkeling', 'Hol Chan, Caye Caulker, Manatee & Tarpon Feeding', 17500, 140, { minimumPaidParticipants: 4, maxParticipants: 12 }),
    item('snorkel-sailing', 'caye-caulker-manatee', 'Island', 'snorkeling', 'Sailing: Hol Chan & Caye Caulker', 17500, 150, { minimumPaidParticipants: 4, maxParticipants: 12 }),
    item('snorkel-bacalar', 'bacalar-chico', 'Island', 'snorkeling', 'Bacalar Chico Full-Day Adventure', 17500, 160, { minimumPaidParticipants: 4, maxParticipants: 12 }),
    item('fish-reef-half', 'fishing', 'Island', 'fishing', 'Reef Fishing (Half Day)', 30938, 170, { pricingBasis: 'per_group', maxParticipants: 4 }),
    item('fish-reef-full', 'fishing', 'Island', 'fishing', 'Reef Fishing (Full Day)', 56250, 180, { pricingBasis: 'per_group', maxParticipants: 4 }),
    item('fish-deep-half', 'fishing', 'Island', 'fishing', 'Deep Sea Fishing (Half Day)', 90000, 190, { pricingBasis: 'per_group', maxParticipants: 4 }),
    item('fish-deep-full', 'fishing', 'Island', 'fishing', 'Deep Sea Fishing (Full Day)', 180000, 200, { pricingBasis: 'per_group', maxParticipants: 4 }),
    item('fish-flat-half', 'fishing', 'Island', 'fishing', 'Flat Fishing (Half Day)', 39375, 210, { pricingBasis: 'per_group', maxParticipants: 2 }),
    item('fish-flat-full', 'fishing', 'Island', 'fishing', 'Flat Fishing (Full Day)', 60000, 220, { pricingBasis: 'per_group', maxParticipants: 2 }),
    item('bbq-full', 'fishing', 'Island', 'fishing', 'Beach Bar-B-Q', 17500, 230, { minimumPaidParticipants: 4 }),
    item('main-altun', 'altun-ha-cave-tubing', 'Mainland', 'mainland', 'Altun Ha & Cave Tubing', 33750, 240, { minimumPaidParticipants: 2 }),
    item('main-xunantunich', 'xunantunich-cave-tubing', 'Mainland', 'mainland', 'Xunantunich & Cave Tubing', 33750, 250, { minimumPaidParticipants: 2 }),
    item('main-cave', 'cave-tubing-ziplining', 'Mainland', 'mainland', 'Cave Tubing & Zip-lining', 33750, 260, { minimumPaidParticipants: 2 }),
    item('main-lamanai', 'lamanai', 'Mainland', 'mainland', 'Lamanai Jungle & New River Tour', 28125, 270, { minimumPaidParticipants: 2 }),
    item('main-atm', 'atm-caves', 'Mainland', 'mainland', 'Actun Tunichil Muknal (ATM) Cave', 45000, 280, { minimumPaidParticipants: 2 }),
    item('transfer-bze-san-pedro', 'transfers-charters', 'Transfer', 'transfer', 'Belize International Airport Boat Transfer', 60000, 290, {
      pricingBasis: 'tiered_transfer',
      priceStatus: 'proposed',
      includedParticipants: 6,
      additionalParticipantPriceCents: 10000,
    }),
  ],
};

export const withDefaultBookingPolicies = (catalog: BookingCatalog): BookingCatalog => {
  const defaults = new Map(DEFAULT_BOOKING_CATALOG.items.map((catalogItem) => [catalogItem.id, catalogItem]));
  const legacyCatalog = catalog.items.some((catalogItem) => !catalogItem.serviceKind || catalogItem.noticeDays === undefined || !catalogItem.confirmationMode || !catalogItem.priceStatus);
  const migratedItems = catalog.items
    .filter((catalogItem) => catalogItem.id !== 'course-resort')
    .map((catalogItem) => {
      const policy = defaults.get(catalogItem.id);
      if (!policy) return catalogItem;
      const hasObsoleteBarbecuePricing = catalogItem.id === 'bbq-full' &&
        catalogItem.priceCents === 56250 &&
        catalogItem.pricingBasis === 'per_group' &&
        catalogItem.minimumPaidParticipants === undefined &&
        catalogItem.maxParticipants === 4;
      const mergedBase = hasObsoleteBarbecuePricing ? {
        ...policy,
        ...catalogItem,
        priceCents: policy.priceCents,
        pricingBasis: policy.pricingBasis,
        minimumPaidParticipants: policy.minimumPaidParticipants,
        maxParticipants: policy.maxParticipants,
      } : { ...policy, ...catalogItem };
      const merged = {
        ...mergedBase,
        description: catalogItem.description || policy.description,
        name: catalogItem.id === 'course-scubadiver' && catalogItem.name === 'Scuba Diver' ? policy.name : mergedBase.name,
      };
      return legacyCatalog ? {
        ...merged,
        tourId: policy.tourId,
        category: policy.category,
        serviceKind: policy.serviceKind,
        name: policy.name,
        noticeDays: policy.noticeDays,
        minimumPaidParticipants: policy.minimumPaidParticipants,
        maxParticipants: policy.maxParticipants,
        confirmationMode: policy.confirmationMode,
        priceStatus: policy.priceStatus,
        includedParticipants: policy.includedParticipants,
        additionalParticipantPriceCents: policy.additionalParticipantPriceCents,
      } : merged;
    });
  if (legacyCatalog) {
    const migratedIds = new Set(migratedItems.map((catalogItem) => catalogItem.id));
    DEFAULT_BOOKING_CATALOG.items.forEach((catalogItem) => {
      if (!migratedIds.has(catalogItem.id)) migratedItems.push(catalogItem);
    });
  }
  return {
    ...catalog,
    version: Math.max(catalog.version, DEFAULT_BOOKING_CATALOG.version),
    items: migratedItems.sort((a, b) => a.sortOrder - b.sortOrder),
  };
};

export const withDefaultParticipantLimits = withDefaultBookingPolicies;

export const hasMainlandDateConflict = (items: Array<{ category: BookingCategory; requestedDate: string }>) => {
  const mainlandDates = new Set<string>();
  for (const item of items) {
    if (item.category !== 'Mainland' || !item.requestedDate) continue;
    if (mainlandDates.has(item.requestedDate)) return true;
    mainlandDates.add(item.requestedDate);
  }
  return false;
};

export const estimateBookingItemCents = (catalogItem: BookingCatalogItem, participants: number, details?: BookingItemDetails) => {
  const count = Math.max(1, Math.round(participants));
  if (catalogItem.pricingBasis === 'tiered_transfer') {
    const oneWay = Math.max(catalogItem.priceCents, count * (catalogItem.additionalParticipantPriceCents ?? 0));
    return details?.transferTrip === 'round_trip' ? oneWay * 2 : oneWay;
  }
  if (catalogItem.pricingBasis === 'per_group') return catalogItem.priceCents;
  return catalogItem.priceCents * Math.max(count, catalogItem.minimumPaidParticipants ?? 1);
};

export const belizeDateAfter = (days: number, now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Belize', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = new Date(Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day) + days));
  return date.toISOString().slice(0, 10);
};

export const catalogItemsForTour = (tourId: string, catalog = DEFAULT_BOOKING_CATALOG) =>
  catalog.items.filter((catalogItem) => catalogItem.active && catalogItem.tourId === tourId).sort((a, b) => a.sortOrder - b.sortOrder);

export const formatUsd = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
