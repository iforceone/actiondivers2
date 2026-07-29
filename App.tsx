
/// <reference types="vite/client" />

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TourAssistant from './components/TourAssistant';
import Home from './pages/Home';
import TourDetail from './pages/TourDetail';
import About from './pages/About';
import MainlandAdventures from './pages/MainlandAdventures';
import IslandAdventures from './pages/IslandAdventures';
import VoyageChronicles from './pages/VoyageChronicles';
import BlogPostPage from './pages/BlogPost';
import Gallery from './pages/Gallery';
import NotFound from './pages/NotFound';
import ReservationCartPage from './pages/Reservations';
import CustomerPortal from './pages/CustomerPortal';
import { PaymentPage, PaymentReturnPage } from './pages/Payment';
import { Check, Info, Anchor, Map, Ship, Droplets, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import SEO, { SITE_URL } from './components/SEO';
import { INITIAL_TOURS } from './constants';
import { BLOG_POSTS } from './data/blogPosts';
import { CONTACT, API, buildWhatsAppUrl } from './config';
import { isAdminPreviewEnabled } from './utils/adminPreview';

const STAFF_PORTAL_BUILD_ENABLED = import.meta.env.DEV || import.meta.env.VITE_STAFF_PORTAL_ENABLED === 'true';
const ADMIN_PREVIEW_ENABLED = isAdminPreviewEnabled();
const Admin = STAFF_PORTAL_BUILD_ENABLED || ADMIN_PREVIEW_ENABLED ? React.lazy(() => import('./pages/Admin')) : null;

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
  if (pathname.startsWith('/pay/') || pathname === '/reservations' || pathname.startsWith('/reservation/') || pathname === '/payment/return' || pathname.startsWith('/admin')) return null;
  return <TourAssistant />;
};

interface BookingOption {
  id: string;
  name: string;
  price: number;
  category: string;
}

const RESERVATION_OPTIONS: Record<string, BookingOption[]> = {
  "Scuba Diving": [
    { id: "dive-single", name: "Single Tank (Mexico Rocks)", price: 116.25, category: "Island" },
    { id: "dive-two", name: "Two Tank Dive", price: 144.38, category: "Island" },
    { id: "dive-holchan", name: "Hol Chan Combo Dive", price: 133.13, category: "Island" },
    { id: "dive-night", name: "Night Dive (Love Tunnel)", price: 155.63, category: "Island" },
  ],
  "Courses & Certifications": [
    { id: "course-refresher", name: "Refresher", price: 208.75, category: "Island" },
    { id: "course-resort", name: "Resort Course", price: 211.88, category: "Island" },
    { id: "course-discover", name: "Discover Scuba (Scuba Discovery)", price: 211.88, category: "Island" },
    { id: "course-referral", name: "Open Water Referral (2 Days)", price: 480.00, category: "Island" },
    { id: "course-scubadiver", name: "Scuba Diver", price: 436.88, category: "Island" },
    { id: "course-owcert", name: "Open Water Certification (3 Days)", price: 564.38, category: "Island" },
    { id: "course-advanced", name: "Advanced Open Water", price: 493.13, category: "Island" },
  ],
  "Snorkeling": [
    { id: "snorkel-hol", name: "Hol Chan & Shark-Ray Alley", price: 90.00, category: "Island" },
    { id: "snorkel-mex", name: "Mexico Rocks Snorkel", price: 75.00, category: "Island" },
    { id: "snorkel-manatee", name: "Caye Caulker & Manatee", price: 175.00, category: "Island" },
    { id: "snorkel-sailing", name: "Sailing — Hol Chan / Caye Caulker", price: 175.00, category: "Island" },
    { id: "snorkel-bacalar", name: "Bacalar Chico Adventure", price: 175.00, category: "Island" },
  ],
  "Fishing (1-4 Persons)": [
    { id: "fish-reef-half", name: "Reef Fishing (Half Day)", price: 309.38, category: "Island" },
    { id: "fish-reef-full", name: "Reef Fishing (Full Day)", price: 562.50, category: "Island" },
    { id: "fish-deep-half", name: "Deep Sea (Half Day)", price: 900.00, category: "Island" },
    { id: "fish-deep-full", name: "Deep Sea (Full Day)", price: 1800.00, category: "Island" },
    { id: "fish-flat-half", name: "Flat Fishing (Half Day)", price: 393.75, category: "Island" },
    { id: "fish-flat-full", name: "Flat Fishing (Full Day)", price: 600.00, category: "Island" },
  ],
  "Specialty Island Tours": [
    { id: "bbq-full", name: "Beach Bar-B-Q (1-4 ppl)", price: 562.50, category: "Island" },
  ],
  "Mainland Discovery": [
    { id: "main-altun", name: "Altun Ha & Cave Tubing", price: 337.50, category: "Mainland" },
    { id: "main-xunantunich", name: "Xunantunich & Cave Tubing", price: 337.50, category: "Mainland" },
    { id: "main-cave", name: "Cave Tubing & Zip-lining", price: 337.50, category: "Mainland" },
    { id: "main-lamanai", name: "Lamanai Temple Tour", price: 281.25, category: "Mainland" },
    { id: "main-atm", name: "ATM Caves Expedition", price: 450.00, category: "Mainland" },
  ]
};

