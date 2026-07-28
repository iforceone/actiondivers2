/**
 * Action Divers & Adventures — Site API Worker
 *
 * Standalone Cloudflare Worker backing the website. Two routes:
 *   POST /inquiry   — emails reservation-form submissions from our own domain via Resend
 *   POST /assistant — proxies Tour Assistant chat to Gemini
 *
 * Both API keys live only as Worker secrets. In particular the Gemini key must
 * never be bundled into the site: anything shipped to the browser is public, and
 * a leaked key is billable to us.
 *
 * Secrets / vars (see wrangler.toml + `wrangler secret put`):
 *   RESEND_API_KEY    (secret)  — Resend API key
 *   GEMINI_API_KEY    (secret)  — Google Gemini API key
 *   TO_EMAIL          (var)     — where inquiries are delivered
 *   FROM_EMAIL        (var)     — verified sender, e.g. "Action Divers <info@actiondiversbelize.com>"
 *   ALLOWED_ORIGINS   (var)     — comma-separated site origins allowed to POST
 *   INQUIRY_LIMITER   (binding) — rate limit for /inquiry, keyed by client IP
 *   ASSISTANT_LIMITER (binding) — rate limit for /assistant, keyed by client IP
 */

import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './systemInstruction';
import { handlePaymentRoute } from './payments';
import { handleReservationRoute, ReservationEnv } from './reservations';

export interface Env extends ReservationEnv {
  RESEND_API_KEY: string;
  GEMINI_API_KEY: string;
  TO_EMAIL: string;
  FROM_EMAIL: string;
  ALLOWED_ORIGINS: string;
  INQUIRY_LIMITER: RateLimit;
  ASSISTANT_LIMITER: RateLimit;
}

const ASSISTANT_MODEL = 'gemini-3-flash-preview';
const MAX_MESSAGE_CHARS = 2000;

interface InquiryPayload {
  name?: string;
  email?: string;
  notes?: string;
  tours?: string;
  estimatedTotal?: string;
  preferredDate?: string;
  adults?: number | string;
  children?: number | string;
  accommodation?: string;
  divingExperience?: string;
  // Honeypot — must be empty for a real human.
  company?: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );

function corsHeaders(origin: string, allowed: string[]): Record<string, string> {
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] ?? '';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key, If-Match',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

