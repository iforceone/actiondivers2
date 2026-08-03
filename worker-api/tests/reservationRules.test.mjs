import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentIsAvailable } from '../src/reservationRules.ts';
import { belizeDateAfter, DEFAULT_BOOKING_CATALOG, estimateBookingItemCents, withDefaultBookingPolicies } from '../../shared/bookingCatalog.ts';

test('catalog identifiers and prices are safe server inputs', () => {
  const ids = new Set(DEFAULT_BOOKING_CATALOG.items.map((item) => item.id));
  assert.equal(ids.size, DEFAULT_BOOKING_CATALOG.items.length);
  assert.ok(DEFAULT_BOOKING_CATALOG.items.every((item) => Number.isInteger(item.priceCents) && item.priceCents >= 0));
});

test('per-person estimates enforce the minimum paid quantity', () => {
  const dive = DEFAULT_BOOKING_CATALOG.items.find((item) => item.id === 'dive-two');
  assert.equal(estimateBookingItemCents(dive, 1), 28_876);
  assert.equal(estimateBookingItemCents(dive, 3), 43_314);
});

test('transfer estimates use the six-person base and double round trips', () => {
  const transfer = DEFAULT_BOOKING_CATALOG.items.find((item) => item.id === 'transfer-bze-san-pedro');
  assert.equal(estimateBookingItemCents(transfer, 6), 60_000);
  assert.equal(estimateBookingItemCents(transfer, 7), 70_000);
  assert.equal(estimateBookingItemCents(transfer, 7, { transferTrip: 'round_trip' }), 140_000);
});

test('the seven-day boundary is inclusive in Belize calendar dates', () => {
  const beforeMidnightBelize = new Date('2026-08-01T05:30:00.000Z');
  assert.equal(belizeDateAfter(7, beforeMidnightBelize), '2026-08-07');
  const afterMidnightBelize = new Date('2026-08-01T06:30:00.000Z');
  assert.equal(belizeDateAfter(7, afterMidnightBelize), '2026-08-08');
});

test('legacy course alias is retired and capacity policies are present', () => {
  const legacyCourse = { ...DEFAULT_BOOKING_CATALOG.items.find((item) => item.id === 'course-discover'), category: 'Island', tourId: 'diving-courses' };
  delete legacyCourse.serviceKind;
  delete legacyCourse.noticeDays;
  delete legacyCourse.confirmationMode;
  delete legacyCourse.priceStatus;
  const hydrated = withDefaultBookingPolicies({ version: 1, publishedAt: null, items: [legacyCourse, { ...DEFAULT_BOOKING_CATALOG.items[4], id: 'course-resort' }] });
  assert.equal(hydrated.items.some((item) => item.id === 'course-resort'), false);
  assert.equal(hydrated.items.find((item) => item.id === 'course-discover').category, 'Course');
  assert.equal(hydrated.items.some((item) => item.id === 'transfer-bze-san-pedro'), true);
  assert.ok(hydrated.items.filter((item) => item.serviceKind === 'snorkeling').every((item) => item.minimumPaidParticipants === 4 && item.maxParticipants === 12));
  assert.ok(hydrated.items.filter((item) => item.serviceKind === 'fishing').every((item) => item.maxParticipants === 2 || item.maxParticipants === 4));
});

test('payment is available only for a live payable quote', () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  const past = new Date(Date.now() - 60_000).toISOString();
  assert.equal(paymentIsAvailable('payable', 'created', future), true);
  assert.equal(paymentIsAvailable('sent_update', 'created', future), false);
  assert.equal(paymentIsAvailable('payable', 'paid', future), false);
  assert.equal(paymentIsAvailable('payable', 'created', past), false);
});
