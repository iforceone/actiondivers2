# Action Divers & Adventures — Belize Tours

Marketing and reservations site for a San Pedro, Ambergris Caye dive and adventure tour
operator. React + Vite + Tailwind, deployed on Cloudflare Workers, with a separate
Worker holding the API keys.

**Live:** https://actiondiversbelize.com (`www` redirects to the apex). The same site
Worker also answers at https://actiondivers2.davebze.workers.dev.

**Status — 2026-11-12.** The public domain serves the site Worker (WordPress is
retired). Reservations, the staff portal and Belize Bank card payments (USD) are live
in production. Kaptin Kai runs on Cloudflare Workers AI in production and preview.
Both Workers were last deployed by hand with Wrangler from `codex/action-divers-work`
at commit `d9fca18`. See [PRODUCTION_LAUNCH.md](PRODUCTION_LAUNCH.md) for the
deployment log.

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
/            → the React site   → Worker "actiondivers2"     (deploy manually)
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
| `POST /assistant` | Kaptin Kai on Cloudflare Workers AI | 12 / 60s |

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
| GitHub | `iforceone/actiondivers2` | Source; working branch `codex/action-divers-work` |
| Resend | dpollard@iforcemarketing.com | Sends inquiry emails |
| Cloudflare DNS | Same account as Workers | `actiondiversbelize.com` → site Worker; `www` redirects to apex |
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

Both Workers are deployed by hand from the working branch. When a change touches both,
deploy the **site first, then the API**: a newer form talking briefly to the older API
is safe, but a stricter API can reject requests from the older form.

```bash
npx wrangler whoami        # confirm account 9afab2d5eabc5a0cee88b9ecc5d2e795
npm run check              # API typecheck + tests, site build + readiness
npx wrangler deploy        # site Worker "actiondivers2" (reads wrangler.jsonc, serves dist/)
```

```bash
cd worker-api
npm run deploy             # API Worker "actiondivers-api" (uses --config wrangler.toml)
```

Afterwards, confirm the live entry asset on https://actiondiversbelize.com matches the
new build and record the version IDs Wrangler printed in PRODUCTION_LAUNCH.md.
Deploys take a few seconds to propagate; if you test immediately you may hit the
previous version. Wait a few seconds and retest before investigating.

**Git builds.** The repo was originally connected to Cloudflare Workers Builds
(`main` → `wrangler deploy`, other branches → `wrangler versions upload`, which only
uploads a preview version). Recent production deployments were made with Wrangler and
`main` lags the working branch. Check Workers & Pages → `actiondivers2` → Settings →
Build before pushing to `main`, so an old `main` build can't replace newer live code.

Wrangler reads `wrangler.jsonc` in the repo root. Keep it committed. Cloudflare's
`cloudflare/workers-autoconfig` bot periodically opens a branch offering to generate its
own config — it also switches the build to `@cloudflare/vite-plugin` and rewrites the
npm scripts, which is a much larger change than it appears. Don't merge it without
deciding you want that migration.

---

## Domain

`actiondiversbelize.com` is mapped to the site Worker. If the domain or origin ever
changes, update these together:

1. **`worker-api/wrangler.toml`** → `ALLOWED_ORIGINS` (comma separated, no trailing
   slash), then redeploy the API. The Worker rejects any other `Origin` with 403.
2. **`worker-api/wrangler.toml`** → `PAYMENT_SITE_ORIGIN` (payment return links).
3. **`components/SEO.tsx`** and **`scripts/prerender-meta.mjs`** → `SITE_URL`.
4. **`index.html`** → `og:url`, `og:image`, `twitter:image`, canonical link and the
   JSON-LD `"url"`.
5. **`public/sitemap.xml`** and **`public/robots.txt`**.
6. **`config.ts`** → API host selection.

`http://localhost:3000` is allowed only by the preview API.

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
Passing local checks does not mean anything has been deployed.

---

## Repo map

```
App.tsx                    routing and footer
wrangler.jsonc             site Worker config (site-worker/index.ts + dist/ assets)
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
components/PhoneInput.tsx  required phone field (country picker + libphonenumber-js)
components/CardBrands.tsx  Visa / Mastercard marks under payment buttons
worker-api/                the API Worker — see its own README
PROJECT_TODO.md            business backlog (payments, transfers, content)
```

---

## Known open items

- **End-to-end check of the 2026-11-12 release.** Submit one real reservation and
  confirm the acknowledgement email, the "check your spam" note, and the payment
  button with card logos.
- **Official card marks.** `CardBrands.tsx` draws simple Visa/Mastercard marks; swap in
  the official acceptance-mark artwork if Belize Bank or the card brands require it.
- **`main` is behind** the working branch. Bring it up to date once the Git build
  settings are confirmed (see [Deploying](#deploying)).
- **Dependencies.** `npm audit` reports two moderate findings in the site packages that
  need a major-version upgrade; review separately.
- **Owner content approval.** Prices, schedules still labeled “Exact time confirmed
  after booking,” and policy language.

`PROJECT_TODO.md` holds the business backlog — payments via Belize Bank, airport
transfers, and content work. Those are larger and need decisions from Action Divers
before implementation.
