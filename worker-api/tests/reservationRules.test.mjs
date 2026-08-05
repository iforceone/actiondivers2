import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentIsAvailable } from '../src/reservationRules.ts';
import { belizeDateAfter, DEFAULT_BOOKING_CATALOG, estimateBookingItemCents, hasMainlandDateConflict, withDefaultBookingPolicies } from '../../shared/bookingCatalog.ts';

test('catalog identifiers and prices are safe server inputs', () => {
  const ids = new Set(DEFAULT_BOOKING_CATALOG.items.map((item) => item.id));
  assert.equal(ids.size, DEFAULT_BOOKING_CATALOG.items.length);
  assert.ok(DEFAULT_BOOKING_CATALOG.items.every((item) => Number.isInteger(item.priceCents) && item.priceCents >= 0));
  assert.ok(DEFAULT_BOOKING_CATALOG.items.every((item) => item.noticeDays >= 7));
});

test('course schedules, names, and minimums hydrate older catalogs', () => {
  const current = DEFAULT_BOOKING_CATALOG.items.find((item) => item.id === 'course-scubadiver');
  const hydrated = withDefaultBookingPolicies({
    version: 99,
    publishedAt: null,
    items: [{ ...current, name: 'Scuba Diver', description: '' }],
  }).items[0];
  assert.equal(hydrated.name, 'PADI Scuba Diver');
  assert.match(hydrated.description, /training dives/i);
  assert.match(DEFAULT_BOOKING_CATALOG.items.find((item) => item.id === 'course-referral').description, /9:00 AM to 12:00 PM/i);
  assert.ok(DEFAULT_BOOKING_CATALOG.items.filter((item) => item.serviceKind === 'course').every((item) => item.minimumPaidParticipants === 2));
  assert.equal(DEFAULT_BOOKING_CATALOG.items.find((item) => item.id === 'course-resort').name, 'Resort Course');
  assert.equal(DEFAULT_BOOKING_CATALOG.items.find((item) => item.id === 'course-discover').name, 'Scuba Discovery');
});

test('per-person estimates enforce the minimum paid quantity', () => {
  const dive = DEFAULT_BOOKING_CATALOG.items.find((item) => item.id === 'dive-two');
  assert.equal(estimateBookingItemCents(dive, 1), 28_876);
  assert.equal(estimateBookingItemCents(dive, 3), 43_314);
});

test('Beach Bar-B-Q uses the owner-confirmed per-person minimum', () => {
  const barbecue = DEFAULT_BOOKING_CATALOG.items.find((item) => item.id === 'bbq-full');
  assert.equal(barbecue.pricingBasis, 'per_person');
  assert.equal(barbecue.minimumPaidParticipants, 4);
  assert.equal(estimateBookingItemCents(barbecue, 2), 70_000);
  assert.equal(estimateBookingItemCents(barbecue, 5), 87_500);
  const migrated = withDefaultBookingPolicies({
    version: 99,
    publishedAt: null,
    items: [{ ...barbecue, priceCents: 56_250, pricingBasis: 'per_group', minimumPaidParticipants: undefined, maxParticipants: 4 }],
  }).items[0];
  assert.equal(migrated.priceCents, 17_500);
  assert.equal(migrated.pricingBasis, 'per_person');
  assert.equal(migrated.minimumPaidParticipants, 4);
  assert.equal(migrated.maxParticipants, undefined);
});

test('only one mainland adventure is allowed per requested day', () => {
  assert.equal(hasMainlandDateConflict([
    { category: 'Mainland', requestedDate: '2026-09-10' },
    { category: 'Mainland', requestedDate: '2026-09-10' },
  ]), true);
  assert.equal(hasMainlandDateConflict([
    { category: 'Mainland', requestedDate: '2026-09-10' },
    { category: 'Mainland', requestedDate: '2026-09-11' },
    { category: 'Island', requestedDate: '2026-09-10' },
  ]), false);
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

test('new service facts and capacity policies hydrate older catalogs', () => {
  const legacyCourse = { ...DEFAULT_BOOKING_CATALOG.items.find((item) => item.id === 'course-discover'), category: 'Island', tourId: 'diving-courses' };
  delete legacyCourse.serviceKind;
  delete legacyCourse.noticeDays;
  delete legacyCourse.confirmationMode;
  delete legacyCourse.priceStatus;
  const hydrated = withDefaultBookingPolicies({ version: 1, publishedAt: null, items: [legacyCourse] });
  assert.equal(hydrated.items.some((item) => item.id === 'course-resort'), true);
  assert.equal(hydrated.items.find((item) => item.id === 'course-discover').category, 'Course');
  assert.equal(hydrated.items.some((item) => item.id === 'transfer-bze-san-pedro'), true);
  assert.ok(hydrated.items.filter((item) => item.serviceKind === 'snorkeling').every((item) => item.minimumPaidParticipants === 4 && item.maxParticipants === 12));
  assert.ok(hydrated.items.filter((item) => item.serviceKind === 'fishing' && item.id !== 'bbq-full').every((item) => item.maxParticipants === 2 || item.maxParticipants === 4));
  assert.equal(hydrated.items.find((item) => item.id === 'bbq-full').minimumPaidParticipants, 4);
  assert.match(hydrated.items.find((item) => item.id === 'snorkel-hol').description, /7:30 AM/i);
  assert.match(hydrated.items.find((item) => item.id === 'main-cave').description, /7:00 AM/i);
});

test('payment is available only for a live payable quote', () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  const past = new Date(Date.now() - 60_000).toISOString();
  assert.equal(paymentIsAvailable('payable', 'created', future), true);
  assert.equal(paymentIsAvailable('sent_update', 'created', future), false);
  assert.equal(paymentIsAvailable('payable', 'paid', future), false);
  assert.equal(paymentIsAvailable('payable', 'created', past), false);
});
