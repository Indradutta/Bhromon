import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, MapPin, Calendar, Heart, Stamp } from 'lucide-react';

const FULL_NOTE_TEXT = `I've always felt that the best parts of a journey are rarely the ones marked with a star on a tourist map. You can visit the famous square, take the expected photo, follow the same "Top 10" list as everyone else — and still leave without really knowing the place. That's why we created BHROMON Unmapped.

Instead of telling you what you're supposed to see, we invite you to follow the people who actually know the land. Architects, boatmen, monks, and local custodians take you through overlooked gallis, hidden high mountain passes, personal stories, and sacred corners you might otherwise walk straight past.

No checklists. No rush. Just a thoughtful way to experience the world — one story at a time.`;

const PHOTO_FRAMES = [
  {
    id: 1,
    image: '/images/darjeeling-himalayas.jpg',
    title: 'Echoes of the High Passes',
    location: 'Nubra Valley & Zanskar',
    rotation: '-rotate-3 hover:rotate-0',
    delay: 0.1,
    tag: 'Alpine Sanctuary',
    caption: '14,000 ft morning silence',
    tapePosition: 'top-left',
    desktopOffset: '',
  },
  {
    id: 2,
    image: '/images/sunset-temple.jpg',
    title: 'Ghats of Varanasi: Dawn Light',
    location: 'Dashashwamedh Ghat',
    rotation: 'rotate-4 hover:rotate-0',
    delay: 0.25,
    tag: 'Sacred Rituals',
    caption: 'Centuries of Vedic chants',
    tapePosition: 'top-right',
    desktopOffset: 'lg:translate-y-8',
    stamp: 'VARANASI • 1926',
  },
  {
    id: 3,
    image: '/images/kerala-backwaters.jpg',
    title: 'Scent of Cardamom & Salt',
    location: 'Alleppey & Munnar',
    rotation: 'rotate-2 hover:rotate-0',
    delay: 0.4,
    tag: 'Slow Travel',
    caption: 'Canals carved by time',
    tapePosition: 'top-left',
    desktopOffset: 'lg:-translate-y-4',
  },
  {
    id: 4,
    image: '/images/andaman.jpg',
    title: 'Bioluminescent Waters',
    location: 'Havelock Island',
    rotation: '-rotate-4 hover:rotate-0',
    delay: 0.55,
    tag: 'Coastal Solitude',
    caption: 'Living turquoise lights',
    tapePosition: 'top-right',
    desktopOffset: 'lg:translate-y-6',
    stamp: 'ANDAMAN • CORAL',
  },
];

