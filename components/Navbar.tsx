
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Info, Anchor, BookOpen, Phone, Images, ShoppingBag, GraduationCap, Ship } from 'lucide-react';
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

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setActiveDropdown(null);
      setMobileExpanded(null);
      setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const navItems = [
    { 
      name: 'Adventures',
      icon: <Anchor className="w-5 h-5" />,
      items: [
        { name: 'Island Adventures', path: '/island-adventures' },
        { name: 'Mainland Adventures', path: '/mainland-adventures' },
      ]
    },
    { name: 'Courses', path: '/courses', icon: <GraduationCap className="w-5 h-5" /> },
    { name: 'Transfers', mobileName: 'Transfers & Charters', path: '/transfers-charters', icon: <Ship className="w-5 h-5" /> },
    { name: 'Gallery', path: '/gallery', icon: <Images className="w-5 h-5" /> },
    { name: 'About Us', path: '/about', icon: <Info className="w-5 h-5" /> },
    { name: 'Travel Guides', path: '/blog', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Plan a Trip', path: '/reservations', icon: <ShoppingBag className="w-5 h-5" />, primary: true },
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

          <div className="hidden h-full flex-1 items-center justify-end gap-x-2 lg:ml-6 lg:flex 2xl:ml-10 2xl:gap-x-4">
            {navItems.map((item) => (
              <div 
                key={item.name} 
                className="relative h-full flex items-center"
                onMouseEnter={() => item.items && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.items ? (
                  <div className="flex items-center h-full">
                    <div className="flex items-center h-full cursor-pointer group">
                      <button type="button" aria-haspopup="menu" aria-expanded={activeDropdown === item.name} onClick={() => setActiveDropdown((open) => open === item.name ? null : item.name)} onFocus={() => setActiveDropdown(item.name)} className={`flex h-full items-center whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] outline-none transition-colors duration-300 ${activeDropdown === item.name ? 'text-[var(--brand-ivory)]' : 'text-[#8DDCE7]/75 hover:text-[var(--brand-aqua)]'}`}>
                        {item.name}
                      </button>
                      <ChevronDown className={`ml-1 w-3 h-3 text-[#8DDCE7]/45 transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180 text-[var(--brand-aqua)]' : ''}`} />
                    </div>
                  </div>
                ) : (
                  <Link 
                    to={item.path!} 
                    title={item.path === '/blog' ? 'Travel Guides' : undefined}
                    className={`group relative flex items-center whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] outline-none transition-colors duration-300 ${item.primary ? 'min-h-11 rounded-full bg-[var(--brand-orange)] px-5 text-white hover:bg-[var(--brand-orange-light)]' : `h-full ${location.pathname === item.path ? 'text-[var(--brand-ivory)]' : 'text-[#8DDCE7]/75 hover:text-[var(--brand-aqua)]'}`}`}
                  >
                    {item.path === '/blog' ? <><BookOpen className="h-4 w-4 2xl:hidden" aria-hidden="true" /><span className="sr-only 2xl:not-sr-only">Travel Guides</span></> : item.name}
                    {item.path === '/reservations' && cartItems.length > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-orange)] px-1.5 text-[11px] text-white">{cartItems.length}</span>
                    )}
                  </Link>
                )}

                {item.items && activeDropdown === item.name && (
                  <div className="absolute left-0 top-full w-64 pt-1 z-50">
                    <div role="menu" className="bg-[#001219] border border-white/10 rounded-2xl shadow-2xl py-4 animate-fade-in">
                      {item.items.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          role="menuitem"
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
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="h-7 w-7" />
            </button>
          </div>

        </div>
      </div>

      {isOpen && <div className="fixed inset-0 z-[200] lg:hidden">
        <div 
          className="absolute inset-0 bg-black/80 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
        
        <div id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Site navigation" className="absolute right-0 top-0 flex h-full w-[85%] max-w-[320px] flex-col bg-[#050f14] shadow-[-30px_0_70px_rgba(0,0,0,0.9)] animate-fade-in">
          
          <div className="flex items-center justify-between p-7 border-b border-white/5 bg-[#050f14] shrink-0">
            <div className="text-sm font-bold font-extrabold tracking-tight text-[var(--brand-ivory)] tracking-[0.3em] uppercase">Menu</div>
            <button onClick={() => setIsOpen(false)} className="text-[#8DDCE7]/45 hover:text-[var(--brand-aqua)] p-2" aria-label="Close menu">
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
                      <span className="text-lg font-bold tracking-tight">{item.mobileName ?? item.name}</span>
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
      </div>}
    </nav>
  );
};

export default Navbar;
