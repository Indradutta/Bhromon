import React, { useEffect, useRef } from 'react';
import { ArrowRight, Star, Play } from 'lucide-react';

export default function HeroSection({ onExploreClick, onReplayPreloader }) {
  const bgImgRef = useRef(null);
  const quoteRef = useRef(null);

  // Silky Smooth Parallax Scrolling Effect without React re-renders or fighting CSS transitions
  useEffect(() => {
    let ticking = false;
    let rafId = null;

    const updateParallax = () => {
      const y = window.scrollY;
      // Only compute and update when hero is near the viewport
      if (y < 1100) {
        if (bgImgRef.current) {
          const isMobile = window.innerWidth < 768;
          // Very gentle, butter-smooth parallax factor that avoids any mobile shudder
          const factor = isMobile ? 0.14 : 0.28;
          const maxOffset = isMobile ? 120 : 220;
          const offset = Math.min(maxOffset, y * factor);
          bgImgRef.current.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.08)`;
        }
        if (quoteRef.current) {
          const quoteOffset = -y * 0.12;
          quoteRef.current.style.transform = `translate3d(0, ${quoteOffset.toFixed(1)}px, 0)`;
        }
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial run
    updateParallax();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleScroll = (e) => {
    e.preventDefault();
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.querySelector('#destinations');
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 75;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="hero"
      aria-label="BHROMON Destination Hero"
      className="relative w-full overflow-hidden select-none"
      style={{ minHeight: '560px', height: 'calc(100vh - 10px)', maxHeight: '820px' }}
    >
      {/* Background Single High-Resolution Photography with Smooth Parallax Drift */}
      <div className="absolute inset-0 w-full h-full bg-[#101F31] overflow-hidden">
        <img
          ref={bgImgRef}
          src="/images/hero-amalfi.jpg"
          alt="Amalfi coastal cliffside village with vibrant villas and blue ocean horizon"
          loading="eager"
          fetchpriority="high"
          style={{
            transform: 'translate3d(0, 0, 0) scale(1.08)',
            willChange: 'transform',
          }}
          className="w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Cinematic Natural Overlays for Legibility and Luxury Contrast */}
        {/* Soft morning ambient wash on left for headline legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6F0]/90 via-[#FAF6F0]/50 to-transparent w-full lg:w-3/5 pointer-events-none" />
        {/* Top subtle vignette for navbar legibility */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />
        {/* Bottom subtle grounding vignette */}
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#101F31]/30 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 h-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-14 flex flex-col justify-between pt-20 sm:pt-28 pb-10 sm:pb-16">
        {/* Middle Main Content Row */}
        <div className="flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
            
            {/* Left: Editorial Headline & Actions */}
            <div className="lg:col-span-8 xl:col-span-7 flex flex-col items-start max-w-xl">
              {/* Stacked Small Label with Horizontal Rule */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-[1.5px] bg-[#101F31]" />
                <div className="flex flex-col text-[9.5px] sm:text-[10px] font-bold tracking-[0.28em] text-[#101F31] leading-tight uppercase">
                  <span>MORE</span>
                  <span>THAN</span>
                  <span>A JOURNEY</span>
                </div>
              </div>

              {/* Large Serif Headline */}
              <h1 className="font-display font-medium text-[2.75rem] xs:text-[3.25rem] sm:text-[4.75rem] lg:text-[5.4rem] xl:text-[5.8rem] leading-[0.94] tracking-[-0.02em] text-[#101F31] mb-4 sm:mb-5">
                Explore
                <br />
                The India
                <br />
                <span className="font-editorial italic font-normal text-[#101F31]">
                  You Love
                </span>
              </h1>

              {/* Supporting Subtext */}
              <p className="text-[13.5px] sm:text-[15px] text-[#303438] leading-[1.6] max-w-md mb-6 sm:mb-7 font-normal">
                Iconic destinations. Meaningful experiences.
                <br className="hidden sm:block" />
                A more beautiful way to see the world with BHROMON.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 mb-7 sm:mb-8">
                <a
                  href="#destinations"
                  onClick={handleScroll}
                  className="inline-flex items-center gap-2.5 bg-[#101F31] hover:bg-[#1E3455] text-white rounded-full px-6 sm:px-8 py-3.5 sm:py-4 text-[12px] sm:text-[13px] font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  <span>Explore Destinations</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </a>

                {onReplayPreloader && (
                  <button
                    type="button"
                    onClick={onReplayPreloader}
                    className="inline-flex items-center gap-2.5 bg-white/85 hover:bg-white text-[#101F31] rounded-full px-4 sm:px-5 py-3 sm:py-3.5 text-[12px] sm:text-[13px] font-semibold tracking-wide transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer border border-[#101F31]/15"
                    title="Watch the Heritage Train and Crimson Sun journey animation"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#B3452C] text-white flex items-center justify-center">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </span>
                    <span>Watch Story</span>
                  </button>
                )}
              </div>

              {/* Hero Metrics Row */}
              <div className="flex items-center gap-4 xs:gap-6 sm:gap-9 pt-1">
                <div>
                  <div className="font-brand text-xl sm:text-3xl font-bold text-[#101F31] leading-none mb-1">
                    50+
                  </div>
                  <div className="text-[9.5px] sm:text-[11px] tracking-[0.14em] text-[#69665F] uppercase font-medium">
                    Destinations
                  </div>
                </div>

                <div className="w-px h-7 sm:h-8 bg-[#D8CEC1]/80" />

                <div>
                  <div className="font-brand text-xl sm:text-3xl font-bold text-[#101F31] leading-none mb-1">
                    2000+
                  </div>
                  <div className="text-[9.5px] sm:text-[11px] tracking-[0.14em] text-[#69665F] uppercase font-medium">
                    Happy Travellers
                  </div>
                </div>

                <div className="w-px h-7 sm:h-8 bg-[#D8CEC1]/80" />

                <div>
                  <div className="flex items-center gap-1 leading-none mb-1">
                    <span className="font-brand text-xl sm:text-3xl font-bold text-[#101F31]">
                      4.8
                    </span>
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#C9A66B] text-[#C9A66B] mb-0.5" />
                  </div>
                  <div className="text-[9.5px] sm:text-[11px] tracking-[0.14em] text-[#69665F] uppercase font-medium">
                    Customer Rating
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Handwritten Script with Parallax Float */}
            <div
              ref={quoteRef}
              style={{
                transform: 'translate3d(0, 0, 0)',
                willChange: 'transform',
              }}
              className="hidden lg:flex lg:col-span-4 xl:col-span-5 flex-col items-end justify-center h-full pt-4 pr-4"
            >
              <div className="font-handwriting text-[#101F31]/85 text-2xl xl:text-3xl leading-snug text-right -rotate-2 select-none drop-shadow-xs bg-white/40 backdrop-blur-xs p-5 rounded-2xl border border-white/60">
                Different Places,
                <br />
                Same You,
                <br />
                A Better Journey
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