/** "2 adults, 1 child" — empty string when no party size was supplied. */
function formatParty(p: InquiryPayload): string {
  const adults = Number(p.adults ?? 0);
  const children = Number(p.children ?? 0);
  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} adult${adults === 1 ? '' : 's'}`);
  if (children > 0) parts.push(`${children} child${children === 1 ? '' : 'ren'}`);
  return parts.join(', ');
}

function renderHtml(p: Required<Pick<InquiryPayload, 'name' | 'email'>> & InquiryPayload): string {
  const row = (label: string, value: string) =>
    value
      ? `<tr>
           <td style="padding:6px 0;color:#5b6b73;font:600 11px/1.4 Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em;width:140px;vertical-align:top">${label}</td>
           <td style="padding:6px 0;color:#0b1f27;font:400 15px/1.5 Arial,sans-serif">${value}</td>
         </tr>`
      : '';
  return `<!doctype html><html><body style="margin:0;background:#f3f5f6;padding:24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6eaec">
      <tr><td style="background:#001219;padding:22px 28px">
        <div style="color:#F8F4E8;font:700 18px/1.2 Arial,sans-serif">Action Divers &amp; Adventures</div>
        <div style="color:#11C7D9;font:600 12px/1.4 Arial,sans-serif;text-transform:uppercase;letter-spacing:.18em;margin-top:4px">New Tour Inquiry</div>
      </td></tr>
      <tr><td style="padding:24px 28px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row('Name', escapeHtml(p.name))}
          ${row('Email', `<a href="mailto:${escapeHtml(p.email)}" style="color:#008BA3">${escapeHtml(p.email)}</a>`)}
          ${row('Preferred date', p.preferredDate ? escapeHtml(String(p.preferredDate)) : '')}
          ${row('Party', escapeHtml(formatParty(p)))}
          ${row('Accommodation', p.accommodation ? escapeHtml(p.accommodation) : '')}
          ${row('Diving experience', p.divingExperience ? escapeHtml(p.divingExperience) : '')}
          ${row('Tours', p.tours ? escapeHtml(p.tours).replace(/, /g, '<br>') : '')}
          ${row('Est. total', p.estimatedTotal ? escapeHtml(p.estimatedTotal) : '')}
          ${row('Notes', p.notes ? escapeHtml(p.notes).replace(/\n/g, '<br>') : '')}
        </table>
      </td></tr>
      <tr><td style="padding:14px 28px;border-top:1px solid #eef1f2;color:#94a3ab;font:400 12px/1.5 Arial,sans-serif">
        Reply directly to this email to respond to the guest.
      </td></tr>
    </table>
  </body></html>`;
}

function renderText(p: InquiryPayload): string {
  return [
    'New Tour Inquiry — Action Divers & Adventures',
    '',
    `Name: ${p.name ?? ''}`,
    `Email: ${p.email ?? ''}`,
    p.preferredDate ? `Preferred date: ${p.preferredDate}` : '',
    formatParty(p) ? `Party: ${formatParty(p)}` : '',
    p.accommodation ? `Accommodation: ${p.accommodation}` : '',
    p.divingExperience ? `Diving experience: ${p.divingExperience}` : '',
    p.tours ? `Tours: ${p.tours}` : '',
    p.estimatedTotal ? `Estimated total: ${p.estimatedTotal}` : '',
    p.notes ? `Notes: ${p.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

type Json = (body: unknown, status: number) => Response;

async function handleInquiry(request: Request, env: Env, json: Json): Promise<Response> {
    // Rate limit per client IP so a single source can't flood the inbox.
    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const { success } = await env.INQUIRY_LIMITER.limit({ key: clientIp });
    if (!success) {
      return json({ ok: false, error: 'Too many inquiries. Please try WhatsApp or phone.' }, 429);
    }

    let data: InquiryPayload;
    try {
      data = (await request.json()) as InquiryPayload;
    } catch {
      return json({ ok: false, error: 'Invalid request.' }, 400);
    }

    // Honeypot: bots fill this; silently accept and drop so they get no signal.
    if (data.company) return json({ ok: true }, 200);

    const name = (data.name ?? '').toString().trim();
    const email = (data.email ?? '').toString().trim();
    if (!name || !EMAIL_RE.test(email)) {
      return json({ ok: false, error: 'Please provide a valid name and email.' }, 422);
    }

    const payload = {
      name,
      email,
      notes: (data.notes ?? '').toString().trim(),
      tours: (data.tours ?? '').toString().trim(),
      estimatedTotal: (data.estimatedTotal ?? '').toString().trim(),
      preferredDate: (data.preferredDate ?? '').toString().trim(),
      adults: Number(data.adults ?? 0) || 0,
      children: Number(data.children ?? 0) || 0,
      accommodation: (data.accommodation ?? '').toString().trim(),
      divingExperience: (data.divingExperience ?? '').toString().trim(),
    };

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [env.TO_EMAIL],
        reply_to: email,
        subject: `New Belize tour inquiry from ${name}`,
        html: renderHtml(payload),
        text: renderText(payload),
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text().catch(() => '');
      console.error('Resend send failed', resendRes.status, detail);
      return json({ ok: false, error: 'Could not send your inquiry. Please try WhatsApp or phone.' }, 502);
    }

    return json({ ok: true }, 200);
}

async function handleAssistant(request: Request, env: Env, json: Json): Promise<Response> {
  // The LLM call costs money per request, so this is limited harder than the form.
  const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const { success } = await env.ASSISTANT_LIMITER.limit({ key: clientIp });
  if (!success) {
    return json({ ok: false, error: 'Too many questions at once. Please wait a moment.' }, 429);
  }

  let body: { message?: unknown };
  try {
    body = (await request.json()) as { message?: unknown };
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return json({ ok: false, error: 'Please include a message.' }, 422);
  // Cap input length so a huge prompt can't run up the bill on one request.
  if (message.length > MAX_MESSAGE_CHARS) {
    return json({ ok: false, error: 'That message is too long. Please shorten it.' }, 413);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: ASSISTANT_MODEL,
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });
    return json({ ok: true, text: response.text ?? '' }, 200);
  } catch (error) {
    console.error('Gemini call failed', error);
    return json({ ok: false, error: 'Assistant unavailable.' }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = (env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const cors = corsHeaders(origin, allowed);
    const json: Json = (body, status) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
      });

    const { pathname } = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const reservationResponse = await handleReservationRoute(request, env, json, allowed.includes(origin));
    if (reservationResponse) return reservationResponse;

    const paymentResponse = await handlePaymentRoute(request, env, json, allowed.includes(origin));
    if (paymentResponse) return paymentResponse;

    if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

    // CORS headers only constrain browsers. Enforce the allowlist server-side so
    // curl/scripts can't use this Worker as an open relay to send mail from our
    // domain or burn through our Gemini quota.
    if (!allowed.includes(origin)) {
      return json({ ok: false, error: 'Forbidden' }, 403);
    }

    switch (pathname) {
      // '/' kept for the original single-purpose deploy shape.
      case '/':
      case '/inquiry':
        return handleInquiry(request, env, json);
      case '/assistant':
        return handleAssistant(request, env, json);
      default:
        return json({ ok: false, error: 'Not found' }, 404);
    }
  },
};
