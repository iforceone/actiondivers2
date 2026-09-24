import test from 'node:test';
import assert from 'node:assert/strict';
import { merchantOrderNumber, refreshPayment, handlePaymentRoute, startPaymentForPortal } from '../src/payments.ts';
import { paymentIsAvailable } from '../src/reservationRules.ts';

test('production checkout stays closed for both entry points until explicitly enabled', async (context) => {
  const network = context.mock.method(globalThis, 'fetch', () => { throw new Error('Disabled checkout contacted the bank'); });
  const env = {
    PAYMENT_ENVIRONMENT: 'production',
    PAYMENT_SITE_ORIGIN: 'https://actiondiversbelize.com',
    PAYMENT_LIMITER: { limit: async () => ({ success: true }) },
    PAYMENTS_DB: { prepare() { throw new Error('Disabled checkout touched payment data'); } },
  };
  const token = 'A'.repeat(43);
  const request = new Request(`https://actiondivers-api.davebze.workers.dev/payments/${token}/start`, { method: 'POST' });
  const json = (body, status) => Response.json(body, { status });
  for (const enabled of ['false', undefined]) {
    const disabledEnv = { ...env, PAYMENTS_ENABLED: enabled };
    const responses = [
      await handlePaymentRoute(request, disabledEnv, json, true),
      await startPaymentForPortal(request, disabledEnv, json, token),
    ];
    for (const response of responses) {
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { ok: false, error: 'Payments are not enabled.' });
    }
  }
  assert.equal(network.mock.callCount(), 0);
});

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
