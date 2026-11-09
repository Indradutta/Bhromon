import React from 'react';

const TICKER_ITEMS = [
  'BHROMON TRAVEL',
  'SACRED PILGRIMAGES',
  'HIMALAYAN ODYSSEYS',
  'ROYAL RAJASTHAN PALACES',
  'KERALA MIST & HOUSEBOATS',
  'ANDAMAN TURQUOISE REEFS',
  'CURATED LUXURY ITINERARIES',
  'UNTOUCHED EXPEDITIONS',
  '100% TAILOR-MADE EXPERIENCES',
  'LOCAL EXPERT CUSTODIANS',
];

export default function SlidingTextTicker({ className = '' }) {
  // Duplicate array 3 times for seamless infinite looping
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#101F31] text-[#F5EBDD] py-3.5 select-none border-y border-[#C9A66B]/30 ${className}`}
      aria-label="Bhromon Highlights Marquee"
    >
      {/* Edge gradient fades for seamless luxury look */}
      <div className="absolute left-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-r from-[#101F31] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-l from-[#101F31] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        {items.map((text, idx) => (
          <div key={idx} className="flex items-center mx-5 sm:mx-7 gap-5 sm:gap-7">
            <span className="font-brand text-[11px] sm:text-[12.5px] font-semibold tracking-[0.26em] uppercase whitespace-nowrap text-[#F5EBDD]/90 hover:text-[#C9A66B] transition-colors">
              {text}
            </span>
            <span className="text-[#C9A66B] text-[10px] select-none opacity-75">
              ◆
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
