import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API } from '../config';
import { BookingCatalog, BookingCatalogItem, DEFAULT_BOOKING_CATALOG } from '../shared/bookingCatalog';

export interface CartItem {
  catalogItemId: string;
  tourId: string;
  name: string;
  priceCents: number;
  pricingBasis: 'per_person' | 'per_group';
  requestedDate: string;
  participantAdults: number;
  participantChildren: number;
}

interface StoredCart {
  schemaVersion: 2;
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
  setAllRequestedDates: (requestedDate: string) => void;
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
    Number.isInteger(item.priceCents) && (item.pricingBasis === 'per_person' || item.pricingBasis === 'per_group') &&
    typeof item.requestedDate === 'string' && Number.isInteger(item.participantAdults) && Number.isInteger(item.participantChildren);
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<BookingCatalog>(DEFAULT_BOOKING_CATALOG);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogOnline, setCatalogOnline] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as { schemaVersion?: number; items?: Array<Partial<CartItem>> } | null;
      if (!Array.isArray(stored?.items)) return [];
      return stored.items.map((item) => ({ ...item, participantAdults: Number.isInteger(item.participantAdults) ? item.participantAdults : 1, participantChildren: Number.isInteger(item.participantChildren) ? item.participantChildren : 0 })).filter(validStoredItem).slice(0, 12);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 2, items } satisfies StoredCart));
  }, [items]);

  useEffect(() => {
    let active = true;
    fetch(API.url('/catalog'), { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const body = await response.json() as { ok?: boolean; catalog?: BookingCatalog };
        if (!response.ok || !body.catalog?.items) throw new Error('Catalog unavailable');
        if (active) {
          setCatalog(body.catalog);
          setCatalogOnline(true);
          setItems((current) => current.map((cartItem) => {
            const fresh = body.catalog!.items.find((candidate) => candidate.id === cartItem.catalogItemId && candidate.active);
            return fresh ? { ...cartItem, name: fresh.name, priceCents: fresh.priceCents, pricingBasis: fresh.pricingBasis } : cartItem;
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
    addItem: (catalogItem, participants = { adults: 1, children: 0 }) => setItems((current) => current.some((item) => item.catalogItemId === catalogItem.id)
      ? current
      : [...current, {
          catalogItemId: catalogItem.id,
          tourId: catalogItem.tourId,
          name: catalogItem.name,
          priceCents: catalogItem.priceCents,
          pricingBasis: catalogItem.pricingBasis,
          requestedDate: '',
          participantAdults: Math.max(0, Math.min(40, Math.round(participants.adults))),
          participantChildren: Math.max(0, Math.min(40, Math.round(participants.children))),
        }].slice(0, 12)),
    removeItem: (catalogItemId) => setItems((current) => current.filter((item) => item.catalogItemId !== catalogItemId)),
    setRequestedDate: (catalogItemId, requestedDate) => setItems((current) => current.map((item) => item.catalogItemId === catalogItemId ? { ...item, requestedDate } : item)),
    setParticipants: (catalogItemId, participantAdults, participantChildren) => setItems((current) => current.map((item) => item.catalogItemId === catalogItemId ? { ...item, participantAdults, participantChildren } : item)),
    setAllRequestedDates: (requestedDate) => setItems((current) => current.map((item) => ({ ...item, requestedDate }))),
    setAllParticipants: (participantAdults, participantChildren) => setItems((current) => current.map((item) => ({ ...item, participantAdults, participantChildren }))),
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
