import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { TOURS_DATA } from '../data/tours';
import publicApi from '../api/publicApi';
import { normalizePackage } from '../utils/packageUtils';

function TourCard({ tour, onSelectTour }) {
  const [favorited, setFavorited] = useState(false);

  return (
    <div
      onClick={() => onSelectTour && onSelectTour(tour)}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-[#D8CEC1]/60 flex flex-col cursor-pointer h-full"
    >
      {/* Destination Photograph */}
      <div className="relative aspect-[16/11] overflow-hidden bg-[#E8DDD0]">
        <img
          src={tour.image}
          alt={tour.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
        />

        {/* Gradient shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

        {/* Tour Category Badge */}
        <span className="absolute bottom-3 left-3 bg-[#FBF7F0]/95 backdrop-blur-xs text-[#101F31] text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-2xs">
          {tour.type}
        </span>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFavorited(!favorited);
          }}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 hover:bg-white backdrop-blur-xs flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-sm cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? 'fill-[#A5422B] text-[#A5422B]' : 'text-[#303438]'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-[#69665F] mb-1.5">
            <Star className="w-3.5 h-3.5 fill-[#C9A66B] text-[#C9A66B]" />
            <span className="font-bold text-[#101F31]">{tour.rating || 4.9}</span>
            <span>({tour.reviewsCount || 180} reviews)</span>
          </div>

          {/* Tour Title */}
          <h3 className="font-display text-[16px] font-medium text-[#101F31] group-hover:text-[#A5422B] transition-colors leading-snug mb-2">
            {tour.title}
          </h3>

          {/* Duration & Price Row */}
          <div className="flex items-center justify-between text-[12px] mb-2.5">
            <div className="flex items-center gap-1.5 text-[#69665F]">
              <Clock className="w-3.5 h-3.5 stroke-[1.8]" />
              <span>{tour.durationText}</span>
            </div>
            <div className="font-brand text-[15px] font-bold text-[#A5422B]">
              ₹ {tour.price.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Short Description */}
          <p className="text-[12px] text-[#69665F] leading-relaxed line-clamp-2">
            {tour.description}
          </p>
        </div>

        {/* Footer Button trigger */}
        <div className="pt-3 mt-3 border-t border-[#D8CEC1]/50 flex items-center justify-between text-xs font-semibold text-[#101F31] group-hover:text-[#A5422B] transition-colors">
          <span>View Itinerary</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedPackages({ filteredTours, searchQuery, onSelectTour, livePackages }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);
  const [internalLiveTours, setInternalLiveTours] = useState(() => TOURS_DATA.map(normalizePackage));

  // Fetch live packages from backend API if not supplied via props
  useEffect(() => {
    if (livePackages && livePackages.length > 0) return;
    let isMounted = true;
    publicApi.getPackages()
      .then((res) => {
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setInternalLiveTours(res.data.map(normalizePackage));
        }
      })
      .catch((err) => {
        console.warn('FeaturedPackages: Using static fallback tours:', err.message);
      });
    return () => {
      isMounted = false;
    };
  }, [livePackages]);

  const activePool = livePackages && livePackages.length > 0 ? livePackages : internalLiveTours;
  const allTours = filteredTours !== undefined ? filteredTours : activePool;

  // Responsive cards per view calculation
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(4);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, allTours.length - cardsPerView);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section
      id="featured-tours"
      className="bg-[#FBF7F0] py-16 sm:py-24 px-5 sm:px-8 lg:px-14 scroll-mt-20 border-t border-[#D8CEC1]/50"
    >
      <div className="max-w-[1380px] mx-auto">
        {/* Two-Column Editorial Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10 items-end">
          {/* Left Column */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#A5422B]" />
              <span className="text-[10px] sm:text-[11px] tracking-[0.28em] text-[#A5422B] font-bold uppercase">
                FEATURED PACKAGES • 2026 ARCHIVE
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-[#101F31] font-normal leading-[0.98] tracking-tight">
              Handpicked
              <br />
              <span className="font-editorial italic">Journeys for You</span>
            </h2>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-6 flex flex-col justify-end">
            <p className="text-[13.5px] text-[#69665F] leading-relaxed max-w-lg mb-4">
              Curated luxury travel circuits across India and beyond. From sacred dawn ghats to private
              houseboats and high Himalayan passes, discover tours that create lifelong memories.
            </p>

            <div className="flex items-center justify-between pt-1">
              <Link
                to="/tours"
                className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#101F31] hover:text-[#A5422B] transition-colors group"
              >
                <span>View All {allTours.length} Packages</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Smooth Carousel Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!canPrev}
                  aria-label="Previous tours"
                  className={`w-10 h-10 rounded-full border border-[#D8CEC1] flex items-center justify-center transition-all cursor-pointer ${
                    canPrev
                      ? 'bg-white hover:bg-[#101F31] hover:text-white hover:border-[#101F31] text-[#101F31] shadow-2xs hover:scale-105 active:scale-95'
                      : 'opacity-35 cursor-not-allowed bg-transparent text-[#69665F]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canNext}
                  aria-label="Next tours"
                  className={`w-10 h-10 rounded-full border border-[#D8CEC1] flex items-center justify-center transition-all cursor-pointer ${
                    canNext
                      ? 'bg-white hover:bg-[#101F31] hover:text-white hover:border-[#101F31] text-[#101F31] shadow-2xs hover:scale-105 active:scale-95'
                      : 'opacity-35 cursor-not-allowed bg-transparent text-[#69665F]'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Filter Banner if active */}
        {searchQuery && (
          <div className="mb-6 px-4 py-3 bg-white/90 rounded-2xl border border-[#D8CEC1]/60 flex items-center justify-between text-[13px] shadow-2xs">
            <span>
              Showing results for <strong>"{searchQuery}"</strong> ({allTours.length} found)
            </span>
            <Link to="/tours" className="text-[#A5422B] font-semibold hover:underline">
              Clear Filter
            </Link>
          </div>
        )}

        {/* 
          ========================================================================
          PHYSICAL HORIZONTAL SLIDING CAROUSEL TRACK (MATHEMATICALLY EXACT & SILKY SMOOTH)
          ========================================================================
        */}
        {allTours.length > 0 ? (
          <div className="overflow-hidden -mx-2.5 sm:-mx-3 py-3">
            <div
              style={{
                transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
                transition: 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="flex w-full will-change-transform"
            >
              {allTours.map((tour) => (
                <div
                  key={tour.id}
                  style={{ width: `${100 / cardsPerView}%` }}
                  className="shrink-0 px-2.5 sm:px-3 h-full"
                >
                  <TourCard tour={tour} onSelectTour={onSelectTour} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-[#D8CEC1]/50">
            <p className="text-[15px] font-semibold text-[#101F31] mb-1">
              No tours found matching your search
            </p>
            <p className="text-[12px] text-[#69665F]">
              Try another location or view all our available curated tours.
            </p>
          </div>
        )}

        {/* Carousel Progress Dots */}
        {allTours.length > cardsPerView && (
          <div className="flex items-center justify-center gap-1.5 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-[#A5422B]' : 'w-2 bg-[#D8CEC1] hover:bg-[#101F31]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
