
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
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-tight text-white drop-shadow-lg">
            Dive, Explore, <br className="hidden md:block" /><span className="text-[#F4A261]">Experience Belize</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Real Belize experiences with personalized service. From world-class reef dives to unforgettable island escapes, your adventure starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/island-adventures" className="bg-[#F4A261] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#E76F51] shadow-lg transition-all transform hover:-translate-y-1 text-center">
              Explore Tours
            </Link>
            <Link to="/reservations" className="bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-[#003049] transition-all border border-white/30 shadow-lg text-center">
              Book Your Adventure
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
          <div className="glass p-10 rounded-3xl transform transition-transform hover:-translate-y-2 border border-white/10 hover:border-white/20">
            <Anchor className="w-12 h-12 text-[#48CAE4] mx-auto mb-6" />
            <h3 className="text-2xl font-bold tracking-tight mb-4 text-white">Real Belize Experiences</h3>
            <p className="text-white/70 leading-relaxed font-medium">
              We focus on what matters: exploring the breathtaking beauty of the Belizean Caribbean with expert guides who know the waters.
            </p>
          </div>
          <div className="glass p-10 rounded-3xl transform transition-transform hover:-translate-y-2 border border-white/10 hover:border-white/20">
            <Shield className="w-12 h-12 text-[#48CAE4] mx-auto mb-6" />
            <h3 className="text-2xl font-bold tracking-tight mb-4 text-white">Highly Personal Service</h3>
            <p className="text-white/70 leading-relaxed font-medium">
              Skip the crowded boats. We cater to small groups, ensuring your day on the water is flexible, safe, and tailored exactly to you.
            </p>
          </div>
          <div className="glass p-10 rounded-3xl transform transition-transform hover:-translate-y-2 border border-white/10 hover:border-white/20">
            <BadgeDollarSign className="w-12 h-12 text-[#48CAE4] mx-auto mb-6" />
            <h3 className="text-2xl font-bold tracking-tight mb-4 text-white">Memorable Days on the Water</h3>
            <p className="text-white/70 leading-relaxed font-medium">
              From reeling in a big catch to drifting over vibrant reefs, we guarantee an adventure you'll talk about long after you return home.
            </p>
          </div>
        </div>
      </section>

      {/* Tour Grid Section */}
      <section className="py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-extrabold tracking-tight text-center mb-16 text-white">Choose Your <span className="text-[#48CAE4]">Adventure</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.slice(0, 6).map(tour => (
              <Link key={tour.id} to={`/tour/${tour.id}`} className="group relative h-[400px] overflow-hidden rounded-3xl block shadow-2xl border border-white/10 hover:border-[#48CAE4]/50 transition-colors">
                <img src={tour.image} alt={`${tour.name} - ${tour.description}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001219] via-[#001219]/40 to-transparent group-hover:via-[#001219]/60 transition-all"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <span className="inline-block bg-[#F4A261] text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-3 font-bold">{tour.category}</span>
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-2">{tour.name}</h3>
                  <div className="flex items-center text-[#48CAE4] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-sm font-bold tracking-widest uppercase mr-2">View Experience</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
            </Link>
          ))}
          </div>
          <div className="mt-16 flex flex-col sm:flex-row justify-center gap-6 px-4">
            <Link to="/island-adventures" className="inline-flex justify-center items-center bg-[#F4A261] text-white px-8 py-5 rounded-full font-bold tracking-widest uppercase hover:bg-[#E76F51] shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              Explore Island Tours <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/mainland-adventures" className="inline-flex justify-center items-center bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-5 rounded-full font-bold tracking-widest uppercase hover:bg-white hover:text-[#001219] shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              Explore Mainland Tours <ArrowRight className="ml-2 w-5 h-5" />
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
