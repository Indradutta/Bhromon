import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) {
  const sheetRef = useRef(null);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] md:hidden flex flex-col justify-end"
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content Card */}
      <div
        ref={sheetRef}
        className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-[28px] shadow-2xl border-t border-[#E9E1D8] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-250 ease-out pb-safe"
      >
        {/* Top Handle & Header */}
        <div className="pt-3 px-5 pb-3 border-b border-[#F0EBE5] shrink-0">
          {/* Subtle grab bar */}
          <div className="w-10 h-1 bg-[#D8CEC1] rounded-full mx-auto mb-3" />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-[#1F2937] leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[#6B7280] mt-0.5 font-normal">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-full bg-[#F7F3ED] hover:bg-[#E9E1D8] text-[#1F2937] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="p-5 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
