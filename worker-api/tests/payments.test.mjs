import test from 'node:test';
import assert from 'node:assert/strict';
import { merchantOrderNumber, refreshPayment } from '../src/payments.ts';
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

test('a bank amount mismatch moves the payment to staff review', async () => {
  const statements = [];
  const env = {
    BELIZE_BANK_USERNAME: 'sandbox-user',
    BELIZE_BANK_PASSWORD: 'sandbox-password',
    PAYMENT_ENVIRONMENT: 'sandbox',
    PAYMENTS_DB: {
      prepare(sql) {
        const statement = { sql, values: [] };
        statements.push(statement);
        return {
          bind(...values) {
            statement.values = values;
            return this;
          },
          async run() { return { meta: { changes: 1 } }; },
        };
      },
    },
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ errorCode: 0, orderStatus: 2, amount: 29_999 }), { status: 200 });
  try {
    await assert.rejects(
      refreshPayment(env, {
        id: 'payment-test', bank_order_id: 'bank-test', amount_cents: 30_000, status: 'awaiting_payment',
      }, 'test_verification'),
      /amount mismatch/i,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
  const reviewUpdate = statements.find(({ sql }) => sql.includes("status = 'review_required'"));
  assert.ok(reviewUpdate);
  assert.match(reviewUpdate.sql, /last_error_code = 'amount_mismatch'/);
  assert.equal(reviewUpdate.values[1], 'payment-test');
  const eventInsert = statements.find(({ sql }) => sql.includes('INSERT INTO payment_events'));
  assert.ok(eventInsert);
  assert.deepEqual(eventInsert.values.slice(1, 5), ['test_verification', 'amount_mismatch', 2, '29999']);
});
