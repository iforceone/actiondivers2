// Central contact / integration config for Action Divers & Adventures.
// Update these values in one place.

export const CONTACT = {
  phoneDisplay: '011-501-671-2624',
  phoneTel: '0115016712624',
  // wa.me uses the full international number with no +, spaces, or dashes.
  whatsappNumber: '5016712624',
  email: 'reservations@actiondiversbelize.com',
  // POST endpoint for the reservations form — your standalone Cloudflare Worker
  // (see /worker-inquiry). After `wrangler deploy`, paste the Worker URL here, e.g.
  // 'https://actiondivers-inquiry.<your-subdomain>.workers.dev'.
  // The form falls back to WhatsApp/phone until this is set.
  inquiryEndpoint: 'https://REPLACE_WITH_INQUIRY_WORKER_URL',
};

export const isInquiryConfigured = () =>
  !CONTACT.inquiryEndpoint.includes('REPLACE_WITH_INQUIRY_WORKER_URL');

/** Build a wa.me deep link with a pre-filled message. */
export function buildWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export interface RatingSource {
  platform: string;
  /** Average rating, out of 5. */
  rating: number;
  /** Number of reviews. */
  count: number;
  /** Link to the reviews page (or null). */
  url: string | null;
}

// Real aggregate-rating figures. Add/remove sources here; the badge renders each.
// Leave the array empty to hide all social-proof badges.
export const SOCIAL_PROOF: RatingSource[] = [
  {
    platform: 'Google',
    rating: 4.8,
    count: 20,
    url: 'https://www.google.com/search?q=Action+Divers+and+Adventures+Reviews',
  },
  {
    platform: 'TripAdvisor',
    rating: 4.5,
    count: 67,
    url: 'https://www.tripadvisor.com/Attraction_Review-g291962-d3850160-Reviews-Action_Divers_and_Adventures-San_Pedro_Ambergris_Caye_Belize_Cayes.html',
  },
];
