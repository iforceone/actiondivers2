# Action Divers production launch preparation

Updated September 24, 2026, on `codex/action-divers-work`.
**Status: production API remains on release `5ca2a8b`; preview API now runs
Workers AI for Kaptin Kai from source `4bd1936`. The branch frontend preview is
verified. Production checkout remains disabled. No merge to main, public-domain
cutover, production frontend deployment, or live transaction has occurred.**

## September 24 English-only Kai update

- Source `4bd1936` is committed and pushed. Kai's greeting and system instructions
  now use natural English with a friendly, casual tone and explicitly avoid Kriol.
- Preview API version `0ea25d51-17bd-42bf-afb8-336d9d8f1f86` is deployed; branch
  frontend serves matching entry asset `index-B94R0WbY.js` with the new greeting.
- Two live chat tests returned English, including a request to use Kriol with
  dialect in earlier conversation history. All 19 API tests, TypeScript, build,
  readiness and launch checks passed. Production was not changed.
- Evidence: ignored `.wrangler/launch-audit/kai-english-verification.json`.

## September 24 Kaptin Kai preview verification

- Missing `GEMINI_API_KEY` on the preview API caused the chat failure. Production's
  Gemini secret was present and a direct production-origin chat retest succeeded.
- Preview now uses native Cloudflare Workers AI, model
  `@cf/google/gemma-4-26b-a4b-it`, without a Gemini key. Code commits `5d9888d` and
  `3860faa` are pushed to `codex/action-divers-work`.
- Preview API at this earlier checkpoint: `0f498dbe-2c79-4a29-8c4c-42f20525c407`, verified at 100%
  traffic. Its tag is `c5-preview`; the deployed source commit is `3860faa`.
  Sandbox payment settings, D1, R2, mail sender, rate limits and Access are retained.
- The actual preview chat's PADI shortcut returned course details. A follow-up
  correctly calculated two Open Water certifications as $1,128.76 and explained
  staff review followed by a private payment link. Tour prices, internal links,
  and next-day requests going to phone/WhatsApp were checked with live responses.
  Kai declined to confirm a booking or mark it paid in chat.
- API TypeScript, 19 unit tests, frontend TypeScript/build, readiness and launch
  checks passed. Deployed malformed-body, empty-history and oversized-message
  checks returned 400, 422 and 413; health/catalog returned 200 and staff session
  redirected to Access. These are bounded chat checks, not a new payment certification.
- Final API samples took 1.5–2.1 seconds. Local evidence is in ignored
  `.wrangler/launch-audit/workers-ai-verification.json`.
