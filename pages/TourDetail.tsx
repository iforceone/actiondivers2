
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_TOURS } from '../constants';
import { MapPin, CheckCircle2, Calendar, DollarSign, Info } from 'lucide-react';
import SEO, { SITE_URL } from '../components/SEO';
import { BLOG_POSTS } from '../data/blogPosts';

const TourDetail: React.FC = () => {
  const { id } = useParams();
  const tour = INITIAL_TOURS.find(t => t.id === id);

  if (!tour) return (
    <div className="h-screen flex items-center justify-center bg-[#001219]">
      <SEO
        title="Tour Not Found"
        description="This Action Divers & Adventures tour could not be found."
        path={`/tour/${id || ''}`}
        noindex
      />
      <h2 className="text-4xl font-extrabold tracking-tight text-[#E9D8A6]">Tour not found.</h2>
    </div>
  );

  const relatedPosts = BLOG_POSTS.filter((post) => post.relatedTours.includes(tour.id)).slice(0, 3);
  const tourStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: `${tour.name} in Belize`,
    description: tour.longDescription,
    image: `${SITE_URL}${tour.image}`,
    url: `${SITE_URL}/tour/${tour.id}`,
    touristType: ['Adventure travelers', 'Families', 'Belize visitors'],
    offers: {
      '@type': 'Offer',
      price: tour.price,
      priceCurrency: 'USD',
      availability: tour.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: `${SITE_URL}/tour/${tour.id}`,
    },
    provider: {
      '@type': 'TouristBusiness',
      name: 'Action Divers & Adventures',
      url: SITE_URL,
      telephone: '011-501-671-2624',
    },
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: tour.category === 'island' ? 'Island Adventures' : 'Mainland Adventures',
        item: `${SITE_URL}/${tour.category === 'island' ? 'island-adventures' : 'mainland-adventures'}`,
      },
      { '@type': 'ListItem', position: 3, name: tour.name, item: `${SITE_URL}/tour/${tour.id}` },
    ],
  };

  return (
    <div className="pt-20">
      <SEO
        title={`${tour.name} in Belize`}
        description={`${tour.description} Book ${tour.name.toLowerCase()} with Action Divers & Adventures from San Pedro, Ambergris Caye.`}
        path={`/tour/${tour.id}`}
        image={tour.image}
        structuredData={[tourStructuredData, breadcrumbStructuredData]}
      />
      <div className="relative h-[60vh]">
        <img src={tour.image} alt={tour.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001219] to-transparent"></div>
        <div className="absolute bottom-20 left-0 right-0 max-w-7xl mx-auto px-4 text-center md:text-left">
          <span className="text-[#E9D8A6] uppercase tracking-[0.4em] text-xs block mb-4">{tour.category} Adventure</span>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-[#E9D8A6]">{tour.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 text-[#E9D8A6]">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-extrabold tracking-tight mb-6 text-[#E9D8A6]">The Experience</h2>
              <p className="text-xl leading-relaxed text-[#E9D8A6]/80 font-light">
                {tour.longDescription}
              </p>
            </section>

            {tour.priceBreakdown && (
              <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                <div className="flex items-center space-x-3 mb-8">
                  <Info className="w-6 h-6 text-[#005F73]" />
                  <h3 className="text-2xl font-extrabold tracking-tight">Pricing Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-[#E9D8A6]/60 text-sm uppercase tracking-widest">Base Rate</span>
                    <span className="font-bold">${tour.priceBreakdown.base.toFixed(2)} USD</span>
                  </div>
                  {tour.priceBreakdown.gear && (
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-[#E9D8A6]/60 text-sm uppercase tracking-widest">Gear Rental</span>
                      <span className="font-bold">${tour.priceBreakdown.gear.toFixed(2)} USD</span>
                    </div>
                  )}
                  {tour.priceBreakdown.parkFee && (
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-[#E9D8A6]/60 text-sm uppercase tracking-widest">Park Entrance Fee</span>
                      <span className="font-bold">${tour.priceBreakdown.parkFee.toFixed(2)} USD</span>
                    </div>
                  )}
                  {tour.priceBreakdown.tax && (
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-[#E9D8A6]/60 text-sm uppercase tracking-widest">GST (Tax)</span>
                      <span className="font-bold">${tour.priceBreakdown.tax.toFixed(2)} USD</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4">
                    <span className="text-[#E9D8A6] font-bold text-lg uppercase tracking-[0.2em]">Estimated Total</span>
                    <span className="text-2xl font-bold text-[#E9D8A6]">${tour.price.toFixed(2)} USD</span>
                  </div>
                  {tour.priceBreakdown.note && (
                    <p className="mt-6 text-[10px] text-[#E9D8A6]/40 uppercase tracking-widest text-[#48CAE4] leading-relaxed">
                      * {tour.priceBreakdown.note}
                    </p>
                  )}
                </div>
              </section>
            )}

            {tour.features && (
              <section className="glass p-10 rounded-3xl">
                <h3 className="text-2xl font-extrabold tracking-tight mb-8">Notable Highlights</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {tour.features.map((feature, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-[#005F73]/30 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#E9D8A6]"></div>
                      </div>
                      <span className="text-lg text-[#E9D8A6]/90">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {relatedPosts.length > 0 && (
              <section className="glass p-10 rounded-3xl">
                <h3 className="text-2xl font-extrabold tracking-tight mb-8">Helpful Planning Guides</h3>
                <div className="space-y-5">
                  {relatedPosts.map((post) => (
                    <Link key={post.slug} to={`/blog/${post.slug}`} className="block p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-lg font-bold text-[#E9D8A6]">{post.title}</span>
                      <span className="block text-sm text-[#E9D8A6]/55 mt-2 leading-relaxed">{post.excerpt}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8">
            <div className="glass p-8 rounded-3xl sticky top-32 border border-[#E9D8A6]/10">
              <h3 className="text-2xl font-extrabold tracking-tight mb-6">Booking Details</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center text-[#E9D8A6]/70">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-green-400">Inquire for current availability</span>
                </div>
                <div className="flex items-center text-[#E9D8A6]/70">
                  <DollarSign className="w-5 h-5 mr-3 text-[#005F73]" />
                  <span>Starting at ${tour.price.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center text-[#E9D8A6]/70">
                  <MapPin className="w-5 h-5 mr-3 text-[#005F73]" />
                  <span>5 miles north of San Pedro</span>
                </div>
                <div className="flex items-center text-[#E9D8A6]/70">
                  <Calendar className="w-5 h-5 mr-3 text-[#005F73]" />
                  <span>Daily departures</span>
                </div>
              </div>

              <Link 
                to="/reservations" 
                className="block w-full text-center bg-[var(--brand-orange)] text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[var(--brand-orange-light)] transition-all shadow-xl"
              >
                Inquire Now
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