export default function TravelJournal() {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [count130, setCount130] = useState(0);
  const [count850, setCount850] = useState(0);
  const [scrollYOffset, setScrollYOffset] = useState(0);

  // 1. Intersection Observer to trigger typewriter, counters, and popups
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. Parallax scroll tracker for subtle floating depth (smooth RAF, desktop-only for zero mobile jitter)
  useEffect(() => {
    let ticking = false;
    let rafId = null;

    const handleScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Only calculate when section is visible in viewport, and subtle on desktop
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const isDesktop = window.innerWidth >= 1024;
              const offset = isDesktop ? (window.innerHeight - rect.top) * 0.04 : 0;
              setScrollYOffset(offset);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // 3. Typewriter Animation for the Framed Letter
  useEffect(() => {
    if (!inView) return;

    let index = 0;
    const interval = setInterval(() => {
      index += 3; // stream 3 chars at a time for smooth readable pace
      if (index >= FULL_NOTE_TEXT.length) {
        setTypedText(FULL_NOTE_TEXT);
        clearInterval(interval);
      } else {
        setTypedText(FULL_NOTE_TEXT.slice(0, index));
      }
    }, 20);

    return () => clearInterval(interval);
  }, [inView]);

  // 4. Counting Number Animations for 130 and 850
  useEffect(() => {
    if (!inView) return;

    const duration = 1800; // 1.8 seconds
    const startTime = performance.now();

    const animateCounters = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setCount130(Math.floor(ease * 130));
      setCount850(Math.floor(ease * 850));

      if (progress < 1) {
        requestAnimationFrame(animateCounters);
      } else {
        setCount130(130);
        setCount850(850);
      }
    };

    requestAnimationFrame(animateCounters);
  }, [inView]);

  return (
    <section
      id="journal-preview"
      ref={containerRef}
      className="relative bg-[#F5EBDD] py-20 sm:py-28 px-5 sm:px-8 lg:px-14 scroll-mt-20 border-t border-[#D8CEC1]/50 overflow-hidden"
    >
      {/* Background Decorative Route Markings & Subtle Compass Watermark */}
      <div className="absolute top-12 left-10 w-96 h-96 pointer-events-none opacity-10 select-none">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" className="text-[#101F31]">
          <circle cx="100" cy="100" r="90" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="60" strokeWidth="0.8" />
          <path d="M100 10 L100 190 M10 100 L190 100" strokeWidth="0.6" />
        </svg>
      </div>

      <div className="max-w-[1380px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-[#D8CEC1]/70">
          <div>
            <p className="text-[11px] font-bold tracking-[0.28em] text-[#A5422B] uppercase mb-2">
              BHROMON JOURNAL & CHRONICLES
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-[52px] text-[#101F31] font-normal leading-[1.0] tracking-tight">
              Stories from the{' '}
              <span className="font-editorial italic font-normal text-[#101F31]">
                Unmapped Road
              </span>
            </h2>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#101F31] hover:text-[#A5422B] transition-colors group"
          >
            <span>Explore All Journal Articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 
          ========================================================================
          EDITORIAL SCRAPBOOK COMPOSITION (MATCHING USER REFERENCE SCREENSHOT)
          Left: Framed Note with Live Typewriter Write Animation
          Middle: Overlapping Animated Stat Badges (130+ Circuits and 850+ Sites)
          Right: Organic Asymmetrical Photo Frames with Pop-Up Animations & Washi Tape
          ========================================================================
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative">
          
          {/* ================================================================== */}
          {/* 1. LEFT FRAMED NOTE WITH LIVE TYPEWRITER ANIMATION                */}
          {/* ================================================================== */}
          <div className="lg:col-span-5 relative">
            <div
              className={`relative bg-[#FDEAEF] rounded-2xl p-6 sm:p-8 sm:py-10 shadow-[0_20px_45px_rgba(16,31,49,0.12)] border-2 border-[#54162B] transition-all duration-700 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {/* Ornate Inner Double Border with Classical Corner Notches */}
              <div className="absolute inset-2.5 sm:inset-3 border border-[#54162B]/50 rounded-xl pointer-events-none" />
              
              {/* Corner Flourishes */}
              <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t-2 border-l-2 border-[#54162B] pointer-events-none" />
              <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-[#54162B] pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-[#54162B] pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b-2 border-r-2 border-[#54162B] pointer-events-none" />

              {/* Title Header: UNSEEN! */}
              <div className="text-center mb-6 pt-1">
                <h3 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.06em] text-[#3E0E1E] uppercase inline-block">
                  UNSEEN!
                </h3>
                <div className="w-16 h-[2px] bg-[#54162B] mx-auto mt-2" />
              </div>

              {/* Animated Typewriter Letter Text */}
              <div className="font-serif text-[13px] sm:text-[14px] text-[#2D121B] leading-[1.75] min-h-[260px] whitespace-pre-line tracking-wide">
                {typedText}
                {/* Blinking Typewriter Cursor */}
                {typedText.length < FULL_NOTE_TEXT.length && (
                  <span className="inline-block w-2 h-4 bg-[#54162B] ml-1 animate-blink align-middle" />
                )}
              </div>

              {/* Founder Sign-off & Cursive Signature */}
              <div className="mt-6 pt-4 border-t border-[#54162B]/30 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] tracking-[0.2em] font-sans font-bold text-[#54162B] uppercase">
                  FOUNDER, BHROMON
                </span>
                {/* Handwritten signature mark */}
                <span className="font-handwriting text-3xl sm:text-4xl text-[#3E0E1E] leading-none mt-1 -rotate-3 select-none">
                  A. Sengupta
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================== */}
          {/* 2. OVERLAPPING ANIMATED STAT BADGES (130+ and 850+)                */}
          {/* ================================================================== */}
          <div className="lg:col-span-1 relative flex lg:flex-col items-center justify-center gap-4 sm:gap-6 my-2 lg:my-0 z-30 pointer-events-auto">
            
            {/* Scalloped Star Seal 1: 130 CIRCUITS */}
            <div
              style={{
                transform: `translateY(${-scrollYOffset * 0.3}px)`,
                willChange: 'transform',
              }}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#101F31] text-white p-2 shadow-2xl flex flex-col items-center justify-center text-center border-2 border-white/60 transition-[opacity,box-shadow] duration-500 hover:scale-110 cursor-default shrink-0 ${
                inView ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-full h-full rounded-full border border-dashed border-white/40 flex flex-col items-center justify-center p-1">
                <span className="font-display text-3xl sm:text-4xl font-bold leading-none text-white tracking-tight">
                  {count130}+
                </span>
                <span className="text-[9px] sm:text-[9.5px] font-sans tracking-[0.24em] font-bold text-[#C9A66B] uppercase mt-1">
                  CIRCUITS
                </span>
              </div>
            </div>

            {/* Double-Bordered Square Seal 2: 850 SACRED SITES */}
            <div
              style={{
                transform: `translateY(${scrollYOffset * 0.25}px) rotate(3deg)`,
                willChange: 'transform',
              }}
              className={`w-28 h-28 sm:w-32 sm:h-32 bg-[#2D140E] text-white p-3 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center border-2 border-[#D8CEC1] transition-[opacity,box-shadow] duration-500 hover:scale-110 cursor-default shrink-0 ${
                inView ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-full h-full border border-[#D8CEC1]/50 rounded-xl flex flex-col items-center justify-center p-1">
                <span className="font-display text-3xl sm:text-4xl font-bold leading-none text-[#F5EBDD] tracking-tight">
                  {count850}+
                </span>
                <span className="text-[9px] sm:text-[9.5px] font-sans tracking-[0.24em] font-bold text-[#E2836E] uppercase mt-1">
                  SACRED SITES
                </span>
              </div>
            </div>

          </div>

          {/* ================================================================== */}
          {/* 3. ASYMMETRICAL ORGANIC PHOTOFRAMES SCRAPBOOK WITH POP-UP ANIMATION */}
          {/* ================================================================== */}
          <div className="lg:col-span-6 relative">
            {/* Scrapbook Board Container with subtle staggered layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 relative py-4">
              
              {PHOTO_FRAMES.map((frame, index) => {
                return (
                  <div
                    key={frame.id}
                    style={{
                      transform: inView
                        ? `translateY(${index % 2 === 0 ? -scrollYOffset * 0.12 : scrollYOffset * 0.12}px)`
                        : 'translateY(30px)',
                      willChange: 'transform',
                    }}
                    className={`group relative bg-white p-3.5 sm:p-4 pb-7 sm:pb-8 rounded-sm shadow-polaroid hover:shadow-polaroid-hover transition-[opacity,box-shadow] duration-500 cursor-pointer ${
                      frame.rotation
                    } ${frame.desktopOffset} hover:scale-105 hover:z-40 ${
                      inView ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    {/* Real Washi Tape Strip at top of photo */}
                    <div
                      className={`absolute -top-3.5 ${
                        frame.tapePosition === 'top-left' ? 'left-6 -rotate-6' : 'right-6 rotate-6'
                      } w-16 sm:w-20 h-5 washi-tape border border-[#D8CEC1]/80 rounded-2xs opacity-90 z-20 pointer-events-none shadow-xs`}
                    />

                    {/* Postal Stamp Badge on selected frames */}
                    {frame.stamp && (
                      <div className="absolute -top-3 -right-3 z-30 w-12 h-12 rounded-full border-2 border-dashed border-[#A5422B]/75 bg-[#FDEAEF]/90 backdrop-blur-2xs flex flex-col items-center justify-center text-center p-1 rotate-12 shadow-sm pointer-events-none">
                        <span className="text-[6.5px] font-mono font-bold tracking-tight text-[#A5422B] leading-none">
                          {frame.stamp}
                        </span>
                      </div>
                    )}

                    {/* Photo Container with subtle inner shadow */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-200 shadow-inner rounded-xs">
                      <img
                        src={frame.image}
                        alt={frame.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      />
                      {/* Subtle vintage photo sheen */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10 pointer-events-none" />

                      {/* Tag pill on photo */}
                      <span className="absolute top-2 left-2 bg-[#101F31]/85 backdrop-blur-xs text-[#F5EBDD] text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-xs">
                        {frame.tag}
                      </span>
                    </div>

                    {/* Polaroid Bottom Caption (Simulating handwritten fountain pen ink) */}
                    <div className="pt-3.5 px-1 flex flex-col justify-between">
                      <h4 className="font-display text-[13.5px] sm:text-[14.5px] font-bold text-[#101F31] group-hover:text-[#A5422B] transition-colors leading-snug line-clamp-1">
                        {frame.title}
                      </h4>
                      <p className="font-handwriting text-base sm:text-lg text-[#69665F] leading-tight mt-0.5 -rotate-1">
                        "{frame.caption}"
                      </p>
                      <div className="flex items-center gap-1 text-[10.5px] text-[#A5422B] font-semibold mt-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{frame.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Subtle Scrapbook Tag in Corner */}
            <div className="mt-4 flex items-center justify-end text-[10px] tracking-[0.2em] font-mono text-[#69665F] uppercase select-none opacity-60">
              <span>BHROMON EXPEDITIONS ARCHIVE • VOL. 2026</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
