import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '../config';

const DEFAULT_MESSAGE =
  "Hi Action Divers & Adventures! I'd like to ask about booking a Belize tour.";

/**
 * Site-wide floating WhatsApp click-to-chat button.
 * Pinned bottom-left so it never collides with the Tour Assistant (bottom-right).
 */
const WhatsAppButton: React.FC = () => (
  <a
    href={buildWhatsAppUrl(DEFAULT_MESSAGE)}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    title="Chat on WhatsApp"
    className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/30 hover:scale-110 active:scale-95 transition-transform"
  >
    <MessageCircle className="w-7 h-7" fill="currentColor" stroke="none" />
    <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40 animate-ping -z-10"></span>
  </a>
);

export default WhatsAppButton;
