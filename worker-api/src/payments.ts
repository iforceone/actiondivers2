export interface PaymentEnv {
  PAYMENTS_DB?: D1Database;
  BELIZE_BANK_USERNAME: string;
  BELIZE_BANK_PASSWORD: string;
  PAYMENT_ENVIRONMENT: string;
  PAYMENT_SITE_ORIGIN: string;
  PAYMENT_LIMITER: RateLimit;
  PAYMENTS_ENABLED?: string;
  RESEND_API_KEY?: string;
  TO_EMAIL?: string;
  FROM_EMAIL?: string;
}

type Json = (body: unknown, status: number) => Response;

interface PaymentIntentRow {
  id: string;
  token_hash: string;
  merchant_order_number: string;
  reservation_reference: string;
  customer_name: string;
  customer_email: string;
  description: string;
  amount_cents: number;
  currency: 'USD';
  status: string;
  bank_order_id: string | null;
  bank_form_url: string | null;
  bank_status: number | null;
  last_error_code: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  reservation_id: string | null;
  quote_id: string | null;
  quote_version: number | null;
}

interface BankResponse {
  orderId?: string;
  orderID?: string;
  formURL?: string;
  errorCode?: string | number;
  errorMessage?: string;
  orderStatus?: number;
  amount?: number;
}

const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
const SANDBOX_BASE_URL = 'https://sandbox.belizebank.com/payment/rest';
const PRODUCTION_BASE_URL = 'https://gateway.belizebank.com/payment/rest';

function nowIso(): string {
  return new Date().toISOString();
}

