import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Check } from 'lucide-react';
import { filterDestinations } from './searchData';
import MobileBottomSheet from './MobileBottomSheet';

export default function DestinationPicker({
  value,
  onChange,
  onSelect,
  placeholder,
  whereLabel,
  helperText,
  error,
  isOpen,
  onToggle,
  onClose,
  isMobile,
}) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Sync internal search term when external value changes
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Suggestions filtered by searchTerm
  const suggestions = filterDestinations(searchTerm);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      if (isMobile) {
        setTimeout(() => mobileInputRef.current?.focus(), 150);
      } else {
        inputRef.current?.focus();
      }
    }
  }, [isOpen, isMobile]);

  // Handle outside click dismissal on desktop
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

  const handleSelectOption = (item) => {
    const destName = item.name;
    setSearchTerm(destName);
    onChange(destName, item.id);
    if (onSelect) onSelect(destName, item.id);
    onClose();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    onChange('', '');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        onToggle(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, suggestions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % Math.max(1, suggestions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[highlightedIndex]) {
        handleSelectOption(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Render suggestion list items
  const renderSuggestionList = (isSheet = false) => (
    <div className="flex flex-col gap-1 py-1">
      <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#F0EBE5]">
        <span>{searchTerm.trim() ? 'Matching Destinations' : 'Popular Destinations'}</span>
        <span className="text-[10px] text-[#A3A3A3] font-medium lowercase">
          {suggestions.length} options
        </span>
      </div>

      {suggestions.length === 0 ? (
        <div className="p-4 text-center text-sm text-[#6B7280]">
          No matching destinations found for "{searchTerm}".
          <div className="mt-1 text-xs text-[#B3452C] font-medium">
            You can still enter a custom destination name!
          </div>
        </div>
      ) : (
        suggestions.map((item, idx) => {
          const isSelected = value?.toLowerCase() === item.name.toLowerCase();
          const isHighlighted = highlightedIndex === idx;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectOption(item)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#F6EDE4] text-[#B3452C]'
                  : isHighlighted
                  ? 'bg-[#F7F3ED] text-[#1F2937]'
                  : 'hover:bg-[#F7F3ED]/60 text-[#1F2937]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#B3452C] text-white' : 'bg-[#F7F3ED] text-[#B3452C]'
                  }`}
                >
                  <MapPin className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-[#1F2937] truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-[#6B7280] truncate font-normal">
                    {item.region}
                  </div>
                </div>
              </div>

              {isSelected && (
                <Check className="w-4 h-4 text-[#B3452C] shrink-0" />
              )}
            </button>
          );
        })
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Field trigger container */}
      <div
        onClick={() => {
          onToggle(!isOpen);
          inputRef.current?.focus();
        }}
        className={`w-full p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer select-none ${
          error
            ? 'bg-red-50/60 ring-1 ring-[#C0392B]'
            : isOpen
            ? 'bg-[#F6EDE4]/60'
            : 'hover:bg-[#F7F3ED]'
        }`}
      >
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-[11px] sm:text-[12px] font-bold text-[#1F2937] uppercase tracking-wider block cursor-pointer">
            {whereLabel || 'WHERE TO?'}
          </label>
          {error && (
            <span className="text-[10.5px] font-semibold text-[#C0392B] animate-in fade-in">
              {error}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-[#B3452C] shrink-0 stroke-[2.2]" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onChange(e.target.value);
              if (!isOpen) onToggle(true);
            }}
            onFocus={() => {
              if (!isMobile) onToggle(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Destination, city or tour'}
            className="w-full text-[14.5px] sm:text-[16px] font-medium text-[#1F2937] placeholder-[#A3A3A3] bg-transparent focus:outline-none"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear destination"
              className="text-[#6B7280] hover:text-[#1F2937] p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {helperText && !searchTerm && (
          <div className="hidden sm:block text-[11px] text-[#6B7280]/80 mt-0.5 truncate font-normal">
            {helperText}
          </div>
        )}
      </div>

      {/* Desktop Suggestions Popover */}
      {isOpen && !isMobile && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-2 w-full min-w-[320px] max-w-[420px] max-h-[340px] overflow-y-auto bg-white rounded-2xl shadow-[0_16px_36px_rgba(16,31,49,0.14)] border border-[#E9E1D8] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-180"
        >
          {renderSuggestionList(false)}
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <MobileBottomSheet
          isOpen={isOpen}
          onClose={onClose}
          title="Choose Destination"
          subtitle="Explore India's most enchanting destinations"
        >
          <div className="mb-4">
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-[#F7F3ED] border border-[#E9E1D8]">
              <Search className="w-4 h-4 text-[#B3452C] shrink-0" />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  onChange(e.target.value);
                }}
                placeholder="Search city, state or tour..."
                className="w-full text-sm font-medium text-[#1F2937] placeholder-[#A3A3A3] bg-transparent focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    onChange('');
                  }}
                  className="p-1 text-[#6B7280]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {renderSuggestionList(true)}
        </MobileBottomSheet>
      )}
    </div>
  );
}
