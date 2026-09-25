
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_TOURS } from '../constants';
import { Backpack, Check, CheckCircle2, Clock, DollarSign, Info, MapPin, PackageCheck, ShoppingBag, Users } from 'lucide-react';
import SEO, { SITE_URL } from '../components/SEO';
import { BLOG_POSTS } from '../data/blogPosts';
import { useBooking } from '../contexts/BookingContext';
import { catalogItemsForTour, formatUsd } from '../shared/bookingCatalog';

const TourDetail: React.FC = () => {
  const { id } = useParams();
  const tour = INITIAL_TOURS.find(t => t.id === id);
  const { catalog, addItem, hasItem } = useBooking();

  if (!tour) return (
    <div className="h-screen flex items-center justify-center bg-[#001219]">
      <SEO
        title="Tour Not Found"
        description="This Action Divers & Adventures tour could not be found."
        path={`/tour/${id || ''}`}
        noindex
      />
      <h2 className="text-4xl font-extrabold tracking-tight text-[#F8F4E8]">Tour not found.</h2>
    </div>
  );

  const relatedPosts = BLOG_POSTS.filter((post) => post.relatedTours.includes(tour.id)).slice(0, 3);
  const bookingOptions = catalogItemsForTour(tour.id, catalog);
  const tourStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: `${tour.name} in Belize`,
    description: tour.longDescription,
    image: `${SITE_URL}${tour.image}`,
    url: `${SITE_URL}/tour/${tour.id}`,
    touristType: ['Adventure travelers', 'Families', 'Belize visitors'],
    offers: tour.options?.length
      ? tour.options.map((option) => ({
          '@type': 'Offer',
          name: option.name,
          price: option.price,
          priceCurrency: 'USD',
          availability: tour.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          url: `${SITE_URL}/tour/${tour.id}`,
        }))
      : {
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
        <img src={tour.image} alt={tour.name} loading="eager" fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001219] to-transparent"></div>
        <div className="absolute bottom-20 left-0 right-0 max-w-7xl mx-auto px-4 text-center md:text-left">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.16em] text-[#F8F4E8]/85">{tour.subCategory || `${tour.category} Adventure`}</span>
          <h1 className="text-5xl font-extrabold tracking-[-0.035em] text-[#F8F4E8] sm:text-6xl md:text-8xl text-balance">{tour.name}</h1>
          {(tour.departureTime || tour.duration) && <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-[#F8F4E8]/90 md:justify-start">{tour.departureTime && <span>Departure: {tour.departureTime}</span>}{tour.duration && <span>Duration: {tour.duration}</span>}</div>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 text-[#F8F4E8]">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-extrabold tracking-tight mb-6 text-[#F8F4E8]">The Experience</h2>
              <p className="text-xl leading-relaxed text-[#F8F4E8]/80 font-light">
                {tour.longDescription}
              </p>
            </section>

            {tour.options && tour.options.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#06212a]">
                <div className="border-b border-white/10 px-6 py-6 sm:px-8">
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#F8F4E8]">Available Options</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F8F4E8]/65">
                    Published totals are shown in USD. Contact Action Divers to confirm availability and which option best fits your group.
                  </p>
                </div>
                <div className="divide-y divide-white/10">
                  {tour.options.map((option) => (
                    <div key={option.name} className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
                      <div className="max-w-2xl">
                        <h3 className="text-lg font-bold text-[#F8F4E8]">{option.name}</h3>
                        <p className="mt-2 leading-relaxed text-[#F8F4E8]/70">{option.description}</p>
                        {option.note && <p className="mt-2 text-sm font-semibold text-[#11C7D9]">{option.note}</p>}
                      </div>
                      <div className="shrink-0 sm:text-right">
                        <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#F8F4E8]/55">Published total</span>
                        <span className="mt-1 block text-2xl font-extrabold text-[#F8F4E8]">${option.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {bookingOptions.length > 0 && (
              <section id="booking-options" className="overflow-hidden rounded-2xl border border-white/10 bg-[#06212a]">
                <div className="border-b border-white/10 px-6 py-6 sm:px-8">
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#F8F4E8]">Add to your trip</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F8F4E8]/65">
                    Choose the option you want, then select its requested date in your reservation cart. Availability and final pricing are confirmed by staff.
                  </p>
                </div>
                <div className="divide-y divide-white/10">
                  {bookingOptions.map((option) => {
                    const added = hasItem(option.id);
                    return (
                      <div key={option.id} className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <div>
                          <h3 className="text-lg font-bold text-[#F8F4E8]">{option.name}</h3>
                          <p className="mt-1 text-sm text-[#F8F4E8]/60">
                            {formatUsd(option.priceCents)} · {option.pricingBasis === 'per_group' ? 'group rate' : 'per person'}{option.minimumPaidParticipants ? ` · minimum charge ${option.minimumPaidParticipants}` : ''}{option.maxParticipants ? ` · maximum ${option.maxParticipants} guests` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addItem(option)}
                          disabled={added}
                          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-orange)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-orange-light)] disabled:bg-white/10 disabled:text-[#F8F4E8]/65"
                        >
                          {added ? <Check className="mr-2 h-4 w-4" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
                          {added ? 'Added to trip' : 'Add to trip'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {tour.priceBreakdown && (
              <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                <div className="flex items-center space-x-3 mb-8">
                  <Info className="w-6 h-6 text-[#11C7D9]" />
                  <h3 className="text-2xl font-extrabold tracking-tight">Pricing Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-[#F8F4E8]/60 text-sm uppercase tracking-widest">Base Rate</span>
                    <span className="font-bold">${tour.priceBreakdown.base.toFixed(2)} USD</span>
                  </div>
                  {tour.priceBreakdown.gear && (
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-[#F8F4E8]/60 text-sm uppercase tracking-widest">Gear Rental</span>
                      <span className="font-bold">${tour.priceBreakdown.gear.toFixed(2)} USD</span>
                    </div>
                  )}
                  {tour.priceBreakdown.parkFee && (
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-[#F8F4E8]/60 text-sm uppercase tracking-widest">Park Entrance Fee</span>
                      <span className="font-bold">${tour.priceBreakdown.parkFee.toFixed(2)} USD</span>
                    </div>
                  )}
                  {tour.priceBreakdown.tax && (
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-[#F8F4E8]/60 text-sm uppercase tracking-widest">GST (Tax)</span>
                      <span className="font-bold">${tour.priceBreakdown.tax.toFixed(2)} USD</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4">
                    <span className="text-[#F8F4E8] font-bold text-lg uppercase tracking-[0.2em]">Estimated Total</span>
                    <span className="text-2xl font-bold text-[#F8F4E8]">${tour.price.toFixed(2)} USD</span>
                  </div>
                  {tour.priceBreakdown.note && (
                    <p className="mt-6 text-xs leading-relaxed text-[#11C7D9]">
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
                      <div className="mt-1 w-5 h-5 rounded-full bg-[#11C7D9]/30 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#F8F4E8]"></div>
                      </div>
                      <span className="text-lg text-[#F8F4E8]/90">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(tour.includes || tour.whatToBring) && (
              <section className="grid gap-6 md:grid-cols-2">
                {tour.includes && (
                  <div className="glass rounded-3xl p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <PackageCheck className="h-6 w-6 text-[#11C7D9]" />
                      <h3 className="text-2xl font-extrabold tracking-tight">What Is Included</h3>
                    </div>
                    <ul className="space-y-3 text-[#F8F4E8]/75">
                      {tour.includes.map((item) => <li key={item} className="flex gap-3"><span className="text-[#11C7D9]">•</span>{item}</li>)}
                    </ul>
                  </div>
                )}
                {tour.whatToBring && (
                  <div className="glass rounded-3xl p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <Backpack className="h-6 w-6 text-[#11C7D9]" />
                      <h3 className="text-2xl font-extrabold tracking-tight">What to Bring</h3>
                    </div>
                    <ul className="space-y-3 text-[#F8F4E8]/75">
                      {tour.whatToBring.map((item) => <li key={item} className="flex gap-3"><span className="text-[#11C7D9]">•</span>{item}</li>)}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {tour.beforeYouBook && tour.beforeYouBook.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-[#06212a] p-8">
                <h3 className="text-2xl font-extrabold tracking-tight">Before You Book</h3>
                <ul className="mt-6 space-y-3 text-[#F8F4E8]/75">
                  {tour.beforeYouBook.map((item) => <li key={item} className="flex gap-3"><span className="text-[#11C7D9]">•</span>{item}</li>)}
                </ul>
              </section>
            )}

            {relatedPosts.length > 0 && (
              <section className="glass p-10 rounded-3xl">
                <h3 className="text-2xl font-extrabold tracking-tight mb-8">Helpful Planning Guides</h3>
                <div className="space-y-5">
                  {relatedPosts.map((post) => (
                    <Link key={post.slug} to={`/blog/${post.slug}`} className="block p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-lg font-bold text-[#F8F4E8]">{post.title}</span>
                      <span className="block text-sm text-[#F8F4E8]/55 mt-2 leading-relaxed">{post.excerpt}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8">
            <div className="glass p-8 rounded-3xl sticky top-32 border border-[#F8F4E8]/10">
              <h3 className="text-2xl font-extrabold tracking-tight mb-6">Booking Details</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center text-[#F8F4E8]/70">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-green-400">Inquire for current availability</span>
                </div>
                <div className="flex items-center text-[#F8F4E8]/70">
                  <DollarSign className="w-5 h-5 mr-3 text-[#11C7D9]" />
                  <span>Starting at ${tour.price.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center text-[#F8F4E8]/70">
                  <Clock className="w-5 h-5 mr-3 text-[#11C7D9]" />
                  <span><strong className="text-[#F8F4E8]">Duration:</strong> {tour.duration || 'Confirmed with your request'}</span>
                </div>
                {tour.departureTime && <div className="flex items-center text-[#F8F4E8]/70">
                  <Clock className="w-5 h-5 mr-3 text-[#11C7D9]" />
                  <span><strong className="text-[#F8F4E8]">Departure:</strong> {tour.departureTime}</span>
                </div>}
                {tour.groupSize && <div className="flex items-center text-[#F8F4E8]/70">
                  <Users className="w-5 h-5 mr-3 shrink-0 text-[#11C7D9]" />
                  <span><strong className="text-[#F8F4E8]">Group size:</strong> {tour.groupSize}</span>
                </div>}
                {tour.meetingPickup && <div className="flex items-start text-[#F8F4E8]/70">
                  <MapPin className="mt-0.5 w-5 h-5 mr-3 shrink-0 text-[#11C7D9]" />
                  <span><strong className="text-[#F8F4E8]">Meeting / pickup:</strong> {tour.meetingPickup}</span>
                </div>}
              </div>

              <a
                href={bookingOptions.length ? '#booking-options' : '/reservations'}
                className="block w-full text-center bg-[var(--brand-orange)] text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[var(--brand-orange-light)] transition-all shadow-xl"
              >
                {bookingOptions.length ? 'Choose an Option' : 'Plan This Tour'}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