const Reservations = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>(['Scuba Diving']);
  const [totalPrice, setTotalPrice] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [accommodation, setAccommodation] = useState('');
  const [divingExperience, setDivingExperience] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  // Honeypot — real users never fill this; bots do.
  const [company, setCompany] = useState('');

  useEffect(() => {
    let total = 0;
    Object.values(RESERVATION_OPTIONS).forEach(group => {
      group.forEach(opt => {
        if (selectedOptions.includes(opt.id)) total += opt.price;
      });
    });
    setTotalPrice(total);
  }, [selectedOptions]);

  const toggleOption = (id: string) => {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const selectedDetails: BookingOption[] = [];
  Object.values(RESERVATION_OPTIONS).forEach(group =>
    group.forEach(opt => {
      if (selectedOptions.includes(opt.id)) selectedDetails.push(opt);
    })
  );
  const tourSummary = selectedDetails.map(o => `${o.name} ($${o.price.toFixed(2)} USD)`).join(', ');

  const whatsappMessage =
    `Hi Action Divers & Adventures! I'd like to inquire about these Belize tours:\n` +
    (selectedDetails.length
      ? selectedDetails.map(o => `• ${o.name} ($${o.price.toFixed(2)} USD)`).join('\n')
      : '• (still deciding — please advise)') +
    `\n\nEstimated total: $${totalPrice.toFixed(2)} USD` +
    (name ? `\nName: ${name}` : '') +
    (preferredDate ? `\nPreferred date: ${preferredDate}` : '') +
    `\nParty: ${adults} adult${adults === 1 ? '' : 's'}, ${children} child${children === 1 ? '' : 'ren'}` +
    (accommodation ? `\nAccommodation: ${accommodation}` : '') +
    (divingExperience ? `\nDiving experience: ${divingExperience}` : '') +
    (notes ? `\nNotes: ${notes}` : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API.isConfigured()) {
      setStatus('error');
      setErrorMsg('Online form is being set up. Please reach us by WhatsApp or phone below.');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch(API.url('/inquiry'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          preferredDate,
          adults,
          children,
          accommodation,
          divingExperience,
          notes,
          tours: tourSummary || 'None selected yet',
          estimatedTotal: `$${totalPrice.toFixed(2)} USD`,
          company, // honeypot
        }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg('Something went wrong sending your inquiry. Please WhatsApp or call us below.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please WhatsApp or call us below.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-36 sm:px-6 md:pt-48">
      <SEO
        title="Plan Your Belize Tours"
        description="Send Action Divers & Adventures a custom inquiry for Belize scuba diving, snorkeling, fishing, island tours, cave tubing, Maya ruins, and mainland tours."
        path="/reservations"
      />
      <div className="mb-14 text-center md:mb-20">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 text-[#F8F4E8]">Plan Your <span className="text-[#11C7D9]">Belize Trip</span></h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#F8F4E8]/70 md:text-lg">Choose the experiences that interest you, share your dates, and we will confirm availability and the final price.</p>
      </div>
      
      <div className="glass space-y-16 rounded-2xl border border-white/5 p-5 sm:p-8 md:space-y-20 md:p-16">
        {/* Step 1: Tour Selection */}
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#F8F4E8]">Select Your Tours</h2>
            <p className="text-sm text-[#F8F4E8]/65">Open a category and choose any tours you would like us to quote. Pricing is per person unless noted.</p>
          </div>
          
          <div className="space-y-3">
            {Object.entries(RESERVATION_OPTIONS).map(([groupName, options]) => {
              const selectedInGroup = options.filter((option) => selectedOptions.includes(option.id)).length;
              return (
              <details
                key={groupName}
                open={openGroups.includes(groupName)}
                onToggle={(event) => {
                  const isOpen = event.currentTarget.open;
                  setOpenGroups((current) => isOpen
                    ? (current.includes(groupName) ? current : [...current, groupName])
                    : current.filter((name) => name !== groupName));
                }}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] open:bg-white/[0.04]"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-aqua)]/70 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="block text-sm font-bold text-[#F8F4E8]">{groupName}</span>
                    <span className="mt-1 block text-xs text-[#F8F4E8]/55">{options.length} option{options.length === 1 ? '' : 's'}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    {selectedInGroup > 0 && (
                      <span className="rounded-full bg-[var(--brand-orange)] px-3 py-1 text-xs font-bold text-white">
                        {selectedInGroup} selected
                      </span>
                    )}
                    <span aria-hidden="true" className="text-xl text-[var(--brand-aqua)] transition-transform duration-200 group-open:rotate-45">+</span>
                  </span>
                </summary>

                <div className="grid gap-3 border-t border-white/5 p-3 sm:p-4 md:grid-cols-2">
                  {options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleOption(opt.id)}
                      aria-pressed={selectedOptions.includes(opt.id)}
                      className={`flex min-h-20 items-center justify-between rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-aqua)]/70 sm:p-5 ${
                        selectedOptions.includes(opt.id)
                          ? 'bg-[var(--brand-orange)] border-[var(--brand-orange)]'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedOptions.includes(opt.id) ? 'bg-[#001219] border-[#001219]' : 'border-white/10'
                        }`}>
                          {selectedOptions.includes(opt.id) && <Check className="w-3 h-3 text-[#F8F4E8]" />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold leading-snug ${selectedOptions.includes(opt.id) ? 'text-white' : 'text-[#F8F4E8]'}`}>
                            {opt.name}
                          </p>
                          <p className={`mt-1 text-sm ${selectedOptions.includes(opt.id) ? 'text-white/80' : 'text-[#F8F4E8]/65'}`}>
                            ${opt.price.toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      {opt.category === 'Island' ? <Anchor className={`w-4 h-4 ${selectedOptions.includes(opt.id) ? 'text-[#001219]/20' : 'text-[#F8F4E8]/10'}`} /> : <Map className={`w-4 h-4 ${selectedOptions.includes(opt.id) ? 'text-[#001219]/20' : 'text-[#F8F4E8]/10'}`} />}
                    </button>
                  ))}
                </div>
              </details>
              );
            })}
          </div>

          {selectedOptions.length > 0 && (
            <div className="mt-10 flex animate-fade-in flex-col items-center justify-between gap-6 rounded-2xl border border-[#F8F4E8]/10 bg-[#F8F4E8]/5 p-6 md:flex-row md:p-8">
              <div className="text-center md:text-left">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#F8F4E8]/60">Estimated Starting Total</p>
                <p className="text-5xl font-extrabold tracking-tight text-[#F8F4E8]">${totalPrice.toFixed(2)} <span className="text-xs font-sans font-light uppercase tracking-widest text-[#F8F4E8]/40 ml-2">USD</span></p>
              </div>
              <div className="flex items-center gap-3 glass px-6 py-4 rounded-full border border-white/5">
                <Info className="w-4 h-4 text-[#11C7D9]" />
                <p className="max-w-[220px] text-xs leading-relaxed text-[#F8F4E8]/65">
                  Final quote will include group size adjustments, gear rentals, and park fees where applicable.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Guest Details */}
        {status === 'success' ? (
          <div className="pt-20 border-t border-white/5 text-center space-y-6 animate-fade-in">
            <CheckCircle2 className="w-16 h-16 text-[#11C7D9] mx-auto" />
            <h2 className="text-3xl font-extrabold tracking-tight text-[#F8F4E8]">Inquiry Sent!</h2>
            <p className="text-[#F8F4E8]/60 max-w-md mx-auto leading-relaxed">
              Thanks{name ? `, ${name}` : ''} — we've received your request and will follow up by email shortly. Want a faster reply? Message us on WhatsApp.
            </p>
            <a
              href={buildWhatsAppUrl(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold px-8 py-4 rounded-full uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5" fill="currentColor" stroke="none" /> Continue on WhatsApp
            </a>
          </div>
        ) : (
        <form className="space-y-10 pt-20 border-t border-white/5" onSubmit={handleSubmit}>
          <div className="text-center space-y-2 mb-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#F8F4E8]">Trip <span className="text-[#11C7D9]">Details</span></h2>
            <p className="text-sm text-[#F8F4E8]/65">Request your date. We confirm availability and the final price before payment.</p>
          </div>

          {/* Honeypot: visually hidden, off-screen, not focusable/announced. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="absolute left-[-9999px] w-px h-px opacity-0"
          />

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="preferred-date" className="ml-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#F8F4E8]/70">Preferred Date</label>
              <input id="preferred-date" name="preferredDate" type="date" autoComplete="off" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] [color-scheme:dark] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label htmlFor="adults" className="ml-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#F8F4E8]/70">Adults</label>
                <input id="adults" name="adults" type="number" inputMode="numeric" min="1" max="20" value={adults} onChange={(e) => setAdults(Number(e.target.value))} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
              </div>
              <div className="space-y-3">
                <label htmlFor="children" className="ml-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#F8F4E8]/70">Children</label>
                <input id="children" name="children" type="number" inputMode="numeric" min="0" max="20" value={children} onChange={(e) => setChildren(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="accommodation" className="ml-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#F8F4E8]/70">Hotel or Villa</label>
              <input id="accommodation" name="accommodation" autoComplete="off" value={accommodation} onChange={(e) => setAccommodation(e.target.value)} placeholder="Where are you staying?" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
            </div>
            <div className="space-y-3">
              <label htmlFor="diving-experience" className="ml-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#F8F4E8]/70">Diving Experience</label>
              <select id="diving-experience" name="divingExperience" autoComplete="off" value={divingExperience} onChange={(e) => setDivingExperience(e.target.value)} className="w-full bg-[#0b2028] border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors">
                <option value="">Not applicable / select one</option>
                <option value="First time / not certified">First time / not certified</option>
                <option value="Certified beginner">Certified beginner</option>
                <option value="Experienced certified diver">Experienced certified diver</option>
                <option value="Training or refresher needed">Training or refresher needed</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="contact-name" className="ml-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#F8F4E8]/70">Contact Name</label>
              <input id="contact-name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
            </div>
            <div className="space-y-3">
              <label htmlFor="email" className="ml-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#F8F4E8]/70">Email Address</label>
              <input id="email" name="email" type="email" autoComplete="email" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="adventure@example.com" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="trip-notes" className="ml-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#F8F4E8]/70">Trip Notes</label>
            <textarea id="trip-notes" name="notes" autoComplete="off" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dietary needs, equipment sizes, accessibility needs, or anything else we should know…" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-[#F8F4E8] h-40 focus:outline-none focus:border-[#11C7D9]/60 transition-colors leading-relaxed"></textarea>
          </div>

          {status === 'error' && (
            <div className="rounded-2xl border border-[var(--brand-orange)]/35 bg-[var(--brand-orange)]/10 p-5 text-center">
              <p className="text-sm leading-relaxed text-[#F8F4E8]">{errorMsg}</p>
              <a
                href={buildWhatsAppUrl(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#8FF0A4] underline decoration-[#8FF0A4]/40 underline-offset-4"
              >
                <MessageCircle className="h-4 w-4" /> Continue with this request on WhatsApp
              </a>
            </div>
          )}

          <button type="submit" disabled={status === 'submitting'} className="w-full flex items-center justify-center gap-3 bg-[var(--brand-orange)] text-white font-bold py-6 rounded-full uppercase tracking-[0.4em] hover:bg-[var(--brand-orange-light)] transition-all shadow-3xl active:scale-[0.98] text-lg disabled:opacity-60 disabled:cursor-not-allowed">
            {status === 'submitting' ? (<><Loader2 className="w-5 h-5 animate-spin" /> Sending…</>) : 'Send Tour Inquiry'}
          </button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-xs uppercase tracking-[0.14em] text-[#F8F4E8]/55">or</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <a
            href={buildWhatsAppUrl(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold py-5 rounded-full uppercase tracking-[0.3em] hover:brightness-110 transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5" fill="currentColor" stroke="none" /> Send via WhatsApp
          </a>
          <p className="text-center text-xs text-[#F8F4E8]/60">WhatsApp opens pre-filled with your selected tours.</p>
        </form>
        )}

        <div className="pt-12 text-center border-t border-white/5">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.14em] text-[#F8F4E8]/55">Need Help Now?</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <div className="space-y-1">
               <a href="tel:0115016712624" className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#F8F4E8] hover:text-white transition-colors">011-501-671-2624</a>
               <p className="text-xs uppercase tracking-[0.12em] text-[#11C7D9] font-bold">Call or WhatsApp</p>
            </div>
            <div className="h-10 w-px bg-white/5 hidden md:block"></div>
            <div className="space-y-1 text-center md:text-left">
               <a href={`mailto:${CONTACT.email}`} className="text-xl font-extrabold tracking-tight text-[#F8F4E8]/80 hover:text-[#F8F4E8] transition-colors">{CONTACT.email}</a>
               <p className="text-xs uppercase tracking-[0.12em] text-[#11C7D9] font-bold">Email Reservations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
            <Route path="/gallery" element={<><SEO title="Belize Adventure Photo Gallery" description="Browse Action Divers & Adventures photos from Belize snorkeling, scuba diving, island adventures, fishing trips, Maya ruins, and mainland tours." path="/gallery" image="/images/gallery/Turtle.png" /><Gallery /></>} />
            <Route path="/island-adventures" element={<><SEO title="Island Tours from San Pedro, Belize" description="Explore Belize island tours from San Pedro, including scuba diving, Hol Chan snorkeling, Shark Ray Alley, Mexico Rocks, fishing, and beach barbecue adventures." path="/island-adventures" image="/images/gallery/Group-of-Snorkelers-with-fish-768x432.png" /><IslandAdventures /></>} />
            <Route path="/mainland-adventures" element={<><SEO title="Belize Mainland Tours & Maya Ruins" description="Explore mainland tours from San Pedro, including Altun Ha, Xunantunich, Lamanai, ATM Caves, cave tubing, zip-lining, and rainforest adventures." path="/mainland-adventures" image="/images/gallery/web-maya-ruin.jpg" /><MainlandAdventures /></>} />
            <Route path="/tour/:id" element={<TourDetail />} />
            <Route path="/blog" element={<VoyageChronicles />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/reservations" element={<ReservationCartPage />} />
            <Route path="/reservation/:token" element={<CustomerPortal />} />
            <Route path="/pay/:token" element={<PaymentPage />} />
            <Route path="/payment/return" element={<PaymentReturnPage />} />
            {STAFF_PORTAL_BUILD_ENABLED && Admin
              ? <Route path="/admin" element={<React.Suspense fallback={null}><Admin /></React.Suspense>} />
              : <Route path="/admin" element={<Navigate to="/" replace />} />}
            {ADMIN_PREVIEW_ENABLED && Admin && <Route path="/admin/preview" element={<React.Suspense fallback={null}><Admin /></React.Suspense>} />}
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
