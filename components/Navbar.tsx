
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Home, Info, Anchor, Map, BookOpen, Phone, Images, ShoppingBag } from 'lucide-react';
import { useBooking } from '../contexts/BookingContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { items: cartItems } = useBooking();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const resetNavState = () => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileExpanded(null);
  };

  useEffect(() => {
    resetNavState();
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'About Us', path: '/about', icon: <Info className="w-5 h-5" /> },
    { name: 'Gallery', path: '/gallery', icon: <Images className="w-5 h-5" /> },
    { 
      name: 'Island Adventures', 
      path: '/island-adventures',
      icon: <Anchor className="w-5 h-5" />,
      items: [
        { name: 'Scuba Diving', path: '/tour/scuba-diving' },
        { name: 'Snorkeling', path: '/tour/snorkeling' },
        { name: 'Beach Bar-B-Q', path: '/tour/beach-bbq' },
        { name: 'Fishing', path: '/tour/fishing' },
      ]
    },
    { 
      name: 'Mainland Adventures', 
      path: '/mainland-adventures',
      icon: <Map className="w-5 h-5" />,
      items: [
        { name: 'Altun Ha & Cave Tubing', path: '/tour/altun-ha-cave-tubing' },
        { name: 'Xunantunich & Cave Tubing', path: '/tour/xunantunich-cave-tubing' },
        { name: 'Cave Tubing / Zip-lining', path: '/tour/cave-tubing-ziplining' },
        { name: 'Lamanai', path: '/tour/lamanai' },
        { name: 'ATM Caves', path: '/tour/atm-caves' },
      ]
    },
    { name: 'Your Trip', path: '/reservations', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Travel Guides', path: '/blog', icon: <BookOpen className="w-5 h-5" /> },
  ];

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#001219] shadow-2xl border-b border-white/5' : 'bg-[#001219] md:bg-transparent border-b border-white/5 md:border-none'}`}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center transition-opacity hover:opacity-85" aria-label="Action Divers & Adventures home">
              <img
                src="/images/brand/brand-logo-header-reverse-transparent.webp"
                alt="Action Divers & Adventures"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-11 w-auto max-w-[210px] object-contain sm:h-12 lg:h-14 lg:max-w-[260px]"
              />
            </Link>
          </div>

          <div className="hidden h-full flex-1 items-center justify-end gap-x-3 lg:ml-8 lg:mt-1.5 lg:flex xl:ml-12 xl:mt-0 xl:gap-x-5">
            {navItems.map((item) => (
              <div 
                key={item.name} 
                className="relative h-full flex items-center"
                onMouseEnter={() => item.items && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.items ? (
                  <div className="flex items-center h-full">
                    {/* Replaced Link with a non-navigational parent to prevent hash collision errors */}
                    <div className="flex items-center h-full cursor-pointer group">
                      <Link 
                        to={item.path}
                        className={`flex h-full items-center whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] outline-none transition-colors duration-300 ${activeDropdown === item.name || location.pathname === item.path ? 'text-[var(--brand-ivory)]' : 'text-[#8DDCE7]/75 hover:text-[var(--brand-aqua)]'}`}
                      >
                        {item.name}
                      </Link>
                      <ChevronDown className={`ml-1 w-3 h-3 text-[#8DDCE7]/45 transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180 text-[var(--brand-aqua)]' : ''}`} />
                    </div>
                  </div>
                ) : (
                  <Link 
                    to={item.path!} 
                    className={`group relative flex h-full items-center whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] outline-none transition-colors duration-300 ${location.pathname === item.path ? 'text-[var(--brand-ivory)]' : 'text-[#8DDCE7]/75 hover:text-[var(--brand-aqua)]'}`}
                  >
                    {item.name}
                    {item.path === '/reservations' && cartItems.length > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-orange)] px-1.5 text-[11px] text-white">{cartItems.length}</span>
                    )}
                  </Link>
                )}

                {item.items && activeDropdown === item.name && (
                  <div className="absolute left-0 top-full w-64 pt-1 z-50">
                    <div className="bg-[#001219] border border-white/10 rounded-2xl shadow-2xl py-4 animate-fade-in">
                      {item.items.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className="block px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#8DDCE7]/70 transition-colors hover:bg-white/5 hover:text-[var(--brand-aqua)]"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
          </div>

          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(true)} 
              className="text-[var(--brand-aqua)] p-2"
              aria-label="Open Menu"
            >
              <Menu className="h-7 w-7" />
            </button>
          </div>

        </div>
      </div>

      <div 
        className={`lg:hidden fixed inset-0 z-[200] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className="absolute inset-0 bg-black/80 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
        
        <div className={`absolute top-0 right-0 w-[85%] max-w-[320px] h-full bg-[#050f14] shadow-[-30px_0_70px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="flex items-center justify-between p-7 border-b border-white/5 bg-[#050f14] shrink-0">
            <div className="text-sm font-bold font-extrabold tracking-tight text-[var(--brand-ivory)] tracking-[0.3em] uppercase">Menu</div>
            <button onClick={() => setIsOpen(false)} className="text-[#8DDCE7]/45 hover:text-[var(--brand-aqua)] p-2">
              <X className="w-7 h-7" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="py-4 flex flex-col">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.items ? (
                    <div>
                      <button 
                        onClick={() => setMobileExpanded(mobileExpanded === item.name ? null : item.name)}
                        className={`w-full flex items-center px-7 py-5 gap-5 transition-colors ${mobileExpanded === item.name ? 'text-[var(--brand-ivory)] bg-white/5' : 'text-[#8DDCE7]/80'}`}
                      >
                        <span className="text-[#8DDCE7]/40">{item.icon}</span>
                        <span className="flex-1 text-left text-lg font-bold tracking-tight">{item.name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileExpanded === item.name ? 'rotate-180' : 'text-[#F8F4E8]/20'}`} />
                      </button>
                      
                      {mobileExpanded === item.name && (
                        <div className="bg-black/40 py-2 border-y border-white/5">
                          {/* Top-level link added to mobile expanded view */}
                          <Link
                            to={item.path!}
                            className="flex items-center px-16 py-4 text-sm font-bold text-[var(--brand-ivory)] hover:text-white transition-colors uppercase tracking-[0.1em] bg-white/5"
                          >
                            All {item.name}
                          </Link>
                          {item.items.map((sub) => (
                            <Link
                              key={sub.name}
                              to={sub.path}
                              className="flex items-center px-16 py-4 text-sm font-bold text-[#8DDCE7]/65 hover:text-[var(--brand-aqua)] transition-colors uppercase tracking-[0.1em]"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path!}
                      className={`flex items-center px-7 py-5 gap-5 transition-colors ${location.pathname === item.path ? 'text-[var(--brand-ivory)] bg-white/5' : 'text-[#8DDCE7]/80'}`}
                    >
                      <span className="text-[#8DDCE7]/40">{item.icon}</span>
                      <span className="text-lg font-bold tracking-tight">{item.name}</span>
                      {item.path === '/reservations' && cartItems.length > 0 && (
                        <span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--brand-orange)] px-2 text-xs font-bold text-white">{cartItems.length}</span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 border-t border-white/5 bg-[#030a0d]">
              <div className="mb-10">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#F8F4E8]/55">Inquiries</p>
                <a href="tel:0115016712624" className="text-2xl font-extrabold tracking-tight text-[#F8F4E8] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#11C7D9]/20 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[#F8F4E8]" />
                  </div>
                  011-501-671-2624
                </a>
              </div>

              <p className="border-t border-white/5 pt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#F8F4E8]/35">Action Divers Belize</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
