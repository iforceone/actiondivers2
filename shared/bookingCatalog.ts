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
  version: 5,
  publishedAt: null,
  items: [
    item('dive-single', 'scuba-diving', 'Island', 'recreational_dive', 'Single Dive — Mexico Rocks', 11625, 10, { minimumPaidParticipants: 2, description: 'For certified divers active within the past year. Departure and duration are not yet published.' }),
    item('dive-two', 'scuba-diving', 'Island', 'recreational_dive', 'Two Dives', 14438, 20, { minimumPaidParticipants: 2, description: 'For certified divers active within the past year. Departure and duration are not yet published.' }),
    item('dive-holchan', 'hol-chan-shark-ray-alley', 'Island', 'recreational_dive', 'Hol Chan Combo Dive', 13313, 30, { minimumPaidParticipants: 2, description: 'For certified divers active within the past year. Departure and duration are not yet published.' }),
    item('dive-night', 'scuba-diving', 'Island', 'recreational_dive', 'Night Dive', 15563, 40, { minimumPaidParticipants: 2, description: 'An evening activity for certified divers active within the past year. Exact check-in and departure are not yet published.' }),
    item('course-refresher', 'courses', 'Course', 'course', 'Refresher', 20875, 50, { minimumPaidParticipants: 2, description: 'A morning session for certified divers returning after more than one year. A recreational dive may follow that afternoon when scheduling allows.' }),
    item('course-resort', 'courses', 'Course', 'course', 'Resort Course', 21188, 60, { minimumPaidParticipants: 2, description: 'One introductory session for a guest who has never been certified, with equipment instruction, pool practice, and a shallow ocean dive once comfortable.' }),
    item('course-discover', 'courses', 'Course', 'course', 'Scuba Discovery', 21188, 65, { minimumPaidParticipants: 2, description: 'One introductory session with equipment instruction, pool practice, and a shallow ocean dive. Exact session time is confirmed with the request.' }),
    item('course-referral', 'courses', 'Course', 'course', 'Open Water Referral', 48000, 70, { minimumPaidParticipants: 2, description: 'Two training days from 9:00 AM to 12:00 PM each day. Guests arrive with completed referral or e-learning documents.' }),
    item('course-scubadiver', 'courses', 'Course', 'course', 'PADI Scuba Diver', 43688, 80, { minimumPaidParticipants: 2, description: 'Pool work and training dives leading to a certification with a shallower depth limitation than full Open Water.' }),
    item('course-owcert', 'courses', 'Course', 'course', 'Open Water Certification', 56438, 90, { minimumPaidParticipants: 2, description: 'Three days from the beginning, including study and exam work, pool training, and training dives.' }),
    item('course-advanced', 'courses', 'Course', 'course', 'Advanced Open Water', 49313, 100, { minimumPaidParticipants: 2, description: 'Five additional dives focused on skill development. Course duration is confirmed with the request.' }),
    item('snorkel-hol', 'hol-chan-shark-ray-alley', 'Island', 'snorkeling', 'Hol Chan & Shark Ray Alley Snorkeling', 9000, 120, { minimumPaidParticipants: 4, maxParticipants: 12, description: 'Departs 7:30 AM and lasts about 3 hours. Pickup timing depends on where the group is staying.' }),
    item('snorkel-mex', 'mexico-rocks', 'Island', 'snorkeling', 'Mexico Rocks Snorkeling', 7500, 130, { minimumPaidParticipants: 4, maxParticipants: 12, description: 'Departs 7:30 AM and lasts 2–3 hours depending on pickup location.' }),
    item('snorkel-manatee', 'caye-caulker-manatee', 'Island', 'snorkeling', 'Hol Chan, Caye Caulker, Manatee & Tarpon Feeding', 17500, 140, { minimumPaidParticipants: 4, maxParticipants: 12, description: 'Runs 9:00 AM–3:00 PM. Lunch is not included; guests purchase lunch on Caye Caulker.' }),
    item('snorkel-sailing', 'caye-caulker-manatee', 'Island', 'snorkeling', 'Sailing: Hol Chan & Caye Caulker', 17500, 150, { minimumPaidParticipants: 4, maxParticipants: 12, description: 'Runs 7:30 AM–3:00 PM. Lunch is not included; guests purchase lunch on Caye Caulker.' }),
    item('snorkel-bacalar', 'bacalar-chico', 'Island', 'snorkeling', 'Bacalar Chico Full-Day Adventure', 17500, 160, { minimumPaidParticipants: 4, maxParticipants: 12, description: 'Runs 9:00 AM–3:00 PM with pickup included.' }),
    item('fish-reef-half', 'fishing', 'Island', 'fishing', 'Reef Fishing (Half Day)', 30938, 170, { pricingBasis: 'per_group', maxParticipants: 4, description: '9:00 AM–1:00 PM for 1–4 guests. Water, sodas, tackle, and bait included; lunch not included.' }),
    item('fish-reef-full', 'fishing', 'Island', 'fishing', 'Reef Fishing (Full Day)', 56250, 180, { pricingBasis: 'per_group', maxParticipants: 4, description: '9:00 AM–3:00 PM for 1–4 guests. Water, sodas, tackle, and bait included.' }),
    item('fish-deep-half', 'fishing', 'Island', 'fishing', 'Deep Sea Fishing (Half Day)', 90000, 190, { pricingBasis: 'per_group', maxParticipants: 4, description: '9:00 AM–1:00 PM for 1–4 guests. Water, sodas, tackle, and bait included; lunch not included.' }),
    item('fish-deep-full', 'fishing', 'Island', 'fishing', 'Deep Sea Fishing (Full Day)', 180000, 200, { pricingBasis: 'per_group', maxParticipants: 4, description: '9:00 AM–3:00 PM for 1–4 guests. Water, sodas, tackle, and bait included.' }),
    item('fish-flat-half', 'fishing', 'Island', 'fishing', 'Flat Fishing (Half Day)', 39375, 210, { pricingBasis: 'per_group', maxParticipants: 2, description: '9:00 AM–1:00 PM. One flat boat price for 1–2 guests; water, sodas, tackle, and bait included.' }),
    item('fish-flat-full', 'fishing', 'Island', 'fishing', 'Flat Fishing (Full Day)', 60000, 220, { pricingBasis: 'per_group', maxParticipants: 2, description: '9:00 AM–3:00 PM. One flat boat price for 1–2 guests; water, sodas, tackle, and bait included.' }),
    item('bbq-full', 'fishing', 'Island', 'fishing', 'Beach Bar-B-Q Fishing Trip', 17500, 230, { minimumPaidParticipants: 4, description: '9:00 AM–3:00 PM. Fishing with a prepared fish barbecue, water, sodas, and snorkeling gear included.' }),
    item('main-altun', 'altun-ha-cave-tubing', 'Mainland', 'mainland', 'Altun Ha & Cave Tubing', 33750, 240, { minimumPaidParticipants: 2, description: 'Full day using the 7:00 AM water taxi from Belize Express in San Pedro.' }),
    item('main-xunantunich', 'xunantunich-cave-tubing', 'Mainland', 'mainland', 'Xunantunich & Cave Tubing', 33750, 250, { minimumPaidParticipants: 2, description: 'Full day using the 7:00 AM water taxi from Belize Express in San Pedro.' }),
    item('main-cave', 'cave-tubing-ziplining', 'Mainland', 'mainland', 'Cave Tubing & Zip-lining', 33750, 260, { minimumPaidParticipants: 2, description: 'Full day using the 7:00 AM water taxi from Belize Express in San Pedro.' }),
    item('main-lamanai', 'lamanai', 'Mainland', 'mainland', 'Lamanai Jungle & New River Tour', 28125, 270, { minimumPaidParticipants: 2, description: 'Full day using the 6:00 AM water taxi from Belize Express in San Pedro.' }),
    item('main-atm', 'atm-caves', 'Mainland', 'mainland', 'Actun Tunichil Muknal (ATM) Cave', 45000, 280, { minimumPaidParticipants: 2, description: 'A physically demanding full day using the 6:00 AM water taxi from Belize Express in San Pedro.' }),
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
  const needsPolicyUpgrade = legacyCatalog || catalog.version < DEFAULT_BOOKING_CATALOG.version;
  const migratedItems = catalog.items
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
      return needsPolicyUpgrade ? {
        ...merged,
        tourId: policy.tourId,
        category: policy.category,
        serviceKind: policy.serviceKind,
        name: policy.name,
        description: policy.description,
        noticeDays: policy.noticeDays,
        minimumPaidParticipants: policy.minimumPaidParticipants,
        maxParticipants: policy.maxParticipants,
        confirmationMode: policy.confirmationMode,
        priceStatus: policy.priceStatus,
        includedParticipants: policy.includedParticipants,
        additionalParticipantPriceCents: policy.additionalParticipantPriceCents,
      } : merged;
    });
  if (needsPolicyUpgrade) {
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
