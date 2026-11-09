import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Menu, X } from 'lucide-react';

// EXACT SEQUENCE: Home, About Us, Destination, Our Packages, Blog, Contact
const NAV_ITEMS = [
  { label: 'Home', sectionId: 'hero', path: '/' },
  { label: 'About Us', sectionId: 'about', path: '/#about' },
  { label: 'Destination', sectionId: 'destinations', path: '/#destinations' },
  { label: 'Our Packages', sectionId: 'featured-tours', path: '/tours' },
  { label: 'Blog', sectionId: 'journal-preview', path: '/blog' },
  { label: 'Contact', sectionId: 'footer', path: '/contact' },
];

export default function BhromonNav({ mode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Home');
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const navContainerRef = useRef(null);
  const itemRefs = useRef({});
  const isManualNavigatingRef = useRef(false);
  const manualNavTimeoutRef = useRef(null);

  // 1. Silky Smooth Sliding Pill Tracker (uses offsetLeft/offsetWidth for zero layout jitter)
  useEffect(() => {
    const updatePill = () => {
      const activeEl = itemRefs.current[activeSection];
      const containerEl = navContainerRef.current;
      if (activeEl && containerEl) {
        setPillStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1,
        });
      }
    };

    // Update on render or frame
    const rafId = requestAnimationFrame(updatePill);
    window.addEventListener('resize', updatePill);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePill);
    };
  }, [activeSection, isHome]);

  // 2. Deterministic, Flicker-Free Scrollspy (with hysteresis and programmatic click lock)
  useEffect(() => {
    if (!isHome) {
      if (location.pathname.startsWith('/tours')) {
        setActiveSection('Our Packages');
      } else if (location.pathname.startsWith('/blog')) {
        setActiveSection('Blog');
      } else if (location.pathname.startsWith('/contact')) {
        setActiveSection('Contact');
      } else if (location.pathname.startsWith('/booking')) {
        setActiveSection('Our Packages');
      } else {
        setActiveSection('Home');
      }
      return;
    }

    let ticking = false;

    const updateActiveSection = () => {
      // Do not let scrollspy hijack the pill when the user explicitly clicked a nav tab
      if (isManualNavigatingRef.current) {
        ticking = false;
        return;
      }

      // Top of screen
      if (window.scrollY < 180) {
        setActiveSection('Home');
        ticking = false;
        return;
      }

      // Bottom of page
      const docHeight = document.documentElement.scrollHeight;
      const windowBottom = window.scrollY + window.innerHeight;
      if (docHeight - windowBottom < 120) {
        setActiveSection('Contact');
        ticking = false;
        return;
      }

      const scrollPos = window.scrollY + 200;

      const sectionElements = [
        { id: 'hero', label: 'Home' },
        { id: 'about', label: 'About Us' },
        { id: 'destinations', label: 'Destination' },
        { id: 'featured-tours', label: 'Our Packages' },
        { id: 'journal-preview', label: 'Blog' },
        { id: 'footer', label: 'Contact' },
      ];

      let current = 'Home';
      for (const s of sectionElements) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            current = s.label;
          }
        }
      }
      setActiveSection(current);
      ticking = false;
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateActiveSection();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (manualNavTimeoutRef.current) clearTimeout(manualNavTimeoutRef.current);
    };
  }, [isHome, location.pathname]);

  const handleNavClick = (e, item) => {
    setMobileOpen(false);
    
    // Lock scrollspy immediately so pill moves smoothly to destination without catching intermediate tabs
    isManualNavigatingRef.current = true;
    setActiveSection(item.label);
    if (manualNavTimeoutRef.current) clearTimeout(manualNavTimeoutRef.current);
    manualNavTimeoutRef.current = setTimeout(() => {
      isManualNavigatingRef.current = false;
    }, 950);

    if (item.sectionId && isHome) {
      e.preventDefault();
      const el = document.getElementById(item.sectionId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 75;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else if (item.sectionId && !isHome && item.path.includes('#')) {
      e.preventDefault();
      navigate('/#' + item.sectionId);
    }
  };

  const handleSearchClick = () => {
    if (isHome) {
      const el = document.getElementById('tour-search');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector('input');
        if (input) setTimeout(() => input.focus(), 300);
      }
    } else {
      navigate('/tours');
    }
  };

  const handlePlanTripClick = (e) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent('open-booking-modal', {
        detail: { title: 'Tailor-Made Luxury Journey' },
      })
    );
  };

  return (
    <>
      {/* 
        ========================================================================
        PURE FLOATING GLASSMORPHISM CAPSULE NAVBAR
        - No full-width bottom strip / bar across the screen
        - No dot blink
        - Water-drop / Jelly sliding indicator
        ========================================================================
      */}
      <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
        <div
          className={`pointer-events-auto max-w-[1240px] w-full mx-auto px-5 sm:px-7 h-14 sm:h-16 rounded-full flex items-center justify-between transition-all duration-400 ${
            scrolled || mode === 'solid' || !isHome
              ? 'bg-white/75 backdrop-blur-2xl border border-white/60 shadow-[0_12px_40px_rgba(16,31,49,0.1)]'
              : 'bg-white/45 backdrop-blur-xl border border-white/45 shadow-[0_8px_30px_rgba(16,31,49,0.06)]'
          }`}
        >
          {/* Typographic Logo */}
          <Link
            to="/"
            onClick={() => setActiveSection('Home')}
            className="flex flex-col leading-none shrink-0 group focus:outline-none"
          >
            <span className="font-brand text-lg sm:text-[21px] tracking-[0.14em] text-[#101F31] font-bold group-hover:text-[#A5422B] transition-colors">
              BHROMON
            </span>
            <span className="text-[7.5px] sm:text-[8px] tracking-[0.26em] text-[#69665F] font-semibold uppercase mt-0.5">
              Travel Beyond Borders
            </span>
          </Link>

          {/* Desktop Capsule Menu with Water-Drop / Jelly Sliding Indicator */}
          <nav
            ref={navContainerRef}
            className="hidden lg:flex items-center relative bg-white/40 backdrop-blur-md p-1 rounded-full border border-white/50 shadow-2xs"
          >
            {/* Smooth Sliding Background Pill (Zero Overshoot Catch) */}
            <div
              style={{
                transform: `translate3d(${pillStyle.left}px, 0, 0)`,
                width: `${pillStyle.width}px`,
                opacity: pillStyle.opacity,
                transition: 'transform 0.32s cubic-bezier(0.2, 0.85, 0.25, 1), width 0.32s cubic-bezier(0.2, 0.85, 0.25, 1), opacity 0.2s ease',
                willChange: 'transform, width',
              }}
              className="absolute top-1 bottom-1 rounded-full bg-[#101F31] shadow-xs pointer-events-none z-0"
            />

            {/* Nav Links */}
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.label;
              return (
                <Link
                  key={item.label}
                  ref={(el) => (itemRefs.current[item.label] = el)}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`relative z-10 px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-colors duration-250 cursor-pointer select-none ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-[#4A4843] hover:text-[#101F31]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Plan Your Trip CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              aria-label="Search destinations and tours"
              onClick={handleSearchClick}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#101F31] hover:text-[#A5422B] flex items-center justify-center shadow-2xs border border-white/60 transition-all duration-250 hover:scale-105 active:scale-95 cursor-pointer"
              title="Search tours & destinations"
            >
              <Search className="w-4 h-4 stroke-[1.9]" />
            </button>

            {/* Plan Your Trip CTA */}
            <button
              type="button"
              onClick={handlePlanTripClick}
              className="hidden sm:inline-flex items-center gap-2 bg-[#101F31] hover:bg-[#1E3455] text-white rounded-full px-5 py-2 text-[12px] font-semibold tracking-wide transition-all duration-250 shadow-xs hover:shadow-md hover:scale-102 active:scale-95 cursor-pointer"
            >
              <span>Plan Your Trip</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white/80 border border-white/60 text-[#101F31] active:scale-95 cursor-pointer"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-[#101F31]/60 backdrop-blur-md"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-[#FBF7F0]/95 backdrop-blur-2xl shadow-2xl border-l border-[#D8CEC1]/60 flex flex-col justify-between p-6 transform transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-[#D8CEC1]/60">
              <div className="flex flex-col">
                <span className="font-brand text-xl font-bold tracking-[0.14em] text-[#101F31]">
                  BHROMON
                </span>
                <span className="text-[8px] tracking-[0.24em] uppercase text-[#69665F]">
                  Travel Beyond Borders
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#D8CEC1]/60 flex items-center justify-center text-[#101F31] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex flex-col py-6 gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.label;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#101F31] text-white shadow-xs font-semibold'
                        : 'text-[#303438] hover:bg-white/80 hover:text-[#A5422B]'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-[#D8CEC1]/60 flex flex-col gap-3">
            <button
              type="button"
              onClick={(e) => {
                setMobileOpen(false);
                handlePlanTripClick(e);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#101F31] text-white rounded-full py-3 text-xs font-semibold tracking-wider uppercase shadow-md cursor-pointer"
            >
              <span>Plan Your Trip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
