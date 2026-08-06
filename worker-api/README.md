# Site API Worker

A standalone Cloudflare Worker backing the website. It does not touch the main site deploy.

| Route | Does |
| --- | --- |
| `POST /inquiry` | Emails reservation-form submissions **from your own domain** via Resend, no third-party branding. Also served at `/` for the original single-route shape. |
| `POST /assistant` | Proxies Tour Assistant chat to Google Gemini. |
| `GET /catalog` | Returns the currently published server-side booking catalog. |
| `POST /reservations` | Creates an idempotent reservation request and private customer portal link. |
| `GET /portal/:token` | Returns one reservation through a hashed, expiring magic-link token. |
| `POST /portal/:token/payment/start` | Starts payment only for the current finalized, payable quote. |
| `/admin-api/*` | Cloudflare Access-authenticated reservation, quote, catalog, template, and staff operations. |
| `GET /payments/:token` | Returns the safe guest-facing reservation payment summary. |
| `POST /payments/:token/start` | Registers the confirmed amount and returns Belize Bank's hosted payment URL. |
| `POST /payments/:token/refresh` | Verifies the current order status directly with Belize Bank. |
| `POST /payments/callback` | Receives bank events, then independently verifies status before updating D1. |

`POST /payments/admin/intents` is intentionally retired. Payment intents are now created only
when authenticated staff finalizes a versioned reservation quote.

Both API keys live only as Worker secrets. **The Gemini key must never go back into the
site bundle** — anything shipped to the browser is readable by anyone, and a leaked key is
billable to you.

## One-time setup

### 1. Resend account + domain
1. Create a free account at https://resend.com.
2. **Add and verify the domain `actiondiversbelize.com`** (Resend → Domains → Add Domain).
   Add the SPF/DKIM (and optional DMARC) DNS records Resend gives you to your domain's DNS.
   Until the domain shows **Verified**, you can only send from `onboarding@resend.dev`
   to your own account email — fine for a first test, but not for production.
3. Create an **API key** (Resend → API Keys). Copy it.

### 2. Gemini API key
Create a key at https://aistudio.google.com/apikey. If you previously had this key in
`.env.local`, **rotate it** — older builds shipped it to the browser, so treat the old
value as public.

### 3. Deploy the Worker
From this `worker-api/` folder:

```bash
npm install
npx wrangler login            # one-time, opens browser
npx wrangler secret put RESEND_API_KEY    # paste the Resend key when prompted
npx wrangler secret put GEMINI_API_KEY    # paste the Gemini key when prompted
npx wrangler deploy --config wrangler.toml
```

Deploy prints the Worker URL, e.g. `https://actiondivers-api.<your-subdomain>.workers.dev`.

### 4. Point the website at it
Copy that Worker URL into the main app's `config.ts` (no trailing slash):

```ts
const API_BASE_URL = 'https://actiondivers-api.<your-subdomain>.workers.dev';
```

Until this is set, the reservations form falls back to WhatsApp/phone and the Tour
Assistant returns its offline message.

## Config (wrangler.toml `[vars]`)
- `TO_EMAIL` — where inquiries land. Use a test inbox while testing, then switch to live.
- `FROM_EMAIL` — verified sender, e.g. `Action Divers & Adventures <info@actiondiversbelize.com>`.
  Use a mailbox that actually exists, so bounce notifications land somewhere.
- `ALLOWED_ORIGINS` — comma-separated site origins allowed to POST (no trailing slash).
  Requests with any other `Origin` are rejected with 403, so this is a real access
  control, not just a CORS header. **Add your production origin here** or the live site
  will get 403s.

Rate limits are per client IP, in `[[ratelimits]]` (`period` must be 10 or 60, and each
block needs its own `namespace_id`):

- `INQUIRY_LIMITER` — 5/60s. Plenty for a human filling out a form.
- `ASSISTANT_LIMITER` — 12/60s. Every call bills against your Gemini quota.

Requires **wrangler 4**. Wrangler 3 silently ignores `[[ratelimits]]` and leaves the
bindings undefined, which throws on every request.

`/assistant` also caps input at 2000 characters so one huge prompt can't run up the bill.

`GET /health` provides a non-secret availability check for monitoring the API Worker.

After changing vars, re-run `npm run deploy`. Secrets persist across deploys.

## Belize Bank payments

Payments use Belize Bank's hosted payment page and standard authorization endpoint. The site
never receives or stores card numbers or security codes. Staff confirms availability and the
full USD amount first, then creates a private payment link.

