import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API } from '../config';
import { BookingCatalog, BookingCatalogItem, BookingItemDetails, DEFAULT_BOOKING_CATALOG, withDefaultBookingPolicies } from '../shared/bookingCatalog';

export interface CartItem {
  catalogItemId: string;
  tourId: string;
  name: string;
  priceCents: number;
  pricingBasis: BookingCatalogItem['pricingBasis'];
  category: BookingCatalogItem['category'];
  serviceKind: BookingCatalogItem['serviceKind'];
  noticeDays: number;
  minimumPaidParticipants?: number;
  maxParticipants?: number;
  confirmationMode: BookingCatalogItem['confirmationMode'];
  priceStatus: BookingCatalogItem['priceStatus'];
  includedParticipants?: number;
  additionalParticipantPriceCents?: number;
  requestedDate: string;
  participantAdults: number;
  participantChildren: number;
  details: BookingItemDetails;
}

interface StoredCart {
  schemaVersion: 3;
  items: CartItem[];
}

interface BookingContextValue {
  catalog: BookingCatalog;
  catalogLoading: boolean;
  catalogOnline: boolean;
  items: CartItem[];
  addItem: (item: BookingCatalogItem, participants?: { adults: number; children: number }) => void;
  removeItem: (catalogItemId: string) => void;
  setRequestedDate: (catalogItemId: string, requestedDate: string) => void;
  setParticipants: (catalogItemId: string, adults: number, children: number) => void;
  setDetails: (catalogItemId: string, details: Partial<BookingItemDetails>) => void;
  setAllParticipants: (adults: number, children: number) => void;
  clearCart: () => void;
  hasItem: (catalogItemId: string) => boolean;
}

const STORAGE_KEY = 'action-divers-reservation-cart-v1';
const BookingContext = createContext<BookingContextValue | null>(null);

