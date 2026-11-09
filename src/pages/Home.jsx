import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import TourSearch from '../components/TourSearch';
import SlidingTextTicker from '../components/SlidingTextTicker';
import AboutBhromon from '../components/AboutBhromon';
import PopularDestinations from '../components/PopularDestinations';
import TravelGallery from '../components/TravelGallery';
import FeaturedPackages from '../components/FeaturedPackages';
import SpecialOffers from '../components/SpecialOffers';
import Testimonials from '../components/Testimonials';
import TravelJournal from '../components/TravelJournal';
import FinalCTA from '../components/FinalCTA';
import SectionDivider from '../components/SectionDivider';
import TourDetailModal from '../components/TourDetailModal';
import BookingEnquiryModal from '../components/BookingEnquiryModal';
import { TOURS_DATA } from '../data/tours';
import publicApi from '../api/publicApi';
import { normalizePackage } from '../utils/packageUtils';

export default function Home({ onReplayPreloader }) {
  const outletCtx = useOutletContext();
  const replayPreloader = onReplayPreloader || outletCtx?.handleReplayPreloader;

  const [livePackages, setLivePackages] = useState(() => TOURS_DATA.map(normalizePackage));
  const [searchResults, setSearchResults] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTour, setSelectedTour] = useState(null);
  const [enquiryData, setEnquiryData] = useState(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  // Sync live packages directly from database
  useEffect(() => {
    let isMounted = true;
    publicApi.getPackages()
      .then((res) => {
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const normalized = res.data.map(normalizePackage);
          setLivePackages(normalized);
        }
      })
      .catch((err) => {
        console.warn('Home: using static tours fallback:', err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Global event listener for "Plan Your Trip" triggers from Navbar or elsewhere
  useEffect(() => {
    const handleOpenEnquiryEvent = (event) => {
      const detail = event?.detail || { title: 'Tailor-Made Luxury Journey' };
      setEnquiryData(detail);
      setShowEnquiryModal(true);
    };

    window.addEventListener('open-booking-modal', handleOpenEnquiryEvent);
    return () => window.removeEventListener('open-booking-modal', handleOpenEnquiryEvent);
  }, []);

  const handleSearch = ({ results, query }) => {
    setSearchResults(results);
    setSearchQuery(query);
  };

  const handleSelectDestination = (destName) => {
    const q = destName.toLowerCase();
    const matched = livePackages.filter(
      (t) =>
        (t.region && t.region.toLowerCase().includes(q)) ||
        (t.destination && t.destination.toLowerCase().includes(q)) ||
        (t.destinationText && t.destinationText.toLowerCase().includes(q)) ||
        (t.title && t.title.toLowerCase().includes(q))
    );
    setSearchResults(matched.length > 0 ? matched : livePackages);
    setSearchQuery(destName);

    const el = document.querySelector('#featured-tours');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 75;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleOpenBooking = (tourOrData) => {
    setEnquiryData(tourOrData || {});
    setShowEnquiryModal(true);
  };

  return (
    <main className="relative bg-[#F5EBDD] overflow-x-hidden">
      {/* 
        ========================================================================
        1. HOME SECTION (#hero)
        ========================================================================
      */}
      <HeroSection
        onReplayPreloader={replayPreloader}
        onExploreClick={() => {
          const el = document.querySelector('#about');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Floating Tour-Search Interface with Tours, Hotels, Activities, Custom Trip */}
      <div className="relative z-30 bg-[#F5EBDD] pt-0">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-14 -translate-y-4 sm:-translate-y-12">
          <TourSearch
            packages={livePackages}
            onSearch={handleSearch}
            onOpenEnquiry={(data) => handleOpenBooking(data)}
          />
        </div>
      </div>

      {/* Dynamic Animated Marquee Sliding Text Ticker */}
      <SlidingTextTicker className="mt-2 mb-6" />

      {/* Section Divider */}
      <SectionDivider variant="compass" label="OUR ETHOS" className="my-2" />

      {/* 
        ========================================================================
        2. ABOUT US SECTION (#about)
        ========================================================================
      */}
      <AboutBhromon />

      {/* Section Divider */}
      <SectionDivider symbol="◆" label="POPULAR DESTINATIONS" className="my-4" />

      {/* 
        ========================================================================
        3. DESTINATION SECTION (#destinations)
        ========================================================================
      */}
      <PopularDestinations onSelectDestination={handleSelectDestination} />

      {/* Section Divider */}
      <SectionDivider symbol="✦" label="MOMENTS FROM THE ROAD" className="my-2" />

      <TravelGallery />

      {/* Section Divider */}
      <SectionDivider variant="compass" label="CURATED EXPEDITIONS" className="my-4" />

      {/* 
        ========================================================================
        4. OUR PACKAGES SECTION (#featured-tours)
        ========================================================================
      */}
      <FeaturedPackages
        filteredTours={searchResults}
        searchQuery={searchQuery}
        livePackages={livePackages}
        onSelectTour={(tour) => setSelectedTour(tour)}
      />

      {/* Section Divider */}
      <SectionDivider symbol="◆" label="LIMITED EDITIONS" className="my-4" />

      <SpecialOffers onOpenOffers={() => handleOpenBooking({ title: 'Special Offers (Up to 30% Off)' })} />

      {/* Section Divider */}
      <SectionDivider symbol="✦" label="TRAVELLER VOICES" className="my-4" />

      <Testimonials />

      {/* Section Divider */}
      <SectionDivider variant="compass" label="CHRONICLES & UNSEEN" className="my-4" />

      {/* 
        ========================================================================
        5. BLOG SECTION (#journal-preview)
        Framed Note with Live Typewriter animation, 130+ & 850+ counters, & Photoframes
        ========================================================================
      */}
      <TravelJournal />

      {/* Section Divider */}
      <SectionDivider symbol="◆" label="BEGIN YOUR JOURNEY" className="my-4" />

      {/* 
        ========================================================================
        6. CONTACT SECTION (#footer / #contact)
        ========================================================================
      */}
      <FinalCTA onOpenEnquiry={() => handleOpenBooking({ title: 'Next Adventure Booking' })} />

      {/* Tour Detail Modal (Itinerary, Inclusions, Pricing) */}
      {selectedTour && (
        <TourDetailModal
          tour={selectedTour}
          onClose={() => setSelectedTour(null)}
          onOpenBooking={(tour) => handleOpenBooking(tour)}
        />
      )}

      {/* Booking Enquiry Modal */}
      {showEnquiryModal && (
        <BookingEnquiryModal
          initialData={enquiryData}
          onClose={() => setShowEnquiryModal(false)}
        />
      )}
    </main>
  );
}