function bankBaseUrl(env: PaymentEnv): string {
  return env.PAYMENT_ENVIRONMENT === 'production' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

async function hashToken(token: string): Promise<string> {
  return bytesToBase64Url(await sha256(token));
}

function paymentStatus(bankStatus: number | null, currentStatus: string): string {
  switch (bankStatus) {
    case 0:
      return 'awaiting_payment';
    case 1:
      return 'authorized_hold';
    case 2:
      return 'paid';
    case 3:
      return 'cancelled';
    case 4:
      return 'refunded';
    case 5:
      return 'authentication_required';
    case 6:
      return 'declined';
    default:
      return currentStatus;
  }
}

function publicPayment(row: PaymentIntentRow) {
  const expired = Date.parse(row.expires_at) <= Date.now() && !['paid', 'refunded'].includes(row.status);
  return {
    reference: row.reservation_reference,
    customerName: row.customer_name,
    description: row.description,
    amount: (row.amount_cents / 100).toFixed(2),
    currency: row.currency,
    status: expired ? 'expired' : row.status,
    expiresAt: row.expires_at,
    paidAt: row.paid_at,
  };
}

async function findByToken(env: PaymentEnv, token: string): Promise<PaymentIntentRow | null> {
  if (!env.PAYMENTS_DB) return null;
  if (!TOKEN_RE.test(token)) return null;
  return env.PAYMENTS_DB.prepare('SELECT * FROM payment_intents WHERE token_hash = ?')
    .bind(await hashToken(token))
    .first<PaymentIntentRow>();
}

async function recordEvent(
  env: PaymentEnv,
  paymentIntentId: string,
  source: string,
  eventType: string,
  bankStatus: number | null = null,
  detail: string | null = null,
): Promise<void> {
  if (!env.PAYMENTS_DB) return;
  await env.PAYMENTS_DB.prepare(
    `INSERT INTO payment_events
      (payment_intent_id, source, event_type, bank_status, detail, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(paymentIntentId, source, eventType, bankStatus, detail?.slice(0, 200) ?? null, nowIso())
    .run();
}

async function bankPost(env: PaymentEnv, path: string, fields: Record<string, string>): Promise<BankResponse> {
  const body = new URLSearchParams({
    userName: env.BELIZE_BANK_USERNAME,
    password: env.BELIZE_BANK_PASSWORD,
    ...fields,
  });
  const response = await fetch(`${bankBaseUrl(env)}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Belize Bank HTTP ${response.status}`);
  const text = await response.text();
  try {
    return JSON.parse(text) as BankResponse;
  } catch {
    throw new Error('Belize Bank returned invalid JSON');
  }
}

function isAllowedGatewayUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'belizebank.com' ||
        url.hostname.endsWith('.belizebank.com') ||
        url.hostname === 'radarpayment.online' ||
        url.hostname.endsWith('.radarpayment.online'))
    );
  } catch {
    return false;
  }
}

async function refreshPayment(env: PaymentEnv, row: PaymentIntentRow, source: string): Promise<PaymentIntentRow> {
  if (!env.PAYMENTS_DB) throw new Error('Payment database is not configured');
  if (!row.bank_order_id) return row;
  const bank = await bankPost(env, '/getOrderStatusExtended.do', { orderId: row.bank_order_id });
  if (Number(bank.errorCode ?? 0) !== 0 || typeof bank.orderStatus !== 'number') {
    const errorCode = String(bank.errorCode ?? 'unknown');
    await recordEvent(env, row.id, source, 'status_error', null, errorCode);
    throw new Error(`Belize Bank status error ${errorCode}`);
  }
  if (typeof bank.amount === 'number' && bank.amount !== row.amount_cents) {
    await env.PAYMENTS_DB.prepare(
      `UPDATE payment_intents
       SET status = 'review_required', last_error_code = 'amount_mismatch', updated_at = ?
       WHERE id = ?`,
    )
      .bind(nowIso(), row.id)
      .run();
    await recordEvent(env, row.id, source, 'amount_mismatch', bank.orderStatus, String(bank.amount));
    throw new Error('Belize Bank amount mismatch');
  }
  const nextStatus = paymentStatus(bank.orderStatus, row.status);
  const timestamp = nowIso();
  await env.PAYMENTS_DB.prepare(
    `UPDATE payment_intents
     SET status = ?, bank_status = ?, last_error_code = NULL, updated_at = ?,
         paid_at = CASE WHEN ? = 'paid' THEN COALESCE(paid_at, ?) ELSE paid_at END
     WHERE id = ?`,
  )
    .bind(nextStatus, bank.orderStatus, timestamp, nextStatus, timestamp, row.id)
    .run();
  await recordEvent(env, row.id, source, `status_${nextStatus}`, bank.orderStatus);
  return { ...row, status: nextStatus, bank_status: bank.orderStatus, updated_at: timestamp, paid_at: nextStatus === 'paid' ? row.paid_at ?? timestamp : row.paid_at };
}

async function finalizePaidReservation(env: PaymentEnv, row: PaymentIntentRow): Promise<void> {
  if (!env.PAYMENTS_DB || row.status !== 'paid' || !row.reservation_id || !row.quote_id) return;
  const timestamp = row.paid_at ?? nowIso();
  const changed = await env.PAYMENTS_DB.prepare(
    "UPDATE reservations SET status = 'paid', version = version + 1, updated_at = ? WHERE id = ? AND status <> 'paid'",
  ).bind(timestamp, row.reservation_id).run();
  await env.PAYMENTS_DB.prepare(
    "UPDATE quote_versions SET status = 'paid', updated_at = ? WHERE id = ? AND status <> 'paid'",
  ).bind(timestamp, row.quote_id).run();
  if (changed.meta.changes) {
    await env.PAYMENTS_DB.prepare(
      "INSERT INTO reservation_events (reservation_id, actor, event_type, detail_json, created_at) VALUES (?, 'bank', 'payment_confirmed', ?, ?)",
    ).bind(row.reservation_id, JSON.stringify({ paymentIntentId: row.id, quoteId: row.quote_id }), timestamp).run();
  }

  const delivered = await env.PAYMENTS_DB.prepare(
    "SELECT id FROM email_delivery_events WHERE reservation_id = ? AND template_key = 'payment_receipt' AND status = 'sent' LIMIT 1",
  ).bind(row.reservation_id).first();
  if (delivered || !env.RESEND_API_KEY || !env.FROM_EMAIL) return;
  let status: 'sent' | 'failed' = 'failed';
  let providerId: string | null = null;
  let errorDetail: string | null = null;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [row.customer_email],
        reply_to: env.TO_EMAIL,
        subject: `Payment received for ${row.reservation_reference}`,
        html: `<div style="font:16px/1.6 Arial,sans-serif;color:#10242c"><h1>Payment received</h1><p>Thank you, ${row.customer_name.replace(/[&<>"']/g, '')}. We received <strong>$${(row.amount_cents / 100).toFixed(2)} USD</strong> for reservation <strong>${row.reservation_reference}</strong>.</p><p>Receipt reference: ${row.merchant_order_number}</p></div>`,
        text: `Payment received\n\nWe received $${(row.amount_cents / 100).toFixed(2)} USD for reservation ${row.reservation_reference}.\nReceipt reference: ${row.merchant_order_number}`,
      }),
    });
    const body = await response.json().catch(() => ({})) as { id?: string; message?: string };
    if (!response.ok) throw new Error(body.message || `Resend HTTP ${response.status}`);
    providerId = body.id ?? null;
    status = 'sent';
  } catch (error) {
    errorDetail = error instanceof Error ? error.message.slice(0, 300) : 'Unknown receipt email error';
  }
  await env.PAYMENTS_DB.prepare(`INSERT INTO email_delivery_events
    (reservation_id, recipient, template_key, provider_id, status, error_detail, created_at)
    VALUES (?, ?, 'payment_receipt', ?, ?, ?, ?)`)
    .bind(row.reservation_id, row.customer_email, providerId, status, errorDetail, nowIso()).run();
}

