# Tour Inquiry Worker (Resend)

A standalone Cloudflare Worker that emails reservation-form submissions **from your own
domain** with no third-party branding. It does not touch the main site deploy.

## One-time setup

### 1. Resend account + domain
1. Create a free account at https://resend.com.
2. **Add and verify the domain `actiondiversbelize.com`** (Resend → Domains → Add Domain).
   Add the SPF/DKIM (and optional DMARC) DNS records Resend gives you to your domain's DNS.
   Until the domain shows **Verified**, you can only send from `onboarding@resend.dev`
   to your own account email — fine for a first test, but not for production.
3. Create an **API key** (Resend → API Keys). Copy it.

### 2. Deploy the Worker
From this `worker-inquiry/` folder:

```bash
npm install
npx wrangler login            # one-time, opens browser
npx wrangler secret put RESEND_API_KEY   # paste the Resend API key when prompted
npx wrangler deploy
```

Deploy prints the Worker URL, e.g. `https://actiondivers-inquiry.<your-subdomain>.workers.dev`.

### 3. Point the website at it
Copy that Worker URL into the main app's `config.ts`:

```ts
inquiryEndpoint: 'https://actiondivers-inquiry.<your-subdomain>.workers.dev',
```

That's it — the reservations form now sends through your domain.

## Config (wrangler.toml `[vars]`)
- `TO_EMAIL` — where inquiries land. Use a test inbox while testing, then switch to live.
- `FROM_EMAIL` — verified sender, e.g. `Action Divers & Adventures <reservations@actiondiversbelize.com>`.
- `ALLOWED_ORIGINS` — comma-separated site origins allowed to POST (no trailing slash).
  Requests with any other `Origin` are rejected with 403, so this is a real access
  control, not just a CORS header.

Rate limiting lives in `[[ratelimits]]`: 5 inquiries per client IP per 60 seconds
(`period` must be 10 or 60). Requires wrangler 4 — wrangler 3 silently ignores the
block and leaves `env.RATE_LIMITER` undefined.

After changing vars, re-run `npx wrangler deploy`. The `RESEND_API_KEY` secret persists.

## Test
The `Origin` header is required — it must match one of `ALLOWED_ORIGINS`.

```bash
curl -X POST https://actiondivers-inquiry.<your-subdomain>.workers.dev -H "Content-Type: application/json" -H "Origin: https://actiondivers2.davebze.workers.dev" -d '{"name":"Jane Diver","email":"you@example.com","preferredDate":"2026-08-14","adults":2,"children":1,"accommodation":"Ramons Village","divingExperience":"Open Water certified","tours":"Two Tank Dive ($144.38 USD)","estimatedTotal":"$144.38 USD","notes":"Testing"}'
```

Expect `{"ok":true}` and an email at `TO_EMAIL` listing every field above. A 6th call
within the same minute should return 429.

## Notes
- The API key lives only as a Worker secret — never in the website bundle.
- A hidden `company` honeypot field is dropped silently (basic bot defense). Add Cloudflare
  Turnstile later if spam becomes an issue.