Before enabling payment routes:

1. Confirm with Belize Bank that the merchant profile settles the API's amount as **USD**.
2. Confirm the existing production and preview D1 bindings in `wrangler.toml`, then verify
   that every migration has been applied:

```bash
npx wrangler d1 migrations list PAYMENTS_DB --remote --preview --config wrangler.toml
npx wrangler d1 migrations list PAYMENTS_DB --remote --config wrangler.toml
```

3. Set payment secrets through Wrangler's hidden prompts:

```bash
npx wrangler secret put BELIZE_BANK_USERNAME
npx wrangler secret put BELIZE_BANK_PASSWORD
```

4. Keep `PAYMENT_ENVIRONMENT = "sandbox"` until the bank accepts the complete sandbox test
   evidence. Production is enabled only by changing it to `production` and deploying with the
   separately supplied production credentials.

Refunds and reversals remain manual in the first release so there is no public or
browser-accessible refund endpoint.

## Reservation and staff portal launch

1. Use the separate preview and production D1 databases already bound as `PAYMENTS_DB` for
   reservations, quotes, catalog revisions, audit events, and payment intents.
2. Apply new migrations to preview first, then production:

```bash
npx wrangler d1 migrations apply PAYMENTS_DB --remote --preview --config wrangler.toml
npx wrangler d1 migrations apply PAYMENTS_DB --remote --config wrangler.toml
```

3. In Cloudflare Zero Trust, create Access applications for the website `/admin*` path and
   API Worker `/admin-api/*` path. Allow only approved staff emails using email one-time PIN.
4. Set `ACCESS_TEAM_DOMAIN` to the team domain, `ACCESS_AUD` to the API Access application
   audience tag, and `OWNER_EMAILS` to the initial approved owner email(s). The Worker validates
   JWT signature, issuer, audience, time claims, email, and active staff membership itself.
5. Build the frontend with `VITE_STAFF_PORTAL_ENABLED=true` only after both Access applications
   are active. No staff identity or credentials are embedded by this flag.
6. Enable in stages: `RESERVATIONS_V2_ENABLED=true`, then `STAFF_PORTAL_ENABLED=true`.
   Keep `PAYMENTS_ENABLED=false` until prices, policies, staff, retention, email delivery, and
   the full Belize Bank sandbox flow are approved. Production payment credentials are a final,
   separate launch step.

The customer cart uses versioned local browser storage, but submitted prices are ignored;
the Worker resolves the active catalog and stores all money as integer USD cents.

## Local development
`wrangler dev` reads secrets from a `.dev.vars` file in this folder (gitignored):

```
GEMINI_API_KEY=your-key
RESEND_API_KEY=your-key
BELIZE_BANK_USERNAME=your-sandbox-username
BELIZE_BANK_PASSWORD=your-sandbox-password
```

For local payment API work, create the D1 binding first and apply the migration locally with
`npx wrangler d1 migrations apply actiondivers-payments --local --config wrangler.toml`.
Do not commit `.dev.vars`.

```bash
npx wrangler dev --local --config wrangler.toml
```

## Test
The `Origin` header is required — it must match one of `ALLOWED_ORIGINS`.

Inquiry:

```bash
curl -X POST https://actiondivers-api.<your-subdomain>.workers.dev/inquiry -H "Content-Type: application/json" -H "Origin: https://actiondivers2.davebze.workers.dev" -d '{"name":"Jane Diver","email":"you@example.com","preferredDate":"2026-08-14","adults":2,"children":1,"accommodation":"Ramons Village","divingExperience":"Open Water certified","tours":"Two Tank Dive ($144.38 USD)","estimatedTotal":"$144.38 USD","notes":"Testing"}'
```

Expect `{"ok":true}` and an email at `TO_EMAIL` listing every field above. A 6th call
within the same minute should return 429.

Assistant:

```bash
curl -X POST https://actiondivers-api.<your-subdomain>.workers.dev/assistant -H "Content-Type: application/json" -H "Origin: https://actiondivers2.davebze.workers.dev" -d '{"message":"How much is the ATM Caves tour?"}'
```

Expect `{"ok":true,"text":"..."}`.

## Notes
- API keys live only as Worker secrets — never in the website bundle.
- The Tour Assistant system prompt is in `src/systemInstruction.ts`, so pricing and tone
  can be corrected with a Worker deploy. Keep its pricing in sync with `constants.tsx`.
- A hidden `company` honeypot field is dropped silently (basic bot defense). Add Cloudflare
  Turnstile later if spam becomes an issue.
