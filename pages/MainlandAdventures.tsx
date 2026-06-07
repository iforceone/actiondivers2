
import React from 'react';
import { INITIAL_TOURS } from '../constants';
import { ArrowRight, Compass, Map, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const MainlandAdventures: React.FC = () => {
  const tours = INITIAL_TOURS.filter(t => t.category === 'mainland');

  return (
    <div className="pt-20 bg-[#001219]">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <img 
          src="/images/gallery/IMG_5824-e1673406815998-768x576.png" 
          alt="Belizean Jungle" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#001219]/80 via-transparent to-[#001219]"></div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <span className="text-[#E9D8A6]/60 text-xs font-bold tracking-[0.45em] uppercase mb-6 block">Belize Mainland Tours</span>
          <h1 className="text-6xl md:text-9xl font-extrabold tracking-tight mb-8 tracking-tight text-[#E9D8A6] leading-none">
            Mainland <br /> <span className="text-[#48CAE4]">Adventures</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-[#E9D8A6]/80 max-w-2xl mx-auto leading-relaxed">
            Visit Maya ruins, caves, rivers, and rainforest sites on full-day tours from Ambergris Caye.
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center">
        <Compass className="w-12 h-12 text-[#005F73] mx-auto mb-10 opacity-50" />
        <h2 className="text-4xl font-extrabold tracking-tight mb-8 text-[#E9D8A6]">The Soul of the Maya World</h2>
        <p className="text-xl text-[#E9D8A6]/70 leading-relaxed font-light">
          Belize is more than the reef. Mainland day trips connect you with Maya history, cave tubing, zip-lining, river journeys, and rainforest scenery, with logistics handled from San Pedro.
        </p>
      </section>

      {/* Tours List */}
      <section className="pb-40 px-6 max-w-7xl mx-auto space-y-32">
        {tours.map((tour, index) => (
          <div key={tour.id} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}>
            {/* Image Side */}
            <div className="w-full lg:w-1/2 relative group">
              <div className="absolute -inset-4 bg-[#005F73]/10 rounded-[3rem] blur-2xl group-hover:bg-[#005F73]/20 transition-all duration-700"></div>
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img 
                  src={tour.image} 
                  alt={tour.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001219]/40 to-transparent"></div>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="inline-flex items-center space-x-3 text-[#005F73]">
                <Map className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Mainland Discovery</span>
              </div>
              <h3 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#E9D8A6]">{tour.name}</h3>
              <p className="text-lg text-[#E9D8A6]/70 leading-relaxed font-light">
                {tour.description}
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="glass p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-[#E9D8A6]/40 mb-2">Duration</p>
                  <p className="text-[#E9D8A6] font-medium">Full Day Tour</p>
                </div>
                <div className="glass p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-[#E9D8A6]/40 mb-2">Departures</p>
                  <p className="text-[#E9D8A6] font-medium">Daily from 6:00 AM</p>
                </div>
              </div>
              <div className="pt-8 flex items-center space-x-8">
                <Link 
                  to={`/tour/${tour.id}`} 
                  className="bg-[var(--brand-orange)] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[var(--brand-orange-light)] transition-all transform hover:-translate-y-1"
                >
                  View Tour
                </Link>
                <Link 
                  to="/reservations" 
                  className="text-[#E9D8A6]/60 hover:text-[#E9D8A6] text-xs font-bold uppercase tracking-[0.2em] flex items-center group transition-colors"
                >
                  Inquire Now <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="py-32 bg-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-5xl font-extrabold tracking-tight text-[#E9D8A6]">Plan a <span className="text-[#48CAE4]">Mainland Day</span></h2>
          <p className="text-[#E9D8A6]/60 text-xl font-light leading-relaxed">
            Mainland tours start early and run most of the day. Contact us with your travel dates and group size so we can help choose the right route.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <div className="flex items-center justify-center space-x-3 text-[#E9D8A6]/40">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Early Booking Recommended</span>
            </div>
            <div className="h-px w-12 bg-white/10 self-center hidden sm:block"></div>
            <div className="flex items-center justify-center space-x-3 text-[#E9D8A6]/40">
              <Compass className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Licensed Local Guides</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainlandAdventures;
