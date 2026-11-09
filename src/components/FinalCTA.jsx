import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA({ onOpenEnquiry }) {
  const handleClick = (e) => {
    if (onOpenEnquiry) {
      e.preventDefault();
      onOpenEnquiry();
    }
  };

  return (
    <section className="relative overflow-hidden select-none" style={{ minHeight: '340px' }}>
      {/* Background Mountain Sunset Photograph */}
      <img
        src="/images/darjeeling-himalayas.jpg"
        alt="Dramatic mountain panorama during warm golden sunset"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark Warm Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07131F]/85 via-[#07131F]/55 to-[#07131F]/70" />

      {/* Subtle Right Circular Cancellation Stamp Illustration */}
      <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-white select-none">
        <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="50" cy="50" r="44" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="38" />
          <circle cx="50" cy="50" r="24" />
          <path d="M10 50 L90 50 M14 44 L86 44 M14 56 L86 56" />
          <text x="50" y="30" textAnchor="middle" fontSize="6" letterSpacing="0.22em" fill="currentColor" fontWeight="bold">
            BHROMON ADVENTURES
          </text>
          <text x="50" y="74" textAnchor="middle" fontSize="5" letterSpacing="0.18em" fill="currentColor">
            EXPLORE • DISCOVER
          </text>
        </svg>
      </div>

      {/* Content */}
      <div className="relative max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-14 py-20 sm:py-24 flex flex-col items-start justify-center text-left text-white h-full">
        <h2 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-normal leading-[0.98] tracking-tight mb-3">
          Ready for Your Next Adventure?
        </h2>
        <p className="text-[13.5px] sm:text-[15px] text-white/80 mb-7 max-w-lg font-light leading-relaxed">
          Let BHROMON plan a journey you'll never forget.
        </p>

        <Link
          to="/booking"
          onClick={handleClick}
          className="inline-flex items-center gap-2.5 bg-[#FBF7F0] hover:bg-white text-[#101F31] rounded-full px-7 sm:px-8 py-3.5 text-[12px] sm:text-[13px] font-semibold tracking-wide transition-all shadow-xl hover:shadow-2xl hover:translate-x-0.5 group cursor-pointer"
        >
          <span>Plan Your Trip</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
