import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { buildWhatsAppUrl } from '../config';

interface AssistantLauncherProps {
  /** Opens the Tour Assistant chat modal. */
  onOpen: () => void;
}

/**
 * The floating dock in the bottom-right corner: WhatsApp on the left,
 * Tour Assistant on the right.
 *
 * The two sit in one pill because they are one control surface — the whole
 * dock hides while the chat modal is open. TourAssistant owns that state and
 * decides when to render this.
 *
 * Tooltips exist because the two buttons look equivalent but aren't: one
 * reaches a person, the other answers instantly. They are hover/focus only,
 * so they don't appear on touch devices — the visible "Need help?" label and
 * the WhatsApp glyph carry the meaning there.
 */

// Shared pill tooltip. Hidden from assistive tech: each control's aria-label
// already says the same thing, and announcing both would be redundant.
const tooltip =
  'pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap ' +
  'rounded-full border border-white/10 bg-[#071820] px-3 py-1.5 shadow-xl ' +
  'text-[10px] font-bold uppercase tracking-widest text-[#F8F4E8] ' +
  'opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100';

const AssistantLauncher: React.FC<AssistantLauncherProps> = ({ onOpen }) => (
  <div className="fixed bottom-3 right-3 z-[40] sm:bottom-5 sm:right-5 md:bottom-8 md:right-8">
    <div className="flex flex-col items-center gap-1 rounded-full border border-white/10 bg-[#071820]/95 p-1.5 shadow-lg backdrop-blur-xl sm:flex-row sm:gap-2 sm:p-2">
      <div className="group relative">
        <a
          href={buildWhatsAppUrl('Hi Action Divers & Adventures! I would like help planning a Belize tour.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-12 sm:w-12"
          aria-label="Message a real person on WhatsApp"
        >
          <MessageCircle className="h-5 w-5" fill="currentColor" strokeWidth={1.5} />
        </a>
        <span aria-hidden="true" className={tooltip}>
          Message a real person
        </span>
      </div>

      <div className="group relative">
        <button
          onClick={onOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-aqua)] font-bold text-[#001219] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-12 sm:w-12"
          aria-label="Open the tour assistant for instant AI answers"
        >
          <Sparkles className="h-5 w-5" />
          <span className="sr-only">Tour Assistant</span>
        </button>
        <span aria-hidden="true" className={tooltip}>
          Instant answers from our AI
        </span>
      </div>
    </div>
  </div>
);

export default AssistantLauncher;
