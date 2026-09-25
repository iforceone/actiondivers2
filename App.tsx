
/// <reference types="vite/client" />

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TourAssistant from './components/TourAssistant';
import Home from './pages/Home';
import TourDetail from './pages/TourDetail';
import About from './pages/About';
import MainlandAdventures from './pages/MainlandAdventures';
import IslandAdventures from './pages/IslandAdventures';
import Courses from './pages/Courses';
import TransfersCharters from './pages/TransfersCharters';
import ServiceRequest from './pages/ServiceRequest';
import VoyageChronicles from './pages/VoyageChronicles';
import BlogPostPage from './pages/BlogPost';
import NotFound from './pages/NotFound';
import ReservationCartPage from './pages/Reservations';
import { Loader2 } from 'lucide-react';
import SEO, { SITE_URL } from './components/SEO';
import { INITIAL_TOURS } from './constants';
import { BLOG_POSTS } from './data/blogPosts';
import { CONTACT } from './config';

const STAFF_PORTAL_BUILD_ENABLED = import.meta.env.DEV || import.meta.env.VITE_STAFF_PORTAL_ENABLED === 'true';
const Admin = STAFF_PORTAL_BUILD_ENABLED ? React.lazy(() => import('./pages/Admin')) : null;
const Gallery = React.lazy(() => import('./pages/Gallery'));
const CustomerPortal = React.lazy(() => import('./pages/CustomerPortal'));
const PaymentPage = React.lazy(() => import('./pages/Payment').then((module) => ({ default: module.PaymentPage })));
const PaymentReturnPage = React.lazy(() => import('./pages/Payment').then((module) => ({ default: module.PaymentReturnPage })));

const RouteLoading = () => <div className="flex min-h-[60vh] items-center justify-center pt-24 text-[#F8F4E8]"><Loader2 className="mr-3 h-6 w-6 animate-spin text-[#11C7D9]" /> Loading…</div>;
const LazyPage: React.FC<{ children: React.ReactNode }> = ({ children }) => <React.Suspense fallback={<RouteLoading />}>{children}</React.Suspense>;

const Footer = () => (
  <footer className="border-t border-white/5 bg-[#001219] px-4 py-12 md:py-16">
    <div className="mx-auto grid max-w-[1600px] gap-10 px-4 text-center md:grid-cols-5 md:gap-12 md:px-8 md:text-left lg:px-12">
      <div className="md:col-span-2">
        <img
          src="/images/brand/brand-logo-header-reverse-transparent.webp"
          alt="Action Divers & Adventures"
          loading="lazy"
          decoding="async"
          className="mb-6 h-auto w-64 max-w-full object-contain mx-auto md:mx-0"
        />
        <p className="text-[#F8F4E8]/60 leading-relaxed max-w-md font-light mx-auto md:mx-0">
          Scuba diving, snorkeling, fishing, island adventures, and mainland tours from San Pedro, Ambergris Caye. Visit our dive shop and tour desk 5 miles north of town at La Perla Del Caribe.
        </p>
        <p className="mt-4 text-sm font-semibold text-[#8DE7EF]">Scuba courses taught by a PADI-certified instructor.</p>
      </div>
      <div>
        <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-[#F8F4E8] md:mb-6">Contact</h4>
        <div className="space-y-3 text-sm leading-relaxed text-[#F8F4E8]/70 md:space-y-4 md:text-xs md:tracking-wider">
          <p>5 miles north of San Pedro at La Perla Del Caribe</p>
          <p>{CONTACT.phoneDisplay}</p>
          <p>{CONTACT.email}</p>
        </div>
      </div>
      <div className="hidden md:block">
        <h4 className="text-[#F8F4E8] font-bold uppercase tracking-[0.16em] text-xs mb-6">Quick Links</h4>
        <div className="flex flex-col space-y-4 text-xs tracking-widest text-[#F8F4E8]/60">
          <Link to="/tour/scuba-diving" className="hover:text-white transition-colors">Scuba Diving</Link>
          <Link to="/tour/snorkeling" className="hover:text-white transition-colors">Snorkeling</Link>
          <Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link>
          <Link to="/island-adventures" className="hover:text-white transition-colors">Island Adventures</Link>
          <Link to="/mainland-adventures" className="hover:text-white transition-colors">Mainland Tours</Link>
          <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
        </div>
      </div>
      <div className="hidden md:block">
        <h4 className="text-[#F8F4E8] font-bold uppercase tracking-[0.16em] text-xs mb-6">Travel Guides</h4>
        <div className="flex flex-col space-y-4 text-xs tracking-widest text-[#F8F4E8]/60">
          {BLOG_POSTS.slice(0, 4).map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="hover:text-white transition-colors">{post.title}</Link>
          ))}
        </div>
      </div>
    </div>
    <div className="mx-auto mt-10 flex max-w-[1600px] items-center justify-center border-t border-white/5 px-4 pt-6 text-center text-[11px] uppercase tracking-[0.12em] text-[#F8F4E8]/50 md:mt-16 md:px-8 md:pt-8 lg:px-12">
      <p>&copy; {new Date().getFullYear()} Action Divers & Adventures. All Rights Reserved.</p>
    </div>
  </footer>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};

