# Action Divers & Adventures — Belize Tours

Marketing and reservations site for a San Pedro, Ambergris Caye dive shop and tour
operator. React + Vite + Tailwind, deployed on Cloudflare Workers, with a separate
Worker holding the API keys.

**Live:** https://actiondivers2.davebze.workers.dev (still a `workers.dev` URL — see
[Moving to a real domain](#moving-to-a-real-domain))

**Launch checkpoint: 2026-09-24.** See [PRODUCTION_LAUNCH.md](PRODUCTION_LAUNCH.md)
for current deployment evidence. Production API remains on `5ca2a8b`; preview
API now runs Kaptin Kai on Cloudflare Workers AI from `3860faa`. Production uses
the live gateway configuration with checkout disabled. The public domain still
serves WordPress; the production site Worker and `main` have not changed.

---

## Quick start

```bash
npm ci
npm ci --prefix worker-api
npm run dev          # http://localhost:3000
```

That's it. **Do not put a Gemini API key in `.env.local`** — the site no longer reads
one, and adding one back would ship it to every visitor (see [Why there are two
projects](#why-there-are-two-projects)). An older version of this README told you to do
exactly that; it was wrong, and the key it referred to has been rotated.

Local development defaults to the production API. Current reservation, course, and
transfer forms submit real requests; `VITE_RESERVATION_REQUESTS_ENABLED` is no longer
implemented. Set `VITE_API_BASE_URL` in ignored `.env.local` to the isolated preview
API when testing submissions. Only the preview API allows `http://localhost:3000`;
production allows the public apex and `www` origins. Branch preview hosts select the
preview API unless explicitly overridden. Do not submit fictional production requests.

```bash
npm run build        # frontend typecheck, build, and route metadata
npm run preview      # serve the built output
npm run typecheck    # frontend only
npm run check        # API typecheck + tests, frontend build + readiness
```

Use `npm run check` before a release. A build cannot verify inbox delivery, approved
staff access, payment certification, or public-domain readiness.

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
| `POST /assistant` | Kaptin Kai: Workers AI on preview, Gemini on production | 12 / 60s |

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
| Cloudflare DNS | Same account as Workers | Active domain zone; website still serves WordPress |
| Google Workspace | — | Mailbox `info@actiondiversbelize.com` receives inquiries |

### ⚠️ The `CLOUDFLARE_API_TOKEN` trap

Previous sessions had global `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
variables targeting another client's account. They were absent in the September 21
audit, but these overrides can take priority over Wrangler OAuth. Check before writes.

Before any `wrangler` command that writes:

```bash
npx wrangler whoami       # must include account 9afab2d5eabc5a0cee88b9ecc5d2e795
```

Verify the account ID, not just the login email: the current authorized member is
`dpollard@iforcemarketing.com`. Clear wrong-account overrides only for that shell.

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

**Pushes to any other branch also build.** Non-production branches run
`npx wrangler versions upload` instead of `wrangler deploy` — it uploads a preview
version without touching production. These builds show up in the same build history, so
a red build there does **not** mean the live site is broken; check which branch the
build came from before panicking.

This is the documented Git build setup; verify it in Cloudflare before releasing.
The production version checked on September 21 was uploaded with Wrangler and is
newer than GitHub `main`. Do not release the stale `main` checkout.

Both commands read `wrangler.jsonc` in the repo root. Keep it committed. Cloudflare's
`cloudflare/workers-autoconfig` bot periodically opens a branch offering to generate its
own config — it also switches the build to `@cloudflare/vite-plugin` and rewrites the
npm scripts, which is a much larger change than it appears. Don't merge it without
deciding you want that migration.

**The Worker does not.** It has no Git integration. After changing anything in
`worker-api/`:

```bash
cd worker-api
npx wrangler whoami        # confirm account 9afab2d5eabc5a0cee88b9ecc5d2e795
npm run deploy
```

Deploys take a few seconds to propagate. If you deploy and immediately test, you may hit
the previous version — this happened during setup and looked like a config bug. Wait a
few seconds and retest before investigating.

---

## Moving to a real domain

The domain is already in Cloudflare DNS but has no mapping to the site Worker.
Coordinate these changes in one reviewed cutover:

1. **`worker-api/wrangler.toml`** → `ALLOWED_ORIGINS` — add the new origin (comma
   separated, no trailing slash), then **`npm run deploy` from `worker-api/`**. The Worker rejects any
   other `Origin` with 403 server-side; this is real access control, not just a CORS
   header, so it will not "just work" until you do this.
2. **`components/SEO.tsx`** → `SITE_URL` — drives canonical URLs and JSON-LD across all
   pages.
3. **`index.html`** → four values: `og:url`, `og:image`, `twitter:image`, and
   `<link rel="canonical">`, plus the `"url"` field in the JSON-LD block.
4. **`scripts/prerender-meta.mjs`** → `SITE_URL` for generated route metadata.
5. **`public/sitemap.xml` and `public/robots.txt`** → public sitemap origin.
6. **`worker-api/wrangler.toml`** → `PAYMENT_SITE_ORIGIN` and customer links/callbacks.
7. **`config.ts`** → verify API host selection for the final domain.
8. Inventory WordPress URLs, prepare redirects, map the chosen hostname to the Worker,
   and verify apex/www behavior, TLS, staff Access coverage, and preview indexing.

Keep `http://localhost:3000` in `ALLOWED_ORIGINS` or local dev breaks.

---

## Gotchas

**`index.html` has a second copy of the structured data.** There is JSON-LD in
`index.html` *and* JSON-LD generated in `App.tsx`. The static one can't read `config.ts`,
so contact details must be updated in both places. This is deliberate — it keeps
structured data available to crawlers that don't execute JavaScript — but it is easy to
update one and forget the other.

**Use `npm run build`, not bare `vite build`.** The npm script typechecks the
frontend. `npm run check` also checks the API.

**Specify the API config explicitly.** Ad-hoc Wrangler commands can select the
parent site's config even from `worker-api/`. Use `--config wrangler.toml` there.
The API npm deployment script already does this.

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

**Production sender verified September 24, 2026.** Resend DKIM uses
`resend._domainkey`; DNS-only CNAMEs `rsend` and `send` point to
`rsend.forge.rmta.net` and `send.forge.rmta.net`. The old SES MX/TXT records at
`send` were replaced. Root SPF and Google Workspace MX records were preserved.
Resend reported the authorized test from `info@actiondiversbelize.com` delivered,
and the recipient confirmed receipt. This was a Resend template test, not a
production reservation/API test. Keep Resend receiving disabled.

**Public-domain release preparation:** see [PRODUCTION_LAUNCH.md](PRODUCTION_LAUNCH.md).
`npm run check:launch` validates the prepared release with live checkout disabled.
Local launch configuration does not mean the public domain or API has been deployed.

---

## Repo map

```
App.tsx                    routing and footer
wrangler.jsonc             site Worker config (assets-only, points at dist/)
config.ts                  contact details, Worker URL, review counts
constants.tsx              tour data and pricing
types.ts                   shared types
components/
  AssistantLauncher.tsx    floating dock: WhatsApp + assistant buttons
  TourAssistant.tsx        chat modal + open state
  SEO.tsx                  per-page meta tags, SITE_URL
services/geminiService.ts  calls worker-api /assistant (no SDK, no key)
pages/Reservations.tsx     current trip request form
pages/ServiceRequest.tsx   course and transfer request forms
worker-api/                the API Worker — see its own README
PROJECT_TODO.md            business backlog (payments, transfers, content)
```

---

## Known open items

Remaining launch gates, roughly by priority:

- **Owner content approval.** Confirm prices, schedules still labeled “Exact time
  confirmed after booking,” public contact details, and policy language.
- **Reservation operations.** D1/R2 exist, migrations are current, and reservations
  and staff gates are enabled. Confirm actual inbox delivery, approved staff access,
  and the complete request/quote workflow before the domain cutover.
- **Live payment verification.** Sandbox certification passed and production bank
  credentials are installed. Complete production deployment checks, approved
  cancellation/refund terms, and an owner-authorized controlled live payment test
  before customer activation. Follow any conditions supplied with the credentials;
  the bank guide does not establish a separate approval-letter requirement.
- **Email operations.** `FROM_EMAIL` and `TO_EMAIL` are both `info@`; confirm the staff
  reply workflow and monitor delivery before enabling live requests.

`PROJECT_TODO.md` holds the business backlog — payments via Belize Bank, airport
transfers, and content work. Those are larger and need decisions from Action Divers
before implementation.
