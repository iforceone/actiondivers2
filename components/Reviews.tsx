import React from 'react';
import { Star } from 'lucide-react';
import { REVIEWS } from '../constants';
import RatingBadge from './RatingBadge';

const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?q=Action+Divers+and+Adventures+Reviews';

const reviewExcerpt = (text: string) => {
  const words = text.split(' ');
  return words.length > 55 ? `${words.slice(0, 55).join(' ')}…` : text;
};

const Reviews: React.FC = () => {
  return (
    <section className="py-24 bg-[#001219] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"></div>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#11C7D9]">Experiences from the Reef</p>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#F8F4E8]">Guest <span className="text-[#11C7D9]">Testimonials</span></h2>
          <div className="mt-8 flex justify-center"><RatingBadge variant="solid" /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {REVIEWS.map((review) => (
            <div key={review.id} className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-8 transition-colors duration-300 hover:border-[#F8F4E8]/20 md:p-10">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F8F4E8] rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <img 
                    src={review.profileImageUrl} 
                    alt={review.reviewerName}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 rounded-full border border-[#F8F4E8]/40 object-cover relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-[#F8F4E8] font-extrabold tracking-tight text-2xl tracking-wide">{review.reviewerName}</h4>
                  <div className="flex gap-1.5 mt-2">
                    {[...Array(review.starRating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#E9D8A6] text-[#E9D8A6]" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative flex-grow">
                <p className="text-[#F8F4E8]/75 font-light leading-relaxed text-sm md:text-base relative z-10">
                  “{reviewExcerpt(review.reviewText)}”
                </p>
                {review.reviewText.split(' ').length > 55 && (
                  <a
                    href={GOOGLE_REVIEWS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-[var(--brand-aqua)] underline decoration-[var(--brand-aqua)]/35 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-aqua)]"
                  >
                    Read Full Review
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