async function startPayment(request: Request, env: PaymentEnv, json: Json, token: string): Promise<Response> {
  if (!env.PAYMENTS_DB) return json({ ok: false, error: 'Payment database is not configured.' }, 503);
  if (env.PAYMENTS_ENABLED !== 'true') return json({ ok: false, error: 'Payments are not enabled.' }, 503);
  const row = await findByToken(env, token);
  if (!row) return json({ ok: false, error: 'Payment request not found.' }, 404);
  if (Date.parse(row.expires_at) <= Date.now()) return json({ ok: false, error: 'This payment request has expired.' }, 410);
  if (row.status === 'paid') return json({ ok: false, error: 'This payment has already been completed.' }, 409);
  if (row.status === 'review_required') return json({ ok: false, error: 'This payment needs staff review. Please contact Action Divers.' }, 409);
  if (!['created', 'registration_failed', 'registering', 'awaiting_payment'].includes(row.status)) {
    return json({ ok: false, error: 'This payment request is no longer active.' }, 409);
  }
  if (row.bank_order_id && row.bank_form_url && isAllowedGatewayUrl(row.bank_form_url)) {
    return json({ ok: true, redirectUrl: row.bank_form_url }, 200);
  }

  const locked = await env.PAYMENTS_DB.prepare(
    `UPDATE payment_intents SET status = 'registering', updated_at = ?
     WHERE id = ? AND status IN ('created', 'registration_failed') AND bank_order_id IS NULL`,
  )
    .bind(nowIso(), row.id)
    .run();
  if (!locked.meta.changes) return json({ ok: false, error: 'Payment setup is already in progress. Please try again shortly.' }, 409);

  try {
    const requestUrl = new URL(request.url);
    const bank = await bankPost(env, '/register.do', {
      amount: String(row.amount_cents),
      description: row.description,
      returnURL: `${env.PAYMENT_SITE_ORIGIN.replace(/\/$/, '')}/payment/return?token=${encodeURIComponent(token)}`,
      orderNumber: row.merchant_order_number,
      email: row.customer_email,
      dynamicCallbackUrl: `${requestUrl.origin}/payments/callback`,
    });
    const orderId = bank.orderId ?? bank.orderID ?? '';
    const formUrl = bank.formURL ?? '';
    if (Number(bank.errorCode ?? 0) !== 0 || !orderId || !isAllowedGatewayUrl(formUrl)) {
      const errorCode = String(bank.errorCode ?? 'invalid_gateway_response');
      await env.PAYMENTS_DB.prepare(
        `UPDATE payment_intents SET status = 'registration_failed', last_error_code = ?, updated_at = ? WHERE id = ?`,
      )
        .bind(errorCode, nowIso(), row.id)
        .run();
      await recordEvent(env, row.id, 'bank', 'registration_failed', null, errorCode);
      return json({ ok: false, error: 'Belize Bank could not start this payment. Please contact Action Divers.' }, 502);
    }
    await env.PAYMENTS_DB.prepare(
      `UPDATE payment_intents
       SET status = 'awaiting_payment', bank_order_id = ?, bank_form_url = ?, last_error_code = NULL, updated_at = ?
       WHERE id = ?`,
    )
      .bind(orderId, formUrl, nowIso(), row.id)
      .run();
    await recordEvent(env, row.id, 'bank', 'registered');
    return json({ ok: true, redirectUrl: formUrl }, 200);
  } catch (error) {
    console.error('Belize Bank registration failed', error instanceof Error ? error.message : 'unknown');
    await env.PAYMENTS_DB.prepare(
      `UPDATE payment_intents SET status = 'review_required', last_error_code = 'registration_uncertain', updated_at = ? WHERE id = ?`,
    )
      .bind(nowIso(), row.id)
      .run();
    await recordEvent(env, row.id, 'worker', 'registration_uncertain');
    return json({ ok: false, error: 'Payment setup could not be confirmed. Please contact Action Divers before retrying.' }, 502);
  }
}

