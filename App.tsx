
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import TourAssistant from './components/TourAssistant';
import Home from './pages/Home';
import TourDetail from './pages/TourDetail';
import Admin from './pages/Admin';
import About from './pages/About';
import MainlandAdventures from './pages/MainlandAdventures';
import IslandAdventures from './pages/IslandAdventures';
import VoyageChronicles from './pages/VoyageChronicles';
import BlogPostPage from './pages/BlogPost';
import Gallery from './pages/Gallery';
import { Check, Info, Anchor, Map, Ship, Droplets, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import SEO, { SITE_URL } from './components/SEO';
import { INITIAL_TOURS } from './constants';
import { BLOG_POSTS } from './data/blogPosts';
import { CONTACT, isInquiryConfigured, buildWhatsAppUrl } from './config';

const Footer = () => (
  <footer className="bg-[#001219] border-t border-white/5 py-16 px-4">
    <div className="max-w-[1600px] mx-auto px-8 lg:px-12 grid md:grid-cols-5 gap-12 text-center md:text-left">
      <div className="md:col-span-2">
        <img
          src="/images/brand/brand-logo-header-reverse-transparent.webp"
          alt="Action Divers & Adventures"
          className="mb-6 h-auto w-64 max-w-full object-contain mx-auto md:mx-0"
        />
        <p className="text-[#F8F4E8]/60 leading-relaxed max-w-md font-light mx-auto md:mx-0">
          Scuba diving, snorkeling, fishing, island adventures, and mainland tours from San Pedro, Ambergris Caye. Visit our dive shop and tour desk 5 miles north of town at La Perla Del Caribe.
        </p>
      </div>
      <div>
        <h4 className="text-[#F8F4E8] font-bold uppercase tracking-widest text-[10px] mb-6">Contact</h4>
        <div className="space-y-4 text-xs tracking-widest text-[#F8F4E8]/60">
          <p>5 miles north of San Pedro at La Perla Del Caribe</p>
          <p>011-501-671-2624</p>
          <p>reservations@actiondiversbelize.com</p>
        </div>
      </div>
      <div>
        <h4 className="text-[#F8F4E8] font-bold uppercase tracking-widest text-[10px] mb-6">Quick Links</h4>
        <div className="flex flex-col space-y-4 text-xs tracking-widest text-[#F8F4E8]/60">
          <Link to="/tour/scuba-diving" className="hover:text-white transition-colors">Scuba Diving</Link>
          <Link to="/tour/snorkeling" className="hover:text-white transition-colors">Snorkeling</Link>
          <Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link>
          <Link to="/island-adventures" className="hover:text-white transition-colors">Island Adventures</Link>
          <Link to="/mainland-adventures" className="hover:text-white transition-colors">Mainland Tours</Link>
          <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
        </div>
      </div>
      <div>
        <h4 className="text-[#F8F4E8] font-bold uppercase tracking-widest text-[10px] mb-6">Travel Guides</h4>
        <div className="flex flex-col space-y-4 text-xs tracking-widest text-[#F8F4E8]/60">
          {BLOG_POSTS.slice(0, 4).map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="hover:text-white transition-colors">{post.title}</Link>
          ))}
        </div>
      </div>
    </div>
    <div className="max-w-[1600px] mx-auto px-8 lg:px-12 mt-16 pt-8 border-t border-white/5 flex justify-center items-center text-[9px] uppercase tracking-[0.4em] text-[#F8F4E8]/30">
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
    if (!isInquiryConfigured()) {
      setStatus('error');
      setErrorMsg('Online form is being set up. Please reach us by WhatsApp or phone below.');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch(CONTACT.inquiryEndpoint, {
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
    <div className="pt-48 pb-32 max-w-5xl mx-auto px-6">
      <SEO
        title="Belize Tour Reservations & Custom Inquiries"
        description="Send Action Divers & Adventures a custom inquiry for Belize scuba diving, snorkeling, fishing, island tours, cave tubing, Maya ruins, and mainland tours."
        path="/reservations"
      />
      <div className="text-center mb-20">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 text-[#F8F4E8]">Plan Your <span className="text-[#11C7D9]">Belize Trip</span></h1>
        <p className="text-[#F8F4E8]/60 text-lg uppercase tracking-[0.22em]">Choose tours, share your dates, and we will follow up with details.</p>
      </div>
      
      <div className="glass p-8 md:p-16 rounded-[4rem] space-y-20 shadow-2xl border border-white/5">
        {/* Step 1: Tour Selection */}
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-extrabold tracking-tight text-[#F8F4E8]">Select Your Tours</h3>
            <p className="text-[#F8F4E8]/40 text-xs uppercase tracking-widest">Pricing is current per person unless noted</p>
          </div>
          
          <div className="space-y-16">
            {Object.entries(RESERVATION_OPTIONS).map(([groupName, options]) => (
              <div key={groupName} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5"></div>
                  <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#11C7D9] font-bold">{groupName}</h4>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(opt.id)}
                      className={`group p-6 rounded-[2rem] border text-left transition-all flex items-center justify-between ${
                        selectedOptions.includes(opt.id)
                          ? 'bg-[var(--brand-orange)] border-[var(--brand-orange)] shadow-[0_0_30px_rgba(255,90,0,0.18)]'
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
                          <p className={`text-[11px] font-bold uppercase tracking-widest ${selectedOptions.includes(opt.id) ? 'text-white' : 'text-[#F8F4E8]'}`}>
                            {opt.name}
                          </p>
                          <p className={`text-[9px] uppercase tracking-widest mt-1 ${selectedOptions.includes(opt.id) ? 'text-white/70' : 'text-[#F8F4E8]/30'}`}>
                            ${opt.price.toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      {opt.category === 'Island' ? <Anchor className={`w-4 h-4 ${selectedOptions.includes(opt.id) ? 'text-[#001219]/20' : 'text-[#F8F4E8]/10'}`} /> : <Map className={`w-4 h-4 ${selectedOptions.includes(opt.id) ? 'text-[#001219]/20' : 'text-[#F8F4E8]/10'}`} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedOptions.length > 0 && (
            <div className="mt-12 p-8 bg-[#F8F4E8]/5 rounded-[3rem] border border-[#F8F4E8]/10 animate-fade-in flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#F8F4E8]/30 mb-2 font-bold">Estimated Starting Total</p>
                <p className="text-5xl font-extrabold tracking-tight text-[#F8F4E8]">${totalPrice.toFixed(2)} <span className="text-xs font-sans font-light uppercase tracking-widest text-[#F8F4E8]/40 ml-2">USD</span></p>
              </div>
              <div className="flex items-center gap-3 glass px-6 py-4 rounded-full border border-white/5">
                <Info className="w-4 h-4 text-[#11C7D9]" />
                <p className="text-[9px] uppercase tracking-widest text-[#F8F4E8]/40 leading-relaxed max-w-[200px]">
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
            <h3 className="text-3xl font-extrabold tracking-tight text-[#F8F4E8]">Inquiry Sent!</h3>
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
            <h3 className="text-3xl font-extrabold tracking-tight text-[#F8F4E8]">Trip <span className="text-[#11C7D9]">Details</span></h3>
            <p className="text-[#F8F4E8]/40 text-xs uppercase tracking-widest">Request your date. We confirm availability and the final price before payment.</p>
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
              <label className="block text-[10px] uppercase tracking-[0.4em] ml-2 text-[#F8F4E8]/40 font-bold">Preferred Date</label>
              <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] [color-scheme:dark] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-[0.25em] ml-2 text-[#F8F4E8]/40 font-bold">Adults</label>
                <input type="number" min="1" max="20" value={adults} onChange={(e) => setAdults(Number(e.target.value))} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-[0.25em] ml-2 text-[#F8F4E8]/40 font-bold">Children</label>
                <input type="number" min="0" max="20" value={children} onChange={(e) => setChildren(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-[0.35em] ml-2 text-[#F8F4E8]/40 font-bold">Hotel or Villa</label>
              <input value={accommodation} onChange={(e) => setAccommodation(e.target.value)} placeholder="Where are you staying?" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-[0.35em] ml-2 text-[#F8F4E8]/40 font-bold">Diving Experience</label>
              <select value={divingExperience} onChange={(e) => setDivingExperience(e.target.value)} className="w-full bg-[#0b2028] border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors">
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
              <label className="block text-[10px] uppercase tracking-[0.4em] ml-2 text-[#F8F4E8]/40 font-bold">Contact Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-[0.4em] ml-2 text-[#F8F4E8]/40 font-bold">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="adventure@example.com" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#F8F4E8] focus:outline-none focus:border-[#11C7D9]/60 transition-colors" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-[0.4em] ml-2 text-[#F8F4E8]/40 font-bold">Trip Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dietary needs, equipment sizes, accessibility needs, or anything else we should know..." className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-[#F8F4E8] h-40 focus:outline-none focus:border-[#11C7D9]/60 transition-colors leading-relaxed"></textarea>
          </div>

          {status === 'error' && (
            <p className="text-center text-sm text-[var(--brand-orange-light)] leading-relaxed">{errorMsg}</p>
          )}

          <button type="submit" disabled={status === 'submitting'} className="w-full flex items-center justify-center gap-3 bg-[var(--brand-orange)] text-white font-bold py-6 rounded-full uppercase tracking-[0.4em] hover:bg-[var(--brand-orange-light)] transition-all shadow-3xl active:scale-[0.98] text-lg disabled:opacity-60 disabled:cursor-not-allowed">
            {status === 'submitting' ? (<><Loader2 className="w-5 h-5 animate-spin" /> Sending…</>) : 'Send Tour Inquiry'}
          </button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#F8F4E8]/30">or</span>
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
          <p className="text-center text-[10px] uppercase tracking-widest text-[#F8F4E8]/30">WhatsApp opens pre-filled with your selected tours</p>
        </form>
        )}

        <div className="pt-12 text-center border-t border-white/5">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#F8F4E8]/20 mb-6 font-bold">Need Help Now?</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <div className="space-y-1">
               <a href="tel:0115016712624" className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#F8F4E8] hover:text-white transition-colors">011-501-671-2624</a>
               <p className="text-[9px] uppercase tracking-widest text-[#11C7D9] font-bold">Call or WhatsApp</p>
            </div>
            <div className="h-10 w-px bg-white/5 hidden md:block"></div>
            <div className="space-y-1 text-center md:text-left">
               <p className="text-xl font-extrabold tracking-tight text-[#F8F4E8]/80">reservations@actiondiversbelize.com</p>
               <p className="text-[9px] uppercase tracking-widest text-[#11C7D9] font-bold">Email Reservations</p>
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
    telephone: '011-501-671-2624',
    email: 'reservations@actiondiversbelize.com',
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
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#001219] text-[#F8F4E8] selection:bg-[var(--brand-orange)] selection:text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<><SEO title="Belize Scuba Diving, Snorkeling & Adventure Tours" description="Action Divers & Adventures offers Belize scuba diving, Hol Chan snorkeling, Shark Ray Alley, fishing, beach BBQs, cave tubing, Maya ruins, and mainland tours from San Pedro." path="/" structuredData={businessStructuredData} /><Home /></>} />
            <Route path="/about" element={<><SEO title="About Action Divers & Adventures Belize" description="Meet Action Divers & Adventures, a San Pedro, Ambergris Caye tour operator known for professional guides, personal service, and memorable Belize reef and mainland adventures." path="/about" image="/images/gallery/SCUBA-and-Snorkelers-1.png" /><About /></>} />
            <Route path="/gallery" element={<><SEO title="Belize Reef, Snorkeling & Adventure Photo Gallery" description="Browse Action Divers & Adventures photos from Belize snorkeling, scuba diving, island adventures, fishing trips, Maya ruins, and mainland tours." path="/gallery" image="/images/gallery/Turtle.png" /><Gallery /></>} />
            <Route path="/island-adventures" element={<><SEO title="Island Adventures from San Pedro Belize" description="Explore Belize island tours from San Pedro, including scuba diving, Hol Chan snorkeling, Shark Ray Alley, Mexico Rocks, fishing, and beach barbecue adventures." path="/island-adventures" image="/images/gallery/Group-of-Snorkelers-with-fish-768x432.png" /><IslandAdventures /></>} />
            <Route path="/mainland-adventures" element={<><SEO title="Belize Mainland Tours, Maya Ruins & Cave Adventures" description="Book Belize mainland tours from San Pedro, including Altun Ha, Xunantunich, Lamanai, ATM Caves, cave tubing, zip-lining, and rainforest adventures." path="/mainland-adventures" image="/images/gallery/web-maya-ruin.jpg" /><MainlandAdventures /></>} />
            <Route path="/tour/:id" element={<TourDetail />} />
            <Route path="/blog" element={<VoyageChronicles />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/admin" element={<><SEO title="Owner Portal" description="Action Divers & Adventures owner portal." path="/admin" noindex /><Admin /></>} />
          </Routes>
        </main>
        <Footer />
        <TourAssistant />
      </div>
    </Router>
  );
};

export default App;
