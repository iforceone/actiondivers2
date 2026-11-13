import React from 'react';

const badge = 'h-6 w-10 shrink-0 rounded bg-white';

export const VisaMark: React.FC = () => (
  <svg viewBox="0 0 40 24" className={badge} role="img" aria-label="Visa">
    <text x="20" y="16.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontStyle="italic" fontWeight="900" fill="#1A1F71" letterSpacing="0.3">VISA</text>
  </svg>
);

export const MastercardMark: React.FC = () => (
  <svg viewBox="0 0 40 24" className={badge} role="img" aria-label="Mastercard">
    <circle cx="16" cy="12" r="7" fill="#EB001B" />
    <circle cx="24" cy="12" r="7" fill="#F79E1B" />
    <path d="M20 6.26a7 7 0 0 1 0 11.48 7 7 0 0 1 0-11.48z" fill="#FF5F00" />
  </svg>
);

/** "We accept" row shown under payment buttons. */
const CardBrands: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex flex-col items-center gap-2 ${className}`}>
    <div className="flex items-center gap-2">
      <VisaMark />
      <MastercardMark />
    </div>
    <p className="text-center text-xs text-[#F8F4E8]/55">Secure card payment processed by Belize Bank</p>
  </div>
);

export default CardBrands;