const validStoredItem = (value: unknown): value is CartItem => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CartItem>;
  return typeof item.catalogItemId === 'string' && typeof item.tourId === 'string' && typeof item.name === 'string' &&
    Number.isInteger(item.priceCents) && (item.pricingBasis === 'per_person' || item.pricingBasis === 'per_group' || item.pricingBasis === 'tiered_transfer') &&
    typeof item.requestedDate === 'string' && (item.maxParticipants === undefined || (Number.isInteger(item.maxParticipants) && item.maxParticipants > 0)) && Number.isInteger(item.participantAdults) && Number.isInteger(item.participantChildren);
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<BookingCatalog>(DEFAULT_BOOKING_CATALOG);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogOnline, setCatalogOnline] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as { schemaVersion?: number; items?: Array<Partial<CartItem>> } | null;
      if (!Array.isArray(stored?.items)) return [];
      const defaults = new Map(DEFAULT_BOOKING_CATALOG.items.map((item) => [item.id, item]));
      const migrated = new Map<string, CartItem>();
      stored.items.forEach((storedItem) => {
        const catalogItemId = storedItem.catalogItemId === 'course-resort' ? 'course-discover' : storedItem.catalogItemId ?? '';
        const fresh = defaults.get(catalogItemId);
        if (!fresh || !['Island', 'Mainland'].includes(fresh.category) || migrated.has(catalogItemId)) return;
        const hydrated = {
          ...storedItem,
          ...fresh,
          catalogItemId,
          requestedDate: storedItem.requestedDate ?? '',
          participantAdults: Number.isInteger(storedItem.participantAdults) ? storedItem.participantAdults! : 1,
          participantChildren: Number.isInteger(storedItem.participantChildren) ? storedItem.participantChildren! : 0,
          details: storedItem.details ?? (fresh.serviceKind === 'transfer' ? { transferTrip: 'one_way' as const } : {}),
        };
        if (validStoredItem(hydrated)) migrated.set(catalogItemId, hydrated);
      });
      return [...migrated.values()].slice(0, 12);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 3, items } satisfies StoredCart));
  }, [items]);

  useEffect(() => {
    let active = true;
    fetch(API.url('/catalog'), { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const body = await response.json() as { ok?: boolean; catalog?: BookingCatalog };
        if (!response.ok || !body.catalog?.items) throw new Error('Catalog unavailable');
        if (active) {
          const liveCatalog = withDefaultBookingPolicies(body.catalog);
          setCatalog(liveCatalog);
          setCatalogOnline(true);
          setItems((current) => current.map((cartItem) => {
            const fresh = liveCatalog.items.find((candidate) => candidate.id === cartItem.catalogItemId && candidate.active);
            return fresh ? { ...cartItem, ...fresh, catalogItemId: fresh.id, requestedDate: cartItem.requestedDate, participantAdults: cartItem.participantAdults, participantChildren: cartItem.participantChildren, details: cartItem.details } : cartItem;
          }));
        }
      })
      .catch(() => active && setCatalogOnline(false))
      .finally(() => active && setCatalogLoading(false));
    return () => { active = false; };
  }, []);

  const value = useMemo<BookingContextValue>(() => ({
    catalog,
    catalogLoading,
    catalogOnline,
    items,
    addItem: (catalogItem, participants = { adults: 1, children: 0 }) => setItems((current) => {
      if (current.some((item) => item.catalogItemId === catalogItem.id)) return current;
      const participantLimit = catalogItem.maxParticipants ?? 80;
      const participantAdults = Math.min(Math.max(0, Math.round(participants.adults)), participantLimit);
      const participantChildren = Math.min(Math.max(0, Math.round(participants.children)), Math.max(0, participantLimit - participantAdults));
      if (!['Island', 'Mainland'].includes(catalogItem.category)) return current;
      return [...current, {
          catalogItemId: catalogItem.id,
          tourId: catalogItem.tourId,
          name: catalogItem.name,
          priceCents: catalogItem.priceCents,
          pricingBasis: catalogItem.pricingBasis,
          category: catalogItem.category,
          serviceKind: catalogItem.serviceKind,
          noticeDays: catalogItem.noticeDays,
          minimumPaidParticipants: catalogItem.minimumPaidParticipants,
          maxParticipants: catalogItem.maxParticipants,
          confirmationMode: catalogItem.confirmationMode,
          priceStatus: catalogItem.priceStatus,
          includedParticipants: catalogItem.includedParticipants,
          additionalParticipantPriceCents: catalogItem.additionalParticipantPriceCents,
          requestedDate: '',
          participantAdults,
          participantChildren,
          details: catalogItem.serviceKind === 'transfer' ? { transferTrip: 'one_way' } : {},
        }].slice(0, 12);
    }),
    removeItem: (catalogItemId) => setItems((current) => current.filter((item) => item.catalogItemId !== catalogItemId)),
    setRequestedDate: (catalogItemId, requestedDate) => setItems((current) => current.map((item) => item.catalogItemId === catalogItemId ? { ...item, requestedDate } : item)),
    setParticipants: (catalogItemId, participantAdults, participantChildren) => setItems((current) => current.map((item) => item.catalogItemId === catalogItemId ? { ...item, participantAdults, participantChildren } : item)),
    setDetails: (catalogItemId, details) => setItems((current) => current.map((item) => item.catalogItemId === catalogItemId ? { ...item, details: { ...item.details, ...details } } : item)),
    setAllParticipants: (adults, children) => setItems((current) => current.map((item) => {
      const participantLimit = item.maxParticipants ?? 80;
      const participantAdults = Math.min(Math.max(0, adults), participantLimit);
      const participantChildren = Math.min(Math.max(0, children), Math.max(0, participantLimit - participantAdults));
      return { ...item, participantAdults, participantChildren };
    })),
    clearCart: () => setItems([]),
    hasItem: (catalogItemId) => items.some((item) => item.catalogItemId === catalogItemId),
  }), [catalog, catalogLoading, catalogOnline, items]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};
