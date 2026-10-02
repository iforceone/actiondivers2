import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { CONTACT } from '../config';

const LAST_UPDATED = 'October 1, 2026';

const PolicyLayout: React.FC<{
  title: string;
  description: string;
  path: string;
  intro?: string;
  children: React.ReactNode;
}> = ({ title, description, path, intro, children }) => (
  <main className="min-h-screen bg-[#001219] px-6 pb-24 pt-36 text-[#F8F4E8] sm:pt-44">
    <SEO title={title} description={description} path={path} />
    <article className="mx-auto max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#11C7D9]">Action Divers & Adventures</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.035em] sm:text-6xl">{title}</h1>
      <p className="mt-3 text-sm text-[#F8F4E8]/55">Last updated {LAST_UPDATED}</p>
      {intro && <p className="mt-8 text-lg font-light leading-relaxed text-[#F8F4E8]/80">{intro}</p>}
      <div className="mt-10 space-y-6 text-lg font-light leading-relaxed text-[#F8F4E8]/75 [&_a]:text-[#8DE7EF] [&_a]:underline [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-[#F8F4E8] [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-6">
        {children}
      </div>
      <nav className="mt-14 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-8 text-sm font-semibold" aria-label="Policies">
        <Link to="/terms" className="text-[#8DE7EF] hover:text-white">Booking Terms</Link>
        <Link to="/cancellation-policy" className="text-[#8DE7EF] hover:text-white">Cancellation & Refund Policy</Link>
        <Link to="/privacy" className="text-[#8DE7EF] hover:text-white">Privacy Notice</Link>
      </nav>
    </article>
  </main>
);

const ContactLine: React.FC = () => (
  <>
    <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or phone/WhatsApp{' '}
    <a href={`tel:${CONTACT.phoneTel}`}>{CONTACT.phoneDisplay}</a>
  </>
);

export const CancellationPolicyPage: React.FC = () => (
  <PolicyLayout
    title="Cancellation & Refund Policy"
    description="Action Divers & Adventures cancellation, date-change, and refund policy for tours, courses, charters, and transfers in San Pedro, Belize."
    path="/cancellation-policy"
    intro="This policy applies to all of our services. Notice is measured against the confirmed departure time in Belize local time."
  >
    <h2>If you cancel</h2>
    <ul>
      <li><strong className="font-semibold text-[#F8F4E8]">15 days or more</strong> before the tour date: 100% refund.</li>
      <li><strong className="font-semibold text-[#F8F4E8]">Less than 15 days but at least 36 hours</strong> before the tour date: we accept date changes, but do not provide refunds.</li>
      <li><strong className="font-semibold text-[#F8F4E8]">Less than 36 hours</strong> before the tour date: no refunds and no date changes.</li>
      <li>No refund is given for no-shows or for any unused portion of the service agreement.</li>
      <li>No refund is given to anyone who is denied service because of refusal to follow rules and regulations.</li>
    </ul>

    <h2>If we cancel or change your trip</h2>
    <p>
      We reserve the right to cancel or modify any trip because of weather conditions, mechanical breakdowns, or
      circumstances beyond our control. If we cancel or materially modify your trip, you may choose a new date or a full refund.
    </p>

    <h2>How to cancel or change a date</h2>
    <p>
      Contact us with your reservation reference at <ContactLine />.
    </p>

    <h2>How refunds are paid</h2>
    <p>
      Approved refunds are returned to the original card. We will start your refund within 3 business days of approval;
      your bank may take additional days to post it.
    </p>
  </PolicyLayout>
);

