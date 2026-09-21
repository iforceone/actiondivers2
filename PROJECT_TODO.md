# Action Divers launch backlog

Updated 2026-09-21. See [LAUNCH_READINESS.md](LAUNCH_READINESS.md) for current evidence.

## Next release candidate

- [x] Fetch latest development branch and preserve unrelated workspace files.
- [x] Fix API TypeScript error and remove unused legacy reservation UI.
- [x] Add `npm run check` and fix catch-all masking in the internal-link check.
- [x] Update React Router within v6 to remove high-severity runtime audit findings.
- [ ] Review the remaining two moderate router package findings and plan/test v7.
- [ ] Review and commit local cleanup; deploy matching frontend/API versions to preview.
- [ ] Run an authorized fictional preview request through Refresher + same-day dive,
      staff review, quote, customer portal, and actual inbox delivery.
- [ ] Reconcile the 33-commit difference from `main` and verify Cloudflare Git build
      settings before a production merge or push.

## Owner and operations approval

- [ ] Approve prices, fees, minimum quantities, capacities, and public contact details.
- [ ] Resolve remaining dive/course schedules and unconfirmed service claims.
- [ ] Supply approved privacy, terms, cancellation, refund, no-show, and weather policies.
- [ ] Approve production staff accounts and customer-data retention.
- [x] Verify separate production/preview D1 and R2 bindings.
- [x] Verify both databases have no pending migrations.
- [x] Verify unauthenticated production site/API staff routes redirect to Access.
- [ ] Verify authorized staff sign-in and permissions; the public gate alone is insufficient.
- [ ] Verify current Resend domain status and customer/staff delivery. Historical
      documents disagree about sender verification; API acceptance is not inbox delivery.
- [ ] Confirm production request, quote, portal, and staff operating procedures.

## Public-domain launch

- [x] Verify Cloudflare DNS access; business domain still serves WordPress.
- [ ] Confirm canonical apex/www choice; current WordPress canonical uses `www`.
- [ ] Inventory WordPress URLs and prepare tested redirects.
- [ ] Update canonical/social/structured-data URLs, prerender metadata, sitemap,
      robots, API origins, email links, payment origin, and Access hostname coverage.
- [ ] Keep previews out of search results after cutover.
- [ ] Record backups, deployment artifacts, Worker version IDs, and rollback steps.
- [ ] Approve production release and DNS/Worker mapping changes.
- [ ] Verify final public domain, desktop/mobile flows, redirects, and monitoring.

## Payment launch (separate)

- [x] Application sandbox scenarios recorded on 2026-08-21 in `PAYMENT_CERTIFICATION.md`.
- [ ] Obtain Belize Bank written approval and resolve/waive the SSL-card discrepancy.
- [ ] Confirm production credentials, gateway/callback URLs, expiry, and refund operations.
- [ ] Complete `PAYMENT_CERTIFICATION.md` production checklist.
- [ ] Activate only after explicit approval and reconciled live testing.

Recommendation: launch the website and reservations with payments disabled, then
activate payments separately after bank and operational approvals.