async function handleCallback(request: Request, env: PaymentEnv): Promise<Response> {
  if (!env.PAYMENTS_DB) return new Response('Payment database is not configured', { status: 503 });
  const fields = new URLSearchParams(await request.text());
  const bankOrderId = fields.get('mdOrder')?.trim() ?? '';
  const operation = fields.get('operation')?.trim().slice(0, 40) ?? '';
  const callbackStatus = fields.get('status')?.trim() ?? '';
  if (!bankOrderId) return new Response('Missing order', { status: 400 });
  const row = await env.PAYMENTS_DB.prepare('SELECT * FROM payment_intents WHERE bank_order_id = ?')
    .bind(bankOrderId)
    .first<PaymentIntentRow>();
  if (!row) return new Response('Unknown order', { status: 404 });
  await recordEvent(env, row.id, 'callback', operation || 'unknown', null, callbackStatus);
  try {
    const refreshed = await refreshPayment(env, row, 'callback_verification');
    await finalizePaidReservation(env, refreshed);
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (error) {
    console.error('Belize Bank callback verification failed', error instanceof Error ? error.message : 'unknown');
    return new Response('Verification failed', { status: 502 });
  }
}

export async function handlePaymentRoute(
  request: Request,
  env: PaymentEnv,
  json: Json,
  originAllowed: boolean,
): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith('/payments')) return null;

  if (!env.PAYMENTS_DB) return json({ ok: false, error: 'Payment database is not configured.' }, 503);

  if (pathname === '/payments/callback') {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    return handleCallback(request, env);
  }

  if (pathname === '/payments/admin/intents') {
    return json({ ok: false, error: 'Standalone payment links are disabled. Finalize a reservation quote in the staff portal.' }, 410);
  }

  if (request.method === 'OPTIONS') return null;
  if (!originAllowed) return json({ ok: false, error: 'Forbidden' }, 403);

  const match = /^\/payments\/([A-Za-z0-9_-]{43})(?:\/(start|refresh))?$/.exec(pathname);
  if (!match) return json({ ok: false, error: 'Not found' }, 404);
  const [, token, action] = match;
  const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const { success } = await env.PAYMENT_LIMITER.limit({ key: clientIp });
  if (!success) return json({ ok: false, error: 'Too many payment requests. Please wait a moment.' }, 429);

  if (!action && request.method === 'GET') {
    const row = await findByToken(env, token);
    return row ? json({ ok: true, payment: publicPayment(row) }, 200) : json({ ok: false, error: 'Payment request not found.' }, 404);
  }
  if (action === 'start' && request.method === 'POST') return startPayment(request, env, json, token);
  if (action === 'refresh' && request.method === 'POST') {
    const row = await findByToken(env, token);
    if (!row) return json({ ok: false, error: 'Payment request not found.' }, 404);
    if (!row.bank_order_id) return json({ ok: true, payment: publicPayment(row) }, 200);
    try {
      const refreshed = await refreshPayment(env, row, 'guest_refresh');
      await finalizePaidReservation(env, refreshed);
      return json({ ok: true, payment: publicPayment(refreshed) }, 200);
    } catch {
      return json({ ok: false, error: 'Payment status could not be confirmed yet. Please try again shortly.' }, 502);
    }
  }
  return json({ ok: false, error: 'Method not allowed' }, 405);
}

export async function startPaymentForPortal(
  request: Request,
  env: PaymentEnv,
  json: Json,
  token: string,
): Promise<Response> {
  return startPayment(request, env, json, token);
}
