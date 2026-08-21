import test from 'node:test';
import assert from 'node:assert/strict';
import { merchantOrderNumber } from '../src/payments.ts';
import { paymentIsAvailable } from '../src/reservationRules.ts';

test('payment retries receive a fresh numeric merchant order number', () => {
  const first = merchantOrderNumber();
  const second = merchantOrderNumber();
  assert.match(first, /^\d{16}$/);
  assert.match(second, /^\d{16}$/);
  assert.notEqual(first, second);
});

test('a live payable quote remains retryable after a decline', () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  assert.equal(paymentIsAvailable('payable', 'declined', future), true);
});
