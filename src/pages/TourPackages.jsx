import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  SlidersHorizontal,
  X,
  Compass,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Filter
} from 'lucide-react';
import BhromonNav from '../components/BhromonNav';
import BhromonFooter from '../components/BhromonFooter';
import TourDetailModal from '../components/TourDetailModal';
import BookingEnquiryModal from '../components/BookingEnquiryModal';
import { TOURS_DATA } from '../data/tours';
import publicApi from '../api/publicApi';
import { normalizePackage } from '../utils/packageUtils';
export { TOURS_DATA };

// Category Definitions with Icons & Labels
const CATEGORY_TABS = [
  { id: 'all', label: 'All Expeditions' },
  { id: 'Spiritual', label: 'Spiritual & Sacred' },
  { id: 'Cultural', label: 'Royal Heritage' },
  { id: 'Hill Station', label: 'Hill Stations & Tea Hills' },
  { id: 'Beach', label: 'Pristine Coastlines' },
  { id: 'Adventure', label: 'Adventure & Treks' },
  { id: 'Wildlife', label: 'Wildlife Safaris' },
];

const POPULAR_DESTINATION_CHIPS = [
  'All',
  'Ladakh',
  'Kerala',
  'Rajasthan',
  'Varanasi',
  'Goa',
  'Sikkim',
  'Andaman',
  'Himachal',
];

const DURATION_RANGES = [
  { label: 'Any Duration', min: 0, max: 999 },
  { label: '3–5 Days', min: 3, max: 5 },
  { label: '6–8 Days', min: 6, max: 8 },
  { label: '9–12 Days', min: 9, max: 12 },
  { label: '13+ Days', min: 13, max: 999 },
];

const PRICE_TIERS = [
  { label: 'All Budgets', min: 0, max: Infinity },
  { label: 'Under ₹25k', min: 0, max: 24999 },
  { label: '₹25k – ₹50k', min: 25000, max: 50000 },
  { label: '₹50k – ₹90k', min: 50001, max: 90000 },
  { label: '₹90k+ (Luxury)', min: 90001, max: Infinity },
];

const ITEMS_PER_PAGE = 6;

