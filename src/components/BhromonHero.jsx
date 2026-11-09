import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  ArrowRight, 
  Play, 
  Star, 
  Compass, 
  Trophy, 
  ChevronDown,
  Menu,
  Sparkles
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function BhromonHero({ onReplayPreloader, isPreloading }) {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const navRef = useRef(null);
  
  // Parallax Layer Refs
  const layer1Ref = useRef(null); // Deep Background: Varanasi Panorama (River, Ghats, Temples, Sunrise)
  const layer2Ref = useRef(null); // Midground: Atmospheric Morning Sun Flare & Golden Mist
  const layer3Ref = useRef(null); // Foreground: Sandstone Pavilion Arch, Steps & Seated Traveler

  // Content Refs
  const eyebrowRef = useRef(null);
  const headlineRef = useRef(null);
  const descRef = useRef(null);
  const ctaRef = useRef(null);
  const cardRef = useRef(null);
  const searchRef = useRef(null);
  const statsRef = useRef(null);
  const badgeRef = useRef(null);
  const scrollRef = useRef(null);
  const dimOverlayRef = useRef(null);

  // Recalculate ScrollTrigger on preloader completion or window resize
  useEffect(() => {
    if (!isPreloading) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isPreloading]);

  // 1. Mouse Move / Parallax Tilt (Desktop 2.5D Living Depth)
  const handleMouseMove = (e) => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;
    const { clientX, clientY } = e;
    const xPos = (clientX / window.innerWidth - 0.5) * 20;
    const yPos = (clientY / window.innerHeight - 0.5) * 14;

    // Foreground layer shifts most prominently (closest to camera)
    if (layer3Ref.current) {
      gsap.to(layer3Ref.current, {
        x: -xPos * 0.8,
        y: -yPos * 0.6,
        duration: 1.2,
        ease: 'power2.out'
      });
    }

    // Atmospheric layer shifts gently
    if (layer2Ref.current) {
      gsap.to(layer2Ref.current, {
        x: xPos * 0.4,
        y: yPos * 0.3,
        duration: 1.4,
        ease: 'power2.out'
      });
    }

    // Deep background shifts subtly to establish vast distance
    if (layer1Ref.current) {
      gsap.to(layer1Ref.current, {
        x: -xPos * 0.2,
        y: -yPos * 0.15,
        duration: 1.6,
        ease: 'power2.out'
      });
    }

    // Floating glass destination card tilts smoothly in 3D
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        x: xPos * 0.6,
        y: yPos * 0.5,
        rotationY: xPos * 0.35,
        rotationX: -yPos * 0.35,
        duration: 1.4,
        ease: 'power2.out'
      });
    }
  };

  // 2. Lifecycle: Smooth Momentum Scroll + GSAP ScrollTrigger Multi-Plane Timeline
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8
    });

    lenis.on('scroll', ScrollTrigger.update);
    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Continuous gentle rotation of the sacred circular travel seal
      if (badgeRef.current) {
        gsap.to(badgeRef.current, {
          rotation: 360,
          duration: 32,
          repeat: -1,
          ease: 'none'
        });
      }

      // Initial Entrance Animation Timeline
      const entranceTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      gsap.set(layer1Ref.current, { scale: 1.08, opacity: 0.95 });
      gsap.set(layer2Ref.current, { scale: 1.04, opacity: 0 });
      gsap.set(layer3Ref.current, { scale: 1.05, opacity: 0 });
      gsap.set(navRef.current, { y: -20, opacity: 0 });
      gsap.set(eyebrowRef.current, { y: 20, opacity: 0 });
      gsap.set(headlineRef.current, { y: 35, opacity: 0 });
      gsap.set(descRef.current, { y: 22, opacity: 0 });
      gsap.set(ctaRef.current, { y: 20, opacity: 0 });
      gsap.set(cardRef.current, { x: 40, opacity: 0 });
      gsap.set(searchRef.current, { y: 35, opacity: 0 });
      gsap.set(statsRef.current, { y: 20, opacity: 0 });
      gsap.set(scrollRef.current, { opacity: 0 });

      entranceTl
        .to(layer1Ref.current, { scale: 1.02, opacity: 1, duration: 1.6, ease: 'power2.out' }, 0)
        .to(layer2Ref.current, { scale: 1.0, opacity: 1, duration: 1.5, ease: 'power2.out' }, 0.1)
        .to(layer3Ref.current, { scale: 1.0, opacity: 1, duration: 1.6, ease: 'power2.out' }, 0.2)
        .to(navRef.current, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.25)
        .to(eyebrowRef.current, { y: 0, opacity: 1, duration: 0.8 }, 0.4)
        .to(headlineRef.current, { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out' }, 0.5)
        .to(descRef.current, { y: 0, opacity: 1, duration: 0.85 }, 0.7)
        .to(ctaRef.current, { y: 0, opacity: 1, duration: 0.85 }, 0.8)
        .to(cardRef.current, { x: 0, opacity: 1, duration: 1.05, ease: 'power3.out' }, 0.75)
        .to(searchRef.current, { y: 0, opacity: 1, duration: 0.95, ease: 'power3.out' }, 0.9)
        .to(statsRef.current, { y: 0, opacity: 1, duration: 0.85 }, 1.05)
        .to(scrollRef.current, { opacity: 1, duration: 0.8 }, 1.15);

      // ========================================================================
      // RESPONSIVE SCROLL CHOREOGRAPHY (Desktop Sticky Pin vs Mobile Natural Flow)
      // ========================================================================
      const mm = gsap.matchMedia();

      // DESKTOP: (min-width: 1024px)
      // Sticky pinning choreography (100vh pin with pinSpacing: false)
      // As the user scrolls, hero stays pinned while the About section slides above it.
      mm.add("(min-width: 1024px)", () => {
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '+=100%',
            scrub: 1,
            pin: true,
            pinSpacing: false,
            anticipatePin: 1
          }
        });

        // Layer 3 (Foreground Archway, Steps & Traveler):
        scrollTl.fromTo(layer3Ref.current,
          { x: 0, y: 0, scale: 1.0 },
          { x: -25, y: -45, scale: 1.07, ease: 'none' },
          0
        );

        // Layer 2 (Atmospheric Depth & Sun Flare):
        scrollTl.fromTo(layer2Ref.current,
          { x: 0, y: 0, scale: 1.0 },
          { x: -30, y: -20, scale: 1.04, ease: 'none' },
          0
        );

        // Layer 1 (Deep Background Varanasi Panorama):
        scrollTl.fromTo(layer1Ref.current,
          { y: 0, scale: 1.0 },
          { y: -18, scale: 1.025, ease: 'none' },
          0
        );

        // Cinematic Dimming Overlay (Gives physical depth as white section glides over)
        if (dimOverlayRef.current) {
          scrollTl.fromTo(dimOverlayRef.current,
            { opacity: 0 },
            { opacity: 0.35, ease: 'none' },
            0
          );
        }

        // Editorial Typography & CTAs (Gently drifts up with subtle fade)
        scrollTl.fromTo([eyebrowRef.current, headlineRef.current, descRef.current, ctaRef.current],
          { y: 0, opacity: 1 },
          { y: -65, opacity: 0.25, stagger: 0.02, ease: 'power1.inOut' },
          0
        );

        // Glass Destination Card:
        scrollTl.fromTo(cardRef.current,
          { x: 0, opacity: 1 },
          { x: 35, opacity: 0.35, ease: 'power1.inOut' },
          0
        );

        // Floating Search Bar:
        scrollTl.fromTo(searchRef.current,
          { y: 0, opacity: 1 },
          { y: 45, opacity: 0, ease: 'power1.inOut' },
          0
        );

        // Bottom Statistics, Scroll Indicator & Badge:
        scrollTl.fromTo([statsRef.current, scrollRef.current, badgeRef.current],
          { y: 0, opacity: 1 },
          { y: 30, opacity: 0, stagger: 0.02, ease: 'power1.inOut' },
          0
        );
      });

      // MOBILE & TABLET: (max-width: 1023px)
      // Allow mobile users to naturally scroll through all hero components
      // (Headline -> Destination Card -> Search Bar -> Stats) without premature pinning.
      mm.add("(max-width: 1023px)", () => {
        gsap.to(layer1Ref.current, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      });

    }, containerRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
    >
      {/* 
        ========================================================================
        PINNED FULL-VIEWPORT HERO SECTION
        ========================================================================
      */}
      <section 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        aria-label="Bhromon Hero"
        className="relative min-h-[100svh] lg:h-[100svh] w-full overflow-visible lg:overflow-hidden bg-[#F4F1E8] text-[#111111] flex flex-col justify-between select-none"
      >
        {/* 
          ======================================================================
          MULTI-PLANE 2.5D PARALLAX DEPTH LAYERS
          ======================================================================
          In initial rest state (scroll = 0), all 3 layers align seamlessly at (0, 0),
          appearing 100% identical to the authentic Varanasi hero photograph.
          Upon scrolling, each layer translates at differential velocities to produce
          the Dribbble "Origin" spatial depth effect.
        */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          
          {/* LAYER 1: Deep Background Canvas (Sky, Sunrise, Distant Hills & River) */}
          <div 
            ref={layer1Ref}
            className="absolute inset-0 w-full h-full bg-cover bg-no-repeat will-change-transform"
            style={{
              backgroundImage: `url('/images/layers/layer-1-sky-bg.jpg')`,
              backgroundPosition: 'center 38%'
            }}
          />

          {/* LAYER 2: Atmospheric Depth Plane (Sun Flare, Golden Glow & Morning River Mist) */}
          <div 
            ref={layer2Ref}
            className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
            style={{
              background: 'radial-gradient(ellipse 55% 45% at 65% 32%, rgba(255, 215, 140, 0.22) 0%, rgba(255, 180, 80, 0.08) 50%, transparent 80%)'
            }}
          />

          {/* LAYER 3: Foreground Plane (Carved Sandstone Archway, Stone Steps & Traveler) */}
          <div 
            ref={layer3Ref}
            className="absolute inset-0 w-full h-full bg-cover bg-no-repeat will-change-transform"
            style={{
              backgroundImage: `url('/images/layers/layer-3-foreground.png')`,
              backgroundPosition: 'center 38%'
            }}
          />

          {/* Subtle Top Gradient for Header Legibility */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-stone-900/18 via-transparent to-transparent pointer-events-none" />

          {/* Delicate Left Ambient Wash for Headline Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50/45 via-amber-50/15 to-transparent w-full lg:w-3/5 pointer-events-none" />

          {/* Bottom Gradient for Stats & Search Panel Contrast */}
          <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none" />

          {/* Cinematic Dimming Overlay on Parallax Scroll (Deepens contrast under white section) */}
          <div 
            ref={dimOverlayRef} 
            className="absolute inset-0 bg-black/45 opacity-0 pointer-events-none transition-opacity" 
          />
        </div>

        {/* 
          ======================================================================
          02. LIGHTWEIGHT REFINED NAVIGATION BAR (IMAGE 1 SPECIFICATION)
          ======================================================================
        */}
        <header 
          ref={navRef}
          className="relative z-30 w-full pt-6 sm:pt-8 px-6 sm:px-12 lg:px-16 max-w-[1440px] mx-auto flex items-center justify-between"
        >
          {/* Left: BHROMON Brand Wordmark & Descriptor */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="#" className="flex items-center group">
              <span className="font-sans font-black text-2xl sm:text-[27px] tracking-[0.05em] text-[#111111] flex items-center">
                <span>BHR</span>
                <span className="relative inline-flex items-center justify-center mx-[1.5px] w-[21px] h-[21px] sm:w-[23px] sm:h-[23px] rounded-full bg-[#111111] text-white overflow-hidden shadow-xs">
                  <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none">
                    <path d="M2.5 15.5L7 7.5L10 12L13.5 5.5L17.5 15.5H2.5Z" fill="#F4F1E8" />
                  </svg>
                </span>
                <span>MON</span>
              </span>
            </a>

            {/* Saffron/terracotta separator & refined descriptor */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-800/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B85C32]"></span>
              <span className="text-[10px] tracking-[0.22em] font-medium text-stone-700 uppercase">
                TRAVEL • DISCOVER • EXPERIENCE
              </span>
            </div>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-[13px] font-medium text-stone-900 tracking-wide">
            <a href="#destinations" className="hover:text-[#123C2A] transition-colors">Destinations</a>
            <a href="#tours" className="hover:text-[#123C2A] transition-colors">Tours</a>
            <a href="#experiences" className="hover:text-[#123C2A] transition-colors">Experiences</a>
            <a href="#journal" className="hover:text-[#123C2A] transition-colors">Journal</a>
            <a href="#about" className="hover:text-[#123C2A] transition-colors">About</a>
          </nav>

          {/* Right Actions: Search Icon, Plan Your Trip Pill, Hamburger */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              aria-label="Search"
              className="w-10 h-10 rounded-full bg-white/85 hover:bg-white text-stone-900 flex items-center justify-center backdrop-blur-md border border-black/5 shadow-xs transition-transform hover:scale-105 cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[1.8]" />
            </button>

            <button className="hidden sm:inline-flex bg-[#123C2A] hover:bg-[#184D36] text-white rounded-full px-6 py-2.5 text-xs font-semibold tracking-wider transition-all shadow-sm hover:shadow-md items-center gap-2 cursor-pointer">
              <span>Plan Your Trip</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>

            <button 
              aria-label="Toggle navigation menu"
              className="p-2 text-stone-900 hover:text-[#123C2A] transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6 stroke-[1.75]" />
            </button>
          </div>
        </header>

        {/* 
          ======================================================================
          03. HERO MAIN BODY (Content Left + Floating Destination Card Right)
          ======================================================================
        */}
        <div className="relative z-20 max-w-[1440px] mx-auto px-5 sm:px-12 lg:px-16 w-full pt-4 sm:pt-8 lg:pt-12 pb-6 lg:pb-2 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Editorial Typography & Actions */}
            <div className="lg:col-span-7 flex flex-col items-start max-w-[540px]">
              {/* Eyebrow */}
              <div 
                ref={eyebrowRef}
                className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold tracking-[0.20em] text-stone-800 uppercase mb-3 sm:mb-4 will-change-transform"
              >
                <span>EXPLORE  •  DISCOVER  •  EXPERIENCE</span>
              </div>

              {/* Main Editorial Headline */}
              <h1 
                ref={headlineRef}
                className="font-display font-medium text-[2.75rem] sm:text-[4.25rem] lg:text-[5.4rem] xl:text-[5.8rem] leading-[0.92] tracking-[-0.02em] text-[#111111] mb-4 sm:mb-6 will-change-transform"
              >
                India <br />
                Beyond <br />
                <span className="font-editorial italic font-normal text-[#173F2D]">
                  Boundaries.
                </span>
              </h1>

              {/* Description */}
              <p 
                ref={descRef}
                className="text-[15px] sm:text-[16px] text-stone-900 leading-[1.55] max-w-[440px] font-normal mb-6 sm:mb-8 will-change-transform"
              >
                Curated journeys, unforgettable destinations and experiences designed around the way you want to travel.
              </p>

              {/* Primary Actions */}
              <div ref={ctaRef} className="flex flex-wrap items-center gap-5 sm:gap-7 will-change-transform">
                <a
                  href="#destinations"
                  className="bg-[#123C2A] hover:bg-[#184D36] text-white rounded-full px-7 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg hover:translate-x-0.5 flex items-center gap-2.5 cursor-pointer h-[52px]"
                >
                  <span>Explore Destinations</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </a>

                <button 
                  onClick={onReplayPreloader}
                  className="inline-flex items-center gap-3 group text-left cursor-pointer transition-opacity hover:opacity-90"
                >
                  <div className="w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#111111] flex items-center justify-center backdrop-blur-md shadow-xs transition-transform group-hover:scale-105 border border-black/10">
                    <Play className="w-4 h-4 fill-current ml-0.5 text-stone-900" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-stone-950 group-hover:text-[#123C2A] transition-colors leading-tight">
                      Watch Our Journey
                    </span>
                    <span className="text-[11px] text-stone-600 font-medium">
                      2 min
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Floating Glassmorphic Destination Card */}
            <div className="lg:col-span-5 flex justify-end mt-4 lg:mt-0">
              <div 
                ref={cardRef}
                className="w-full max-w-[370px] rounded-3xl p-5 sm:p-5.5 bg-[#1F1914]/55 backdrop-blur-xl border border-white/20 shadow-2xl text-white transition-all hover:border-white/30 will-change-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 pr-1">
                    <span className="text-[10px] tracking-[0.24em] text-white/70 font-semibold uppercase block">
                      NEXT DESTINATION
                    </span>
                    <h3 className="font-display text-2xl sm:text-[28px] font-normal text-white mt-1 leading-tight">
                      Varanasi
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/85 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#E07A5F] shrink-0" />
                      <span>Uttar Pradesh, India</span>
                    </div>
                    <p className="text-xs text-white/80 mt-2.5 leading-relaxed font-light">
                      “Timeless ghats, spiritual vibes and a journey within.”
                    </p>
                  </div>

                  <div className="w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-white/25 shadow-md relative">
                    <img 
                      src="/images/varanasi-thumb.jpg" 
                      alt="Varanasi Ghats at Sunrise"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/12 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 overflow-hidden">
                      <img className="inline-block h-7 w-7 rounded-full ring-1 ring-white/40 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Traveler" />
                      <img className="inline-block h-7 w-7 rounded-full ring-1 ring-white/40 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Traveler" />
                      <img className="inline-block h-7 w-7 rounded-full ring-1 ring-white/40 object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" alt="Traveler" />
                      <img className="inline-block h-7 w-7 rounded-full ring-1 ring-white/40 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Traveler" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/95 font-medium">
                      <Star className="w-3.5 h-3.5 fill-[#D7A43A] text-[#D7A43A]" />
                      <span className="font-semibold">4.8</span>
                      <span className="text-white/65 text-[11px]">(2.1K reviews)</span>
                    </div>
                  </div>

                  <button 
                    aria-label="View Varanasi Tour"
                    className="w-10 h-10 rounded-full bg-white text-stone-950 flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer shrink-0"
                  >
                    <ArrowRight className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 
          ======================================================================
          04. FLOATING SEARCH BAR & BOTTOM STATUS ROW
          ======================================================================
        */}
        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-4 sm:px-12 lg:px-16 pb-8 sm:pb-10 pt-4 lg:pt-0">
          
          {/* Floating Travel Search Panel */}
          <div 
            ref={searchRef}
            className="w-full max-w-[1060px] mx-auto bg-[#F4F1E8]/94 backdrop-blur-xl rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-2xl border border-white/60 mb-6 sm:mb-8 will-change-transform"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1 sm:gap-2 divide-y divide-stone-900/10 sm:divide-y-0">
              
              <div className="flex-1 flex items-center gap-3.5 px-4 py-2 sm:py-1.5 cursor-pointer hover:bg-stone-100/60 rounded-xl sm:rounded-full transition-colors">
                <MapPin className="w-5 h-5 text-stone-900 shrink-0 stroke-[1.8]" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#111111]">Where do you want to go?</span>
                  <span className="text-[11px] text-stone-500 truncate">Search destinations, experiences...</span>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-stone-900/12 shrink-0" />

              <div className="flex-1 flex items-center justify-between px-4 py-2 sm:py-1.5 cursor-pointer hover:bg-stone-100/60 rounded-xl sm:rounded-full transition-colors">
                <div className="flex items-center gap-3.5">
                  <Calendar className="w-5 h-5 text-stone-900 shrink-0 stroke-[1.8]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#111111]">Travel Date</span>
                    <span className="text-[11px] text-stone-500">Select date</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-500 stroke-[1.8]" />
              </div>

              <div className="hidden sm:block h-8 w-px bg-stone-900/12 shrink-0" />

              <div className="flex-1 flex items-center justify-between px-4 py-2 sm:py-1.5 cursor-pointer hover:bg-stone-100/60 rounded-xl sm:rounded-full transition-colors">
                <div className="flex items-center gap-3.5">
                  <Users className="w-5 h-5 text-stone-900 shrink-0 stroke-[1.8]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#111111]">Travelers</span>
                    <span className="text-[11px] text-stone-500">2 travelers</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-500 stroke-[1.8]" />
              </div>

              <button className="bg-[#123C2A] hover:bg-[#184D36] text-white rounded-xl sm:rounded-full px-6 sm:px-7 py-3 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0 mt-1 sm:mt-0">
                <Search className="w-4 h-4 stroke-[2]" />
                <span>Search Tours</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </button>

            </div>
          </div>

          {/* Bottom Bar: Scroll, Metrics & Sacred Travel Seal */}
          <div 
            ref={statsRef}
            className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-1 text-white relative will-change-transform"
          >
            {/* Scroll Indicator */}
            <div ref={scrollRef} className="hidden lg:flex items-center gap-3 text-white/80 shrink-0">
              <div className="w-5 h-9 rounded-full border border-white/70 flex items-start justify-center p-1.5">
                <div className="w-1 h-2 rounded-full bg-white animate-bounce" />
              </div>
              <span className="text-[10px] tracking-[0.24em] font-semibold uppercase text-white/75">
                SCROLL TO DISCOVER
              </span>
            </div>

            {/* 4 Statistics Metrics */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8 lg:gap-10 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-white/85 shrink-0 stroke-[1.75]" />
                <div>
                  <div className="text-base sm:text-lg font-semibold text-white leading-tight">150+</div>
                  <div className="text-[10px] tracking-wider uppercase text-white/70 font-medium">Destinations</div>
                </div>
              </div>

              <div className="hidden sm:block h-6 w-px bg-white/20" />

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-white/85 shrink-0 stroke-[1.75]" />
                <div>
                  <div className="text-base sm:text-lg font-semibold text-white leading-tight">50K+</div>
                  <div className="text-[10px] tracking-wider uppercase text-white/70 font-medium">Happy Travelers</div>
                </div>
              </div>

              <div className="hidden sm:block h-6 w-px bg-white/20" />

              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-[#D7A43A] fill-[#D7A43A] shrink-0" />
                <div>
                  <div className="text-base sm:text-lg font-semibold text-white leading-tight">4.9</div>
                  <div className="text-[10px] tracking-wider uppercase text-white/70 font-medium">Average Rating</div>
                </div>
              </div>

              <div className="hidden sm:block h-6 w-px bg-white/20" />

              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-white/85 shrink-0 stroke-[1.75]" />
                <div>
                  <div className="text-base sm:text-lg font-semibold text-white leading-tight">10+</div>
                  <div className="text-[10px] tracking-wider uppercase text-white/70 font-medium">Years of Experience</div>
                </div>
              </div>
            </div>

            {/* Bottom Right: Circular Travel Seal + Ganges Waves */}
            <div className="hidden lg:flex items-center justify-end relative shrink-0">
              <div className="relative w-24 h-24 flex items-center justify-center">
                
                <svg 
                  ref={badgeRef}
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
                  <path
                    id="circlePath"
                    d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                    fill="none"
                  />
                  <text className="text-[6.8px] uppercase tracking-[0.24em] fill-white/85 font-semibold">
                    <textPath href="#circlePath" startOffset="0%">
                      • TRAVEL • EXPLORE • EXPERIENCE •
                    </textPath>
                  </text>
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white stroke-current fill-none stroke-[1.2]" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4C10.5 7 10 10 12 14C14 10 13.5 7 12 4Z" />
                    <path d="M12 14C9 12 7.5 9 8.5 6C10 8.5 11 11.5 12 14Z" />
                    <path d="M12 14C15 12 16.5 9 15.5 6C14 8.5 13 11.5 12 14Z" />
                    <path d="M12 14C7 13.5 5 11 5.5 8C7 10.5 9.5 12.5 12 14Z" />
                    <path d="M12 14C17 13.5 19 11 18.5 8C17 10.5 14.5 12.5 12 14Z" />
                    <path d="M8 16C10.5 17 13.5 17 16 16" />
                  </svg>
                </div>

                <div className="absolute -bottom-1 -right-4 pointer-events-none opacity-70">
                  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="white" strokeWidth="0.9" strokeLinecap="round">
                    <path d="M0 4 C 5 2, 10 6, 15 4 C 20 2, 25 6, 30 4 C 35 2, 40 6, 45 4" />
                    <path d="M0 10 C 5 8, 10 12, 15 10 C 20 8, 25 12, 30 10 C 35 8, 40 12, 45 10" />
                    <path d="M0 16 C 5 14, 10 18, 15 16 C 20 14, 25 18, 30 16 C 35 14, 40 18, 45 16" />
                  </svg>
                </div>

              </div>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
