# Action Divers launch readiness

Initial audit: 2026-09-21, before the authorized preview release. Recommendation: prepare and validate one matching website/API
release in preview, then cut over the public domain with payments disabled.

This audit updated local code and documentation only. It did not commit, push,
merge to main, deploy, change DNS, submit a reservation, send email, or start a payment.

## Repository and local cleanup

- Active checkout: `C:\Dev\action divers\G2`.
- Remote: `https://github.com/iforceone/actiondivers2.git`.
- Fetched origin and fast-forwarded `codex/action-divers-work` from `89403bb` to
  `9acdd92e960d19252645f4822f2f472297abf4a6` (September 21 refresher booking flow).
- `origin/main` is `2fc23f6be49993707f54294ce5b730de485db00c`, 33 commits behind the
  work branch. It is not a safe representation of the currently deployed site.
- Fixed the chatbot history array/tuple type mismatch that failed API typechecking.
- Removed the unused legacy reservation component and duplicate price list from
  `App.tsx`. Active trip/course/transfer forms remain in `pages/`.
- Updated `react-router-dom` from 6.28.0 to 6.30.6 and its lockfile.
- Added frontend typechecking to `npm run build` and combined checks to `npm run check`.
- Excluded the not-found catch-all from internal-link validation so misspelled routes fail.
  Sitemap checks now inspect every URL instead of silently ignoring other domains.
- Ignored existing `.claude/` machine-local settings without deleting them.
- Refreshed README/status/backlog and added a workspace pointer to G2. Older
  prototypes, source media, and business files remain intact.

At this initial audit checkpoint, cleanup changes were uncommitted for review.
The subsequent preview release is authorized separately; production and domain
changes are outside that authorization.

## What Cloudflare is serving

| Surface | Verified state |
| --- | --- |
| `actiondiversbelize.com` | HTTP 301 to `https://www.actiondiversbelize.com/` |
| `www.actiondiversbelize.com` | HTTP 200; existing WordPress/Avada website |
| `actiondivers2.davebze.workers.dev` | New React site; version 68 at 100% traffic, deployed August 22 |
| `codex-action-divers-work-actiondivers2.davebze.workers.dev` | September 21 branch preview, version 69 |
| `actiondivers-api.davebze.workers.dev` | Production API, version 18 at 100%, deployed August 22 |
| `actiondivers-api-preview.davebze.workers.dev` | Separate preview API; active deployment is also from August 22 |

The preview's main JS asset `index-BPHoQARE.js` exactly matched the initial local
build of `9acdd92` before this audit's cleanup. Production uses `index-DCkzj-MT.js`
and does not match. There is no Git SHA annotation on the active production Worker,
so its exact source commit was not established. Deployment timestamps, versions,
public responses, rendered pages, and asset bytes were checked independently.

The September 21 change includes both frontend and API validation changes. The
preview frontend is newer than its API; deploy the matching API before validating
the complete new Refresher + afternoon dive flow. No external booking was submitted
to prove that mismatch through a customer record.

### Recorded active version IDs

- Production website: `3f457aef-5084-49af-8ee0-b3212d895fdd`.
- Branch website preview: `08f13e6a-2dc0-4d8b-9c77-a1291438fd8b`.
- Production API: `73a01f86-8d1a-44dc-b971-6dbc87e0fe86`.
- Preview API: `4fe21a2e-6c56-4a09-936f-7fd6b9997d35`.

### Access, configuration, and storage

- Existing Wrangler OAuth successfully accessed account
  `9afab2d5eabc5a0cee88b9ecc5d2e795`, owned by Davebze@gmail.com, through member
  `dpollard@iforcemarketing.com`. No new account access is needed for this audit.
- Cloudflare DNS zone is active with `adelaide.ns.cloudflare.com` and
  `rudy.ns.cloudflare.com`. No Action Divers custom-domain mapping was returned
  by the account's Workers domains API. This supersedes the old SiteGround DNS note.
- Production API flags: `RESERVATIONS_V2_ENABLED=true`, `STAFF_PORTAL_ENABLED=true`,
  `PAYMENTS_ENABLED=false`, `PAYMENT_ENVIRONMENT=sandbox`.
- Production D1: `actiondivers-reservations-production`; preview D1:
  `actiondivers-reservations-preview`. Both have no pending migrations (six in Git).
