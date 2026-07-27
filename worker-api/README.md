# Site API Worker

A standalone Cloudflare Worker backing the website. It does not touch the main site deploy.

| Route | Does |
| --- | --- |
| `POST /inquiry` | Emails reservation-form submissions **from your own domain** via Resend, no third-party branding. Also served at `/` for the original single-route shape. |
| `POST /assistant` | Proxies Tour Assistant chat to Google Gemini. |

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
npx wrangler deploy
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
- `FROM_EMAIL` — verified sender, e.g. `Action Divers & Adventures <reservations@actiondiversbelize.com>`.
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

After changing vars, re-run `npx wrangler deploy`. Secrets persist across deploys.

## Local development
`wrangler dev` reads secrets from a `.dev.vars` file in this folder (gitignored):

```
GEMINI_API_KEY=your-key
RESEND_API_KEY=your-key
```

```bash
npx wrangler dev --local
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
