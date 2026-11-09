import React from 'react';

/**
 * Editorial Luxury Section Divider
 * Provides visual separation between major sections with subtle gradients,
 * fine-line rules, and an optional ornate compass or diamond motif.
 */
export default function SectionDivider({ 
  className = '', 
  symbol = '◆', 
  label = '', 
  variant = 'diamond' 
}) {
  return (
    <div className={`w-full max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-14 py-2 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Left hairline gradient rule */}
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D8CEC1]/80 to-[#D8CEC1]" />

        {/* Center decorative emblem */}
        <div className="mx-4 sm:mx-6 flex items-center gap-2.5 text-[#A5422B] shrink-0 select-none">
          {variant === 'compass' ? (
            <svg
              className="w-4 h-4 text-[#C9A66B] animate-spin-slow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" strokeDasharray="2 2" />
              <polygon points="12,3 15,12 12,21 9,12" fill="#A5422B" stroke="none" />
              <circle cx="12" cy="12" r="2" fill="#101F31" />
            </svg>
          ) : (
            <span className="text-[10px] sm:text-xs font-serif text-[#A5422B] tracking-widest">
              {symbol}
            </span>
          )}

          {label && (
            <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.24em] text-[#69665F] uppercase">
              {label}
            </span>
          )}

          {label && (
            <span className="text-[10px] sm:text-xs font-serif text-[#A5422B] tracking-widest">
              {symbol}
            </span>
          )}
        </div>

        {/* Right hairline gradient rule */}
        <div className="flex-1 h-px bg-gradient-to-r from-[#D8CEC1] via-[#D8CEC1]/80 to-transparent" />
      </div>
    </div>
  );
}
