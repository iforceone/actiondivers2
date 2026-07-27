# Action Divers & Adventures Project Backlog

## Payment and Reservation Flow

Recommended first release: **request to book, confirm availability, then collect payment**.

- [ ] Store reservation requests in a server-side database with a public reference number and internal status.
- [ ] Add staff workflow to confirm availability, party pricing, fees, deposit, and cancellation terms.
- [ ] Add a secure guest payment portal, opened from an expiring link sent after confirmation.
- [ ] Register each payment server-side with Belize Bank and redirect the guest to the bank-hosted payment form.
- [ ] Keep merchant credentials and signing details exclusively in Worker secrets; never expose them to React or the browser.
- [ ] Store the Belize Bank order ID against the reservation before redirecting the guest.
- [ ] Verify callback and return results server-side, make updates idempotent, and show a receipt/status page.
- [ ] Support deposit, balance, full-payment, refund, and reversal records with an audit trail.
- [ ] Add a staff payment-link tool for guests who reserved by phone, email, WhatsApp, or in person.
- [ ] Decide whether pre-authorization and later capture are operationally useful; do not make this the default without bank confirmation.
- [ ] Complete Belize Bank test-environment certification before enabling production payments.

Decisions still needed: merchant account credentials, final production domain, deposit rules, cancellation/refund policy, payment-link expiry, who can issue links, and whether prices shown include every tax and third-party fee.

## Airport Pickup and Transfers

- [ ] Confirm pickup locations, service area, and one-way/round-trip routes.
- [ ] Confirm passenger and luggage capacity, vehicle types, operating hours, and lead time.
- [ ] Set prices, taxes, waiting-time charges, child-seat policy, and cancellation/no-show rules.
- [ ] Decide whether transfers are standalone services, tour add-ons, or both.
- [ ] Collect flight number, arrival date/time, airline, passenger count, luggage, accommodation, and contact details.
- [ ] Prepare service copy, photographs, FAQs, and transfer confirmation messages.
- [ ] Add transfer availability and payment to the same reservation workflow after business rules are approved.

## Media and Content

- [ ] Move the remaining large gallery and tour images to Cloudinary with responsive formats and dimensions.
- [ ] Replace file-derived gallery captions with curated titles and descriptions for the strongest images.
- [ ] Confirm all departures, duration, minimum party sizes, inclusions, and age/fitness restrictions with Action Divers.
