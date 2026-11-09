import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const POPULAR_DESTS = [
  {
    id: 1,
    name: 'Ladakh',
    image: '/images/ladakh-pass.jpg',
    alt: 'High altitude mountain road in Ladakh',
  },
  {
    id: 2,
    name: 'Kerala',
    image: '/images/kerala-backwaters.jpg',
    alt: 'Traditional houseboat on Kerala backwaters',
  },
  {
    id: 3,
    name: 'Rajasthan',
    image: '/images/rajasthan-fort.jpg',
    alt: 'Hawa Mahal sandstone facade in Jaipur, Rajasthan',
  },
  {
    id: 4,
    name: 'North East',
    image: '/images/darjeeling-himalayas.jpg',
    alt: 'Misty green valleys and mountains in North East India',
  },
  {
    id: 5,
    name: 'Goa',
    image: '/images/goa-beach.jpg',
    alt: 'Pristine coastal beach in Goa with leaning palm trees',
  },
];

export default function PopularDestinations({ onSelectDestination }) {
  return (
    <section
      id="destinations"
      className="bg-[#F5EBDD] py-14 sm:py-20 px-5 sm:px-8 lg:px-14 scroll-mt-20 border-t border-[#D8CEC1]/40"
    >
      <div className="max-w-[1380px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Editorial Column */}
          <div className="lg:col-span-4 xl:col-span-3">
            <p className="text-[10px] tracking-[0.3em] text-[#A5422B] font-semibold uppercase mb-2">
              POPULAR DESTINATIONS
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#101F31] font-normal leading-[0.98] tracking-tight mb-4">
              Places That
              <br />
              <span className="font-editorial italic">Inspire</span>
            </h2>
            <p className="text-[13px] text-[#69665F] leading-relaxed mb-6">
              From mountains to beaches, heritage to hidden gems — explore the most loved
              destinations with BHROMON.
            </p>
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#101F31] hover:text-[#A5422B] transition-colors group"
            >
              <span>Explore All Destinations</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Arched Cards Row (5 Vertical Cards) */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {POPULAR_DESTS.map((dest) => (
                <Link
                  key={dest.id}
                  to={`/tours?destination=${encodeURIComponent(dest.name)}`}
                  onClick={() => onSelectDestination && onSelectDestination(dest.name)}
                  className="group relative h-[270px] sm:h-[310px] lg:h-[320px] rounded-t-[75px] sm:rounded-t-[85px] rounded-b-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 block hover:-translate-y-1"
                >
                  {/* Destination Photo */}
                  <img
                    src={dest.image}
                    alt={dest.alt}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />

                  {/* Gradient Contrast Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Bottom Content: Destination Name & Small Arrow */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 flex items-end justify-between text-white">
                    <span className="font-display text-base sm:text-lg font-normal tracking-wide">
                      {dest.name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
