import React from 'react';
import { Star } from 'lucide-react';
import { SOCIAL_PROOF } from '../config';

interface RatingBadgeProps {
  /** 'light' for dark backgrounds (default), 'solid' for a glass pill */
  variant?: 'light' | 'solid';
  className?: string;
}

/**
 * Aggregate-rating social-proof badges.
 * Renders one pill per configured source in SOCIAL_PROOF (config.ts).
 * Renders nothing if the list is empty — no fabricated numbers.
 */
const RatingBadge: React.FC<RatingBadgeProps> = ({ variant = 'light', className = '' }) => {
  if (!SOCIAL_PROOF.length) return null;

  const wrapper =
    variant === 'solid'
      ? 'glass border border-white/10'
      : 'bg-white/5 border border-white/10';

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      {SOCIAL_PROOF.map((src) => {
        const pill = (
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${wrapper}`}>
            <span className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.round(src.rating) ? 'fill-[#E9D8A6] text-[#E9D8A6]' : 'text-white/20'}`}
                />
              ))}
            </span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#F8F4E8]">
              {src.rating.toFixed(1)}
              <span className="text-[#F8F4E8]/60 font-medium"> · {src.count}+ {src.platform} reviews</span>
            </span>
          </span>
        );

        return src.url ? (
          <a
            key={src.platform}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${src.rating} star ${src.platform} rating from ${src.count} reviews`}
            className="hover:opacity-90 transition-opacity"
          >
            {pill}
          </a>
        ) : (
          <React.Fragment key={src.platform}>{pill}</React.Fragment>
        );
      })}
    </div>
  );
};

export default RatingBadge;
