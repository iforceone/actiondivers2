import { belizeDateAfter, DEFAULT_BOOKING_CATALOG, BookingCatalog, BookingCatalogItem, BookingItemDetails, estimateBookingItemCents, hasMainlandDateConflict, withDefaultBookingPolicies } from '../../shared/bookingCatalog';
import { requireStaff, staffErrorStatus, StaffIdentity, AccessEnv } from './auth';
import { PaymentEnv, startPaymentForPortal } from './payments';
import { paymentIsAvailable } from './reservationRules';

type Json = (body: unknown, status: number) => Response;

export interface ReservationEnv extends PaymentEnv, AccessEnv {
  RESEND_API_KEY: string;
  TO_EMAIL: string;
  FROM_EMAIL: string;
  PAYMENT_SITE_ORIGIN: string;
  RESERVATIONS_V2_ENABLED?: string;
  STAFF_PORTAL_ENABLED?: string;
  INQUIRY_LIMITER: RateLimit;
}

interface ReservationRow {
  id: string;
  reference: string;
  status: string;
  request_kind: 'tour' | 'course' | 'transfer';
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  adults: number;
  children: number;
  accommodation: string | null;
  diving_experience: string | null;
  customer_notes: string | null;
  internal_notes: string | null;
  customer_message: string | null;
  estimated_total_cents: number;
  current_quote_version: number | null;
  version: number;
  created_at: string;
  updated_at: string;
}

interface QuoteRow {
  id: string;
  reservation_id: string;
  version: number;
  status: string;
  customer_message: string | null;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  currency: 'USD';
  expires_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
}

interface ReservationSummaryRow {
  id: string;
  reference: string;
  status: string;
  request_kind: 'tour' | 'course' | 'transfer';
  customer_name: string;
  customer_email: string;
  adults: number;
  children: number;
  estimated_total_cents: number;
  current_quote_version: number | null;
  version: number;
  created_at: string;
  updated_at: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
const RESERVATION_STATUSES = new Set(['new', 'reviewing', 'needs_contact', 'quoted', 'awaiting_payment', 'paid', 'cancelled', 'completed']);
const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const nowIso = () => new Date().toISOString();
const siteOrigin = (env: ReservationEnv) => env.PAYMENT_SITE_ORIGIN.replace(/\/$/, '');

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] ?? character));

const bytesToBase64Url = (bytes: Uint8Array) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const randomToken = () => bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
const tokenHash = async (token: string) => bytesToBase64Url(new Uint8Array(
  await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)),
));

const reservationReference = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const random = crypto.getRandomValues(new Uint8Array(6));
  return `AD-${Array.from(random, (value) => alphabet[value % alphabet.length]).join('')}`;
};

const merchantOrderNumber = () =>
  `${Date.now().toString().slice(-10)}${crypto.getRandomValues(new Uint32Array(1))[0].toString().padStart(10, '0').slice(-6)}`;

const database = (env: ReservationEnv) => {
  if (!env.PAYMENTS_DB) throw new Error('Reservation database is not configured.');
  return env.PAYMENTS_DB;
};

function validCatalog(value: unknown): value is BookingCatalog {
  if (!value || typeof value !== 'object') return false;
  const catalog = value as Partial<BookingCatalog>;
  if (!Array.isArray(catalog.items) || catalog.items.length > 200) return false;
  const ids = new Set<string>();
  return catalog.items.every((candidate) => {
    const item = candidate as Partial<BookingCatalogItem>;
    if (!item.id || ids.has(item.id)) return false;
    ids.add(item.id);
    return typeof item.tourId === 'string' && typeof item.name === 'string' && item.name.trim().length > 0 &&
      (item.category === 'Island' || item.category === 'Mainland' || item.category === 'Course' || item.category === 'Transfer') &&
      ['recreational_dive', 'course', 'snorkeling', 'fishing', 'mainland', 'transfer'].includes(item.serviceKind ?? '') &&
      Number.isInteger(item.priceCents) && item.priceCents! >= 0 && item.priceCents! <= 10_000_000 &&
      (item.pricingBasis === 'per_person' || item.pricingBasis === 'per_group' || item.pricingBasis === 'tiered_transfer') &&
      Number.isInteger(item.noticeDays) && item.noticeDays! >= 7 && item.noticeDays! <= 365 &&
      (item.minimumPaidParticipants === undefined || (Number.isInteger(item.minimumPaidParticipants) && item.minimumPaidParticipants! >= 1 && item.minimumPaidParticipants! <= 80)) &&
      (item.maxParticipants === undefined || (Number.isInteger(item.maxParticipants) && item.maxParticipants! >= 1 && item.maxParticipants! <= 80)) &&
      (item.minimumPaidParticipants === undefined || item.maxParticipants === undefined || item.minimumPaidParticipants <= item.maxParticipants) &&
      (item.confirmationMode === 'request_only' || item.confirmationMode === 'instant') &&
      (item.priceStatus === 'current' || item.priceStatus === 'proposed') &&
      typeof item.active === 'boolean' && Number.isInteger(item.sortOrder);
  });
}

async function publishedCatalog(env: ReservationEnv): Promise<BookingCatalog> {
  if (!env.PAYMENTS_DB) return DEFAULT_BOOKING_CATALOG;
  const row = await env.PAYMENTS_DB.prepare(
    "SELECT payload_json, version, published_at FROM catalog_revisions WHERE status = 'published' LIMIT 1",
  ).first<{ payload_json: string; version: number; published_at: string | null }>();
  if (row) {
    try {
      const payload = JSON.parse(row.payload_json) as BookingCatalog;
      if (validCatalog(withDefaultBookingPolicies(payload))) return withDefaultBookingPolicies({ ...payload, version: row.version, publishedAt: row.published_at });
    } catch {
      // Fall through to the checked-in catalog if a stored revision is corrupt.
    }
  }
  const timestamp = nowIso();
  const seeded = { ...DEFAULT_BOOKING_CATALOG, publishedAt: timestamp };
  await env.PAYMENTS_DB.prepare(
    `INSERT OR IGNORE INTO catalog_revisions
      (id, version, status, payload_json, created_by, created_at, published_at)
     VALUES (?, 1, 'published', ?, 'system', ?, ?)`,
  ).bind(crypto.randomUUID(), JSON.stringify(seeded), timestamp, timestamp).run();
  return seeded;
}