const ConditionalFooter = () => {
  const { pathname } = useLocation();
  return pathname.startsWith('/admin') ? null : <Footer />;
};

const ContextualTourAssistant = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/pay/') || pathname === '/reservations' || pathname.startsWith('/courses/request') || pathname.startsWith('/transfers-charters/request') || pathname.startsWith('/reservation/') || pathname === '/payment/return' || pathname.startsWith('/admin')) return null;
  return <TourAssistant />;
};

const App: React.FC = () => {
  const businessStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristBusiness',
    name: 'Action Divers & Adventures',
    description: "Belize tour operator offering scuba diving, snorkeling, fishing, island adventures, cave tubing, Maya ruins, and mainland tours from San Pedro.",
    url: SITE_URL,
    telephone: CONTACT.phoneDisplay,
    email: CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'San Pedro',
      addressLocality: 'Ambergris Caye',
      addressCountry: 'Belize',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 18.4663,
      longitude: -87.9667,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Belize Adventure Tours',
      itemListElement: INITIAL_TOURS.map((tour) => ({
        '@type': 'Offer',
        url: `${SITE_URL}/tour/${tour.id}`,
        price: tour.price,
        priceCurrency: 'USD',
        itemOffered: {
          '@type': 'TouristTrip',
          name: tour.name,
          description: tour.description,
        },
      })),
    },
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <div className="min-h-screen bg-[#001219] text-[#F8F4E8] selection:bg-[var(--brand-orange)] selection:text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<><SEO title="Belize Scuba Diving & Adventure Tours" description="Explore scuba diving, snorkeling, fishing, island adventures, and mainland tours from San Pedro, Ambergris Caye with Action Divers & Adventures." path="/" structuredData={businessStructuredData} /><Home /></>} />
            <Route path="/about" element={<><SEO title="About Action Divers Belize" description="Meet Action Divers & Adventures, a San Pedro, Ambergris Caye tour operator offering personal service and Belize reef and mainland adventures." path="/about" image="/images/gallery/SCUBA-and-Snorkelers-1.png" /><About /></>} />
            <Route path="/gallery" element={<><SEO title="Belize Adventure Photo Gallery" description="Browse Action Divers & Adventures photos from Belize snorkeling, scuba diving, island adventures, fishing trips, Maya ruins, and mainland tours." path="/gallery" image="/images/gallery/Turtle.png" /><LazyPage><Gallery /></LazyPage></>} />
            <Route path="/island-adventures" element={<><SEO title="Island Tours from San Pedro, Belize" description="Explore Belize island tours from San Pedro, including scuba diving, Hol Chan snorkeling, Shark Ray Alley, Mexico Rocks, fishing, and beach barbecue adventures." path="/island-adventures" image="/images/gallery/Group-of-Snorkelers-with-fish-768x432.png" /><IslandAdventures /></>} />
            <Route path="/mainland-adventures" element={<><SEO title="Belize Mainland Tours & Maya Ruins" description="Explore mainland tours from San Pedro, including Altun Ha, Xunantunich, Lamanai, ATM Caves, cave tubing, zip-lining, and rainforest adventures." path="/mainland-adventures" image="/images/gallery/web-maya-ruin.jpg" /><MainlandAdventures /></>} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/request" element={<ServiceRequest mode="course" />} />
            <Route path="/transfers-charters" element={<TransfersCharters />} />
            <Route path="/transfers-charters/request" element={<ServiceRequest mode="transfer" />} />
            <Route path="/tour/diving-courses" element={<Navigate to="/courses" replace />} />
            <Route path="/tour/beach-bbq" element={<Navigate to="/tour/fishing" replace />} />
            <Route path="/plan-your-trip" element={<Navigate to="/reservations" replace />} />
            <Route path="/adventures" element={<Navigate to="/island-adventures" replace />} />
            <Route path="/contact" element={<Navigate to="/about" replace />} />
            <Route path="/tour/:id" element={<TourDetail />} />
            <Route path="/blog" element={<VoyageChronicles />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/reservations" element={<ReservationCartPage />} />
            <Route path="/reservation/:token" element={<LazyPage><CustomerPortal /></LazyPage>} />
            <Route path="/pay/:token" element={<LazyPage><PaymentPage /></LazyPage>} />
            <Route path="/payment/return" element={<LazyPage><PaymentReturnPage /></LazyPage>} />
            {STAFF_PORTAL_BUILD_ENABLED && Admin
              ? <Route path="/admin" element={<React.Suspense fallback={null}><Admin /></React.Suspense>} />
              : <Route path="/admin" element={<Navigate to="/" replace />} />}
            <Route path="/admin/preview" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ConditionalFooter />
        <ContextualTourAssistant />
      </div>
    </Router>
  );
};

export default App;
