# Action Divers & Adventures — Belize Tours

Marketing and reservations site for a San Pedro, Ambergris Caye dive shop and tour
operator. React + Vite + Tailwind, deployed on Cloudflare Workers, with a separate
Worker holding the API keys.

**Live:** https://actiondivers2.davebze.workers.dev (still a `workers.dev` URL — see
[Moving to a real domain](#moving-to-a-real-domain))

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

That's it. **Do not put a Gemini API key in `.env.local`** — the site no longer reads
one, and adding one back would ship it to every visitor (see [Why there are two
projects](#why-there-are-two-projects)). An older version of this README told you to do
exactly that; it was wrong, and the key it referred to has been rotated.

In local dev the Tour Assistant and reservations form call the deployed Worker, which
allows `http://localhost:3000` as an origin. They work locally without extra setup.

```bash
npm run build        # production build into dist/
npm run preview      # serve the built output
npx tsc --noEmit     # typecheck (vite build does NOT typecheck)
```

`npm run build` will happily build code with type errors. Run `tsc --noEmit` before
pushing — that is what CI-equivalent checking looks like here.

---

## Why there are two projects

```
/            → the React site   → Worker "actiondivers2"     (auto-deploys from main)
/worker-api  → the API backend  → Worker "actiondivers-api"  (deploy manually)
```

The site is static and public. Anything it contains — including anything injected at
build time via Vite `define` — is readable by any visitor in DevTools. So the Gemini and
Resend keys live only in `worker-api`, as Cloudflare Worker secrets, and the browser
talks to that Worker instead of to Google or Resend directly.

`worker-api` serves two routes, both behind an origin allowlist and per-IP rate limits:

| Route | Purpose | Rate limit |
| --- | --- | --- |
| `POST /inquiry` (also `/`) | Emails reservation-form submissions via Resend | 5 / 60s |
| `POST /assistant` | Proxies Tour Assistant chat to Google Gemini | 12 / 60s |

`config.ts` in the site root holds the Worker URL, contact details, and review counts.
It is the single source of truth for those — prefer importing `CONTACT` over retyping a
phone number or address.

See [worker-api/README.md](worker-api/README.md) for the Worker's own setup, secrets,
and test commands.

---

## Accounts and services

Five separate accounts are involved. This trips people up, so it's worth reading before
touching infrastructure.

| Service | Account | What it does |
| --- | --- | --- |
| Cloudflare | **Davebze@gmail.com** (`9afab2d5eabc5a0cee88b9ecc5d2e795`) | Hosts both Workers |
| GitHub | `iforceone/actiondivers2` | Source; pushes to `main` auto-deploy the site |
| Resend | dpollard@iforcemarketing.com | Sends inquiry emails |
| SiteGround | — | **DNS** for `actiondiversbelize.com` (not Cloudflare) |
| Google Workspace | — | Mailbox `info@actiondiversbelize.com` receives inquiries |

### ⚠️ The `CLOUDFLARE_API_TOKEN` trap

The development machine has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` set
globally, pointing at a **different client's Cloudflare account**. That env var silently
takes priority over `wrangler login`. It has already caused one misdeploy: the API Worker
was created in the wrong account with both production API keys attached.

Before any `wrangler` command that writes:

```bash
npx wrangler whoami       # must say davebze@gmail.com
```

If it names any other account, clear the variables for that shell session.

```powershell
Remove-Item Env:CLOUDFLARE_API_TOKEN; Remove-Item Env:CLOUDFLARE_ACCOUNT_ID
```

```bash
unset CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
```

`wrangler login` refuses to run at all while the token is set. Note that both accounts
now contain Workers, so a wrong-account `wrangler delete` is destructive — delete Workers
through the dashboard, where the account is visible.

---

## Deploying

**The site deploys itself.** Push to `main` and Cloudflare Workers Builds runs
`npm run build` then `npx wrangler deploy`. Takes about 90 seconds. Watch it under
Workers & Pages → `actiondivers2` → Deployments.

**The Worker does not.** It has no Git integration. After changing anything in
`worker-api/`:

```bash
cd worker-api
npx wrangler whoami        # confirm davebze@gmail.com first
npx wrangler deploy
```

Deploys take a few seconds to propagate. If you deploy and immediately test, you may hit
the previous version — this happened during setup and looked like a config bug. Wait a
few seconds and retest before investigating.

---

## Moving to a real domain

The `workers.dev` URL is hardcoded in **seven** places. Miss the first one and both the
chatbot and the reservations form return `403` on the new domain with no visible cause.

1. **`worker-api/wrangler.toml`** → `ALLOWED_ORIGINS` — add the new origin (comma
   separated, no trailing slash), then **`npx wrangler deploy`**. The Worker rejects any
   other `Origin` with 403 server-side; this is real access control, not just a CORS
   header, so it will not "just work" until you do this.
2. **`components/SEO.tsx`** → `SITE_URL` — drives canonical URLs and JSON-LD across all
   pages.
3. **`index.html`** → four values: `og:url`, `og:image`, `twitter:image`, and
   `<link rel="canonical">`, plus the `"url"` field in the JSON-LD block.

Keep `http://localhost:3000` in `ALLOWED_ORIGINS` or local dev breaks.

---

## Gotchas

**`index.html` has a second copy of the structured data.** There is JSON-LD in
`index.html` *and* JSON-LD generated in `App.tsx`. The static one can't read `config.ts`,
so contact details must be updated in both places. This is deliberate — it keeps
structured data available to crawlers that don't execute JavaScript — but it is easy to
update one and forget the other.

**`vite build` does not typecheck.** Real type errors have shipped green builds here.
Run `npx tsc --noEmit`.

**The root `tsconfig.json` excludes `worker-api/`.** The Worker has its own tsconfig with
Cloudflare types instead of DOM types. Typecheck it from inside `worker-api/`.

**Rate limiting needs wrangler 4.** Wrangler 3 silently ignores the `[[ratelimits]]`
blocks and leaves the bindings `undefined`, which throws on every request. Don't
downgrade.

**Email addresses must be real mailboxes.** `reservations@actiondiversbelize.com` was
published across the site for months and bounces — it was never created. MX records prove
a *domain* accepts mail, not that an address exists. Everything now uses
`info@actiondiversbelize.com`. If you ever switch back, first remove the old address from
Resend's suppression list (Emails → Suppression list) or sends fail silently.

**Resend's `{"ok":true}` means "accepted", not "delivered."** Always confirm in the Resend
dashboard. The first test inquiry returned `ok:true` and bounced.

**Sending is verified via the `send.` subdomain.** DKIM sits at `resend._domainkey`, with
SPF and MX on `send.actiondiversbelize.com`, so the root SPF and Google Workspace MX
records are untouched. Do not enable "Receiving" in Resend — it adds a root `MX` at
priority 0 that would hijack all inbound mail away from Google Workspace.

---

## Repo map

```
App.tsx                    routing, footer, reservations page/form
config.ts                  contact details, Worker URL, review counts
constants.tsx              tour data and pricing
types.ts                   shared types
components/
  AssistantLauncher.tsx    floating dock: WhatsApp + assistant buttons
  TourAssistant.tsx        chat modal + open state
  SEO.tsx                  per-page meta tags, SITE_URL
services/geminiService.ts  calls worker-api /assistant (no SDK, no key)
worker-api/                the API Worker — see its own README
PROJECT_TODO.md            business backlog (payments, transfers, content)
```

---

## Known open items

Technical, roughly by priority:

- **Mobile UX on the launcher dock.** The button tooltips are hover/focus only, so they
  never appear on touch devices, and below 640px the assistant button is a bare sparkle
  icon with no label (`hidden sm:inline`). Likely the majority of traffic.
- **The reservations form's UI flow is untested end to end.** The Worker endpoint is
  verified and a test inquiry was confirmed Delivered, but the form's own success and
  error states have not been exercised in a browser.
- **Single 377 kB JS chunk.** Under the 500 kB warning threshold now, but there is no
  code splitting; `Gallery` and `TourAssistant` are reasonable lazy-load candidates.
- **`FROM_EMAIL` and `TO_EMAIL` are both `info@`.** Workable, but guest replies go to
  `reply_to` (the guest's own address), so confirm staff replies land where expected.

`PROJECT_TODO.md` holds the business backlog — payments via Belize Bank, airport
transfers, and content work. Those are larger and need decisions from Action Divers
before implementation.
