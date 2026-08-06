// Central contact / integration config for Action Divers & Adventures.
// Update these values in one place.

export const CONTACT = {
  phoneDisplay: '011-501-671-2624',
  phoneTel: '0115016712624',
  // wa.me uses the full international number with no +, spaces, or dashes.
  whatsappNumber: '5016712624',
  // Must be a real mailbox — this is published in the footer, on the
  // reservations page, and in JSON-LD that search engines surface.
  email: 'info@actiondiversbelize.com',
};

// Base URL of the site API Worker (see /worker-api). After `wrangler deploy`,
// paste the Worker URL here, e.g. 'https://actiondivers-api.<subdomain>.workers.dev'.
// No trailing slash. Until this is set the reservations form falls back to
// WhatsApp/phone and the Tour Assistant returns its offline message.
const API_BASE_URL = 'https://actiondivers-api.davebze.workers.dev';

export const API = {
  baseUrl: API_BASE_URL,
  isConfigured: () => {
    try {
      const url = new URL(API_BASE_URL);
      return url.protocol === 'https:' && Boolean(url.hostname);
    } catch {
      return false;
    }
  },
  /** url('/inquiry') -> 'https://.../inquiry' */
  url: (path: string) => `${API_BASE_URL.replace(/\/$/, '')}${path}`,
};

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
