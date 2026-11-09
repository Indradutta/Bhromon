import React, { useState, useEffect, useRef } from 'react';
import { Users, Minus, Plus } from 'lucide-react';
import { getTravellerSummary } from './searchData';
import MobileBottomSheet from './MobileBottomSheet';

const LIMITS = {
  adults: { min: 1, max: 20, label: 'Adults', desc: 'Ages 13 and above' },
  children: { min: 0, max: 10, label: 'Children', desc: 'Ages 2–12 years' },
  infants: { min: 0, max: 10, label: 'Infants', desc: 'Under 2 years' },
};

export default function TravellerPickerPopover({
  value = { adults: 2, children: 0, infants: 0 },
  onChange,
  isOpen,
  onToggle,
  onClose,
  isMobile,
}) {
  const containerRef = useRef(null);

  const counts = value || { adults: 2, children: 0, infants: 0 };

  // Outside click dismissal on desktop
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, isMobile, onClose]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleIncrement = (type) => {
    const { max } = LIMITS[type];
    const current = counts[type] || 0;
    if (current >= max) return;
    onChange({ ...counts, [type]: current + 1 });
  };

  const handleDecrement = (type) => {
    const { min } = LIMITS[type];
    const current = counts[type] || 0;
    if (current <= min) return;
    onChange({ ...counts, [type]: current - 1 });
  };

  const handleDone = () => {
    onClose();
  };

  const summary = getTravellerSummary(counts);

  const renderContent = () => (
    <div className="w-full flex flex-col gap-3 py-1">
      {Object.keys(LIMITS).map((type) => {
        const { min, max, label, desc } = LIMITS[type];
        const count = counts[type];
        const canDecrement = count > min;
        const canIncrement = count < max;

        return (
          <div
            key={type}
            className="flex items-center justify-between py-2 border-b border-[#F0EBE5] last:border-0"
          >
            <div>
              <div className="text-[14px] font-bold text-[#1F2937]">
                {label}
              </div>
              <div className="text-xs text-[#6B7280] font-normal">
                {desc}
              </div>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!canDecrement}
                onClick={() => handleDecrement(type)}
                aria-label={`Decrease ${label}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  canDecrement
                    ? 'bg-[#F7F3ED] hover:bg-[#B3452C] hover:text-white text-[#1F2937] active:scale-90 cursor-pointer shadow-2xs'
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                }`}
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              <span className="w-5 text-center font-mono text-[14px] font-bold text-[#1F2937]">
                {count}
              </span>

              <button
                type="button"
                disabled={!canIncrement}
                onClick={() => handleIncrement(type)}
                aria-label={`Increase ${label}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  canIncrement
                    ? 'bg-[#F7F3ED] hover:bg-[#B3452C] hover:text-white text-[#1F2937] active:scale-90 cursor-pointer shadow-2xs'
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        );
      })}

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleDone}
          className="w-full sm:w-auto px-6 py-2 rounded-full text-xs font-semibold bg-[#B3452C] hover:bg-[#963922] text-white transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Box */}
      <div
        onClick={() => onToggle(!isOpen)}
        className={`w-full p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer select-none ${
          isOpen ? 'bg-[#F6EDE4]/60' : 'hover:bg-[#F7F3ED]'
        }`}
      >
        <label className="text-[11px] sm:text-[12px] font-bold text-[#1F2937] uppercase tracking-wider block mb-0.5 cursor-pointer">
          TRAVELLERS
        </label>
        <div className="flex items-center gap-2.5">
          <Users className="w-4 h-4 text-[#B3452C] shrink-0 stroke-[2.2]" />
          <span className="text-[14.5px] sm:text-[16px] font-medium text-[#1F2937] truncate">
            {summary}
          </span>
        </div>
      </div>

      {/* Desktop Popover */}
      {isOpen && !isMobile && (
        <div
          role="dialog"
          aria-label="Select travellers"
          className="absolute right-0 top-full mt-2 w-[290px] sm:w-[310px] bg-white rounded-2xl shadow-[0_16px_36px_rgba(16,31,49,0.14)] border border-[#E9E1D8] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-180"
        >
          {renderContent()}
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <MobileBottomSheet
          isOpen={isOpen}
          onClose={onClose}
          title="Number of Travellers"
          subtitle="Add adults, children and infants for your journey"
        >
          {renderContent()}
        </MobileBottomSheet>
      )}
    </div>
  );
}
