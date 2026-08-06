# Action Divers & Adventures Launch Backlog

The public experience, reservation interfaces, staff dashboard, customer portal, and
Belize Bank workflow exist in code. External services remain deliberately gated. This
file tracks what must happen after owner and infrastructure decisions resume.

## Owner confirmation

- [ ] Approve current prices, fees, minimum billed quantities, and capacities.
- [ ] Confirm departure/check-in times and durations for the four regular dives.
- [ ] Confirm exact session hours for Refresher, Resort Course, and Scuba Discovery, plus the Advanced Open Water duration.
- [ ] Approve public contact/location wording and PADI instructor wording.
- [ ] Supply privacy, cancellation, refund, no-show, weather, and terms language.
- [ ] Approve staff email addresses and customer-data retention period.

## Reservation and staff launch

- [x] Create separate preview and production D1 databases and apply existing migrations.
- [x] Seed the production catalog from the current server-side catalog and verify empty customer/payment tables.
- [ ] Configure Cloudflare Access for approved staff and verify Worker-side JWT checks.
- [ ] Test acknowledgement, staff notification, quote, update, and receipt delivery.
- [ ] Enable reservations, then the staff portal, then the frontend submission flag.

## Payment launch

- [ ] Complete Belize Bank sandbox certification and callback testing.
- [ ] Confirm merchant settings, final payment expiry, and refund operations.
- [ ] Enable payments only after policies, reservations, staff access, and email monitoring are live.

## Domain and operations

- [ ] Acquire/confirm the final public domain before changing canonical URLs or CORS.
- [ ] Update DNS, origins, callbacks, sitemap, structured data, and email links together.
- [ ] Establish D1 export, monitoring, incident response, and rollback procedures.
