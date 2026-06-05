import React from 'react';
import { Star } from 'lucide-react';
import { REVIEWS } from '../constants';

const Reviews: React.FC = () => {
  return (
    <section className="py-24 bg-[#001219] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"></div>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <p className="text-[#005F73] uppercase tracking-[0.4em] text-[10px] font-bold mb-4">Experiences from the Reef</p>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#E9D8A6]">Guest <span className="text-[#48CAE4]">Testimonials</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {REVIEWS.map((review) => (
            <div key={review.id} className="glass p-10 md:p-12 rounded-[3rem] border border-white/5 hover:border-[#E9D8A6]/20 transition-all duration-500 group flex flex-col h-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_rgba(0,18,25,0.8)]">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#E9D8A6] rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <img 
                    src={review.profileImageUrl} 
                    alt={review.reviewerName}
                    className="w-16 h-16 rounded-full border border-[#E9D8A6]/40 object-cover relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-[#E9D8A6] font-extrabold tracking-tight text-2xl tracking-wide">{review.reviewerName}</h4>
                  <div className="flex gap-1.5 mt-2">
                    {[...Array(review.starRating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#E9D8A6] text-[#E9D8A6] opacity-80" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative flex-grow">
                <p className="text-[#E9D8A6]/60 font-light leading-loose text-sm md:text-base relative z-10 text-[#48CAE4]">
                  "{review.reviewText}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
