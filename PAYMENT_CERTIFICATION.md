# Belize Bank payment certification

Date: 2026-08-21  
Environment: Belize Bank sandbox + isolated Cloudflare preview resources  
Result: **Application integration passed; production configuration and a controlled live test remain before customer activation.**

## Tested preview stack

- Frontend: `https://codex-action-divers-work-actiondivers2.davebze.workers.dev`
- API: `https://actiondivers-api-preview.davebze.workers.dev`
- Preview D1: `actiondivers-reservations-preview`
- Preview R2: `actiondivers-media-preview`
- Staff routes protected by Cloudflare Access.
- Production `PAYMENTS_ENABLED` remains `false`.

No card number, CVC, password, API key, or gateway credential is stored in this document or in the repository.

## Application-level evidence

| Scenario | Evidence | Result |
| --- | --- | --- |
| Successful payment | Reservation `AD-RF762M`, bank order `4002`, $300 USD, bank status `2` | Payment and reservation became `paid`; exactly one receipt was sent |
| Duplicate callback | Completed callback replayed once | HTTP 200; one payment-confirmation event and one sent receipt remained |
| Declined payment | Reservation `AD-E5B8TN`, bank order `3002`, $300 USD, bank status `6` | Payment became `declined`; reservation remained `awaiting_payment`; no receipt |
| Retry after decline | Same reservation, fresh bank order `3003` | Retry audit event recorded; new gateway order registered; reservation remained unpaid |
| Expired link | Fictional preview intent temporarily expired, then restored | Portal hid checkout and API returned HTTP `410 Gone` |
| Amount mismatch | Verification routine received a deterministic mocked bank amount of 29,999 cents for a 30,000-cent intent | Payment update targeted `review_required`, error `amount_mismatch`, and an audit event; paid finalization did not run |
| Automated validation | Worker tests and TypeScript validation | 14/14 tests passed; `tsc --noEmit` passed |

## Gateway-card observations

- Mastercard 3DS2 Full success: passed.
- Visa 3DS2 Frictionless success: passed.
- Mastercard designated failure: declined as expected, although the sandbox unexpectedly displayed an ACS challenge.
- Visa 3DS2 Attempt success: passed.
- Mastercard SSL success case: bank returned status `6`, action code `2003`, stating that payments cannot be made without 3D Secure. This is a recorded sandbox limitation, not evidence that a separate bank approval or waiver is required. Verify the supported 3D Secure flow during the controlled live test; contact the bank if a live failure needs resolution.

## Production readiness

1. **Updated September 24, 2026:** The user confirms Belize Bank supplied production credentials. The supplied integration guide (pages 9–10) identifies the production endpoint and says production credentials are supplied when the merchant is ready to launch. It does not establish a separate written approval requirement. Follow any conditions actually supplied by the bank; verify the credentials and complete payment flow in a controlled live test.
2. **Resolved September 24, 2026:** `actiondiversbelize.com` is verified in Resend. An authorized template test from `info@actiondiversbelize.com` was reported Delivered, and the recipient confirmed receipt. Production API email delivery remains a separate deployment smoke test. Preview retains its sandbox sender.
3. Production sender, reply-to address, recipient routing, production secrets, and callback URL must be confirmed before activation.

Production bank credentials were supplied by the user and installed in Cloudflare.
On September 24, the active production API exposed both bank secret binding names
without revealing their values; credential validity has not been tested with the bank.
See [PRODUCTION_LAUNCH.md](PRODUCTION_LAUNCH.md) for the prepared configuration and
remaining launch gates. The public website and live payment activation are unchanged.

## Production launch checklist

Complete deployment preparation before the supervised live test. Complete reconciliation and obtain the owner's activation approval before opening payments to customers.

- [x] User confirms production merchant credentials received and saved directly in Cloudflare.
- [ ] Production gateway base URL and allowed redirect hosts confirmed.
- [ ] Production callback URL is reachable, included in gateway registration, and meets any callback allowlisting requirements actually specified by the bank.
- [x] `actiondiversbelize.com` verified in Resend; sender delivery test and recipient receipt confirmed.
- [ ] Production `FROM_EMAIL`, `TO_EMAIL`, and reply-to routing confirmed.
- [x] Production bank, Resend, and Gemini secret bindings present in Cloudflare; values not read or committed.
- [x] Production D1 has no pending migrations; R2 binding is `actiondivers-media` (September 24).
- [ ] Cloudflare Access protects all `/admin-api/*` production routes.
- [ ] Production frontend origin is the only production CORS origin, apart from explicitly approved origins.
- [ ] Production deployment smoke-tested with `PAYMENTS_ENABLED=false`.
- [ ] Backup/rollback Worker version recorded.
- [ ] Staff verifies quote creation, customer portal access, and email delivery without starting a charge.
- [ ] A low-value live transaction amount, operator, and test window are explicitly approved by the owner; any conditions supplied with the bank's production credentials are satisfied.
- [ ] Temporarily enable production payments for the supervised test window, then disable them if reconciliation fails or general activation is not yet approved.
- [ ] Live transaction through the supported 3D Secure flow, callback, reservation transition, and receipt independently reconciled.
- [ ] Refund/cancellation operations and staff responsibilities documented.
- [ ] Only after reconciliation and owner approval: leave production `PAYMENTS_ENABLED=true` for customers and monitor the first transactions.

## Repository fixes produced during certification

- `930bf40` — corrected Belize Bank `returnUrl` request casing.
- `eec9500` — accepted the sandbox `formUrl` response casing.
- `4281fba` — added safe retry behavior after a decline.