- Workers AI's free allowance is 10,000 Neurons per account per day; Free-plan
  requests fail when exhausted. No paid-plan upgrade or Gemini fallback was added.
  See [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- Production API is still `bc81179c-6736-4bdb-bbc2-54e79c7622fb` at 100%, checked
  after preview deployment. Moving production chat to Workers AI and updating
  the final privacy notice remain separate launch steps.

## Earlier September 24 API release checkpoint

- Production API: `bc81179c-6736-4bdb-bbc2-54e79c7622fb`, 100% traffic, tag `5ca2a8b`.
  `PAYMENT_ENVIRONMENT=production`, `PAYMENTS_ENABLED=false`, apex payment origin,
  apex/www CORS, existing bank/email secrets retained. Credential validity has
  not yet been tested against the live bank.
- Preview API: `6ad5e929-478e-435f-8e63-a1f6eede2083`, 100% traffic, tag `5ca2a8b`.
  Sandbox settings, sender, database, and bucket remain isolated.
- Branch frontend: all nine compiled JS/CSS files match the local release build;
  entry asset `index-BKxn0K6c.js`. All 26 legacy redirects and preview/private
  indexing headers passed deployed checks.
- Final HTTP verification: 25 checks passed, including both production checkout
  entry points returning HTTP 503, unauthorized origins rejected, API health,
  catalog/media, staff Access gates, and unchanged public WordPress delivery.
  This does not substitute for an authenticated staff workflow or live payment.
- Before deployment, production contained four reservations and zero payment
  intents. A private database export was saved under the ignored
  `.wrangler/launch-audit/production-before-api-release-2026-09-24.sql`.
  SHA-256: `AA59F94352387CF48D329F2EE23D33D5423C8C438AFF4E50DFCA920681D8AA81`.
- Local verification evidence: `.wrangler/launch-audit/release-5ca2a8b.json`.
- Cloudflare Git settings were checked: production branch `main`; other branches
  use `wrangler versions upload`. The production site Worker remains unchanged.
- No general policies were found across the 83 published WordPress pages and
  four posts. [Policy drafts](docs/POLICIES_DRAFT.md) are ready for owner review;
  they are repository documents and are not published website pages.

## Verified progress

- The owner confirmed the completed sandbox reservation-to-payment certification
  described in `PAYMENT_CERTIFICATION.md`.
- Resend verified `actiondiversbelize.com`. The September 24 production-sender test
  from `info@actiondiversbelize.com` was Delivered, and the owner confirmed receipt.
  This was a Resend template test, not a test of the deployed production API's key
  and application email path. Inbox-versus-spam placement was not specified.
- Production bank username/password, Resend, and Gemini secret binding names are
  present. Their values were not read, changed, or copied to this repository.
- Production D1 has no pending migrations. Its database and R2 bindings are correct.
- Both APIs return HTTP 200 from `/health`. Production catalog has 29 items.
- Existing production Worker `/admin` and API `/admin-api/session` redirect
  unauthenticated visitors to Cloudflare Access.
- The old WordPress website is still live. Apex currently redirects to `www`.

## Prepared configuration versus live configuration after the API release

| Setting | Live on September 24 | Prepared locally |
| --- | --- | --- |
| Public site | WordPress on `www.actiondiversbelize.com` | Canonical `https://actiondiversbelize.com` |
| Website search metadata | Temporary Workers origin | Public apex in canonical, social, JSON-LD, sitemap, robots |
| API payment environment | `production` | `production` |
| API payment website origin | `https://actiondiversbelize.com` | `https://actiondiversbelize.com` |
| Production checkout | `PAYMENTS_ENABLED=false` | `PAYMENTS_ENABLED=false` |
| Production CORS | Apex and `www` only | Apex and `www` only |
| Preview API | Isolated sandbox | Unchanged sandbox variables and resources |

The API remains at `https://actiondivers-api.davebze.workers.dev`; it does not need
a new API hostname. The frontend already selects this API on the public domain
and the isolated preview API on branch preview hostnames. Do not override
`VITE_API_BASE_URL` with a production URL on branch preview builds.

The API configuration keeps production and preview D1/R2 resources in their
respective environments. Removed redundant top-level preview binding aliases;
use `--env preview` explicitly for sandbox work.

## Domain and Access cutover plan

The API configuration has been deployed. Domain, frontend production, and Access
hostname changes below remain unapplied.

1. Record/export the current apex/www DNS records, Cloudflare Redirect Rules,
   Page Rules, Worker custom domains, and Access applications immediately before
   cutover. Keep the WordPress host running for rollback. The recorded September
   23 apex and `www` A records both point to `35.208.33.149`, proxied, TTL Auto.
2. Confirm Git build settings and deploy the reviewed frontend/API source together.
   Do not merge `main` or assume pushing the work branch releases production.
3. Add `actiondiversbelize.com/admin` and `actiondiversbelize.com/admin/*` to the
   existing appropriate Access application with the existing approved staff
   policy. Confirm API Access coverage for `/admin-api` and `/admin-api/*` and
   that its audience still matches the Worker. Keep public customer and payment
   callback paths outside the staff Access application.
4. Attach only `actiondiversbelize.com` as a Custom Domain to `actiondivers2`.
   Use the Cloudflare dashboard for the reviewed cutover. No custom-domain route
   has been added to `wrangler.jsonc`, so a branch preview upload cannot claim it.
5. Add a zone Single Redirect rule matching exactly
   `http.host eq "www.actiondiversbelize.com"`, with dynamic destination
   `concat("https://actiondiversbelize.com", http.request.uri.path)`, HTTP 301,
   and **Preserve query string enabled**. Keep `www` proxied. Check and remove
   or disable a conflicting apex-to-www Cloudflare rule at cutover, if one
   exists; the currently observed redirect's originating layer is not established.
6. Verify apex HTTPS, www redirects including a harmless query string, certificate
   validity, protected staff routes, and public callback reachability. Check that
   no redirect loop exists. Domain redirects cannot go in the static `_redirects`
   file; that file contains path redirects only.
7. With checkout disabled, perform an authorized production reservation, staff
   quote, portal-link, and application email test using designated test recipients.
   Confirm that emails and portal links point to the apex and that the production
   Resend secret belongs to the team with the verified domain.

Cloudflare references:
[Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/),
[redirect rules](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/),
[static headers](https://developers.cloudflare.com/workers/static-assets/headers/),
[static path redirects](https://developers.cloudflare.com/workers/static-assets/redirects/).

## Legacy URLs and content decisions

The live WordPress sitemap exposed **143 URLs** on September 24. Its nine child
sitemaps were read. The public URL inventory is retained in
`docs/legacy-urls-2026-09-24.txt`.

`public/_redirects` prepares 26 redirects (with and without trailing slashes) for
13 clear path matches: about, contact, scuba, local dives, scuba instruction,
snorkeling, fishing, beach barbecue, cave tubing/ziplining, Altun Ha, Xunantunich,
Lamanai, and the island-adventures category. These target existing public pages.

Before cutover, decide what to retain or retire for pages without a direct match:
`/golf-cart-rental/`, `/island-spa/`, `/real-estate/`, `/the-belize-zoo/`,
`/maya-ruins/`, `/snorkeling-and-fishing/`, `/media/`, `/faq/`, `/pricing/`, and
the older testimonial posts. The sitemap also includes many theme demo pages
(portfolio examples, lorem-ipsum FAQs, home versions, sliders, and layout demos).
Do not redirect every unmatched page to the homepage. The current SPA fallback
returns HTTP 200 for unknown paths; proper 404/410 treatment for retired URLs
remains a cutover task, not a completed part of this preparation.

Approved privacy, terms, and cancellation/refund pages are still absent from the
new site. Review `docs/POLICIES_DRAFT.md`, confirm the proposed business terms and
marked privacy details, then publish the approved versions before launch.

## Production gateway configuration and controlled live test

The supplied *Belize Bank Limited Card Payment Gateway Integration Guide v1.3*
(pages 9–10) confirms the production base URL below and says production credentials
are supplied when the merchant is ready to launch. The owner confirms receiving
those credentials. The guide does not establish a separate written approval
requirement. Follow any conditions actually supplied by the bank; the remaining
technical verification is a controlled live test.

| Configuration / test item | Prepared value / outstanding point |
| --- | --- |
| Production gateway | `https://gateway.belizebank.com/payment/rest` |
| Merchant currency | USD; the code sends amounts in cents and relies on the merchant's currency configuration |
| Return URL | `https://actiondiversbelize.com/payment/return?token=<opaque-payment-token>` |
| Callback URL | `https://actiondivers-api.davebze.workers.dev/payments/callback` |
| Callback method | POST, form-encoded; callback URL is supplied in gateway registration. Verify reachability and any bank-specified allowlisting requirements. The API verifies payment status with the bank before finalization |
| Sandbox observation | Mastercard SSL success case returned status 6 / action code 2003, requiring 3D Secure. Verify the supported 3D Secure flow live; this observation does not establish a separate approval or waiver requirement |
| Live test | Confirm owner-approved amount, cardholder/operator, timing, refund/reconciliation procedure, and any conditions supplied with the bank's production credentials |

No live order, charge, or refund was initiated. Credential validity and merchant
currency still need live verification. No message was sent to the bank.

After deployment checks and owner authorization, enable checkout only for the agreed
supervised window, have the authorized cardholder enter payment details on the
bank page, and reconcile the bank transaction, callback, paid reservation, and
single receipt. Disable checkout if the test fails or if general activation is
not yet approved. Enabling checkout permits other valid outstanding links too;
review outstanding production payment intents before that window. Bank
callbacks and verification must remain available for transactions already begun.

## Rollback record

Recorded before the September 24 API release:

- Website: `3f457aef-5084-49af-8ee0-b3212d895fdd`.
- Prior API rollback version: `b93b13ae-953c-4f29-a47c-ea25e79e7b6c` (includes installed
  bank-secret bindings; sandbox environment with checkout disabled). The current
  API version is recorded in the release checkpoint above.
- Production D1: `d3d3ec34-c463-4f36-af2c-5ab32a45acda`.
- Production R2: `actiondivers-media`.

Before release, export production D1 and save fresh DNS/rule/Access snapshots.
Do not restore old database data over new customer bookings as a code rollback.
For a site rollback, disable the new www-to-apex rule, remove the newly attached
custom domain, restore the recorded apex/www A records and former redirect
behavior, and verify WordPress. Preserve all email DNS records. For a Worker
rollback, select the recorded version using its explicit config, then verify
active traffic and bindings; do not assume a version upload is a deployment.

## Validation

- `npm run check:launch`: passed (15 API tests, frontend/API TypeScript, production
  build, readiness, 26 canonical pages, 26 redirect rules, preview/private headers,
  production checkout disabled).
- Production and preview API `wrangler deploy --dry-run` with explicit config:
  passed; bindings select their separate databases and buckets.
- Local Wrangler runtime: 34 HTTP checks passed for all 26 legacy redirects,
  preview-host noindex, and private-route noindex/referrer/cache headers. Preview
  host matching used Wrangler's explicit local origin because it rewrites the
  incoming Host header. These checks do not establish deployed behavior.
- A payment-gate regression test checks both payment-start entry points with
  production mode and false/missing enable flags. Neither touches payment data
  nor calls the bank.
- Existing Vite warning remains: the main JavaScript chunk exceeds 500 kB.
- Deployed API and preview checks are recorded separately in the release checkpoint.
  Public-domain cutover, Access hostname changes, real payment, and production
  application-email delivery remain unverified.
