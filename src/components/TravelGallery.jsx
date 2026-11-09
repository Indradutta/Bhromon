import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Camera,
  Maximize2,
  Compass,
  Filter,
} from 'lucide-react';

const ALL_GALLERY_ITEMS = [
  {
    id: 1,
    src: '/images/hampi.jpg',
    alt: 'Ancient Indian stone temple carvings at Hampi',
    title: 'Heritage Monoliths',
    location: 'Hampi, Karnataka',
    category: 'Heritage',
    description:
      'Centuries of Vijayanagara stone architecture towering above rust-colored boulder hills at dawn.',
  },
  {
    id: 2,
    src: '/images/kayak.jpg',
    alt: 'Kayaker in clear emerald river waters between canyon cliffs',
    title: 'Emerald Waters',
    location: 'Dawki, Meghalaya',
    category: 'Waters',
    description:
      'Gliding through crystal-clear Umngot river where boats appear suspended in pure air.',
  },
  {
    id: 3,
    src: '/images/santorini.jpg',
    alt: 'Coastal hillside village with white and blue houses',
    title: 'Coastal Terraces',
    location: 'Santorini & Mediterranean',
    category: 'Coasts',
    description:
      'Sun-drenched cliffside dwellings looking out across deep sapphire Aegean calderas.',
  },
  {
    id: 4,
    src: '/images/goa-beach.jpg',
    alt: 'Tropical beach with leaning palm trees',
    title: 'Serene Shores',
    location: 'Goa Coastline',
    category: 'Coasts',
    description:
      'Secluded southern coves fringed by swaying coconut palms and warm Arabian Sea breezes.',
  },
  {
    id: 5,
    src: '/images/sunset-temple.jpg',
    alt: 'Ancient temple towers silhouetted against golden sunset',
    title: 'Golden Hour Spire',
    location: 'Khajuraho, Bundelkhand',
    category: 'Heritage',
    description:
      'Intricate Nagara-style stone temples lit by warm amber twilight across ancient water bodies.',
  },
  {
    id: 6,
    src: '/images/darjeeling-himalayas.jpg',
    alt: 'Snowy Himalayan peaks above mist-covered tea gardens',
    title: 'Himalayan Whispers',
    location: 'Darjeeling & Kanchenjunga',
    category: 'Mountains',
    description:
      'Rolling emerald tea slopes framed by the snow-capped massif of Mount Kanchenjunga.',
  },
  {
    id: 7,
    src: '/images/kerala-backwaters.jpg',
    alt: 'Traditional wooden houseboat on serene palm-lined canal',
    title: 'Spice Coast Canals',
    location: 'Alleppey & Vembanad',
    category: 'Waters',
    description:
      'Drifting silently along coconut-fringed waterways in a hand-crafted cedarwood kettuvallam.',
  },
  {
    id: 8,
    src: '/images/rajasthan-fort.jpg',
    alt: 'Imposing golden sandstone fort battlements overlooking city',
    title: 'Citadels of the Sun',
    location: 'Jodhpur & Mehrangarh',
    category: 'Heritage',
    description:
      'Imposing sandstone battlements rising four hundred feet above the Indigo blue houses of Marwar.',
  },
  {
    id: 9,
    src: '/images/andaman.jpg',
    alt: 'White sand beach and turquoise lagoon',
    title: 'Turquoise Coral Isles',
    location: 'Havelock, Andaman',
    category: 'Coasts',
    description:
      'Untamed island horizons, powdery ivory sands, and protected living coral gardens.',
  },
  {
    id: 10,
    src: '/images/varanasi-hero.jpg',
    alt: 'Varanasi Ghats at evening Ganga Aarti ceremony',
    title: 'Sacred River Reverie',
    location: 'Varanasi, Uttar Pradesh',
    category: 'Heritage',
    description:
      'A symphony of brass bells, sandalwood incenses, and flickering earthen diyas floating on Mother Ganga.',
  },
];

const CATEGORIES = ['All', 'Heritage', 'Waters', 'Coasts', 'Mountains'];