export const TermsPage: React.FC = () => (
  <PolicyLayout
    title="Booking Terms"
    description="Booking terms for Action Divers & Adventures diving, snorkeling, fishing, island, and mainland tours, courses, and transfers in San Pedro, Belize."
    path="/terms"
    intro="Action Divers & Adventures arranges diving, snorkeling, fishing, island activities, mainland excursions, courses, and transfers from San Pedro, Ambergris Caye, Belize."
  >
    <h2>Requests, quotes, and payment</h2>
    <p>
      Submitting a trip request lets our team check availability and prepare your quote. It does not confirm a booking.
      Review the dates, participant numbers, activities, inclusions, pickup arrangements, and total in your quote before
      paying. Contact us if anything needs to change.
    </p>
    <p>
      Website prices and cart totals are estimates until our team issues a quote. The quote states the amount payable in
      US dollars and any applicable fees or exclusions. Your card issuer may apply its own conversion rate or charges.
    </p>
    <p>
      Pay only through the payment link provided for your reservation. Card details are entered on Belize Bank's checkout
      page; please do not send them by email, WhatsApp, or the website assistant. Payment must be successfully verified
      before a reservation is marked paid. If checkout reports a problem, contact us with your reservation reference
      before making a separate payment. Your final trip arrangements are those confirmed by our team. An expired quote or
      payment link requires a fresh availability check.
    </p>

    <h2>Participants and safety</h2>
    <p>
      Tell us your party size accurately and confirm any activity-specific age, certification, experience, or participation
      requirements before payment. Diving activities may require medical screening and activity waivers. Please contact
      staff directly about suitability questions, and do not put sensitive medical details in the website assistant.
      Participants must follow the guide's safety instructions.
    </p>

    <h2>Changes to your trip</h2>
    <p>
      Departure times, routes, and sites may change with weather, sea conditions, availability, and safety requirements.
      Our team will communicate material changes and explain your options under our{' '}
      <Link to="/cancellation-policy">Cancellation & Refund Policy</Link>, which applies to your booking.
    </p>

    <h2>Your rights</h2>
    <p>Nothing in these terms removes rights that cannot lawfully be excluded.</p>

    <h2>Contact</h2>
    <p>
      <ContactLine />.
    </p>
  </PolicyLayout>
);

export const PrivacyPage: React.FC = () => (
  <PolicyLayout
    title="Privacy Notice"
    description="How Action Divers & Adventures collects, uses, and protects information submitted for tour enquiries, reservations, and payments."
    path="/privacy"
    intro="Action Divers & Adventures uses information you provide to answer enquiries, prepare quotes, arrange activities, manage reservations and payments, and provide customer support."
  >
    <h2>What we collect</h2>
    <p>
      When you make an enquiry or trip request, we collect the details you submit, such as your name, email address,
      telephone number, accommodation, requested dates and activities, party size, and booking notes. We keep
      reservation, quote, payment-status, and communication records needed to operate your booking. Please provide
      information about other travellers only when you are authorized to do so. A parent or responsible adult should
      arrange bookings for children.
    </p>
    <p>
      Our website and service providers process technical information, such as IP addresses and request logs, to deliver
      the site, prevent abuse, and investigate errors. The booking cart stores selected activities and participant details
      in your browser's local storage so your selection can be kept between visits. You can clear this using your
      browser's site-data controls.
    </p>

    <h2>Who handles your information</h2>
    <p>
      Cloudflare hosts the website and booking services, and an email service delivers booking emails. Belize Bank
      processes card payments on its own checkout page. Our booking system stores payment references, amounts, and
      status; it does not collect your full card number or security code. Relevant guest details may also be shared with
      the tour or transport providers arranging your requested service. These providers may process information outside
      Belize.
    </p>

    <h2>Website assistant</h2>
    <p>
      Our optional website assistant, Kaptin Kai, is AI-powered: its replies are generated by an AI service, not written by
      a person, and it can make mistakes. It sends your questions and recent conversation to that service to generate
      replies. For bookings, changes, or anything urgent, message Roberto directly on WhatsApp. Do not include card details, passwords, identity documents, medical information, or other sensitive personal
      information. For booking-specific help, contact our staff directly.
    </p>

    <h2>How we use and keep information</h2>
    <p>
      We use booking information for your requested services and related support. We keep information needed for
      bookings, accounting, disputes, and applicable legal obligations.
    </p>

    <h2>Your choices</h2>
    <p>
      Contact us to request access to or correction of your information, or to ask for deletion or limits on its use. We
      may need to verify your identity and retain certain records where required for legal obligations or an unresolved
      transaction, and we will explain any limitations. We use access controls to restrict staff access, but no internet
      service can guarantee complete security.
    </p>

    <h2>Contact</h2>
    <p>
      Privacy questions can be sent to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
    </p>
  </PolicyLayout>
);
