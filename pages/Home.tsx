
import React, { useState } from 'react';
import { Anchor, Shield, BadgeDollarSign, ArrowRight } from 'lucide-react';
import { INITIAL_TOURS } from '../constants';
import { Link } from 'react-router-dom';
import TourSearch from '../components/TourSearch';
import Reviews from '../components/Reviews';

const Home: React.FC = () => {
  const [filteredTours, setFilteredTours] = useState(INITIAL_TOURS);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-1000"
          poster="/images/gallery/Boat-out-at-sea.jpg"
        >
          <source src="https://new1.actiondiversbelize.com/media/hero1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-b from-[#001219]/70 via-transparent to-[#001219]"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-6xl md:text-8xl serif mb-6 tracking-tight leading-tight text-[#E9D8A6]">
            First Class <span className="italic text-[#E9D8A6]">Adventures</span>
          </h1>
          <p className="text-xl md:text-2xl font-light mb-10 text-[#E9D8A6]/90 max-w-2xl mx-auto leading-relaxed">
            Action Divers & Adventures offers unforgettable luxury expeditions in the heart of the Belizean Caribbean.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/island-adventures" className="bg-[#E9D8A6] text-[#001219] px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all transform hover:-translate-y-1 text-center">
              Explore Tours
            </Link>
            <Link to="/reservations" className="glass text-[#E9D8A6] px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all border border-white/20 text-center">
              Book Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <TourSearch onToursFiltered={setFilteredTours} />
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="glass p-10 rounded-3xl transform transition-hover hover:-translate-y-2">
            <Anchor className="w-12 h-12 text-[#005F73] mx-auto mb-6" />
            <h3 className="text-2xl serif mb-4 text-[#E9D8A6]">First Class Adventures</h3>
            <p className="text-[#E9D8A6]/70 leading-relaxed font-light">
              We offer only premier Belizean expeditions. Be confident that your adventure will be unforgettable and enjoyable.
            </p>
          </div>
          <div className="glass p-10 rounded-3xl transform transition-hover hover:-translate-y-2">
            <Shield className="w-12 h-12 text-[#005F73] mx-auto mb-6" />
            <h3 className="text-2xl serif mb-4 text-[#E9D8A6]">Friendly Service</h3>
            <p className="text-[#E9D8A6]/70 leading-relaxed font-light">
              We want you to feel at home and relaxed. We make friends with our customers and they keep coming back for our friendly service!
            </p>
          </div>
          <div className="glass p-10 rounded-3xl transform transition-hover hover:-translate-y-2">
            <BadgeDollarSign className="w-12 h-12 text-[#005F73] mx-auto mb-6" />
            <h3 className="text-2xl serif mb-4 text-[#E9D8A6]">Competitive Rates</h3>
            <p className="text-[#E9D8A6]/70 leading-relaxed font-light">
              Action Divers offers competitive rates to suit your vacation budget without compromising on luxury.
            </p>
          </div>
        </div>
      </section>

      {/* Tour Grid Section */}
      <section className="py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl serif text-center mb-16 text-[#E9D8A6]">Curated <span className="italic">Excursions</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.slice(0, 6).map(tour => (
              <Link key={tour.id} to={`/tour/${tour.id}`} className="group relative h-[400px] overflow-hidden rounded-3xl block shadow-2xl">
                <img src={tour.image} alt={`${tour.name} - ${tour.description}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#E9D8A6]/80 block mb-2 font-bold">{tour.category} expedition</span>
                  <h3 className="text-3xl serif text-white mb-2">{tour.name}</h3>
                  <div className="flex items-center text-[#E9D8A6] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-sm font-bold tracking-widest uppercase mr-2">View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link to="/island-adventures" className="inline-flex items-center text-[#E9D8A6] border-b border-[#E9D8A6]/30 pb-2 text-sm font-bold tracking-[0.3em] uppercase hover:text-white hover:border-white transition-all">
              Discover All Adventures <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <Reviews />
    </div>
  );
};

export default Home;
