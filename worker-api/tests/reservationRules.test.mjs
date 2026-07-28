import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDiscount, paymentIsAvailable } from '../src/reservationRules.ts';
import { DEFAULT_BOOKING_CATALOG } from '../../shared/bookingCatalog.ts';

test('catalog identifiers and prices are safe server inputs', () => {
  const ids = new Set(DEFAULT_BOOKING_CATALOG.items.map((item) => item.id));
  assert.equal(ids.size, DEFAULT_BOOKING_CATALOG.items.length);
  assert.ok(DEFAULT_BOOKING_CATALOG.items.every((item) => Number.isInteger(item.priceCents) && item.priceCents >= 0));
});

test('percentage discounts use integer cents and retain an audit reason', () => {
  assert.deepEqual(calculateDiscount(14_438, { type: 'percentage', percent: 10, reason: 'Returning guest' }), {
    type: 'percentage', value: 1000, amountCents: 1444, reason: 'Returning guest',
  });
});

test('fixed discounts cannot exceed the quote subtotal', () => {
  assert.throws(() => calculateDiscount(5_000, { type: 'fixed', amountCents: 5_001, reason: 'Test' }));
});

test('payment is available only for a live payable quote', () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  const past = new Date(Date.now() - 60_000).toISOString();
  assert.equal(paymentIsAvailable('payable', 'created', future), true);
  assert.equal(paymentIsAvailable('sent_update', 'created', future), false);
  assert.equal(paymentIsAvailable('payable', 'paid', future), false);
  assert.equal(paymentIsAvailable('payable', 'created', past), false);
});
