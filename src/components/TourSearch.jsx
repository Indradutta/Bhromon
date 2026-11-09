import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { SEARCH_CATEGORIES, toISODateString } from './search/searchData';
import SearchCategoryTabs from './search/SearchCategoryTabs';
import DestinationPicker from './search/DestinationPicker';
import DatePickerPopover from './search/DatePickerPopover';
import TravellerPickerPopover from './search/TravellerPickerPopover';
import CustomTripPanel from './search/CustomTripPanel';
import { TOURS_DATA } from '../data/tours';

export default function TourSearch({ onSearch, onOpenEnquiry, packages }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Controlled Form State
  const [activeCategory, setActiveCategory] = useState('tours');
  const [destination, setDestination] = useState(() => searchParams.get('destination') || '');
  const [destinationId, setDestinationId] = useState('');
  
  // Default travel date: 14 days in future
  const [travelDate, setTravelDate] = useState(() => {
    const urlDate = searchParams.get('date');
    if (urlDate) return urlDate;
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return toISODateString(d);
  });

  const [travellers, setTravellers] = useState(() => ({
    adults: parseInt(searchParams.get('adults'), 10) || 2,
    children: parseInt(searchParams.get('children'), 10) || 0,
    infants: parseInt(searchParams.get('infants'), 10) || 0,
  }));

  // Popover / Modal state: null | 'destination' | 'date' | 'travellers'
  const [openPanel, setOpenPanel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Responsive state detection (768px breakpoint)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Current category config
  const currentCategory = useMemo(() => {
    return SEARCH_CATEGORIES.find((c) => c.id === activeCategory) || SEARCH_CATEGORIES[0];
  }, [activeCategory]);

  // Tab switching handler
  const handleSelectCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setOpenPanel(null);
    setErrors({});
  };

  // Close all panels
  const handleClosePanel = useCallback(() => {
    setOpenPanel(null);
  }, []);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (activeCategory === 'tours' && !destination.trim()) {
      newErrors.destination = 'Please choose a destination';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Search submission
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    handleClosePanel();

    // Validate
    if (!validateForm()) {
      setOpenPanel('destination');
      return;
    }

    setIsSubmitting(true);

    // Subtle async simulation (200ms) to ensure UI feedback and prevent double submission
    await new Promise((r) => setTimeout(r, 220));

    if (activeCategory === 'tours') {
      const q = destination.toLowerCase().trim();
      const pool = packages && packages.length > 0 ? packages : TOURS_DATA;
      const results = q
        ? pool.filter(
            (t) =>
              (t.title && t.title.toLowerCase().includes(q)) ||
              (t.destination && t.destination.toLowerCase().includes(q)) ||
              (t.destinationText && t.destinationText.toLowerCase().includes(q)) ||
              (t.region && t.region.toLowerCase().includes(q)) ||
              (t.type && t.type.toLowerCase().includes(q)) ||
              (t.category && t.category.toLowerCase().includes(q)) ||
              (t.tags && Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase().includes(q)))
          )
        : pool;

      // Update URL search parameters without reloading page
      try {
        const params = new URLSearchParams();
        if (destination) params.set('destination', destination);
        if (travelDate) params.set('date', travelDate);
        if (travellers.adults) params.set('adults', travellers.adults);
        if (travellers.children) params.set('children', travellers.children);
        if (travellers.infants) params.set('infants', travellers.infants);
        setSearchParams(params, { replace: true });
      } catch {
        // Safe fallback in non-router context
      }

      // Trigger search callback
      if (onSearch) {
        onSearch({
          results,
          query: destination,
          date: travelDate,
          travellers,
        });
      }

      // Smooth scroll to Featured Packages section
      const el = document.querySelector('#featured-tours');
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 75;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      // Hotels, Activities, or Custom Trip routing to Enquiry Modal
      const titles = {
        hotels: 'Luxury Heritage Stays & Palaces',
        activities: 'Curated Heritage Experiences & Activities',
        customTrip: 'Tailor-Made Bespoke Itinerary Request',
      };

      const payload = {
        title: titles[activeCategory] || 'Custom Journey Enquiry',
        destination: destination || 'Bespoke India Expeditions',
        travelDate,
        travellers,
        category: activeCategory,
      };

      if (onOpenEnquiry) {
        onOpenEnquiry(payload);
      } else {
        window.dispatchEvent(
          new CustomEvent('open-booking-modal', {
            detail: payload,
          })
        );
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div
      id="tour-search"
      className="relative z-30 w-full"
      role="search"
      aria-label="BHROMON Travel Search"
    >
      {/* Decorative Antique Brand Stamp Behind Card on Large Displays */}
      <div className="hidden xl:block absolute -top-8 -right-6 pointer-events-none opacity-20 text-[#1F2937] select-none">
        <svg width="115" height="115" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="50" cy="50" r="46" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="26" />
          <path d="M50 4 L50 96 M4 50 L96 50 M17 17 L83 83 M17 83 L83 17" strokeWidth="0.6" />
          <text x="50" y="32" textAnchor="middle" fontSize="6" letterSpacing="0.2em" fill="currentColor" fontWeight="bold">BHROMON</text>
          <text x="50" y="72" textAnchor="middle" fontSize="5" letterSpacing="0.15em" fill="currentColor">EST. 2026</text>
        </svg>
      </div>

      {/* Main Search Card Surface */}
      <div className="max-w-[1140px] mx-auto bg-white rounded-3xl sm:rounded-[28px] shadow-[0_20px_50px_rgba(16,31,49,0.11)] border border-[#E9E1D8] p-3 sm:p-5 transition-all">
        
        {/* Section A: Search Category Tabs */}
        <SearchCategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Section B: Search Form Content */}
        {activeCategory === 'customTrip' ? (
          <CustomTripPanel
            destination={destination}
            travelDate={travelDate}
            travellers={travellers}
            onSubmitCustomTrip={(data) => {
              if (onOpenEnquiry) {
                onOpenEnquiry(data);
              } else {
                window.dispatchEvent(
                  new CustomEvent('open-booking-modal', { detail: data })
                );
              }
            }}
            isSubmitting={isSubmitting}
          />
        ) : (
          <form onSubmit={handleSearchSubmit} noValidate className="pt-2 sm:pt-3">
            {/* Desktop Unified Search Row */}
            <div className="hidden md:flex md:items-center gap-0 divide-x divide-[#F0EBE5]">
              
              {/* 1. Destination Field (~44% width) */}
              <div className="flex-[1.8] min-w-[220px] pr-2">
                <DestinationPicker
                  value={destination}
                  onChange={(val, id) => {
                    setDestination(val);
                    if (id) setDestinationId(id);
                    if (errors.destination) {
                      setErrors((prev) => ({ ...prev, destination: null }));
                    }
                  }}
                  whereLabel={currentCategory.whereLabel}
                  placeholder={currentCategory.placeholder}
                  helperText={currentCategory.helperText}
                  error={errors.destination}
                  isOpen={openPanel === 'destination'}
                  onToggle={(open) => setOpenPanel(open ? 'destination' : null)}
                  onClose={handleClosePanel}
                  isMobile={false}
                />
              </div>

              {/* 2. Travel Date Field (~25% width) */}
              <div className="flex-1 min-w-[180px] px-2">
                <DatePickerPopover
                  value={travelDate}
                  onChange={(dateStr) => {
                    setTravelDate(dateStr);
                    setOpenPanel(null);
                  }}
                  dateLabel={currentCategory.dateLabel}
                  isOpen={openPanel === 'date'}
                  onToggle={(open) => setOpenPanel(open ? 'date' : null)}
                  onClose={handleClosePanel}
                  isMobile={false}
                />
              </div>

              {/* 3. Travellers Field (~25% width) */}
              <div className="flex-1 min-w-[180px] px-2">
                <TravellerPickerPopover
                  value={travellers}
                  onChange={(counts) => setTravellers(counts)}
                  isOpen={openPanel === 'travellers'}
                  onToggle={(open) => setOpenPanel(open ? 'travellers' : null)}
                  onClose={handleClosePanel}
                  isMobile={false}
                />
              </div>

              {/* 4. Desktop Circular Terracotta Search Button (~76px) */}
              <div className="pl-3 flex items-center justify-center shrink-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label={currentCategory.ariaLabel}
                  title={currentCategory.buttonText}
                  className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#B3452C] hover:bg-[#963922] active:bg-[#7F301F] text-white flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus-visible:ring-3 focus-visible:ring-[#B3452C]/40 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 lg:w-6 lg:h-6 stroke-[2.2]" />
                  )}
                </button>
              </div>

            </div>

            {/* Dedicated Mobile Vertical Stack Layout */}
            <div className="flex md:hidden flex-col gap-2.5 pt-1">
              {/* 1. Mobile Destination Field */}
              <DestinationPicker
                value={destination}
                onChange={(val, id) => {
                  setDestination(val);
                  if (id) setDestinationId(id);
                  if (errors.destination) {
                    setErrors((prev) => ({ ...prev, destination: null }));
                  }
                }}
                whereLabel={currentCategory.whereLabel}
                placeholder={currentCategory.placeholder}
                helperText={currentCategory.helperText}
                error={errors.destination}
                isOpen={openPanel === 'destination'}
                onToggle={(open) => setOpenPanel(open ? 'destination' : null)}
                onClose={handleClosePanel}
                isMobile={true}
              />

              {/* 2. Mobile Travel Date Field */}
              <DatePickerPopover
                value={travelDate}
                onChange={(dateStr) => {
                  setTravelDate(dateStr);
                  setOpenPanel(null);
                }}
                dateLabel={currentCategory.dateLabel}
                isOpen={openPanel === 'date'}
                onToggle={(open) => setOpenPanel(open ? 'date' : null)}
                onClose={handleClosePanel}
                isMobile={true}
              />

              {/* 3. Mobile Travellers Field */}
              <TravellerPickerPopover
                value={travellers}
                onChange={(counts) => setTravellers(counts)}
                isOpen={openPanel === 'travellers'}
                onToggle={(open) => setOpenPanel(open ? 'travellers' : null)}
                onClose={handleClosePanel}
                isMobile={true}
              />

              {/* 4. Full-Width Mobile Terracotta CTA Button (54px) */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label={currentCategory.ariaLabel}
                  className="w-full h-13 rounded-2xl bg-[#B3452C] hover:bg-[#963922] active:bg-[#7F301F] text-white flex items-center justify-center gap-2.5 text-[15px] font-semibold tracking-wide transition-all shadow-md active:scale-98 cursor-pointer focus:outline-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 stroke-[2.2]" />
                      <span>{currentCategory.buttonText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
