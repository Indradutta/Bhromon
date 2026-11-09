import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Compass, 
  MapPin, 
  ArrowUpRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function BhromonAbout() {
  const containerRef = useRef(null);
  const watermarkRef = useRef(null);
  const mapRef = useRef(null);
  const paperSheetRef = useRef(null);
  const paperBackingRef = useRef(null);
  
  // Photo Collage Refs
  const photoVaranasiRef = useRef(null);
  const photoSikkimRef = useRef(null);
  const photoRajasthanRef = useRef(null);
  const photoKeralaRef = useRef(null);
  const badgeRef = useRef(null);
  const stampTrainRef = useRef(null);
  const stampCircleRef = useRef(null);
  const botanicalRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ====================================================================
      // DESKTOP: CINEMATIC COLLAGE PARALLAX & STAGGERED SCROLL ENTRANCE
      // ====================================================================
      mm.add("(min-width: 1024px)", () => {
        // 1. Staggered Entry Timeline
        const entryTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "top 25%",
            scrub: 1.2
          }
        });

        // Main Paper Sheet Glides In
        entryTl.fromTo(paperSheetRef.current, 
          { y: 80, rotation: -3, opacity: 0 },
          { y: 0, rotation: -1, opacity: 1, ease: "power3.out" },
          0
        );

        entryTl.fromTo(paperBackingRef.current,
          { y: 100, rotation: 3, opacity: 0 },
          { y: 0, rotation: 1.5, opacity: 1, ease: "power3.out" },
          0.05
        );

        // Independent Photographic Entrances
        entryTl.fromTo(photoVaranasiRef.current,
          { y: 90, rotation: -5, opacity: 0 },
          { y: 0, rotation: -2, opacity: 1, ease: "power2.out" },
          0.1
        );

        entryTl.fromTo(photoSikkimRef.current,
          { y: -60, rotation: 5, opacity: 0 },
          { y: 0, rotation: 2.5, opacity: 1, ease: "power2.out" },
          0.15
        );

        entryTl.fromTo(photoRajasthanRef.current,
          { x: -40, y: 70, rotation: -4, opacity: 0 },
          { x: 0, y: 0, rotation: -1.5, opacity: 1, ease: "power2.out" },
          0.2
        );

        entryTl.fromTo(photoKeralaRef.current,
          { y: 110, rotation: 4, opacity: 0 },
          { y: 0, rotation: 1.8, opacity: 1, ease: "power2.out" },
          0.25
        );

        // Green 790+ Destination Badge & Stamps
        entryTl.fromTo(badgeRef.current,
          { scale: 0.8, y: 50, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, ease: "back.out(1.4)" },
          0.28
        );

        entryTl.fromTo([stampTrainRef.current, stampCircleRef.current],
          { rotation: -15, scale: 0.85, opacity: 0 },
          { rotation: 0, scale: 1, opacity: 1, stagger: 0.08, ease: "power2.out" },
          0.32
        );

        // 2. Differential Continuous Parallax Scrub
        // Background Cartography: slowest drift
        gsap.to(mapRef.current, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        // Watermark Typography: gentle float
        gsap.to(watermarkRef.current, {
          y: -65,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        // Left Paper Sheet Parallax
        gsap.to(paperSheetRef.current, {
          y: -45,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        // Photo Cards Differential Parallax
        gsap.to(photoVaranasiRef.current, {
          y: -75,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        gsap.to(photoSikkimRef.current, {
          y: -110,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        gsap.to(photoRajasthanRef.current, {
          y: -55,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        gsap.to(photoKeralaRef.current, {
          y: -95,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        // Foreground Botanical Sprig
        if (botanicalRef.current) {
          gsap.to(botanicalRef.current, {
            y: -120,
            rotation: 5,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          });
        }
      });

      // ====================================================================
      // MOBILE: NATURAL SCROLL WITH CLEAN REVEALS
      // ====================================================================
      mm.add("(max-width: 1023px)", () => {
        gsap.fromTo(paperSheetRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: paperSheetRef.current,
              start: "top 85%"
            }
          }
        );

        const photoCards = [
          photoVaranasiRef.current,
          photoSikkimRef.current,
          badgeRef.current,
          photoRajasthanRef.current,
          photoKeralaRef.current
        ].filter(Boolean);

        photoCards.forEach((card) => {
          gsap.fromTo(card,
            { opacity: 0, y: 35 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%"
              }
            }
          );
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="about"
      ref={containerRef}
      aria-label="About Bhromon — Editorial Travel Journal"
      className="relative z-20 w-full min-h-screen bg-[#F4EFEA] text-[#111111] pt-14 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-8 lg:px-14 overflow-hidden border-t border-stone-300/80 shadow-[0_-30px_90px_rgba(0,0,0,0.32)]"
    >
      {/* 
        ========================================================================
        01. BACKGROUND PAPER TEXTURE & CARTOGRAPHY ROUTES
        ========================================================================
      */}
      {/* Tactile Aged Paper Grain Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(#9B8365 0.75px, transparent 0.75px)`,
          backgroundSize: '22px 22px'
        }}
        aria-hidden="true"
      />

      {/* Subtle Vignette & Warm Fiber Wash */}
      <div 
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#EDE4D8]/60 via-transparent to-[#E8DDD0]/80"
        aria-hidden="true"
      />

      {/* Low-Contrast Background India Map & Flight/Rail Waypoints */}
      <div 
        ref={mapRef}
        className="absolute inset-0 pointer-events-none opacity-[0.22] overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg 
          viewBox="0 0 1440 900" 
          fill="none" 
          className="w-full h-full object-cover text-[#735F48]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle India & Subcontinent Outline Contour */}
          <path 
            d="M 680,80 C 720,110 770,120 810,160 C 840,190 890,200 930,220 C 970,240 1020,290 1010,340 C 1000,390 940,410 920,450 C 900,490 880,550 860,600 C 840,650 810,720 780,780 C 760,820 740,840 730,860 C 710,840 690,790 670,740 C 650,690 620,630 600,580 C 580,530 550,490 530,440 C 510,390 490,340 510,290 C 530,240 570,210 610,170 C 650,130 660,100 680,80 Z" 
            stroke="currentColor" 
            strokeWidth="0.8" 
            strokeDasharray="6 8"
            opacity="0.4"
          />

          {/* Dotted Heritage Route Line: Varanasi -> Rajasthan -> Sikkim -> Kerala */}
          <path 
            d="M 580,260 Q 720,230 840,320 T 1140,240 Q 1200,460 1080,680" 
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeDasharray="5 7" 
            strokeLinecap="round"
          />

          {/* Route Waypoint Nodes */}
          <circle cx="580" cy="260" r="3.5" fill="currentColor" />
          <circle cx="840" cy="320" r="4.5" fill="currentColor" />
          <circle cx="1140" cy="240" r="4" fill="currentColor" />
          <circle cx="1080" cy="680" r="4" fill="currentColor" />

          {/* Vintage Compass Rose / Cartographic Mandala (Upper Right) */}
          <g transform="translate(1220, 140) scale(0.9)" opacity="0.65">
            <circle cx="0" cy="0" r="50" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="44" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
            <circle cx="0" cy="0" r="22" stroke="currentColor" strokeWidth="0.8" />
            <path d="M 0,-44 L 6,-14 L 0,0 L -6,-14 Z" fill="currentColor" />
            <path d="M 0,44 L 6,14 L 0,0 L -6,14 Z" fill="currentColor" />
            <path d="M -44,0 L -14,6 L 0,0 L -14,-6 Z" fill="currentColor" />
            <path d="M 44,0 L 14,6 L 0,0 L 14,-6 Z" fill="currentColor" />
            <text x="0" y="-54" textAnchor="middle" fontSize="10" fontFamily="sans-serif" letterSpacing="0.2em" fill="currentColor">N</text>
            <text x="56" y="4" textAnchor="middle" fontSize="10" fontFamily="sans-serif" letterSpacing="0.2em" fill="currentColor">E</text>
            <text x="0" y="64" textAnchor="middle" fontSize="10" fontFamily="sans-serif" letterSpacing="0.2em" fill="currentColor">S</text>
            <text x="-56" y="4" textAnchor="middle" fontSize="10" fontFamily="sans-serif" letterSpacing="0.2em" fill="currentColor">W</text>
          </g>

          {/* Latitude / Longitude Markings */}
          <text x="90" y="840" fontSize="11" letterSpacing="0.25em" fontFamily="monospace" fill="currentColor" opacity="0.7">
            25.3176° N, 82.9739° E • INDIA EXPLORATION ARCHIVE
          </text>
        </svg>
      </div>

      {/* 
        ========================================================================
        02. TOP EDITORIAL NAVIGATION / MARKERS
        ========================================================================
      */}
      <div className="relative z-20 max-w-[1440px] mx-auto flex items-center justify-between pb-8 sm:pb-12 border-b border-stone-400/25">
        {/* Left: Section Indicator */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
          <span className="font-sans text-xs tracking-[0.28em] font-semibold text-stone-700 uppercase">
            01 — ABOUT
          </span>
        </div>

        {/* Right: Est. India 2020 + Handwritten Script Note */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:block text-right">
            <span className="font-handwriting text-2xl sm:text-[26px] text-stone-700 -rotate-2 block leading-none">
              Different Paths, Same Incredible India
            </span>
          </div>

          <div className="flex items-center gap-2 pl-4 border-l border-stone-400/30 text-right">
            <span className="font-sans text-[10px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
              EST. INDIA <br />
              <span className="font-bold text-stone-900">2020</span>
            </span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        03. GIANT WATERMARK SERIF HEADLINE (Layered Behind Collage)
        ========================================================================
      */}
      <div 
        ref={watermarkRef}
        className="relative z-10 max-w-[1440px] mx-auto pointer-events-none select-none overflow-hidden -mb-28 sm:-mb-44 lg:-mb-64 pt-6 sm:pt-10"
        aria-hidden="true"
      >
        <div className="font-brand font-bold text-[3.8rem] sm:text-[7rem] md:text-[8.5rem] lg:text-[11.5rem] xl:text-[13rem] leading-[0.84] tracking-[-0.03em] text-[#C4B298]/28 sm:text-[#C4B298]/32 text-center lg:text-right pr-0 lg:pr-12">
          INDIA, <br />
          <span className="tracking-tight">BEYOND</span> <br />
          THE OBVIOUS.
        </div>
      </div>

      {/* 
        ========================================================================
        04. MAIN JOURNAL CANVAS (Deckle Paper Left + Collage Right)
        ========================================================================
      */}
      <div className="relative z-20 max-w-[1440px] mx-auto pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-start">
          
          {/* ================================================================== */}
          {/* LEFT: PHYSICAL TORN-EDGE PAPER SHEET (ABOUT BHROMON)               */}
          {/* ================================================================== */}
          <div className="lg:col-span-5 relative pt-4 lg:pt-8">
            
            {/* Architectural Sandstone Jharokha Peek on Far-Left Background */}
            <div className="hidden xl:block absolute -left-8 -top-6 w-20 h-72 rounded-l-2xl overflow-hidden shadow-lg opacity-40 mix-blend-multiply pointer-events-none -rotate-2">
              <img 
                src="/images/layers/layer-3-foreground.png" 
                alt="Carved Sandstone Archway" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dried Botanical Flower Sprig Taped to Left Margin */}
            <div 
              ref={botanicalRef}
              className="absolute -left-3 sm:-left-6 top-16 z-30 pointer-events-none flex flex-col items-center"
            >
              {/* Botanical Pressed Twig SVG */}
              <svg width="44" height="74" viewBox="0 0 44 74" fill="none" className="text-[#6D5D4B]">
                <path d="M 22,70 C 22,50 20,30 22,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 22,50 Q 12,42 8,46 C 4,50 14,58 22,54" fill="#8C7A65" opacity="0.8" />
                <path d="M 22,38 Q 32,30 36,34 C 40,38 30,46 22,42" fill="#8C7A65" opacity="0.8" />
                <path d="M 22,26 Q 14,18 10,22 C 6,26 16,34 22,30" fill="#8C7A65" opacity="0.8" />
                <circle cx="22" cy="6" r="3.5" fill="#B85C32" opacity="0.9" />
                <circle cx="16" cy="10" r="2.5" fill="#D7A43A" opacity="0.85" />
                <circle cx="28" cy="10" r="2.5" fill="#D7A43A" opacity="0.85" />
              </svg>
              {/* Translucent Washi Tape Securing Sprig */}
              <div className="w-10 h-3.5 -mt-8 bg-[#E5DCB8]/80 backdrop-blur-xs shadow-xs rotate-12 border-t border-b border-black/5" />
            </div>

            {/* Layer 2: Secondary Under-Paper with Slight Counter-Rotation */}
            <div 
              ref={paperBackingRef}
              className="absolute inset-0 bg-[#E8DFC8] rounded-2xl shadow-md rotate-[1.5deg] pointer-events-none border border-stone-300/60"
              aria-hidden="true"
            />

            {/* Layer 1: Main Physical Deckle-Edge Paper Card */}
            <div 
              ref={paperSheetRef}
              className="relative bg-[#FAF6F0] rounded-2xl p-7 sm:p-10 lg:p-11 shadow-deckle border border-[#E0D5BE] -rotate-[1deg] transition-transform duration-500 hover:rotate-0"
              style={{
                backgroundImage: `radial-gradient(#C2B29A 0.5px, transparent 0.5px)`,
                backgroundSize: '16px 16px'
              }}
            >
              {/* Washi Tape Strip at Top Edge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#E8DFC8]/80 backdrop-blur-xs shadow-xs -rotate-2 border-l border-r border-black/10 flex items-center justify-center pointer-events-none">
                <span className="text-[8px] tracking-[0.2em] font-mono text-stone-500 uppercase opacity-60">ARCHIVE NOTE</span>
              </div>

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 mb-3 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B85C32]" />
                <span className="font-sans text-[11px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                  01 — ABOUT BHROMON
                </span>
              </div>

              {/* Main Title: More Than Destinations, A Deeper India. */}
              <div className="mb-5">
                <h2 className="font-display text-3xl sm:text-[36px] lg:text-[42px] font-normal text-[#111111] tracking-[-0.02em] leading-[1.08]">
                  <span>More Than</span> <br />
                  <span>Destinations,</span> <br />
                  <span className="font-editorial italic font-normal text-[#123C2A] inline-flex items-center gap-2">
                    <span>A Deeper India.</span>
                    <span className="w-6 h-6 rounded-full bg-[#123C2A] text-white inline-flex items-center justify-center shrink-0 not-italic shadow-xs">
                      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none">
                        <path d="M2.5 15.5L7 7.5L10 12L13.5 5.5L17.5 15.5H2.5Z" fill="#F4EFEA" />
                      </svg>
                    </span>
                  </span>
                </h2>
                
                {/* Thin Terracotta Divider Rule */}
                <div className="w-14 h-[1.5px] bg-[#B85C32] mt-3.5" />
              </div>

              {/* Body Narrative Statements */}
              <div className="space-y-3.5 font-sans text-stone-800 text-sm sm:text-[15px] leading-[1.65] font-normal">
                <p>
                  At <strong className="font-semibold text-stone-950">BHROMON</strong>, we believe travel is not simply about reaching a place. It's about the stories you collect, the people you meet, and the India you discover along the way.
                </p>
                <p className="text-stone-700 font-light">
                  From ancient ghats and royal cities to misty mountains and quiet backwaters, we create journeys that take you beyond the obvious.
                </p>
              </div>

              {/* Call to Action: OUR STORY → */}
              <div className="mt-5 flex items-center gap-4">
                <a
                  href="#story"
                  className="inline-flex items-center gap-2.5 bg-[#123C2A] hover:bg-[#184D36] text-white text-xs font-semibold tracking-wider uppercase px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md hover:translate-x-0.5 cursor-pointer"
                >
                  <span>Our Story</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                </a>
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                  EST. 2020
                </span>
              </div>

              {/* Bottom Details: Vintage Lotus Stamp & Curator Note */}
              <div className="mt-8 pt-6 border-t border-stone-300/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Vintage Postal Lotus Stamp */}
                  <div className="w-12 h-12 rounded-full border border-stone-500/70 p-1 flex items-center justify-center shrink-0 text-stone-700">
                    <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <circle cx="16" cy="16" r="14" strokeDasharray="2 3" />
                      <path d="M16 6 C14 10 11 15 16 20 C21 15 18 10 16 6 Z" fill="currentColor" fillOpacity="0.15" />
                      <path d="M16 20 C10 18 7 14 11 11 C13 14 15 17 16 20 Z" />
                      <path d="M16 20 C22 18 25 14 21 11 C19 14 17 17 16 20 Z" />
                      <circle cx="16" cy="20" r="1.5" fill="currentColor" />
                    </svg>
                  </div>

                  <div>
                    <span className="font-sans text-[10px] tracking-[0.2em] font-semibold text-stone-900 uppercase block">
                      CURATED JOURNEYS
                    </span>
                    <span className="font-sans text-[10px] tracking-[0.16em] text-stone-500 uppercase block">
                      ACROSS INDIA • EST. 2020
                    </span>
                  </div>
                </div>

                {/* Hand-signed authenticity glyph */}
                <div className="font-handwriting text-2xl text-[#123C2A] -rotate-3 select-none">
                  Bhromon
                </div>
              </div>

            </div>

          </div>

          {/* ================================================================== */}
          {/* RIGHT: ART-DIRECTED PHOTOGRAPHIC SCRAPBOOK COLLAGE                */}
          {/* ================================================================== */}
          <div className="lg:col-span-7 relative min-h-[640px] sm:min-h-[720px] lg:min-h-[820px] pt-4">
            
            {/* -------------------------------------------------------------- */}
            {/* PHOTO 1: VARANASI (Top-Left of Collage)                        */}
            {/* -------------------------------------------------------------- */}
            <div 
              ref={photoVaranasiRef}
              className="lg:absolute lg:top-0 lg:left-4 z-20 w-full sm:w-[320px] lg:w-[340px] group transition-all duration-500 hover:z-40"
            >
              <div className="bg-white p-3 sm:p-3.5 pb-4 rounded-xl shadow-photo-print -rotate-[2deg] group-hover:rotate-0 group-hover:scale-[1.03] transition-transform duration-500 border border-stone-200/90 relative">
                {/* Washi Tape Strip */}
                <div className="absolute -top-3 left-10 w-20 h-5 bg-[#EDE2C4]/85 backdrop-blur-xs shadow-xs -rotate-6 pointer-events-none" />

                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative">
                  <img 
                    src="/images/varanasi-hero.jpg" 
                    alt="Varanasi sunrise ghats"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <div className="font-handwriting text-xl sm:text-2xl text-stone-800 leading-tight">
                    <span className="font-semibold text-stone-950">Varanasi</span> — Where stories never end
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#123C2A] transition-colors shrink-0" />
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* PHOTO 2: SIKKIM / HIMALAYAS (Top-Right of Collage)             */}
            {/* -------------------------------------------------------------- */}
            <div 
              ref={photoSikkimRef}
              className="mt-6 lg:mt-0 lg:absolute lg:top-4 lg:right-0 z-20 w-full sm:w-[300px] lg:w-[330px] group transition-all duration-500 hover:z-40"
            >
              <div className="bg-white p-3 sm:p-3.5 pb-4 rounded-xl shadow-photo-print rotate-[2.5deg] group-hover:rotate-0 group-hover:scale-[1.03] transition-transform duration-500 border border-stone-200/90 relative">
                {/* Vintage Postage Stamp Affixed to Top-Right */}
                <div className="absolute -top-4 -right-2 z-30 w-16 h-18 bg-[#F0EADB] p-1 shadow-md border-2 border-dashed border-[#8E7963] rotate-6 pointer-events-none flex flex-col items-center justify-between">
                  <span className="text-[7px] tracking-[0.2em] font-bold text-stone-700 uppercase">INDIA</span>
                  <div className="w-full h-8 overflow-hidden rounded-xs">
                    <img src="/images/darjeeling-himalayas.jpg" alt="Stamp mountain" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[6.5px] font-mono font-bold text-stone-600">₹ 25.00</span>
                </div>

                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative">
                  <img 
                    src="/images/darjeeling-himalayas.jpg" 
                    alt="Sikkim Himalayan ranges and mountain railway"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <div className="font-handwriting text-xl sm:text-2xl text-stone-800 leading-tight">
                    <span className="font-semibold text-stone-950">Sikkim</span> — Higher perspectives
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#123C2A] transition-colors shrink-0" />
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* DARK FOREST-GREEN DESTINATION BADGE: 790+ DESTINATIONS         */}
            {/* -------------------------------------------------------------- */}
            <div 
              ref={badgeRef}
              className="mt-6 lg:mt-0 lg:absolute lg:top-[285px] lg:left-[220px] z-30 w-full sm:w-[200px] lg:w-[220px] transition-transform duration-500 hover:scale-105"
            >
              <div className="bg-[#123C2A] text-[#FAF6F0] p-5 sm:p-6 rounded-xl shadow-2xl border-t border-b border-emerald-700/40 -rotate-[1deg] relative overflow-hidden select-none">
                {/* Subtle Compass Rose watermark */}
                <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
                  <Compass className="w-24 h-24 stroke-[1]" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="font-brand text-4xl sm:text-5xl font-bold tracking-tight text-[#FAF6F0] leading-none mb-1">
                    790+
                  </div>
                  <span className="font-sans text-[10.5px] sm:text-[11px] tracking-[0.24em] font-semibold text-emerald-200/90 uppercase block mb-2">
                    DESTINATIONS
                  </span>
                  
                  {/* Compass star motif */}
                  <div className="w-6 h-6 flex items-center justify-center text-[#D7A43A]">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" fill="currentColor" fillOpacity="0.2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* PHOTO 3: RAJASTHAN (Bottom-Left of Collage)                    */}
            {/* -------------------------------------------------------------- */}
            <div 
              ref={photoRajasthanRef}
              className="mt-6 lg:mt-0 lg:absolute lg:top-[340px] lg:left-0 z-20 w-full sm:w-[310px] lg:w-[335px] group transition-all duration-500 hover:z-40"
            >
              <div className="bg-white p-3 sm:p-3.5 pb-4 rounded-xl shadow-photo-print -rotate-[1.5deg] group-hover:rotate-0 group-hover:scale-[1.03] transition-transform duration-500 border border-stone-200/90 relative">
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative">
                  <img 
                    src="/images/rajasthan-fort.jpg" 
                    alt="Rajasthan royal fort and desert palace"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <div className="font-handwriting text-xl sm:text-2xl text-stone-800 leading-tight">
                    <span className="font-semibold text-stone-950">Rajasthan</span> — Land of royal stories
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#123C2A] transition-colors shrink-0" />
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* PHOTO 4: KERALA (Bottom-Right of Collage)                      */}
            {/* -------------------------------------------------------------- */}
            <div 
              ref={photoKeralaRef}
              className="mt-6 lg:mt-0 lg:absolute lg:top-[380px] lg:right-2 z-20 w-full sm:w-[325px] lg:w-[350px] group transition-all duration-500 hover:z-40"
            >
              <div className="bg-white p-3 sm:p-3.5 pb-4 rounded-xl shadow-photo-print rotate-[1.8deg] group-hover:rotate-0 group-hover:scale-[1.03] transition-transform duration-500 border border-stone-200/90 relative">
                {/* Washi Tape Strip Holding Leaf */}
                <div className="absolute -bottom-3 right-8 w-24 h-5 bg-[#EDE2C4]/85 backdrop-blur-xs shadow-xs rotate-3 pointer-events-none z-30" />

                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative">
                  <img 
                    src="/images/kerala-backwaters.jpg" 
                    alt="Kerala backwaters luxury houseboat"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <div className="font-handwriting text-xl sm:text-2xl text-stone-800 leading-tight">
                    <span className="font-semibold text-stone-950">Kerala</span> — Serenity in every direction
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#123C2A] transition-colors shrink-0" />
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* VINTAGE STAMPS & POSTMARKS AT BOTTOM                           */}
            {/* -------------------------------------------------------------- */}
            {/* Vintage Heritage Train Saloon Stamp */}
            <div 
              ref={stampTrainRef}
              className="hidden sm:block absolute -bottom-6 left-[280px] z-30 w-36 h-20 bg-[#F5ECE0] p-1.5 shadow-md border border-stone-400/80 -rotate-3 select-none pointer-events-none"
            >
              <div className="w-full h-full border border-dashed border-[#8E7963] p-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[7px] font-bold text-stone-700 uppercase tracking-wider">
                  <span>BHROMON</span>
                  <span>MAIL CAR</span>
                </div>
                <div className="w-full h-8 overflow-hidden rounded-xs">
                  <img src="/images/heritage-saloon.jpg" alt="Heritage rail stamp" className="w-full h-full object-cover" />
                </div>
                <span className="text-[6.5px] font-mono text-stone-600 text-center tracking-widest">IMPERIAL SALOON</span>
              </div>
            </div>

            {/* Circular Postmark Cancellation Ink Stamp */}
            <div 
              ref={stampCircleRef}
              className="hidden sm:block absolute -bottom-8 right-16 z-30 w-24 h-24 pointer-events-none select-none text-stone-600/75 rotate-12"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="50" cy="50" r="42" strokeDasharray="3 2" />
                <circle cx="50" cy="50" r="36" />
                <path d="M 14,50 L 86,50" />
                <path d="M 18,44 L 82,44" />
                <path d="M 18,56 L 82,56" />
                <text x="50" y="32" textAnchor="middle" fontSize="7.5" fontFamily="sans-serif" letterSpacing="0.2em" fill="currentColor" fontWeight="bold">D.A.R.J.E.E.L.I.N.G</text>
                <text x="50" y="74" textAnchor="middle" fontSize="6.5" fontFamily="sans-serif" letterSpacing="0.18em" fill="currentColor">INDIA POST • 2026</text>
              </svg>
            </div>

          </div>

        </div>
      </div>

      {/* 
        ========================================================================
        05. EDITORIAL METADATA STATISTICS & NEXT SECTION BRIDGE
        ========================================================================
      */}
      <div className="relative z-20 max-w-[1440px] mx-auto mt-16 sm:mt-24 pt-8 border-t border-stone-300/60">
        
        {/* Minimal Editorial Statistics with Thin Separators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 pb-8 border-b border-stone-300/40">
          <div className="flex flex-col">
            <span className="font-brand text-3xl sm:text-4xl font-bold text-[#111111] leading-none mb-1.5">790+</span>
            <span className="text-[10px] font-semibold text-stone-600 tracking-[0.2em] uppercase">Destinations</span>
          </div>
          <div className="flex flex-col border-l border-stone-300/60 pl-6">
            <span className="font-brand text-3xl sm:text-4xl font-bold text-[#111111] leading-none mb-1.5">50K+</span>
            <span className="text-[10px] font-semibold text-stone-600 tracking-[0.2em] uppercase">Happy Travelers</span>
          </div>
          <div className="flex flex-col border-l border-stone-300/60 pl-6">
            <span className="font-brand text-3xl sm:text-4xl font-bold text-[#111111] leading-none mb-1.5">4.9</span>
            <span className="text-[10px] font-semibold text-stone-600 tracking-[0.2em] uppercase">Average Rating</span>
          </div>
          <div className="flex flex-col border-l border-stone-300/60 pl-6">
            <span className="font-brand text-3xl sm:text-4xl font-bold text-[#111111] leading-none mb-1.5">10+</span>
            <span className="text-[10px] font-semibold text-stone-600 tracking-[0.2em] uppercase">Years of Experience</span>
          </div>
        </div>

        {/* Cinematic Bottom Transition (Leads toward curated routes / Discover India) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-600 text-xs">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#B85C32]" />
            <span className="tracking-wide">
              Every expedition is curated directly with generational custodians and local artisan guilds.
            </span>
          </div>

          <a 
            href="#destinations" 
            className="inline-flex items-center gap-2 font-semibold text-[#123C2A] hover:underline cursor-pointer tracking-wider uppercase text-[11px]"
          >
            <span>Discover India — Explore Curated Routes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </section>
  );
}
