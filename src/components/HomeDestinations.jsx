import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Clock, Star, Sparkles, TrendingDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DESTINATIONS = [
  {
    id: 1,
    name: 'Ladakh',
    tagline: 'Himalayan High Passes',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=900&q=80',
    tours: 12,
    startPrice: 72000,
    badge: 'Most Popular',
    region: 'J&K',
  },
  {
    id: 2,
    name: 'Varanasi',
    tagline: 'City of Eternal Light',
    image: 'https://images.unsplash.com/photo-1561016928-9c038adf1fc3?auto=format&fit=crop&w=900&q=80',
    tours: 8,
    startPrice: 18500,
    badge: 'Spiritual',
    region: 'Uttar Pradesh',
  },
  {
    id: 3,
    name: 'Rajasthan',
    tagline: 'Forts, Palaces & Desert',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80',
    tours: 18,
    startPrice: 48000,
    badge: 'Heritage',
    region: 'Rajasthan',
  },
  {
    id: 4,
    name: 'Kerala',
    tagline: 'Backwaters & Spice Hills',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80',
    tours: 14,
    startPrice: 42000,
    badge: 'Luxury',
    region: 'Kerala',
  },
  {
    id: 5,
    name: 'Andaman',
    tagline: 'Coral Reefs & Turquoise Seas',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    tours: 9,
    startPrice: 64000,
    badge: 'Beach',
    region: 'Andaman & Nicobar',
  },
  {
    id: 6,
    name: 'North East',
    tagline: 'Monasteries & Kanchenjunga',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
    tours: 7,
    startPrice: 34000,
    badge: 'Himalayan',
    region: 'North East India',
  },
  {
    id: 7,
    name: 'Goa',
    tagline: 'Quiet shores & old quarters',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80',
    tours: 10,
    startPrice: 25000,
    badge: 'Beach',
    region: 'Goa',
  },
];

const SPECIAL_OFFERS = [
  {
    id: 1,
    label: 'Early Bird Offer',
    title: 'Book 60 Days Ahead & Save 15%',
    desc: 'On Rajasthan & Kerala heritage circuits. Limited seasonal slots available.',
    badgeColor: 'bg-[#D7A43A] text-[#111111]',
    icon: TrendingDown,
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    label: 'Honeymoon Exclusive',
    title: 'Complimentary Private Houseboat Night',
    desc: 'All Kerala backwater bookings above ₹60,000 include an exclusive sunset cruise.',
    badgeColor: 'bg-[#B85C32] text-white',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1609137144822-4463c271d798?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    label: 'Group Special',
    title: '10% Off for Groups of 8+',
    desc: 'Corporate offsite, family reunion or school expeditions — we handle every detail.',
    badgeColor: 'bg-[#123C2A] text-white',
    icon: Star,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
  },
];

export default function HomeDestinations() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.dest-card-item',
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.dest-grid-section', start: 'top 82%' }
        }
      );
      gsap.fromTo('.offer-card-item',
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0,
          duration: 0.7, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: '.offers-section', start: 'top 82%' }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* =====================================================================
          SECTION 1: DESTINATIONS SHOWCASE
          ===================================================================== */}
      <section id="destinations" className="dest-grid-section py-14 sm:py-16 px-6 sm:px-12 lg:px-16 max-w-[1440px] mx-auto scroll-mt-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.85fr_2fr] md:items-end">
          <div className="mb-2">
            <div className="inline-flex items-center gap-2.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#B85C32]" />
              <span className="text-[9px] font-semibold tracking-[0.25em] text-stone-600 uppercase">Popular destinations</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-[#111111] font-normal leading-[0.98] tracking-tight">
              Places That<br /><span className="font-editorial italic text-[#123C2A]">Inspire</span>
            </h2>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-stone-600">From mountain trails to quiet shores, find the India you want to remember.</p>
            <Link to="/tours" className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#123C2A] hover:text-[#B85C32] transition-colors group">
              Explore all destinations <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        {/* Destination arches */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {['Ladakh', 'Kerala', 'Rajasthan', 'North East', 'Goa'].map((name) => DESTINATIONS.find((dest) => dest.name === name)).filter(Boolean).map((dest) => (
            <Link
              key={dest.id}
              to="/tours"
              className="dest-card-item group relative h-56 sm:h-64 lg:h-60 overflow-hidden rounded-t-[100px] rounded-b-xl shadow-md hover:shadow-xl transition-all duration-500 block"
            >
              {/* Background Image */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Badge */}
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 sm:p-4">
                <h3 className="font-display text-lg sm:text-xl font-normal text-white leading-tight">{dest.name}</h3>
                <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: SPECIAL OFFERS
          ===================================================================== */}
      <section id="offers" className="offers-section relative min-h-[260px] sm:min-h-[310px] scroll-mt-24 overflow-hidden bg-[#183b4a]">
        <img src="/images/heritage-saloon.jpg" alt="A heritage train travelling through the hills" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071e2b]/85 via-[#071e2b]/45 to-transparent" />
        <div className="relative mx-auto flex min-h-[260px] max-w-[1440px] items-center justify-between gap-8 px-6 py-10 sm:min-h-[310px] sm:px-12 lg:px-16">
          <div className="max-w-xl text-white">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/75">Special offers</p>
            <h2 className="font-display text-3xl leading-[0.96] sm:text-5xl">Travel More<br />Spend Less</h2>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/80">Seasonal fares and thoughtful extras on journeys across India.</p>
            <Link to="/booking" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fbf2df] px-5 py-2.5 text-[11px] font-semibold text-[#172A3A] hover:bg-white">
              Know offers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-full border border-white/70 bg-[#a4432e]/95 text-center text-white shadow-xl sm:flex">
            <div><span className="block text-[9px] uppercase tracking-[0.2em]">Save up to</span><strong className="font-display text-4xl font-normal">15%</strong><span className="block text-[9px] uppercase tracking-[0.2em]">on select trips</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
