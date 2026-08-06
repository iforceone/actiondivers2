
import React, { useState } from 'react';
import { Anchor, Shield, BadgeDollarSign, ArrowRight } from 'lucide-react';
import { INITIAL_TOURS } from '../constants';
import { Link } from 'react-router-dom';
import TourSearch from '../components/TourSearch';
import Reviews from '../components/Reviews';
import RatingBadge from '../components/RatingBadge';
import { BLOG_POSTS } from '../data/blogPosts';

const Home: React.FC = () => {
  const [filteredTours, setFilteredTours] = useState(INITIAL_TOURS);
  const featuredTourIds = [
    'scuba-diving',
    'hol-chan-shark-ray-alley',
    'fishing',
    'caye-caulker-manatee',
    'altun-ha-cave-tubing',
    'cave-tubing-ziplining',
  ];
  const visibleTours = filteredTours.length === INITIAL_TOURS.length
    ? featuredTourIds.map((id) => INITIAL_TOURS.find((tour) => tour.id === id)).filter((tour): tour is (typeof INITIAL_TOURS)[number] => Boolean(tour))
    : filteredTours.slice(0, 6);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100svh-5rem)] items-center justify-center overflow-hidden py-12 md:h-[90vh] md:min-h-0 md:py-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-1000"
          poster="/images/gallery/Boat-out-at-sea.jpg"
        >
          <source src="https://res.cloudinary.com/dmmtiqunw/video/upload/q_auto/f_auto/v1780760922/belize-dive-adventure_arycfl.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-b from-[#001219]/70 via-transparent to-[#001219]"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.32em] text-white/85">
            San Pedro, Ambergris Caye Dive Shop & Tour Operator
          </p>
          <h1 className="mb-6 text-[46px] font-black leading-[0.98] tracking-[-0.035em] text-white drop-shadow-lg md:text-8xl md:leading-tight md:tracking-tighter">
            Dive, Explore, <br className="hidden md:block" /><span className="text-[var(--brand-orange)]">Experience Belize</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg font-medium leading-relaxed text-white/90 drop-shadow-md md:mb-10 md:max-w-2xl md:text-2xl">
            Scuba diving, snorkeling, fishing, and island adventures from San Pedro with friendly local guides and personal service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/island-adventures" className="bg-[var(--brand-orange)] text-white px-8 md:px-10 py-4 rounded-full font-bold uppercase tracking-[0.12em] hover:bg-[var(--brand-orange-light)] shadow-lg shadow-orange-950/30 transition-colors text-center">
              Explore Tours
            </Link>
            <Link to="/reservations" className="bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-[#003049] transition-all border border-white/30 shadow-lg text-center">
              Plan Your Trip
            </Link>
          </div>
          <div className="hidden md:block">
            <RatingBadge className="mt-7" />
            <p className="mt-6 text-sm font-semibold text-white/80">
              Tour desk located 5 miles north of San Pedro at La Perla Del Caribe.
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 py-7 text-center md:hidden">
        <RatingBadge />
        <p className="mx-auto mt-4 max-w-sm text-sm font-semibold leading-relaxed text-[#F8F4E8]/75">
          Tour desk located 5 miles north of San Pedro at La Perla Del Caribe.
        </p>
      </div>

      {/* Search Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <TourSearch onToursFiltered={setFilteredTours} />
      </section>

      {/* Tour Grid Section */}
      <section className="pb-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="pt-20 pb-12 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#11C7D9]">Matching Tours</p>
            <h2 className="text-5xl font-extrabold tracking-tight text-white">Choose Your <span className="text-[#11C7D9]">Adventure</span></h2>
          </div>
          {filteredTours.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleTours.map(tour => (
              <Link key={tour.id} to={`/tour/${tour.id}`} className="group relative block h-[320px] overflow-hidden rounded-2xl border border-white/10 shadow-xl transition-colors hover:border-[#11C7D9]/50 sm:h-[360px] lg:h-[400px]">
                <img src={tour.image} alt={`${tour.name} - ${tour.description}`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001219] via-[#001219]/40 to-transparent group-hover:via-[#001219]/60 transition-all"></div>
                
                <div className="absolute bottom-0 left-0 right-0 translate-y-0 p-7 transition-transform duration-500 md:translate-y-4 md:group-hover:translate-y-0 md:p-8">
                <span className="mb-3 inline-block rounded-full bg-[var(--brand-orange)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">{tour.category}</span>
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-2">{tour.name}</h3>
                  <div className="flex items-center text-[#11C7D9] opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100">
                    <span className="text-sm font-bold tracking-widest uppercase mr-2">View Experience</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
            </Link>
            ))}
            </div>
          ) : (
            <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
              <h3 className="text-3xl font-extrabold tracking-tight text-white mb-4">No exact match yet</h3>
              <p className="text-[#F8F4E8]/65 leading-relaxed mb-8">
                Try a broader search, raise the max price, or send us a note and we can help shape the right Belize day.
              </p>
              <Link to="/reservations" className="inline-flex justify-center items-center bg-[var(--brand-orange)] text-white px-8 py-4 rounded-full font-bold tracking-widest uppercase hover:bg-[var(--brand-orange-light)] transition-colors">
                Ask Us to Customize It
              </Link>
            </div>
          )}
          <div className="mt-16 flex flex-col sm:flex-row justify-center gap-6 px-4">
            <Link to="/island-adventures" className="inline-flex justify-center items-center bg-[var(--brand-orange)] text-white px-8 py-5 rounded-full font-bold tracking-widest uppercase hover:bg-[var(--brand-orange-light)] shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              Explore Island Tours <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/mainland-adventures" className="inline-flex justify-center items-center bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-5 rounded-full font-bold tracking-widest uppercase hover:bg-white hover:text-[#001219] shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              Explore Mainland Tours <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Guides Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#11C7D9]">Belize Travel Guides</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Plan the Right Adventure</h2>
          </div>
          <Link to="/blog" className="inline-flex items-center text-[#F8F4E8]/60 hover:text-[#F8F4E8] text-xs font-bold uppercase tracking-[0.25em]">
            View All Guides <ArrowRight className="ml-3 w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {BLOG_POSTS.slice(0, 3).map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition-colors hover:border-[#11C7D9]/40">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={post.image} alt={post.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="p-7">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#11C7D9]">{post.date}</p>
                <h3 className="text-2xl font-extrabold tracking-tight text-white mb-4 leading-tight">{post.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 md:p-10">
            <Anchor className="w-12 h-12 text-[#11C7D9] mx-auto mb-6" />
            <h3 className="text-2xl font-bold tracking-tight mb-4 text-white">Real Belize Experiences</h3>
            <p className="text-white/70 leading-relaxed font-medium">
              We focus on what matters: exploring the breathtaking beauty of the Belizean Caribbean with expert guides who know the waters.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 md:p-10">
            <Shield className="w-12 h-12 text-[#11C7D9] mx-auto mb-6" />
            <h3 className="text-2xl font-bold tracking-tight mb-4 text-white">Highly Personal Service</h3>
            <p className="text-white/70 leading-relaxed font-medium">
              Skip the crowded boats. We cater to small groups, ensuring your day on the water is flexible, safe, and tailored exactly to you.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 md:p-10">
            <BadgeDollarSign className="w-12 h-12 text-[#11C7D9] mx-auto mb-6" />
            <h3 className="text-2xl font-bold tracking-tight mb-4 text-white">Memorable Days on the Water</h3>
            <p className="text-white/70 leading-relaxed font-medium">
              From reeling in a big catch to drifting over vibrant reefs, these are the kinds of Belize adventures guests remember long after returning home.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <Reviews />
    </div>
  );
};

export default Home;