export default function TourPackages({ embedded = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDestination = searchParams.get('destination') || '';

  // Live backend packages state (with TOURS_DATA fallback)
  const [allPackages, setAllPackages] = useState(() => TOURS_DATA.map(normalizePackage));

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialDestination);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDuration, setActiveDuration] = useState('Any Duration');
  const [activePriceTier, setActivePriceTier] = useState('All Budgets');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [selectedTourForDetail, setSelectedTourForDetail] = useState(null);
  const [bookingModalData, setBookingModalData] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch live published packages from backend database
  useEffect(() => {
    let isMounted = true;
    async function loadLivePackages() {
      try {
        const res = await publicApi.getPackages();
        if (isMounted && res?.data && res.data.length > 0) {
          const normalized = res.data.map(normalizePackage);
          setAllPackages(normalized);
        }
      } catch (err) {
        console.warn('Using static tours fallback:', err.message);
      }
    }
    loadLivePackages();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync if URL query param changes
  useEffect(() => {
    const destParam = searchParams.get('destination');
    if (destParam) {
      setSearchQuery(destParam);
    }
  }, [searchParams]);

  // Compute category counts for tabs
  const categoryCounts = useMemo(() => {
    const counts = { all: allPackages.length };
    CATEGORY_TABS.forEach((tab) => {
      if (tab.id !== 'all') {
        counts[tab.id] = allPackages.filter((t) => t.type === tab.id).length;
      }
    });
    return counts;
  }, [allPackages]);

  // Filter and Sort Tours
  const filteredTours = useMemo(() => {
    return allPackages.filter((tour) => {
      // 1. Text Search matching title, destination, region, type, description, or tags
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          tour.title.toLowerCase().includes(q) ||
          tour.destination.toLowerCase().includes(q) ||
          tour.region.toLowerCase().includes(q) ||
          tour.type.toLowerCase().includes(q) ||
          tour.description.toLowerCase().includes(q) ||
          (tour.tags && tour.tags.some((tag) => tag.toLowerCase().includes(q)));

        if (!matchesQuery) return false;
      }

      // 2. Category Tab Filter
      if (activeCategory !== 'all' && tour.type !== activeCategory) {
        return false;
      }

      // 3. Duration Filter
      if (activeDuration !== 'Any Duration') {
        const range = DURATION_RANGES.find((r) => r.label === activeDuration);
        if (range && (tour.durationDays < range.min || tour.durationDays > range.max)) {
          return false;
        }
      }

      // 4. Price Tier Filter
      if (activePriceTier !== 'All Budgets') {
        const tier = PRICE_TIERS.find((p) => p.label === activePriceTier);
        if (tier && (tour.price < tier.min || tour.price > tier.max)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'duration') return a.durationDays - b.durationDays;
      // Default: featured first, then rating
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.rating || 0) - (a.rating || 0);
    });
  }, [allPackages, searchQuery, activeCategory, activeDuration, activePriceTier, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, activeDuration, activePriceTier, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredTours.length / ITEMS_PER_PAGE) || 1;
  const paginatedTours = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTours.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTours, currentPage]);

  const activeFiltersCount =
    (activeCategory !== 'all' ? 1 : 0) +
    (activeDuration !== 'Any Duration' ? 1 : 0) +
    (activePriceTier !== 'All Budgets' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setActiveDuration('Any Duration');
    setActivePriceTier('All Budgets');
    setSortBy('featured');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleSelectChip = (chip) => {
    if (chip === 'All') {
      setSearchQuery('');
      setSearchParams({});
    } else {
      setSearchQuery(chip);
      setSearchParams({ destination: chip });
    }
  };

  const handleOpenDetailModal = (tour) => {
    setSelectedTourForDetail(tour);
  };

  const handleOpenBookingModal = (tour) => {
    setBookingModalData(tour || { title: 'Tailor-Made Luxury Journey' });
    setShowBookingModal(true);
  };

  return (
    <div className="relative min-h-screen bg-[#F5EBDD] text-[#101F31] flex flex-col font-sans selection:bg-[#A5422B] selection:text-white">
      {/* If standalone, render BhromonNav */}
      {!embedded && <BhromonNav mode="solid" />}

      {/* Main Page Container with generous top clearance (pt-28 sm:pt-36) so fixed navbar never obscures content */}
      <main className="relative z-10 pt-28 sm:pt-36 pb-20 px-5 sm:px-8 lg:px-14 max-w-[1380px] mx-auto w-full flex-1">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#69665F] font-medium mb-4">
          <Link to="/" className="hover:text-[#A5422B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#101F31] font-semibold">Tour Packages & Expeditions</span>
        </nav>

        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-8 border-b border-[#D8CEC1]/80 mb-8">
          <div className="max-w-3xl">
            {/* Small uppercase label */}
            <div className="inline-flex items-center gap-2.5 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#A5422B] animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#A5422B] uppercase">
                BHROMON ARCHIVE OF EXTRAORDINARY ROUTES • 2026
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-[52px] text-[#101F31] font-normal leading-[1.04] tracking-tight mb-4">
              Explore All{' '}
              <span className="font-editorial italic font-normal text-[#101F31]">
                Destinations & Packages
              </span>
            </h1>

            {/* Editorial Lead Paragraph */}
            <p className="text-[14px] sm:text-[15px] text-[#69665F] leading-relaxed max-w-2xl font-normal">
              From the sacred dawn ghats of Varanasi and royal desert forts of Rajputana to misty
              houseboats in Kerala and the high windblown passes of Ladakh — our itineraries are
              handcrafted with local custodians, honoring both authenticity and comfort.
            </p>
          </div>

          {/* Right Aesthetic Quality Stamp (IRCTC & Luxury Concierge Touch) */}
          <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-3 bg-[#FBF7F0] p-3.5 px-4 rounded-2xl border border-[#D8CEC1]/80 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-[#101F31] text-[#C9A66B] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="text-right">
                <div className="font-brand text-[11px] tracking-[0.16em] font-bold text-[#101F31] uppercase">
                  100% Curated Routes
                </div>
                <div className="text-[11px] text-[#69665F]">
                  {allPackages.length} Verified Expeditions
                </div>
              </div>
            </div>
            <span className="text-[10px] tracking-widest text-[#69665F] font-semibold uppercase">
              All India Permits • 24/7 Concierge Support
            </span>
          </div>
        </div>

        {/* 
          ========================================================================
          GOIBIBO & IRCTC INSPIRED INTERACTIVE SEARCH CONSOLE
          ========================================================================
        */}
        <div className="bg-[#FBF7F0] rounded-3xl p-5 sm:p-7 border border-[#D8CEC1]/80 shadow-sm mb-10">
          {/* Top Search Input Row */}
          <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-4 pb-5 border-b border-[#D8CEC1]/60">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#69665F]">
                <Search className="w-5 h-5 stroke-[1.8]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by destination (e.g. Ladakh, Varanasi, Kerala, Goa), title, or keywords..."
                className="w-full bg-white pl-12 pr-10 py-3.5 rounded-2xl border border-[#D8CEC1] text-sm text-[#101F31] placeholder-[#69665F]/60 focus:outline-none focus:ring-2 focus:ring-[#101F31]/20 focus:border-[#101F31] transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#69665F] hover:text-[#101F31] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-[#69665F] uppercase tracking-wider whitespace-nowrap">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#D8CEC1] text-xs font-semibold text-[#101F31] rounded-xl px-3 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#101F31]/20 cursor-pointer shadow-2xs"
              >
                <option value="featured">Curated (Featured)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="duration">Duration: Short to Long</option>
              </select>
            </div>
          </div>

          {/* Quick Destination Chips */}
          <div className="py-4 border-b border-[#D8CEC1]/60 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#69665F] tracking-wider uppercase mr-1">
              Popular:
            </span>
            {POPULAR_DESTINATION_CHIPS.map((chip) => {
              const isSelected =
                (chip === 'All' && !searchQuery) ||
                (searchQuery.toLowerCase() === chip.toLowerCase());
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSelectChip(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all spring-jelly cursor-pointer ${
                    isSelected
                      ? 'bg-[#101F31] text-white shadow-2xs'
                      : 'bg-white hover:bg-stone-100 text-[#303438] border border-[#D8CEC1]/70'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Horizontal Category Tabs Bar (Goibibo / IRCTC Style with Live Counters) */}
          <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = activeCategory === tab.id;
              const count = categoryCounts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all spring-jelly cursor-pointer border ${
                    isSelected
                      ? 'bg-[#A5422B] text-white border-[#A5422B] shadow-2xs'
                      : 'bg-white text-[#303438] border-[#D8CEC1]/70 hover:border-[#101F31]/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F5EBDD] text-[#69665F]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Filters Bar: Duration & Budget Dropdowns + Clear CTA */}
          <div className="pt-4 mt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Duration Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#69665F] font-medium">Duration:</span>
                <select
                  value={activeDuration}
                  onChange={(e) => setActiveDuration(e.target.value)}
                  className="bg-white border border-[#D8CEC1] rounded-lg px-2.5 py-1.5 font-medium text-[#101F31] focus:outline-none cursor-pointer"
                >
                  {DURATION_RANGES.map((d) => (
                    <option key={d.label} value={d.label}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Tier Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#69665F] font-medium">Budget:</span>
                <select
                  value={activePriceTier}
                  onChange={(e) => setActivePriceTier(e.target.value)}
                  className="bg-white border border-[#D8CEC1] rounded-lg px-2.5 py-1.5 font-medium text-[#101F31] focus:outline-none cursor-pointer"
                >
                  {PRICE_TIERS.map((p) => (
                    <option key={p.label} value={p.label}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters CTA if active */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A5422B] hover:text-[#101F31] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters ({activeFiltersCount} active)</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter & Overview */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-xs sm:text-sm text-[#69665F]">
            Showing <strong className="text-[#101F31]">{filteredTours.length}</strong> handcrafted{' '}
            {filteredTours.length === 1 ? 'expedition' : 'expeditions'}
            {searchQuery && (
              <span>
                {' '}
                matching "<strong className="text-[#A5422B]">{searchQuery}</strong>"
              </span>
            )}
          </p>
          <span className="text-xs font-medium text-[#69665F]">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* 
          ========================================================================
          EXPEDITIONS GRID (LUXURY CARDS WITH WORKING BUTTONS)
          ========================================================================
        */}
        {paginatedTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-12">
            {paginatedTours.map((tour) => (
              <div
                key={tour.id}
                className="group bg-white rounded-3xl overflow-hidden border border-[#D8CEC1]/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                {/* Tour Photograph */}
                <div className="relative aspect-[16/11] overflow-hidden bg-[#E8DDD0]">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="bg-[#FBF7F0]/95 backdrop-blur-xs text-[#101F31] text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-2xs">
                      {tour.type}
                    </span>

                    {/* Availability Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-2xs ${
                        tour.availability === 'Available'
                          ? 'bg-emerald-900/90 text-emerald-200'
                          : tour.availability === 'Limited'
                          ? 'bg-amber-900/90 text-amber-200'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tour.availability === 'Available'
                            ? 'bg-emerald-400 animate-pulse'
                            : tour.availability === 'Limited'
                            ? 'bg-amber-400'
                            : 'bg-stone-400'
                        }`}
                      />
                      {tour.availability || 'Available'}
                    </span>
                  </div>

                  {/* Bottom Image Badges: Destination & Duration */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-medium drop-shadow-sm">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A66B]" />
                      {tour.region || tour.destination}
                    </span>
                    <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full drop-shadow-sm font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                      {tour.durationText}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating row */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex items-center text-[#C9A66B]">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-[#101F31]">
                        {tour.rating || 4.9}
                      </span>
                      <span className="text-[11px] text-[#69665F]">
                        ({tour.reviewsCount || 180} reviews)
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-lg sm:text-xl font-medium text-[#101F31] group-hover:text-[#A5422B] transition-colors leading-snug mb-2.5">
                      {tour.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[12.5px] text-[#69665F] leading-relaxed line-clamp-2 mb-4">
                      {tour.description}
                    </p>

                    {/* Tags */}
                    {tour.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {tour.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-[#F5EBDD] text-[#69665F] text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Pricing & Working Action Buttons */}
                  <div className="pt-4 border-t border-[#D8CEC1]/60 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-[#69665F] uppercase tracking-wider block">
                        From
                      </span>
                      <span className="font-brand text-lg sm:text-xl font-bold text-[#A5422B]">
                        ₹{tour.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Itinerary Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenDetailModal(tour)}
                        className="px-3.5 py-2 rounded-full border border-[#101F31]/30 hover:border-[#101F31] text-[#101F31] hover:bg-[#101F31] hover:text-white text-xs font-semibold tracking-wide transition-all spring-jelly cursor-pointer"
                        title="View Day-by-Day Itinerary"
                      >
                        Itinerary
                      </button>

                      {/* Book Expedition Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenBookingModal(tour)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#101F31] hover:bg-[#1E3455] text-white text-xs font-semibold tracking-wide transition-all shadow-2xs hover:shadow-md spring-jelly cursor-pointer"
                        title="Book or Enquire this expedition"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#D8CEC1]/80 max-w-xl mx-auto mb-16 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#F5EBDD] text-[#A5422B] flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-display text-2xl text-[#101F31] mb-2 font-medium">
              No Expeditions Found
            </h3>
            <p className="text-xs sm:text-sm text-[#69665F] leading-relaxed mb-6">
              We couldn't find any journeys matching your current search parameters. Try resetting
              filters or searching for broader destinations like Ladakh, Kerala, or Rajasthan.
            </p>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-2 bg-[#101F31] hover:bg-[#1E3455] text-white px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className={`w-9 h-9 rounded-full border border-[#D8CEC1] flex items-center justify-center transition-all cursor-pointer ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-transparent'
                  : 'bg-white hover:bg-[#101F31] hover:text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#101F31] text-white shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-[#303438] border border-[#D8CEC1]'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className={`w-9 h-9 rounded-full border border-[#D8CEC1] flex items-center justify-center transition-all cursor-pointer ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed bg-transparent'
                  : 'bg-white hover:bg-[#101F31] hover:text-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Integrated Modals so every single button functions 100% */}
        {selectedTourForDetail && (
          <TourDetailModal
            tour={selectedTourForDetail}
            onClose={() => setSelectedTourForDetail(null)}
            onOpenBooking={(tour) => {
              setSelectedTourForDetail(null);
              handleOpenBookingModal(tour);
            }}
          />
        )}

        {showBookingModal && (
          <BookingEnquiryModal
            initialData={bookingModalData}
            onClose={() => setShowBookingModal(false)}
          />
        )}
      </main>

      {!embedded && <BhromonFooter />}
    </div>
  );
}