export default function TravelGallery() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  // Filter items based on active category
  const filteredItems = ALL_GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  // Display either the first 5 or all filtered items based on expansion state
  const displayedItems = isExpanded ? filteredItems : filteredItems.slice(0, 5);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activePhotoIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActivePhotoIndex(null);
      if (e.key === 'ArrowLeft') {
        setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setActivePhotoIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, filteredItems.length]);

  const handleOpenBookingForPhoto = (photo) => {
    setActivePhotoIndex(null);
    window.dispatchEvent(
      new CustomEvent('open-booking-modal', {
        detail: {
          title: `Expedition to ${photo.location}`,
          destination: photo.location,
        },
      })
    );
  };

  const currentPhoto = activePhotoIndex !== null ? filteredItems[activePhotoIndex] : null;

  return (
    <>
      <section
        id="gallery"
        className="bg-[#F5EBDD] py-16 sm:py-24 px-5 sm:px-8 lg:px-14 scroll-mt-20 border-t border-[#D8CEC1]/50 relative"
      >
        <div className="max-w-[1380px] mx-auto">
          {/* Header & Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#D8CEC1]/70">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <Camera className="w-3.5 h-3.5 text-[#A5422B]" />
                <p className="text-[10px] sm:text-[11px] tracking-[0.28em] text-[#A5422B] font-bold uppercase">
                  TRAVEL GALLERY • MOMENTS FROM THE ROAD
                </p>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-[#101F31] font-normal leading-[0.98] tracking-tight">
                Moments from{' '}
                <span className="font-editorial italic font-normal text-[#101F31]">the Road</span>
              </h2>
            </div>

            {/* Category Filter Chips & Toggle Button */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Category Chips */}
              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs p-1 rounded-full border border-[#D8CEC1]/80 shadow-2xs">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat);
                        // If user selects a category with <= 5 items, keep it tidy
                        if (activePhotoIndex !== null) setActivePhotoIndex(null);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#101F31] text-white shadow-2xs'
                          : 'text-[#69665F] hover:text-[#101F31] hover:bg-stone-200/50'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* SEE MORE PHOTOS / SHOW LESS TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2 bg-white hover:bg-[#101F31] hover:text-white text-[#101F31] border border-[#D8CEC1] px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer group"
              >
                <span>{isExpanded ? 'Show Curated View' : `See More Photos (${filteredItems.length})`}</span>
                <ArrowRight
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isExpanded ? '-rotate-90' : 'group-hover:translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 
            ========================================================================
            LUXURY PHOTO GRID UX (CLEAN 5-COL STRIP OR EXPANDED 10-COL MASONRY)
            ========================================================================
          */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 transition-all duration-500">
            {displayedItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActivePhotoIndex(idx)}
                className="group relative h-[220px] sm:h-[260px] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer block hover:-translate-y-1.5 bg-[#E8DDD0] border border-white/60"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                />

                {/* Corner Expand Indicator */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xs">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>

                {/* Category Badge */}
                <span className="absolute top-3 left-3 bg-[#101F31]/75 backdrop-blur-xs text-[#F5EBDD] text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>

                {/* Hover Caption Overlay with smooth gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 text-white">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/80 font-medium mb-1">
                      <MapPin className="w-3 h-3 text-[#E2836E]" />
                      <span>{item.location}</span>
                    </div>
                    <h4 className="text-[13px] font-bold leading-tight font-display text-white">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Caption Note below Grid */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#69665F] pt-4 border-t border-[#D8CEC1]/40 gap-2">
            <span className="font-serif italic">
              Click any photo to explore high-resolution view and location narratives.
            </span>
            <span className="font-mono text-[11px] font-semibold text-[#101F31]">
              SHOWING {displayedItems.length} OF {filteredItems.length} CAPTURED MOMENTS
            </span>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        ACCESSIBLE FULLSCREEN LIGHTBOX MODAL WITH NAVIGATION & BOOKING ACTION
        ========================================================================
      */}
      {activePhotoIndex !== null && currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery Lightbox"
          className="fixed inset-0 z-50 bg-[#101F31]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActivePhotoIndex(null)}
            aria-label="Close lightbox"
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Previous Arrow Button */}
          <button
            type="button"
            onClick={() =>
              setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1))
            }
            aria-label="Previous photo"
            className="absolute left-4 sm:left-8 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Arrow Button */}
          <button
            type="button"
            onClick={() =>
              setActivePhotoIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0))
            }
            aria-label="Next photo"
            className="absolute right-4 sm:right-8 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Modal Content Container */}
          <div
            className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Container with Soft Shadow */}
            <div className="relative max-h-[65vh] rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10">
              <img
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                className="w-full h-full max-h-[65vh] object-contain"
              />
            </div>

            {/* Photo Metadata Card */}
            <div className="mt-4 bg-[#101F31]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 text-white max-w-2xl w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-[#E2836E] font-semibold mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentPhoto.location}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/70">
                    Photo {activePhotoIndex + 1} of {filteredItems.length}
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight">
                  {currentPhoto.title}
                </h3>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  {currentPhoto.description}
                </p>
              </div>

              {/* Enquire CTA */}
              <button
                type="button"
                onClick={() => handleOpenBookingForPhoto(currentPhoto)}
                className="inline-flex items-center gap-2 bg-[#A5422B] hover:bg-[#8D3420] text-white px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md hover:scale-102 shrink-0 cursor-pointer"
              >
                <span>Plan Journey Here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
