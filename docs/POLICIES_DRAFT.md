# Action Divers website policies — draft for review

Updated September 25, 2026. **Draft pages, not published.** The owner supplied the
business name and cancellation policy below on September 25. These replace the
earlier proposed 48-hour policy. Remaining questions and proposed wording are
marked explicitly; the complete booking terms and privacy notice await review.

## Decisions for the owner

| Decision | Proposed wording / confirmation needed |
| --- | --- |
| Customer cancellations | Owner supplied: 100% refund at least 15 days before the tour date; date changes but no refund with less than 15 days and more than 36 hours' notice; neither with less than 36 hours. Draft treats exactly 36 hours as the date-change tier ("at least 36 hours"), the customer-favourable reading; owner to confirm. |
| Operator cancellations or modifications | Owner reserves the right to cancel or modify trips for weather, mechanical breakdowns and circumstances beyond the business's control. Owner confirmed: if we cancel, the customer chooses a new date or a full refund. Drafted to apply to a materially modified trip as well; confirm that extension. |
| Policy scope | Owner confirmed: the same policy applies across all services, with no exceptions. |
| Refund processing | Refunds go to the original card (standard card-network practice; confirm with Belize Bank). Proposed: refund started within 3 business days of approval, with bank posting time not guaranteed. Owner asked about 24 hours; not recommended unless staff can reliably meet it, including weekends and holidays. |
| Business identity | Owner confirmed: Action Divers and Adventures. Public phone confirmed: +501 671-2624. Confirm the address is La Perla Del Caribe, 5 miles north of San Pedro, Ambergris Caye, Belize. |
| Data handling | Confirm whether booking details are used for marketing, how long enquiry/booking records are kept, who handles deletion requests, and any sharing with tour/transport partners. Provider details can be checked technically; production AI selection remains to be finalized. |

## Draft: Booking terms

Action Divers and Adventures arranges diving, snorkeling, fishing, island activities,
mainland excursions, courses, and transfers from San Pedro, Ambergris Caye, Belize.
Contact us at info@actiondiversbelize.com or +501 671-2624.

Submitting a trip request lets our team check availability and prepare your quote.
It does not confirm a booking. Review the dates, participant numbers, activities,
inclusions, pickup arrangements, and total in your quote before paying. Contact us
if anything needs to change.

Website prices and cart totals are estimates until our team issues a quote.
The quote states the amount payable in US dollars and any applicable fees or
exclusions. Your card issuer may apply its own conversion rate or charges.
Pay only through the payment link provided for your reservation. Card details
are entered on Belize Bank's checkout page; please do not send them by email,
WhatsApp, or the website assistant.

Payment must be successfully verified before a reservation is marked paid.
If checkout reports a problem, contact us with your reservation reference before
making a separate payment. Your final trip arrangements are those confirmed by
our team. An expired quote or payment link requires a fresh availability check.

Tell us your party size accurately and confirm any activity-specific age,
certification, experience, or participation requirements before payment. Diving
activities may require medical screening and activity waivers. Please contact
staff directly about suitability questions; do not put sensitive medical details
in the website assistant. Participants must follow the guide's safety instructions.

Departure times, routes, and sites may change with weather, sea conditions,
availability, and safety requirements. Our team will communicate material changes
and explain the options available under the cancellation policy.

The cancellation and refund policy below applies to your booking.
Nothing in these terms removes rights that cannot lawfully be excluded.

## Draft: Cancellations and refunds

Owner-supplied terms, edited for punctuation and readability without changing the
notice periods or exclusions:

- Cancellations made 15 days or more before the tour date receive a 100% refund.
- For cancellations made less than 15 days but at least 36 hours before the tour
  date, we accept date changes but do not provide refunds.
- For cancellations made less than 36 hours before the tour date, no refunds or
  date changes are available.
- No refund is given for no-shows or any unused portion of the service agreement.
- No refund is given to anyone denied service for refusing to follow rules and
  regulations.

Action Divers and Adventures reserves the right to cancel or modify any trip due
to weather conditions, mechanical breakdowns, or circumstances beyond our control.
If we cancel or materially modify your trip, you may choose a new date or a full
refund.

This policy applies to all of our services.

Proposed contact instructions: to cancel or request a date change, email
info@actiondiversbelize.com or contact +501 671-2624 with your reservation reference.
Notice is measured against the confirmed departure time in Belize local time.