- Active R2 bindings are `actiondivers-media` in production and the separate
  `actiondivers-media-preview` bucket in preview; no uploads were made in this audit.
  Preview reservations, staff, and payments are enabled with sandbox payment mode.
- Production Gemini and Resend secret names exist; values were neither exposed nor changed.
  No Belize Bank secret binding appears in the inspected production API version.
- Both APIs return healthy `/health` responses. Production `/catalog` returns
  catalog version 6 with 29 items; `/media` returns HTTP 200.
- Production website `/admin` and API `/admin-api/session` return Cloudflare Access
  redirects to unauthenticated visitors. Approved staff membership and a successful
  authorized staff session were not reverified.
- Production origins still allow the production Worker URL, branch preview, and
  `http://localhost:3000`. They do not yet include the business domain.
- Current frontend forms submit directly; the previously documented
  `VITE_RESERVATION_REQUESTS_ENABLED` switch no longer exists.

## Validation completed

- `npm run check`: both TypeScript checks, 14 existing API tests, production build,
  metadata generation for 26 routes, and readiness checks passed.
- Negative fixture: the readiness script rejected both a broken internal link and
  invalid sitemap path despite the catch-all route.
- API `wrangler deploy --dry-run --config wrangler.toml`: passed without deployment.
- Local browser checks: homepage, scuba detail, reservation form, transfer request,
  and blog page rendered; no errors in the checked route console log.
- At 390px width, the refresher form showed the afternoon-dive option, participant
  controls, and a changed estimate from $417.50 to $650.00 when selected; no horizontal
  overflow. Mobile home, reservations, and the not-found route also rendered without
  horizontal overflow. No request was submitted.
- `git diff --check`: passed.

### Remaining technical findings

1. Runtime dependency audit now reports **0 high/critical and 2 moderate package
   findings** in the website; the API runtime audit reports zero. Remaining router
   advisories are [navigation redirect handling](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6)
   and [SSR error hydration](https://github.com/advisories/GHSA-337j-9hxr-rhxg).
   The published patched major is v7. The site uses `BrowserRouter`, not SSR
   hydration, but that does not clear the package findings or prove every navigation
   path safe. Plan and test the major upgrade rather than claiming a clean audit.
2. Main JavaScript remains about 534 kB uncompressed / 154 kB gzip and triggers
   Vite's chunk warning. Consider lazy-loading the assistant as a follow-up.
3. Canonicals, sitemap, social URLs, and generated route metadata still point to
   the Worker domain. The preview homepage is also indexable. Update search behavior
   as part of the public-domain cutover.
4. Approved privacy, terms, and cancellation/refund pages are still absent from routes.
5. Current inbox delivery, Resend domain verification, staff workflow, and bank approval
   were not tested. README and payment-certification notes disagree about Resend
   verification; settle that using the live Resend account and an authorized delivery test.

## Recommended release sequence

1. **Prepare one reviewed release candidate.** Review/commit local cleanup, address the
   remaining router findings, and deploy matching preview frontend and API versions.
   Check Cloudflare's actual Git build settings before reconciling/merging `main`.
2. **Prove the operating flow.** With authorized test addresses, submit a preview
   request including Refresher + afternoon dive, review it as approved staff, issue a
   quote, open the customer portal, and confirm inbox delivery. Obtain owner approval
   of content, prices, contact details, schedules, and policy pages.
3. **Prepare the domain release.** Confirm apex/www canonical choice; inventory old
   WordPress URLs and build redirects. Update canonical/social/prerender/sitemap URLs,
   CORS, email/portal links, payment origin, Access hostname coverage, and preview
   indexing together. Record WordPress/DNS rollback and exact Worker versions.
4. **Launch after approval with payments disabled.** Deploy the reviewed site/API,
   map the public domain, and verify final URLs, redirects, desktop/mobile requests,
   staff access, and monitoring. No DNS cutover is authorized or performed by this audit.
5. **Activate payments separately.** Follow `PAYMENT_CERTIFICATION.md`: obtain bank
   approval, resolve the SSL-card discrepancy, provision production credentials and
   callbacks, and reconcile an explicitly approved live transaction before activation.

Raw public-check evidence is local and ignored under `.wrangler/launch-audit/`.
