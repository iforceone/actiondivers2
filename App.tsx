
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
import Gallery from './pages/Gallery';
import { Check, Info, Anchor, Map, Ship, Droplets } from 'lucide-react';

const Footer = () => (
  <footer className="bg-[#001219] border-t border-white/5 py-16 px-4">
    <div className="max-w-[1600px] mx-auto px-8 lg:px-12 grid md:grid-cols-4 gap-12 text-center md:text-left">
      <div className="md:col-span-2">
        <h2 className="text-3xl serif mb-6 tracking-widest text-[#E9D8A6]">ACTION DIVERS</h2>
        <p className="text-[#E9D8A6]/60 leading-relaxed max-w-md font-light mx-auto md:mx-0">
          Belize's premier boutique tour operator. Known for our professionalism, knowledge and friendly service, we help you create that unforgettable fun-filled vacation.
        </p>
      </div>
      <div>
        <h4 className="text-[#E9D8A6] font-bold uppercase tracking-widest text-[10px] mb-6">Contact</h4>
        <div className="space-y-4 text-xs tracking-widest text-[#E9D8A6]/60">
          <p>San Pedro, Ambergris Caye, Belize</p>
          <p>011-501-671-2624</p>
          <p>reservations@actiondivers.com</p>
        </div>
      </div>
      <div>
        <h4 className="text-[#E9D8A6] font-bold uppercase tracking-widest text-[10px] mb-6">Quick Links</h4>
        <div className="flex flex-col space-y-4 text-xs tracking-widest text-[#E9D8A6]/60">
          <Link to="/tour/scuba-diving" className="hover:text-white transition-colors">Scuba Diving</Link>
          <Link to="/tour/snorkeling" className="hover:text-white transition-colors">Snorkeling</Link>
          <Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link>
          <Link to="/island-adventures" className="hover:text-white transition-colors">Island Adventures</Link>
          <Link to="/mainland-adventures" className="hover:text-white transition-colors">Mainland Tours</Link>
          <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
        </div>
      </div>
    </div>
    <div className="max-w-[1600px] mx-auto px-8 lg:px-12 mt-16 pt-8 border-t border-white/5 flex justify-center items-center text-[9px] uppercase tracking-[0.4em] text-[#E9D8A6]/30">
      <p>&copy; 2024 Action Divers & Adventures. All Rights Reserved.</p>
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
    { id: "dive-night", name: "Night Dive (Love Tunnel)", price: 155.63, category: "Island" },
    { id: "dive-discover", name: "Discover Scuba Class", price: 211.88, category: "Island" },
    { id: "dive-cert", name: "Open Water Certification", price: 564.38, category: "Island" },
    { id: "dive-adv", name: "Advanced Open Water", price: 493.13, category: "Island" },
  ],
  "Snorkeling": [
    { id: "snorkel-hol", name: "Hol Chan & Shark-Ray Alley", price: 90.00, category: "Island" },
    { id: "snorkel-mex", name: "Mexico Rocks Snorkel", price: 75.00, category: "Island" },
    { id: "snorkel-manatee", name: "Caye Caulker & Manatee", price: 175.00, category: "Island" },
    { id: "snorkel-bacalar", name: "Bacalar Chico Adventure", price: 175.00, category: "Island" },
  ],
  "Fishing (1-4 Persons)": [
    { id: "fish-reef-half", name: "Reef Fishing (Half Day)", price: 309.38, category: "Island" },
    { id: "fish-reef-full", name: "Reef Fishing (Full Day)", price: 562.50, category: "Island" },
    { id: "fish-deep-half", name: "Deep Sea (Half Day)", price: 900.00, category: "Island" },
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

  return (
    <div className="pt-48 pb-32 max-w-5xl mx-auto px-6">
      <div className="text-center mb-20">
        <h1 className="text-6xl md:text-8xl serif mb-6 text-[#E9D8A6]">Curated <span className="italic">Inquiry</span></h1>
        <p className="text-[#E9D8A6]/60 italic text-lg uppercase tracking-[0.3em]">Design Your Bespoke Itinerary</p>
      </div>
      
      <div className="glass p-8 md:p-16 rounded-[4rem] space-y-20 shadow-2xl border border-white/5">
        {/* Step 1: Tour Selection */}
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl serif text-[#E9D8A6]">Select Your Expeditions</h3>
            <p className="text-[#E9D8A6]/40 text-xs uppercase tracking-widest">Pricing is current per person unless noted</p>
          </div>
          
          <div className="space-y-16">
            {Object.entries(RESERVATION_OPTIONS).map(([groupName, options]) => (
              <div key={groupName} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5"></div>
                  <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#005F73] font-bold">{groupName}</h4>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(opt.id)}
                      className={`group p-6 rounded-[2rem] border text-left transition-all flex items-center justify-between ${
                        selectedOptions.includes(opt.id)
                          ? 'bg-[#E9D8A6] border-[#E9D8A6] shadow-[0_0_30px_rgba(233,216,166,0.15)]'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedOptions.includes(opt.id) ? 'bg-[#001219] border-[#001219]' : 'border-white/10'
                        }`}>
                          {selectedOptions.includes(opt.id) && <Check className="w-3 h-3 text-[#E9D8A6]" />}
                        </div>
                        <div>
                          <p className={`text-[11px] font-bold uppercase tracking-widest ${selectedOptions.includes(opt.id) ? 'text-[#001219]' : 'text-[#E9D8A6]'}`}>
                            {opt.name}
                          </p>
                          <p className={`text-[9px] uppercase tracking-widest mt-1 ${selectedOptions.includes(opt.id) ? 'text-[#001219]/40' : 'text-[#E9D8A6]/30'}`}>
                            ${opt.price.toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      {opt.category === 'Island' ? <Anchor className={`w-4 h-4 ${selectedOptions.includes(opt.id) ? 'text-[#001219]/20' : 'text-[#E9D8A6]/10'}`} /> : <Map className={`w-4 h-4 ${selectedOptions.includes(opt.id) ? 'text-[#001219]/20' : 'text-[#E9D8A6]/10'}`} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedOptions.length > 0 && (
            <div className="mt-12 p-8 bg-[#E9D8A6]/5 rounded-[3rem] border border-[#E9D8A6]/10 animate-fade-in flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#E9D8A6]/30 mb-2 font-bold">Estimated Base Total</p>
                <p className="text-5xl serif text-[#E9D8A6]">${totalPrice.toFixed(2)} <span className="text-xs font-sans font-light uppercase tracking-widest text-[#E9D8A6]/40 ml-2">USD</span></p>
              </div>
              <div className="flex items-center gap-3 glass px-6 py-4 rounded-full border border-white/5">
                <Info className="w-4 h-4 text-[#005F73]" />
                <p className="text-[9px] uppercase tracking-widest text-[#E9D8A6]/40 leading-relaxed max-w-[200px]">
                  Final quote will include group size adjustments, gear rentals, and park fees where applicable.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Guest Details */}
        <form className="space-y-10 pt-20 border-t border-white/5" onSubmit={(e) => e.preventDefault()}>
          <div className="text-center space-y-2 mb-4">
            <h3 className="text-3xl serif text-[#E9D8A6]">Guest <span className="italic">Manifest</span></h3>
            <p className="text-[#E9D8A6]/40 text-xs uppercase tracking-widest">How should we address you?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-[0.4em] ml-2 text-[#E9D8A6]/40 font-bold">Contact Name</label>
              <input placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#E9D8A6] focus:outline-none focus:border-[#E9D8A6]/40 transition-colors" />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-[0.4em] ml-2 text-[#E9D8A6]/40 font-bold">Email Coordinate</label>
              <input type="email" placeholder="adventure@example.com" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[#E9D8A6] focus:outline-none focus:border-[#E9D8A6]/40 transition-colors" />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-[0.4em] ml-2 text-[#E9D8A6]/40 font-bold">Expedition Notes</label>
            <textarea placeholder="Tell us about your party size, preferred dates, and any dietary or gear requirements..." className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-[#E9D8A6] h-40 focus:outline-none focus:border-[#E9D8A6]/40 transition-colors leading-relaxed"></textarea>
          </div>

          <button type="button" className="w-full bg-[#E9D8A6] text-[#001219] font-bold py-6 rounded-full uppercase tracking-[0.4em] hover:bg-white transition-all shadow-3xl active:scale-[0.98] text-lg">
            Submit Inquiry to Base
          </button>
        </form>

        <div className="pt-12 text-center border-t border-white/5">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#E9D8A6]/20 mb-6 font-bold">Immediate Assistance</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <div className="space-y-1">
               <a href="tel:0115016712624" className="text-3xl md:text-4xl serif text-[#E9D8A6] hover:text-white transition-colors">011-501-671-2624</a>
               <p className="text-[9px] uppercase tracking-widest text-[#005F73] font-bold">Direct Satellite Link</p>
            </div>
            <div className="h-10 w-px bg-white/5 hidden md:block"></div>
            <div className="space-y-1 text-center md:text-left">
               <p className="text-xl serif text-[#E9D8A6]/80">reservations@actiondivers.com</p>
               <p className="text-[9px] uppercase tracking-widest text-[#005F73] font-bold">Electronic Post</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#001219] text-[#E9D8A6] selection:bg-[#E9D8A6] selection:text-[#001219]">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/island-adventures" element={<IslandAdventures />} />
            <Route path="/mainland-adventures" element={<MainlandAdventures />} />
            <Route path="/tour/:id" element={<TourDetail />} />
            <Route path="/blog" element={<VoyageChronicles />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        <TourAssistant />
      </div>
    </Router>
  );
};

export default App;
