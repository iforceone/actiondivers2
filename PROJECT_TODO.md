# Action Divers launch backlog

Updated 2026-09-24. See [PRODUCTION_LAUNCH.md](PRODUCTION_LAUNCH.md) for current evidence.

## Next release candidate

- [x] Fetch latest development branch and preserve unrelated workspace files.
- [x] Fix API TypeScript error and remove unused legacy reservation UI.
- [x] Add `npm run check` and fix catch-all masking in the internal-link check.
- [x] Update React Router within v6 to remove high-severity runtime audit findings.
- [ ] Review the remaining two moderate router package findings and plan/test v7.
- [x] Review and commit local cleanup; deploy matching frontend/API versions to preview (`5ca2a8b`).
- [ ] Run an authorized fictional preview request through Refresher + same-day dive,
      staff review, quote, customer portal, and actual inbox delivery.
- [x] Verify Cloudflare Git build settings: `main` is production; other branches upload previews.
- [ ] Reconcile work-branch differences before any separately authorized merge to `main`.

## Owner and operations approval

- [ ] Approve prices, fees, minimum quantities, capacities, and public contact details.
- [ ] Resolve remaining dive/course schedules and unconfirmed service claims.
- [ ] Supply approved privacy, terms, cancellation, refund, no-show, and weather policies.
      Drafts prepared in `docs/POLICIES_DRAFT.md`; not approved or published.
- [ ] Approve production staff accounts and customer-data retention.
- [x] Verify separate production/preview D1 and R2 bindings.
- [x] Verify both databases have no pending migrations.
- [x] Verify unauthenticated production site/API staff routes redirect to Access.
- [ ] Verify authorized staff sign-in and permissions; the public gate alone is insufficient.
- [x] Verify Resend domain and production-sender delivery; recipient confirmed receipt.
- [ ] Verify deployed production API customer/staff email delivery during the booking test.
- [ ] Confirm production request, quote, portal, and staff operating procedures.

## Public-domain launch

- [x] Verify Cloudflare DNS access; business domain still serves WordPress.
- [x] Prepare requested apex canonical; existing WordPress still redirects to `www`.
- [x] Inventory 143 WordPress URLs and verify 26 redirects for direct matches in preview.
- [ ] Resolve unmatched legacy services and implement proper 404/410 handling for retired URLs.
- [ ] Update canonical/social/structured-data URLs, prerender metadata, sitemap,
      robots, API origins, email links, payment origin, and Access hostname coverage.
- [x] Deploy and verify preview noindex and private-link headers.
- [x] Record database backup, API/source versions, and rollback steps; refresh DNS snapshots at cutover.
- [ ] Approve production release and DNS/Worker mapping changes.
- [ ] Verify final public domain, desktop/mobile flows, redirects, and monitoring.

## Payment launch (separate)

- [x] Application sandbox scenarios recorded on 2026-08-21 in `PAYMENT_CERTIFICATION.md`.
- [x] Production credentials supplied by Belize Bank and installed directly in Cloudflare (owner confirmation).
- [x] Deploy matching production API with live gateway selected and checkout disabled; verify both payment-start routes remain closed.
- [ ] Verify the supported 3D Secure flow in a controlled live test and satisfy any conditions supplied with the production credentials. A separate written approval or SSL-test waiver is not established by the bank guide.
- [ ] Confirm production credentials, gateway/callback URLs, expiry, and refund operations.
- [ ] Complete `PAYMENT_CERTIFICATION.md` production checklist.
- [ ] Activate only after explicit approval and reconciled live testing.

Recommendation: launch the website and reservations with payments disabled, then
activate payments separately after operational checks, reconciled live testing, and owner approval.
