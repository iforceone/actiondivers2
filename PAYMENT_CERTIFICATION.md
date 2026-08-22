# Belize Bank payment certification

Date: 2026-08-21  
Environment: Belize Bank sandbox + isolated Cloudflare preview resources  
Result: **Application integration passed; production activation remains blocked on external approvals.**

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
- Mastercard SSL success case: bank returned status `6`, action code `2003`, stating that payments cannot be made without 3D Secure. Belize Bank must clarify this discrepancy before certification is treated as unconditional.

## External blockers

1. Belize Bank must approve the integration, provide production credentials/endpoints, and clarify the SSL test-card result.
2. `actiondiversbelize.com` must be verified in Resend. Preview currently uses Resend's testing sender and can only deliver to the account owner's address.
3. Production sender, reply-to address, recipient routing, production secrets, and callback URL must be confirmed before activation.

## Production launch checklist

Do not enable live payments until every item below is complete.

- [ ] Belize Bank written sandbox/integration approval received.
- [ ] SSL test-card discrepancy resolved or explicitly waived by Belize Bank.
- [ ] Production merchant credentials received through a secure channel.
- [ ] Production gateway base URL and allowed redirect hosts confirmed.
- [ ] Production callback URL supplied to and accepted by Belize Bank.
- [ ] `actiondiversbelize.com` verified in Resend.
- [ ] Production `FROM_EMAIL`, `TO_EMAIL`, and reply-to routing confirmed.
- [ ] Production secrets installed directly in Cloudflare; never committed to Git.
- [ ] Production D1 migrations and R2 binding verified.
- [ ] Cloudflare Access protects all `/admin-api/*` production routes.
- [ ] Production frontend origin is the only production CORS origin, apart from explicitly approved origins.
- [ ] Production deployment smoke-tested with `PAYMENTS_ENABLED=false`.
- [ ] Backup/rollback Worker version recorded.
- [ ] Staff verifies quote creation, customer portal access, and email delivery without starting a charge.
- [ ] A low-value live transaction is explicitly approved by the owner and Belize Bank.
- [ ] Live transaction, callback, reservation transition, and receipt independently reconciled.
- [ ] Refund/cancellation operations and staff responsibilities documented.
- [ ] Only after reconciliation: set production `PAYMENTS_ENABLED=true` and monitor the first transactions.

## Repository fixes produced during certification

- `930bf40` — corrected Belize Bank `returnUrl` request casing.
- `eec9500` — accepted the sandbox `formUrl` response casing.
- `4281fba` — added safe retry behavior after a decline.