const reservationDto = (row: ReservationRow) => ({
  id: row.id,
  reference: row.reference,
  status: row.status,
  requestKind: row.request_kind,
  customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone },
  party: { adults: row.adults, children: row.children },
  accommodation: row.accommodation,
  divingExperience: row.diving_experience,
  customerNotes: row.customer_notes,
  internalNotes: row.internal_notes,
  customerMessage: row.customer_message,
  estimatedTotalCents: row.estimated_total_cents,
  currentQuoteVersion: row.current_quote_version,
  version: row.version,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

async function emailReservation(
  env: ReservationEnv,
  reservationId: string,
  recipient: string,
  subject: string,
  heading: string,
  body: string,
  portalUrl: string | null,
  templateKey: string,
  replyTo?: string,
) {
  const safeBody = escapeHtml(body).replace(/\n/g, '<br>');
  const button = portalUrl
    ? `<p style="margin:26px 0 4px"><a href="${escapeHtml(portalUrl)}" style="display:inline-block;background:#ff5a00;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font:700 14px Arial,sans-serif">View reservation</a></p>`
    : '';
  let providerId: string | null = null;
  let status: 'sent' | 'failed' = 'failed';
  let errorDetail: string | null = null;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [recipient],
        reply_to: replyTo || env.TO_EMAIL,
        subject,
        html: `<div style="background:#f3f5f6;padding:24px"><div style="max-width:620px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e6eaec"><div style="background:#001219;padding:24px 28px;color:#f8f4e8;font:700 20px Arial,sans-serif">Action Divers &amp; Adventures</div><div style="padding:28px;color:#10242c;font:400 16px/1.6 Arial,sans-serif"><h1 style="font-size:24px;line-height:1.25;margin:0 0 16px">${escapeHtml(heading)}</h1><p>${safeBody}</p>${button}<p style="margin-top:28px;color:#63747b;font-size:13px">Reply to this email if anything needs to change.</p></div></div></div>`,
        text: `${heading}\n\n${body}${portalUrl ? `\n\nView reservation: ${portalUrl}` : ''}`,
      }),
    });
    const responseBody = await response.json().catch(() => ({})) as { id?: string; message?: string };
    if (!response.ok) throw new Error(responseBody.message || `Resend HTTP ${response.status}`);
    providerId = responseBody.id ?? null;
    status = 'sent';
  } catch (error) {
    errorDetail = error instanceof Error ? error.message.slice(0, 300) : 'Unknown email error';
  }
  if (env.PAYMENTS_DB) {
    await env.PAYMENTS_DB.prepare(
      `INSERT INTO email_delivery_events
        (reservation_id, recipient, template_key, provider_id, status, error_detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind(reservationId, recipient, templateKey, providerId, status, errorDetail, nowIso()).run();
  }
  return status;
}

async function createReservation(request: Request, env: ReservationEnv, json: Json): Promise<Response> {
  if (env.RESERVATIONS_V2_ENABLED !== 'true') return json({ ok: false, error: 'Online reservations are not enabled yet.' }, 503);
  const db = database(env);
  const idempotencyKey = text(request.headers.get('Idempotency-Key'), 128);
  if (idempotencyKey.length < 8) return json({ ok: false, error: 'A valid Idempotency-Key header is required.' }, 400);
  const existing = await db.prepare('SELECT response_json, status_code FROM idempotency_keys WHERE scope = ? AND key = ?')
    .bind('reservation-create', idempotencyKey).first<{ response_json: string; status_code: number }>();
  if (existing) return json(JSON.parse(existing.response_json), existing.status_code);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
  if (body.company) return json({ ok: true }, 200);
  const customer = (body.customer ?? {}) as Record<string, unknown>;
  const name = text(customer.name, 100);
  const email = text(customer.email, 200).toLowerCase();
  const phone = text(customer.phone, 40);
  const adults = Number(body.adults);
  const children = Number(body.children ?? 0);
  const submittedItems = Array.isArray(body.items) ? body.items : [];
  if (!name || !EMAIL_RE.test(email) || !Number.isInteger(adults) || adults < 1 || adults > 40 || !Number.isInteger(children) || children < 0 || children > 40) {
    return json({ ok: false, error: 'Valid contact information and party size are required.' }, 422);
  }
  if (submittedItems.length < 1 || submittedItems.length > 12) return json({ ok: false, error: 'Choose between 1 and 12 tours.' }, 422);
  const catalog = await publishedCatalog(env);
  const catalogById = new Map(catalog.items.filter((item) => item.active).map((item) => [item.id, item]));
  const normalizedItems: Array<{ catalog: BookingCatalogItem; requestedDate: string; adults: number; children: number; details: BookingItemDetails }> = [];
  for (const candidate of submittedItems) {
    const submitted = candidate as Record<string, unknown>;
    const catalogItem = catalogById.get(text(submitted.catalogItemId, 80));
    const requestedDate = text(submitted.requestedDate, 10);
    const itemAdults = Number(submitted.adults);
    const itemChildren = Number(submitted.children ?? 0);
    const rawDetails = submitted.details && typeof submitted.details === 'object' ? submitted.details as BookingItemDetails : {};
    const details: BookingItemDetails = {
      certificationLevel: text(rawDetails.certificationLevel, 100) || undefined,
      lastDiveDate: text(rawDetails.lastDiveDate, 10) || undefined,
      referralDocuments: typeof rawDetails.referralDocuments === 'boolean' ? rawDetails.referralDocuments : undefined,
      transferTrip: rawDetails.transferTrip === 'round_trip' ? 'round_trip' : rawDetails.transferTrip === 'one_way' ? 'one_way' : undefined,
      arrivalTime: text(rawDetails.arrivalTime, 10) || undefined,
      flightNumber: text(rawDetails.flightNumber, 80) || undefined,
      returnDate: text(rawDetails.returnDate, 10) || undefined,
      returnTime: text(rawDetails.returnTime, 10) || undefined,
      returnFlightNumber: text(rawDetails.returnFlightNumber, 80) || undefined,
      luggage: text(rawDetails.luggage, 300) || undefined,
      destination: text(rawDetails.destination, 200) || undefined,
      specialRequirements: text(rawDetails.specialRequirements, 500) || undefined,
    };
    if (!catalogItem || !DATE_RE.test(requestedDate) || requestedDate < belizeDateAfter(catalogItem.noticeDays) || requestedDate > belizeDateAfter(730)) {
      return json({ ok: false, error: 'Every selected service needs a valid date at least seven days away and within the next two years.' }, 422);
    }
    if (!Number.isInteger(itemAdults) || !Number.isInteger(itemChildren) || itemAdults < 0 || itemChildren < 0 || itemAdults > adults || itemChildren > children || itemAdults + itemChildren < 1) {
      return json({ ok: false, error: 'Every selected tour needs at least one participant within the overall party size.' }, 422);
    }
    if (catalogItem.maxParticipants && itemAdults + itemChildren > catalogItem.maxParticipants) {
      return json({ ok: false, error: `${catalogItem.name} allows a maximum of ${catalogItem.maxParticipants} guests.` }, 422);
    }
    if (catalogItem.serviceKind === 'recreational_dive') {
      if (!text(details.certificationLevel, 100) || !DATE_RE.test(text(details.lastDiveDate, 10))) return json({ ok: false, error: 'Recreational dives require certification and a valid last-dive date.' }, 422);
      if (text(details.lastDiveDate, 10) < belizeDateAfter(-365)) return json({ ok: false, error: 'Guests whose last dive was more than one year ago should request a Refresher course.' }, 422);
    }
    if (catalogItem.id === 'course-referral' && typeof details.referralDocuments !== 'boolean') return json({ ok: false, error: 'Please confirm your referral-document status.' }, 422);
    if (catalogItem.serviceKind === 'transfer') {
      if ((details.transferTrip !== 'one_way' && details.transferTrip !== 'round_trip') || !text(details.arrivalTime, 10) || !text(details.destination, 200)) return json({ ok: false, error: 'Transfer direction, time, and destination are required.' }, 422);
      if (details.transferTrip === 'round_trip' && (!DATE_RE.test(text(details.returnDate, 10)) || !text(details.returnTime, 10))) return json({ ok: false, error: 'Round-trip transfers require a return date and time.' }, 422);
    }
    normalizedItems.push({ catalog: catalogItem, requestedDate, adults: itemAdults, children: itemChildren, details });
  }
  const requestKinds = new Set(normalizedItems.map((item) => item.catalog.category === 'Course' ? 'course' : item.catalog.category === 'Transfer' ? 'transfer' : 'tour'));
  if (requestKinds.size !== 1) return json({ ok: false, error: 'Tour, course, and transfer requests must be submitted separately.' }, 422);
  if (hasMainlandDateConflict(normalizedItems.map((item) => ({ category: item.catalog.category, requestedDate: item.requestedDate })))) {
    return json({ ok: false, error: 'Only one mainland adventure can be scheduled per day.' }, 422);
  }
  const requestKind = [...requestKinds][0];
  const timestamp = nowIso();
  const id = crypto.randomUUID();
  const reference = reservationReference();
  const portalToken = randomToken();
  const portalUrl = `${siteOrigin(env)}/reservation/${portalToken}`;
  const estimatedTotalCents = normalizedItems.reduce((total, item) => total + estimateBookingItemCents(item.catalog, item.adults + item.children, item.details), 0);
  const portalExpiresAt = new Date(Date.now() + 180 * 86_400_000).toISOString();
  const responseBody = { ok: true, reference, portalUrl, emailStatus: 'pending' };
  const statements = [
    db.prepare(`INSERT INTO reservations
      (id, reference, request_kind, customer_name, customer_email, customer_phone, adults, children, accommodation,
       diving_experience, customer_notes, estimated_total_cents, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, reference, requestKind, name, email, phone || null, adults, children, text(body.accommodation, 160) || null, text(body.divingExperience, 160) || null, text(body.notes, 2000) || null, estimatedTotalCents, timestamp, timestamp),
    ...normalizedItems.map((entry, index) => db.prepare(`INSERT INTO reservation_items
      (id, reservation_id, catalog_item_id, tour_id, name_snapshot, requested_date, price_snapshot_cents, pricing_basis, adults, children, details_json, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), id, entry.catalog.id, entry.catalog.tourId, entry.catalog.name, entry.requestedDate, entry.catalog.priceCents, entry.catalog.pricingBasis, entry.adults, entry.children, JSON.stringify(entry.details), index, timestamp)),
    db.prepare(`INSERT INTO customer_access_tokens
      (id, reservation_id, token_hash, active, expires_at, created_at) VALUES (?, ?, ?, 1, ?, ?)`)
      .bind(crypto.randomUUID(), id, await tokenHash(portalToken), portalExpiresAt, timestamp),
    db.prepare(`INSERT INTO reservation_events (reservation_id, actor, event_type, detail_json, created_at)
      VALUES (?, 'customer', 'reservation_created', ?, ?)`)
      .bind(id, JSON.stringify({ catalogVersion: catalog.version, itemCount: normalizedItems.length }), timestamp),
    db.prepare(`INSERT INTO idempotency_keys (scope, key, response_json, status_code, created_at) VALUES (?, ?, ?, 201, ?)`)
      .bind('reservation-create', idempotencyKey, JSON.stringify(responseBody), timestamp),
  ];
  try {
    await db.batch(statements);
  } catch {
    const raced = await db.prepare('SELECT response_json, status_code FROM idempotency_keys WHERE scope = ? AND key = ?')
      .bind('reservation-create', idempotencyKey).first<{ response_json: string; status_code: number }>();
    if (raced) return json(JSON.parse(raced.response_json), raced.status_code);
    return json({ ok: false, error: 'This reservation could not be saved.' }, 500);
  }

  const tourLines = normalizedItems.map((entry) => `${entry.catalog.name} — ${entry.requestedDate} (${entry.adults} adults, ${entry.children} children)`).join('\n');
  const customerStatus = await emailReservation(env, id, email, `We received reservation ${reference}`, 'Your Belize trip request is in', `Thanks, ${name}. We received your request:\n\n${tourLines}\n\nOur team will review availability and email you when there is an update.`, portalUrl, 'customer_acknowledgement');
  await emailReservation(env, id, env.TO_EMAIL, `New reservation request ${reference}`, `New reservation from ${name}`, `${tourLines}\n\nParty: ${adults} adults, ${children} children\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}`, null, 'staff_new_reservation', email);
  await db.prepare('UPDATE idempotency_keys SET response_json = ? WHERE scope = ? AND key = ?')
    .bind(JSON.stringify({ ...responseBody, emailStatus: customerStatus }), 'reservation-create', idempotencyKey).run();
  return json({ ...responseBody, emailStatus: customerStatus }, 201);
}

async function reservationDetail(db: D1Database, id: string) {
  const reservation = await db.prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first<ReservationRow>();
  if (!reservation) return null;
  const [items, quote, events, deliveries] = await Promise.all([
    db.prepare('SELECT * FROM reservation_items WHERE reservation_id = ? ORDER BY sort_order').bind(id).all(),
    db.prepare('SELECT * FROM quote_versions WHERE reservation_id = ? ORDER BY version DESC LIMIT 1').bind(id).first<QuoteRow>(),
    db.prepare('SELECT actor, event_type, detail_json, created_at FROM reservation_events WHERE reservation_id = ? ORDER BY created_at DESC LIMIT 50').bind(id).all(),
    db.prepare('SELECT recipient, template_key, status, created_at FROM email_delivery_events WHERE reservation_id = ? ORDER BY created_at DESC LIMIT 20').bind(id).all(),
  ]);
  let quoteItems: unknown[] = [];
  let payment: unknown = null;
  if (quote) {
    const [quoteItemRows, paymentRow] = await Promise.all([
      db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order').bind(quote.id).all(),
      db.prepare('SELECT status, paid_at, expires_at, last_error_code FROM payment_intents WHERE quote_id = ? ORDER BY created_at DESC LIMIT 1').bind(quote.id).first(),
    ]);
    quoteItems = quoteItemRows.results;
    payment = paymentRow;
  }
  return { reservation: reservationDto(reservation), items: items.results, quote, quoteItems, payment, events: events.results, deliveries: deliveries.results };
}

async function portalDetails(env: ReservationEnv, token: string, json: Json): Promise<Response> {
  if (!TOKEN_RE.test(token)) return json({ ok: false, error: 'Reservation link not found.' }, 404);
  const db = database(env);
  const access = await db.prepare(`SELECT reservation_id, quote_id, expires_at FROM customer_access_tokens
    WHERE token_hash = ? AND active = 1`).bind(await tokenHash(token)).first<{ reservation_id: string; quote_id: string | null; expires_at: string }>();
  if (!access) return json({ ok: false, error: 'Reservation link not found.' }, 404);
  if (Date.parse(access.expires_at) <= Date.now()) return json({ ok: false, error: 'This reservation link has expired.' }, 410);
  const detail = await reservationDetail(db, access.reservation_id);
  if (!detail) return json({ ok: false, error: 'Reservation not found.' }, 404);
  const quote = access.quote_id
    ? await db.prepare('SELECT * FROM quote_versions WHERE id = ?').bind(access.quote_id).first<QuoteRow>()
    : null;
  const quoteItems = quote ? (await db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order').bind(quote.id).all()).results : [];
  const payment = quote ? await db.prepare('SELECT status, paid_at, expires_at, merchant_order_number AS receipt_reference FROM payment_intents WHERE quote_id = ? ORDER BY created_at DESC LIMIT 1').bind(quote.id).first<{ status: string; paid_at: string | null; expires_at: string; receipt_reference: string }>() : null;
  const paymentAvailable = detail.reservation.status === 'awaiting_payment'
    && paymentIsAvailable(quote?.status ?? null, payment?.status ?? null, payment?.expires_at ?? null);
  return json({ ok: true, reservation: detail.reservation, items: detail.items, quote, quoteItems, payment, paymentAvailable }, 200);
}

function parseQuote(body: Record<string, unknown>) {
  const submittedLines = Array.isArray(body.items) ? body.items : [];
  if (submittedLines.length < 1 || submittedLines.length > 30) throw new Error('A quote needs between 1 and 30 line items.');
  const items = submittedLines.map((candidate, index) => {
    const value = candidate as Record<string, unknown>;
    const label = text(value.label, 140);
    const quantity = Number(value.quantity);
    const unitPriceCents = Number(value.unitPriceCents);
    const serviceDate = text(value.serviceDate, 10);
    if (!label || !Number.isInteger(quantity) || quantity < 1 || quantity > 100 || !Number.isInteger(unitPriceCents) || unitPriceCents < 0 || unitPriceCents > 10_000_000 || (serviceDate && !DATE_RE.test(serviceDate))) {
      throw new Error(`Quote line ${index + 1} is invalid.`);
    }
    return {
      id: crypto.randomUUID(),
      reservationItemId: text(value.reservationItemId, 80) || null,
      catalogItemId: text(value.catalogItemId, 80) || null,
      label,
      serviceDate: serviceDate || null,
      quantity,
      unitPriceCents,
      lineTotalCents: quantity * unitPriceCents,
      notes: text(value.notes, 500) || null,
      sortOrder: index,
    };
  });
  const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  if ('discount' in body) throw new Error('Discount input is no longer supported. Edit quote-line quantities or prices instead.');
  return { items, subtotalCents, totalCents: subtotalCents, customerMessage: text(body.customerMessage, 2000) || null };
}

async function saveQuoteDraft(request: Request, env: ReservationEnv, staff: StaffIdentity, reservationId: string, json: Json) {
  const db = database(env);
  const reservation = await db.prepare('SELECT * FROM reservations WHERE id = ?').bind(reservationId).first<ReservationRow>();
  if (!reservation) return json({ ok: false, error: 'Reservation not found.' }, 404);
  const expectedVersion = Number(request.headers.get('If-Match'));
  if (!Number.isInteger(expectedVersion) || expectedVersion !== reservation.version) return json({ ok: false, error: 'This reservation changed. Reload before saving.' }, 409);
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
  let parsed;
  try { parsed = parseQuote(body); } catch (error) { return json({ ok: false, error: error instanceof Error ? error.message : 'Invalid quote.' }, 422); }
  const timestamp = nowIso();
  const existingDraft = await db.prepare("SELECT * FROM quote_versions WHERE reservation_id = ? AND status = 'draft' ORDER BY version DESC LIMIT 1")
    .bind(reservationId).first<QuoteRow>();
  const quoteId = existingDraft?.id ?? crypto.randomUUID();
  const quoteVersion = existingDraft?.version ?? ((await db.prepare('SELECT COALESCE(MAX(version), 0) AS max_version FROM quote_versions WHERE reservation_id = ?').bind(reservationId).first<{ max_version: number }>())?.max_version ?? 0) + 1;
  const statements = existingDraft
    ? [db.prepare(`UPDATE quote_versions SET customer_message = ?, subtotal_cents = ?, discount_cents = ?, total_cents = ?, updated_at = ?, created_by = ? WHERE id = ? AND status = 'draft'`)
        .bind(parsed.customerMessage, parsed.subtotalCents, 0, parsed.totalCents, timestamp, staff.email, quoteId)]
    : [db.prepare(`INSERT INTO quote_versions
        (id, reservation_id, version, status, customer_message, subtotal_cents, discount_cents, total_cents, created_by, created_at, updated_at)
       VALUES (?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)`)
        .bind(quoteId, reservationId, quoteVersion, parsed.customerMessage, parsed.subtotalCents, 0, parsed.totalCents, staff.email, timestamp, timestamp)];
  statements.push(
    db.prepare('DELETE FROM quote_items WHERE quote_id = ?').bind(quoteId),
    db.prepare('DELETE FROM discounts WHERE quote_id = ?').bind(quoteId),
    ...parsed.items.map((item) => db.prepare(`INSERT INTO quote_items
      (id, quote_id, reservation_item_id, catalog_item_id, label, service_date, quantity, unit_price_cents, line_total_cents, notes, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(item.id, quoteId, item.reservationItemId, item.catalogItemId, item.label, item.serviceDate, item.quantity, item.unitPriceCents, item.lineTotalCents, item.notes, item.sortOrder)),
    db.prepare('UPDATE reservations SET status = ?, customer_message = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?')
      .bind(reservation.status === 'new' ? 'reviewing' : reservation.status, parsed.customerMessage, timestamp, reservationId, expectedVersion),
    db.prepare('INSERT INTO reservation_events (reservation_id, actor, event_type, detail_json, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(reservationId, staff.email, 'quote_draft_saved', JSON.stringify({ quoteVersion, subtotalCents: parsed.subtotalCents }), timestamp),
  );
  await db.batch(statements);
  return json({ ok: true, detail: await reservationDetail(db, reservationId) }, 200);
}

async function rotatePortalToken(db: D1Database, reservationId: string, quoteId: string, timestamp: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + 180 * 86_400_000).toISOString();
  return {
    token,
    hash: await tokenHash(token),
    expiresAt,
    revoke: db.prepare('UPDATE customer_access_tokens SET active = 0, revoked_at = ? WHERE reservation_id = ? AND active = 1').bind(timestamp, reservationId),
    insert: db.prepare(`INSERT INTO customer_access_tokens
      (id, reservation_id, quote_id, token_hash, active, expires_at, created_at) VALUES (?, ?, ?, ?, 1, ?, ?)`)
      .bind(crypto.randomUUID(), reservationId, quoteId, await tokenHash(token), expiresAt, timestamp),
  };
}

async function sendQuote(request: Request, env: ReservationEnv, staff: StaffIdentity, reservationId: string, json: Json, payable: boolean) {
  const db = database(env);
  if (payable && env.PAYMENTS_ENABLED !== 'true') return json({ ok: false, error: 'Payments remain disabled until the production gateway is approved.' }, 503);
  const idempotencyKey = text(request.headers.get('Idempotency-Key'), 128);
  if (idempotencyKey.length < 8) return json({ ok: false, error: 'A valid Idempotency-Key header is required.' }, 400);
  const idempotencyScope = `quote-send:${reservationId}:${payable ? 'payment' : 'update'}`;
  const previous = await db.prepare('SELECT response_json, status_code FROM idempotency_keys WHERE scope = ? AND key = ?')
    .bind(idempotencyScope, idempotencyKey).first<{ response_json: string; status_code: number }>();
  if (previous) return json({ ...JSON.parse(previous.response_json), detail: await reservationDetail(db, reservationId) }, previous.status_code);
  const reservation = await db.prepare('SELECT * FROM reservations WHERE id = ?').bind(reservationId).first<ReservationRow>();
  const quote = await db.prepare("SELECT * FROM quote_versions WHERE reservation_id = ? AND status = 'draft' ORDER BY version DESC LIMIT 1")
    .bind(reservationId).first<QuoteRow>();
  if (!reservation || !quote) return json({ ok: false, error: 'Save a quote draft before sending.' }, 409);
  const expectedVersion = Number(request.headers.get('If-Match'));
  if (expectedVersion !== reservation.version) return json({ ok: false, error: 'This reservation changed. Reload before sending.' }, 409);
  let body: Record<string, unknown> = {};
  try { body = await request.json() as Record<string, unknown>; } catch { /* Empty bodies are valid. */ }
  const validForDays = Math.min(Math.max(Number(body.validForDays ?? 7) || 7, 1), 30);
  if (payable && quote.total_cents <= 0) return json({ ok: false, error: 'The finalized quote total must be greater than zero.' }, 422);
  if (payable) {
    const catalog = await publishedCatalog(env);
    const mainlandIds = new Set(catalog.items.filter((item) => item.category === 'Mainland').map((item) => item.id));
    const reservationItems = await db.prepare('SELECT catalog_item_id, requested_date FROM reservation_items WHERE reservation_id = ?').bind(reservationId).all<{ catalog_item_id: string; requested_date: string }>();
    const mainlandItems = reservationItems.results.filter((candidate) => mainlandIds.has(candidate.catalog_item_id));
    const servicesByDate = new Map<string, Set<string>>();
    mainlandItems.forEach((item) => servicesByDate.set(item.requested_date, (servicesByDate.get(item.requested_date) ?? new Set()).add(item.catalog_item_id)));
    const internalConflict = [...servicesByDate].find(([, serviceIds]) => serviceIds.size > 1);
    if (internalConflict) return json({ ok: false, error: `This reservation contains conflicting mainland tours on ${internalConflict[0]}. Move one tour to another date before sending for payment.` }, 409);
    for (const item of mainlandItems) {
      const conflict = await db.prepare(`SELECT ri.name_snapshot, r.reference FROM reservation_items ri
        JOIN reservations r ON r.id = ri.reservation_id
        WHERE ri.requested_date = ? AND ri.catalog_item_id <> ? AND ri.catalog_item_id IN (${[...mainlandIds].map(() => '?').join(',')})
          AND r.id <> ? AND r.status IN ('awaiting_payment', 'paid', 'completed') LIMIT 1`)
        .bind(item.requested_date, item.catalog_item_id, ...mainlandIds, reservationId).first<{ name_snapshot: string; reference: string }>();
      if (conflict) return json({ ok: false, error: `A different mainland tour is already committed on ${item.requested_date} (${conflict.reference}). Matching tours may be combined; conflicting tours cannot be sent for payment.` }, 409);
    }
  }
  const timestamp = nowIso();
  const portal = await rotatePortalToken(db, reservationId, quote.id, timestamp);
  const portalUrl = `${siteOrigin(env)}/reservation/${portal.token}`;
  const quoteExpiresAt = payable ? new Date(Date.now() + validForDays * 86_400_000).toISOString() : null;
  const statements = [
    portal.revoke,
    portal.insert,
    db.prepare("UPDATE quote_versions SET status = ?, expires_at = ?, sent_at = ?, updated_at = ? WHERE id = ? AND status = 'draft'")
      .bind(payable ? 'payable' : 'sent_update', quoteExpiresAt, timestamp, timestamp, quote.id),
    db.prepare("UPDATE quote_versions SET status = 'superseded', updated_at = ? WHERE reservation_id = ? AND id <> ? AND status IN ('payable', 'sent_update')")
      .bind(timestamp, reservationId, quote.id),
    db.prepare("UPDATE payment_intents SET status = 'superseded', updated_at = ? WHERE reservation_id = ? AND status NOT IN ('paid', 'refunded')")
      .bind(timestamp, reservationId),
    db.prepare('UPDATE reservations SET status = ?, current_quote_version = ?, customer_message = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?')
      .bind(payable ? 'awaiting_payment' : 'quoted', quote.version, quote.customer_message, timestamp, reservationId, expectedVersion),
    db.prepare('INSERT INTO reservation_events (reservation_id, actor, event_type, detail_json, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(reservationId, staff.email, payable ? 'quote_sent_for_payment' : 'customer_update_sent', JSON.stringify({ quoteVersion: quote.version, totalCents: quote.total_cents, validForDays }), timestamp),
    db.prepare('INSERT INTO idempotency_keys (scope, key, response_json, status_code, created_at) VALUES (?, ?, ?, 200, ?)')
      .bind(idempotencyScope, idempotencyKey, JSON.stringify({ ok: true, portalUrl, emailStatus: 'pending' }), timestamp),
  ];
  if (payable) {
    const paymentId = crypto.randomUUID();
    statements.push(
      db.prepare(`INSERT INTO payment_intents
        (id, token_hash, merchant_order_number, reservation_reference, customer_name, customer_email,
         description, amount_cents, currency, status, expires_at, created_at, updated_at, reservation_id, quote_id, quote_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'USD', 'created', ?, ?, ?, ?, ?, ?)`)
        .bind(paymentId, portal.hash, merchantOrderNumber(), reservation.reference, reservation.customer_name, reservation.customer_email, `Action Divers reservation ${reservation.reference}`, quote.total_cents, quoteExpiresAt, timestamp, timestamp, reservationId, quote.id, quote.version),
      db.prepare(`INSERT INTO payment_events (payment_intent_id, source, event_type, created_at) VALUES (?, 'staff', 'intent_created', ?)`)
        .bind(paymentId, timestamp),
    );
  }
  await db.batch(statements);
  const message = quote.customer_message || (payable ? 'Your reservation details and final amount are ready to review.' : 'There is an update to your reservation request.');
  const emailStatus = await emailReservation(
    env,
    reservationId,
    reservation.customer_email,
    payable ? `Reservation ${reservation.reference} is ready for payment` : `Update for reservation ${reservation.reference}`,
    payable ? 'Your reservation is ready' : 'Your reservation has an update',
    message,
    portalUrl,
    payable ? 'quote_ready' : 'reservation_update',
  );
  await db.prepare('UPDATE idempotency_keys SET response_json = ? WHERE scope = ? AND key = ?')
    .bind(JSON.stringify({ ok: true, portalUrl, emailStatus }), idempotencyScope, idempotencyKey).run();
  return json({ ok: true, portalUrl, emailStatus, detail: await reservationDetail(db, reservationId) }, 200);
}

async function updateReservation(request: Request, env: ReservationEnv, staff: StaffIdentity, id: string, json: Json) {
  const db = database(env);
  const current = await db.prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first<ReservationRow>();
  if (!current) return json({ ok: false, error: 'Reservation not found.' }, 404);
  const expectedVersion = Number(request.headers.get('If-Match'));
  if (expectedVersion !== current.version) return json({ ok: false, error: 'This reservation changed. Reload before saving.' }, 409);
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
  const customer = (body.customer ?? {}) as Record<string, unknown>;
  const name = text(customer.name ?? current.customer_name, 100);
  const email = text(customer.email ?? current.customer_email, 200).toLowerCase();
  const party = (body.party ?? {}) as Record<string, unknown>;
  const adults = Number(party.adults ?? current.adults);
  const children = Number(party.children ?? current.children);
  if (!name || !EMAIL_RE.test(email) || !Number.isInteger(adults) || adults < 1 || adults > 40 || !Number.isInteger(children) || children < 0 || children > 40) {
    return json({ ok: false, error: 'A valid customer name, email, and party size are required.' }, 422);
  }
  const submittedItems = Array.isArray(body.items) ? body.items : [];
  const requestedItems: Array<{ id: string; requestedDate: string; adults: number; children: number }> = [];
  for (const candidate of submittedItems) {
    const item = candidate as Record<string, unknown>;
    const itemId = text(item.id, 80);
    const requestedDate = text(item.requestedDate, 10);
    const itemAdults = Number(item.adults);
    const itemChildren = Number(item.children ?? 0);
    if (!itemId || !DATE_RE.test(requestedDate) || requestedDate < belizeDateAfter(7) || requestedDate > belizeDateAfter(730)) {
      return json({ ok: false, error: 'Requested dates must be at least seven days away and within the next two years.' }, 422);
    }
    if (!Number.isInteger(itemAdults) || !Number.isInteger(itemChildren) || itemAdults < 0 || itemChildren < 0 || itemAdults > adults || itemChildren > children || itemAdults + itemChildren < 1) {
      return json({ ok: false, error: 'Every tour needs at least one participant within the overall party size.' }, 422);
    }
    requestedItems.push({ id: itemId, requestedDate, adults: itemAdults, children: itemChildren });
  }
  if (requestedItems.length) {
    const stored = await db.prepare('SELECT id, catalog_item_id FROM reservation_items WHERE reservation_id = ?').bind(id).all<{ id: string; catalog_item_id: string }>();
    const allowedIds = new Set(stored.results.map((item) => item.id));
    if (requestedItems.some((item) => !allowedIds.has(item.id))) return json({ ok: false, error: 'A reservation item is invalid.' }, 422);
    const catalog = await publishedCatalog(env);
    const capacityByCatalogId = new Map(catalog.items.map((item) => [item.id, item.maxParticipants]));
    const catalogIdByItemId = new Map(stored.results.map((item) => [item.id, item.catalog_item_id]));
    const overCapacity = requestedItems.find((item) => {
      const capacity = capacityByCatalogId.get(catalogIdByItemId.get(item.id) ?? '');
      return capacity !== undefined && item.adults + item.children > capacity;
    });
    if (overCapacity) {
      const capacity = capacityByCatalogId.get(catalogIdByItemId.get(overCapacity.id) ?? '');
      return json({ ok: false, error: `This tour allows a maximum of ${capacity} guests.` }, 422);
    }
  }
  const timestamp = nowIso();
  await db.batch([
    db.prepare(`UPDATE reservations SET customer_name = ?, customer_email = ?, customer_phone = ?, adults = ?, children = ?, accommodation = ?, diving_experience = ?,
      customer_notes = ?, internal_notes = ?, customer_message = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?`)
      .bind(name, email, text(customer.phone ?? current.customer_phone, 40) || null, adults, children, text(body.accommodation ?? current.accommodation, 160) || null, text(body.divingExperience ?? current.diving_experience, 160) || null, text(body.customerNotes ?? current.customer_notes, 2000) || null, text(body.internalNotes ?? current.internal_notes, 4000) || null, text(body.customerMessage ?? current.customer_message, 2000) || null, timestamp, id, expectedVersion),
    ...requestedItems.map((item) => db.prepare('UPDATE reservation_items SET requested_date = ?, adults = ?, children = ? WHERE id = ? AND reservation_id = ?').bind(item.requestedDate, item.adults, item.children, item.id, id)),
    db.prepare('INSERT INTO reservation_events (reservation_id, actor, event_type, detail_json, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(id, staff.email, 'reservation_updated', JSON.stringify({ fromVersion: expectedVersion, requestedItemsChanged: requestedItems.length }), timestamp),
  ]);
  return json({ ok: true, detail: await reservationDetail(db, id) }, 200);
}

async function changeStatus(request: Request, env: ReservationEnv, staff: StaffIdentity, id: string, json: Json) {
  const db = database(env);
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
  const status = text(body.status, 40);
  const reason = text(body.reason, 500);
  if (!RESERVATION_STATUSES.has(status)) return json({ ok: false, error: 'Invalid reservation status.' }, 422);
  if (status === 'paid') return json({ ok: false, error: 'Paid status can only be confirmed by the bank callback.' }, 422);
  const current = await db.prepare('SELECT version, status FROM reservations WHERE id = ?').bind(id).first<{ version: number; status: string }>();
  if (!current) return json({ ok: false, error: 'Reservation not found.' }, 404);
  if (status === 'completed' && current.status !== 'paid') return json({ ok: false, error: 'Only a paid reservation can be completed.' }, 409);
  const expectedVersion = Number(request.headers.get('If-Match'));
  if (expectedVersion !== current.version) return json({ ok: false, error: 'This reservation changed. Reload before saving.' }, 409);
  const timestamp = nowIso();
  const statements = [
    db.prepare('UPDATE reservations SET status = ?, version = version + 1, updated_at = ?, completed_at = CASE WHEN ? = \'completed\' THEN ? ELSE completed_at END WHERE id = ? AND version = ?')
      .bind(status, timestamp, status, timestamp, id, expectedVersion),
    db.prepare('INSERT INTO reservation_events (reservation_id, actor, event_type, detail_json, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(id, staff.email, 'status_changed', JSON.stringify({ status, reason }), timestamp),
  ];
  if (!['awaiting_payment', 'paid', 'completed'].includes(status)) {
    statements.push(
      db.prepare("UPDATE quote_versions SET status = 'superseded', updated_at = ? WHERE reservation_id = ? AND status = 'payable'").bind(timestamp, id),
      db.prepare("UPDATE payment_intents SET status = 'superseded', updated_at = ? WHERE reservation_id = ? AND status NOT IN ('paid', 'refunded')").bind(timestamp, id),
    );
  }
  await db.batch(statements);
  return json({ ok: true, detail: await reservationDetail(db, id) }, 200);
}

async function adminCatalog(request: Request, env: ReservationEnv, staff: StaffIdentity, json: Json, action: string | null) {
  const db = database(env);
  if (request.method === 'GET' && !action) {
    const published = await publishedCatalog(env);
    const draftRow = await db.prepare("SELECT payload_json, version FROM catalog_revisions WHERE status = 'draft' LIMIT 1").first<{ payload_json: string; version: number }>();
    return json({ ok: true, published, draft: draftRow ? withDefaultBookingPolicies({ ...JSON.parse(draftRow.payload_json), version: draftRow.version }) : null }, 200);
  }
  if (request.method === 'PUT' && !action) {
    let body: unknown;
    try { body = await request.json(); } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
    if (!validCatalog(body)) return json({ ok: false, error: 'Catalog payload is invalid.' }, 422);
    const timestamp = nowIso();
    const existing = await db.prepare("SELECT id, version FROM catalog_revisions WHERE status = 'draft' LIMIT 1").first<{ id: string; version: number }>();
    if (existing) {
      await db.prepare('UPDATE catalog_revisions SET payload_json = ?, created_by = ?, created_at = ? WHERE id = ?')
        .bind(JSON.stringify(body), staff.email, timestamp, existing.id).run();
    } else {
      const max = await db.prepare('SELECT COALESCE(MAX(version), 0) AS max_version FROM catalog_revisions').first<{ max_version: number }>();
      await db.prepare("INSERT INTO catalog_revisions (id, version, status, payload_json, created_by, created_at) VALUES (?, ?, 'draft', ?, ?, ?)")
        .bind(crypto.randomUUID(), (max?.max_version ?? 0) + 1, JSON.stringify(body), staff.email, timestamp).run();
    }
    return json({ ok: true }, 200);
  }
  if (request.method === 'POST' && action === 'publish') {
    const draft = await db.prepare("SELECT id, version, payload_json FROM catalog_revisions WHERE status = 'draft' LIMIT 1").first<{ id: string; version: number; payload_json: string }>();
    if (!draft) return json({ ok: false, error: 'Save a catalog draft before publishing.' }, 409);
    const timestamp = nowIso();
    await db.batch([
      db.prepare("UPDATE catalog_revisions SET status = 'archived' WHERE status = 'published'"),
      db.prepare("UPDATE catalog_revisions SET status = 'published', published_at = ? WHERE id = ? AND status = 'draft'").bind(timestamp, draft.id),
    ]);
    return json({ ok: true, published: { ...JSON.parse(draft.payload_json), version: draft.version, publishedAt: timestamp } }, 200);
  }
  return json({ ok: false, error: 'Method not allowed.' }, 405);
}

const DEFAULT_TEMPLATES = [
  { id: 'quote-ready', name: 'Quote ready', subject: 'Your Action Divers reservation is ready', body: 'We have reviewed your requested tours and prepared the final details for your trip.' },
  { id: 'needs-contact', name: 'Needs a quick conversation', subject: 'A question about your Action Divers reservation', body: 'We need to confirm one detail before we can finalize your reservation. Please reply to this email.' },
  { id: 'unavailable', name: 'Requested option unavailable', subject: 'Update about your Action Divers request', body: 'The requested tour or date is not currently available. Please reply and we will help find another option.' },
];

async function ensureTemplates(db: D1Database) {
  const count = await db.prepare('SELECT COUNT(*) AS count FROM message_templates').first<{ count: number }>();
  if ((count?.count ?? 0) > 0) return;
  const timestamp = nowIso();
  await db.batch(DEFAULT_TEMPLATES.map((template) => db.prepare(`INSERT OR IGNORE INTO message_templates
    (id, name, subject, body, active, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 'system', ?, ?)`)
    .bind(template.id, template.name, template.subject, template.body, timestamp, timestamp)));
}

async function adminTemplates(request: Request, env: ReservationEnv, staff: StaffIdentity, json: Json, templateId?: string) {
  const db = database(env);
  await ensureTemplates(db);
  if (request.method === 'GET' && !templateId) {
    const rows = await db.prepare('SELECT * FROM message_templates ORDER BY name').all();
    return json({ ok: true, templates: rows.results }, 200);
  }
  if (request.method === 'DELETE' && templateId) {
    const result = await db.prepare('UPDATE message_templates SET active = 0, updated_at = ? WHERE id = ?')
      .bind(nowIso(), templateId).run();
    return result.meta.changes ? json({ ok: true }, 200) : json({ ok: false, error: 'Template not found.' }, 404);
  }
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
  const name = text(body.name, 80);
  const subject = text(body.subject, 160);
  const templateBody = text(body.body, 2000);
  if (!name || !subject || !templateBody) return json({ ok: false, error: 'Name, subject, and message are required.' }, 422);
  const timestamp = nowIso();
  if (request.method === 'POST' && !templateId) {
    await db.prepare(`INSERT INTO message_templates (id, name, subject, body, active, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?)`).bind(crypto.randomUUID(), name, subject, templateBody, staff.email, timestamp, timestamp).run();
  } else if (request.method === 'PUT' && templateId) {
    await db.prepare('UPDATE message_templates SET name = ?, subject = ?, body = ?, active = ?, updated_at = ? WHERE id = ?')
      .bind(name, subject, templateBody, body.active === false ? 0 : 1, timestamp, templateId).run();
  } else return json({ ok: false, error: 'Method not allowed.' }, 405);
  return json({ ok: true }, 200);
}

async function adminStaff(request: Request, env: ReservationEnv, staff: StaffIdentity, json: Json, memberEmail?: string) {
  if (staff.role !== 'owner') return json({ ok: false, error: 'Owner access is required.' }, 403);
  const db = database(env);
  if (request.method === 'GET' && !memberEmail) {
    const rows = await db.prepare('SELECT email, display_name, role, active, created_at, updated_at FROM staff_members ORDER BY email').all();
    return json({ ok: true, staff: rows.results }, 200);
  }
  if (request.method === 'POST' && !memberEmail) {
    let body: Record<string, unknown>;
    try { body = await request.json() as Record<string, unknown>; } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
    const email = text(body.email, 200).toLowerCase();
    const role = body.role === 'owner' ? 'owner' : 'staff';
    if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'A valid staff email is required.' }, 422);
    const timestamp = nowIso();
    await db.prepare(`INSERT INTO staff_members (email, display_name, role, active, created_by, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET display_name = excluded.display_name, role = excluded.role, active = 1, updated_at = excluded.updated_at`)
      .bind(email, text(body.displayName, 100) || null, role, staff.email, timestamp, timestamp).run();
    return json({ ok: true }, 200);
  }
  if (memberEmail && (request.method === 'PUT' || request.method === 'DELETE')) {
    const email = memberEmail.toLowerCase();
    const current = await db.prepare('SELECT email, role, active FROM staff_members WHERE email = ?').bind(email)
      .first<{ email: string; role: 'owner' | 'staff'; active: number }>();
    if (!current) return json({ ok: false, error: 'Staff member not found.' }, 404);
    if (request.method === 'DELETE') {
      if (email === staff.email) return json({ ok: false, error: 'You cannot remove your own access.' }, 409);
      if (current.role === 'owner' && current.active) {
        const owners = await db.prepare("SELECT COUNT(*) AS count FROM staff_members WHERE role = 'owner' AND active = 1").first<{ count: number }>();
        if ((owners?.count ?? 0) <= 1) return json({ ok: false, error: 'At least one active owner is required.' }, 409);
      }
      await db.prepare('UPDATE staff_members SET active = 0, updated_at = ? WHERE email = ?').bind(nowIso(), email).run();
      return json({ ok: true }, 200);
    }
    let body: Record<string, unknown>;
    try { body = await request.json() as Record<string, unknown>; } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
    const role = body.role === 'owner' ? 'owner' : 'staff';
    if (current.role === 'owner' && role !== 'owner' && current.active) {
      const owners = await db.prepare("SELECT COUNT(*) AS count FROM staff_members WHERE role = 'owner' AND active = 1").first<{ count: number }>();
      if ((owners?.count ?? 0) <= 1) return json({ ok: false, error: 'At least one active owner is required.' }, 409);
    }
    await db.prepare('UPDATE staff_members SET display_name = ?, role = ?, active = ?, updated_at = ? WHERE email = ?')
      .bind(text(body.displayName, 100) || null, role, body.active === false ? 0 : 1, nowIso(), email).run();
    return json({ ok: true }, 200);
  }
  return json({ ok: false, error: 'Method not allowed.' }, 405);
}

async function handleAdmin(request: Request, env: ReservationEnv, json: Json, pathname: string) {
  if (env.STAFF_PORTAL_ENABLED !== 'true') return json({ ok: false, error: 'Staff portal is not enabled.' }, 503);
  let staff: StaffIdentity;
  try { staff = await requireStaff(request, env); } catch (error) { return json({ ok: false, error: error instanceof Error ? error.message : 'Staff access denied.' }, staffErrorStatus(error)); }
  if (pathname === '/admin-api/session' && request.method === 'GET') return json({ ok: true, staff }, 200);
  if (pathname === '/admin-api/roster' && request.method === 'GET') {
    const db = database(env);
    const url = new URL(request.url);
    const date = text(url.searchParams.get('date'), 10);
    const tour = text(url.searchParams.get('tour'), 80);
    if (!DATE_RE.test(date) || !tour) return json({ ok: false, error: 'Choose a valid date and tour.' }, 422);
    const rows = await db.prepare(`SELECT ri.id AS reservation_item_id, ri.name_snapshot AS tour_name, ri.requested_date,
      ri.adults, ri.children, r.id AS reservation_id, r.reference, r.status, r.customer_name, r.customer_email,
      r.customer_phone, r.accommodation, r.diving_experience, r.customer_notes, r.internal_notes
      FROM reservation_items ri
      JOIN reservations r ON r.id = ri.reservation_id
      WHERE ri.requested_date = ? AND (ri.catalog_item_id = ? OR ri.tour_id = ?) AND r.status != 'cancelled'
      ORDER BY r.customer_name COLLATE NOCASE, r.reference`)
      .bind(date, tour, tour).all();
    const totals = rows.results.reduce<{ adults: number; children: number }>((total, row) => {
      const value = row as { adults?: number; children?: number };
      total.adults += Number(value.adults ?? 0);
      total.children += Number(value.children ?? 0);
      return total;
    }, { adults: 0, children: 0 });
    return json({ ok: true, roster: rows.results, totals: { ...totals, guests: totals.adults + totals.children, reservations: rows.results.length } }, 200);
  }
  if (pathname === '/admin-api/reservations' && request.method === 'GET') {
    const db = database(env);
    const url = new URL(request.url);
    const status = text(url.searchParams.get('status'), 40);
    const kind = text(url.searchParams.get('kind'), 20);
    const query = text(url.searchParams.get('q'), 100);
    const dateFrom = text(url.searchParams.get('dateFrom'), 10);
    const dateTo = text(url.searchParams.get('dateTo'), 10);
    const tour = text(url.searchParams.get('tour'), 80);
    const cursor = text(url.searchParams.get('cursor'), 180);
    if ((dateFrom && !DATE_RE.test(dateFrom)) || (dateTo && !DATE_RE.test(dateTo)) || (dateFrom && dateTo && dateFrom > dateTo)) {
      return json({ ok: false, error: 'The requested date range is invalid.' }, 422);
    }
    const conditions: string[] = [];
    const values: unknown[] = [];
    if (status && RESERVATION_STATUSES.has(status)) { conditions.push('status = ?'); values.push(status); }
    if (kind === 'tour' || kind === 'course' || kind === 'transfer') { conditions.push('request_kind = ?'); values.push(kind); }
    if (query) { conditions.push('(reference LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)'); const like = `%${query}%`; values.push(like, like, like); }
    const dateConditions = ['ri.reservation_id = reservations.id'];
    if (dateFrom && DATE_RE.test(dateFrom)) { dateConditions.push('ri.requested_date >= ?'); values.push(dateFrom); }
    if (dateTo && DATE_RE.test(dateTo)) { dateConditions.push('ri.requested_date <= ?'); values.push(dateTo); }
    if (dateConditions.length > 1) conditions.push(`EXISTS (SELECT 1 FROM reservation_items ri WHERE ${dateConditions.join(' AND ')})`);
    if (tour) { conditions.push('EXISTS (SELECT 1 FROM reservation_items ri WHERE ri.reservation_id = reservations.id AND (ri.catalog_item_id = ? OR ri.tour_id = ?))'); values.push(tour, tour); }
    const cursorParts = cursor.split('|');
    if (cursorParts.length === 2 && cursorParts[0] && cursorParts[1]) {
      conditions.push('(updated_at < ? OR (updated_at = ? AND id < ?))');
      values.push(cursorParts[0], cursorParts[0], cursorParts[1]);
    }
    const sql = `SELECT id, reference, status, request_kind, customer_name, customer_email, adults, children, estimated_total_cents, current_quote_version, version, created_at, updated_at FROM reservations ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY updated_at DESC, id DESC LIMIT 51`;
    const rows = await db.prepare(sql).bind(...values).all<ReservationSummaryRow>();
    const page = rows.results.slice(0, 50);
    const last = page[page.length - 1];
    return json({ ok: true, reservations: page, nextCursor: rows.results.length > 50 && last ? `${last.updated_at}|${last.id}` : null }, 200);
  }
  const reservationMatch = /^\/admin-api\/reservations\/([^/]+)(?:\/(quote-draft|send-update|send-for-payment|status))?$/.exec(pathname);
  if (reservationMatch) {
    const [, id, action] = reservationMatch;
    if (!action && request.method === 'GET') {
      const detail = await reservationDetail(database(env), id);
      return detail ? json({ ok: true, detail }, 200) : json({ ok: false, error: 'Reservation not found.' }, 404);
    }
    if (!action && request.method === 'PATCH') return updateReservation(request, env, staff, id, json);
    if (action === 'quote-draft' && request.method === 'PUT') return saveQuoteDraft(request, env, staff, id, json);
    if (action === 'send-update' && request.method === 'POST') return sendQuote(request, env, staff, id, json, false);
    if (action === 'send-for-payment' && request.method === 'POST') return sendQuote(request, env, staff, id, json, true);
    if (action === 'status' && request.method === 'POST') return changeStatus(request, env, staff, id, json);
  }
  const catalogMatch = /^\/admin-api\/catalog(?:\/(publish))?$/.exec(pathname);
  if (catalogMatch) return adminCatalog(request, env, staff, json, catalogMatch[1] ?? null);
  const templateMatch = /^\/admin-api\/templates(?:\/([^/]+))?$/.exec(pathname);
  if (templateMatch) return adminTemplates(request, env, staff, json, templateMatch[1]);
  const staffMatch = /^\/admin-api\/staff(?:\/([^/]+))?$/.exec(pathname);
  if (staffMatch) {
    let memberEmail: string | undefined;
    try { memberEmail = staffMatch[1] ? decodeURIComponent(staffMatch[1]) : undefined; } catch { return json({ ok: false, error: 'Invalid staff identifier.' }, 400); }
    return adminStaff(request, env, staff, json, memberEmail);
  }
  return json({ ok: false, error: 'Not found.' }, 404);
}

export async function handleReservationRoute(
  request: Request,
  env: ReservationEnv,
  json: Json,
  originAllowed: boolean,
): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (pathname.startsWith('/admin-api/')) {
    if (!originAllowed) return json({ ok: false, error: 'Forbidden.' }, 403);
    return handleAdmin(request, env, json, pathname);
  }
  if (pathname === '/catalog' && request.method === 'GET') return json({ ok: true, catalog: await publishedCatalog(env) }, 200);
  if (pathname === '/reservations') {
    if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
    if (!originAllowed) return json({ ok: false, error: 'Forbidden.' }, 403);
    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const { success } = await env.INQUIRY_LIMITER.limit({ key: `reservation:${clientIp}` });
    if (!success) return json({ ok: false, error: 'Too many reservation requests. Please wait a moment.' }, 429);
    return createReservation(request, env, json);
  }
  const portalMatch = /^\/portal\/([A-Za-z0-9_-]{43})(?:\/(payment\/start))?$/.exec(pathname);
  if (portalMatch) {
    if (!originAllowed) return json({ ok: false, error: 'Forbidden.' }, 403);
    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const { success } = await env.PAYMENT_LIMITER.limit({ key: `portal:${clientIp}` });
    if (!success) return json({ ok: false, error: 'Too many portal requests. Please wait a moment.' }, 429);
    if (!portalMatch[2] && request.method === 'GET') return portalDetails(env, portalMatch[1], json);
    if (portalMatch[2] === 'payment/start' && request.method === 'POST') return startPaymentForPortal(request, env, json, portalMatch[1]);
    return json({ ok: false, error: 'Method not allowed.' }, 405);
  }
  return null;
}