Approved refunds are returned to the original card. We will start your refund
within 3 business days of approval; your bank may take additional days to post it.

**Before publication: owner to confirm the 3-business-day refund timeframe, that
exactly 36 hours' notice falls in the date-change tier (as drafted), and the
contact and Belize-time notice wording.**

## Draft: Privacy notice

Action Divers and Adventures uses information you provide to answer enquiries,
prepare quotes, arrange activities, manage reservations and payments, and provide
customer support. **Before publication: insert the confirmed business address.**
Privacy questions can be sent to info@actiondiversbelize.com.

When you make an enquiry or trip request, we collect the details you submit,
such as your name, email address, telephone number, accommodation, requested
dates and activities, party size, and booking notes. We keep reservation, quote,
payment-status, and communication records needed to operate your booking.
Please provide information about other travellers only when you are authorized
to do so. A parent or responsible adult should arrange bookings for children.

Our website and service providers process technical information, such as IP
addresses and request logs, to deliver the site, prevent abuse, and investigate
errors. The booking cart stores selected activities and participant details in
your browser's local storage so the selection can be retained between visits.
You can clear this using your browser's site-data controls.

Cloudflare hosts the website and booking services. Resend delivers booking emails.
Belize Bank processes card payments on its own checkout page. The booking system
stores payment references, amounts, and status; it does not collect your full
card number or security code. Relevant guest details may also be shared with the
tour or transport providers arranging your requested service. These providers
may process information outside Belize.

The optional website assistant sends your questions and recent conversation
context to Google's Gemini service to generate replies. Do not include card
details, passwords, identity documents, medical information, or other sensitive
personal information. For booking-specific help, contact our staff directly.
**Before publication: confirm the Gemini project's data-use terms and add the
appropriate disclosure; do not promise that conversations are excluded from
model improvement unless the account settings and terms support that statement.**

**Preview implementation note, September 24: the branch preview now sends chat
to Cloudflare Workers AI, using a Cloudflare-hosted Gemma model. Production still
uses Gemini. If Workers AI is selected for production, replace the Gemini
description and review [Cloudflare's data-use terms](https://developers.cloudflare.com/workers-ai/platform/data-usage/)
before approving and publishing this notice.**

We use booking information for your requested services and related support.
**Before publication: confirm any separate marketing uses, analytics or advertising
tools, and consent choices; the source-code review alone does not establish all
dashboard-injected tracking or offline marketing practices.**

We retain information needed for bookings, accounting, disputes, and applicable
legal obligations. **Before publication: specify the actual retention periods or
criteria for enquiry records, completed bookings, payment records, and logs, and
implement the corresponding deletion process.**

Contact us to request access to or correction of your information, or to ask for
deletion or limits on its use. We may need to verify your identity and retain
certain records where required for legal obligations or an unresolved transaction.
We will explain any applicable limitations. We use access controls to restrict
staff access, but no internet service can guarantee complete security.

## Research and implementation notes

- Reviewed all 83 published WordPress pages and four posts on September 24, plus
  the 143-URL sitemap inventory and local repository. No general privacy, booking,
  or tour cancellation policy was located. This does not rule out unpublished or
  offline policies.
- The existing [golf-cart rental page](https://www.actiondiversbelize.com/golf-cart-rental/)
  contains rental-specific early-return and prepaid-fuel refund exclusions. They
  have not been generalized to tours or adopted in these drafts.
- Collection, browser storage, bank checkout, and email/assistant descriptions
  were checked against the current application source. Bank refund operations
  and retention automation have not been verified as implemented.
- [Google's Gemini terms](https://ai.google.dev/gemini-api/terms) distinguish paid
  and unpaid service data use; the account's billing status has not been inspected.
- Provider reference: [Resend privacy policy](https://resend.com/legal/privacy-policy).
  Its own website policies are not a substitute for Action Divers' notice.
- Legal review reference: [Belize Data Protection Act, 2021](https://www.nationalassembly.gov.bz/wp-content/uploads/2021/12/Act-No-45-of-2021-Data-Protection-Act.pdf).
  This draft does not assert a particular retention period or blanket legal compliance.
- After approval, publish `/privacy`, `/terms`, and `/cancellation-policy`; link
  them in the footer and relevant request/payment screens. Preserve the applicable
  policy version with bookings if implementing an acceptance requirement.
