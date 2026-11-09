import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SpecialOffers({ onOpenOffers }) {
  return (
    <section
      id="offers"
      className="relative overflow-hidden scroll-mt-20 select-none"
      style={{ minHeight: '340px' }}
    >
      {/* Background Scenic Viaduct Train Photograph */}
      <img
        src="/images/train-bridge.jpg"
        alt="Heritage mountain railway journey crossing viaduct bridge"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark Contrast Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07131F]/90 via-[#07131F]/60 to-[#07131F]/25" />

      <div className="relative max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-14 py-16 sm:py-20 flex items-center justify-between gap-8">
        {/* Left Text Group */}
        <div className="max-w-xl text-white">
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] text-[#C9A66B] font-semibold uppercase mb-3">
            SPECIAL OFFERS
          </p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-[56px] text-white font-normal leading-[0.94] tracking-tight mb-4">
            Travel More
            <br />
            Spend Less
          </h2>
          <p className="text-[13px] sm:text-[14px] text-white/80 leading-relaxed max-w-md mb-7 font-light">
            Exclusive deals on your favorite destinations. Limited-time offers, unforgettable experiences.
          </p>

          <Link
            to="/booking?offer=special-30"
            onClick={(e) => {
              if (onOpenOffers) {
                e.preventDefault();
                onOpenOffers();
              }
            }}
            className="inline-flex items-center gap-2.5 bg-[#FBF7F0] hover:bg-white text-[#101F31] rounded-full px-6 sm:px-7 py-3 text-[12px] sm:text-[13px] font-semibold tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:translate-x-0.5 group cursor-pointer"
          >
            <span>View Offers</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Right Circular Terracotta Travel Seal Badge */}
        <div className="hidden sm:flex shrink-0 w-32 h-32 lg:w-36 lg:h-36 rounded-full bg-[#A5422B]/95 text-white shadow-2xl flex-col items-center justify-center text-center border-2 border-white/30 relative">
          {/* Inner fine concentric ring */}
          <div className="absolute inset-1.5 rounded-full border border-dashed border-white/40 pointer-events-none" />
          
          <span className="text-[9px] tracking-[0.22em] uppercase font-medium text-white/90 leading-none mb-1">
            UP TO
          </span>
          <strong className="font-display text-4xl lg:text-[42px] font-bold leading-none tracking-tight">
            30%
          </strong>
          <span className="text-[10px] tracking-[0.24em] uppercase font-bold text-white/90 leading-none mt-1">
            OFF
          </span>
        </div>
      </div>
    </section>
  );
}
