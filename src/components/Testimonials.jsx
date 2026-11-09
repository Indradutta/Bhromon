import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    quote: '"BHROMON made our Kashmir trip absolutely magical. From shikara rides to high altitude passes, everything was flawlessly organized!"',
    name: 'Riya Sen',
    city: 'Kolkata, West Bengal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    trip: 'Kashmir Valley Odyssey',
  },
  {
    id: 2,
    quote: '"Professional, authentic and deeply respectful of local heritage. The Rajasthan palace stays were like stepping straight into history."',
    name: 'Arjun Mehta',
    city: 'Delhi, NCR',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    trip: 'Royal Rajputana Heritage',
  },
  {
    id: 3,
    quote: '"The private houseboat experience in Alleppey was heavenly. Transparent pricing, delicious local cuisine and unforgettable warmth."',
    name: 'Priya Sharma',
    city: 'Bangalore, Karnataka',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    trip: 'Kerala Backwaters & Tea Hills',
  },
  {
    id: 4,
    quote: '"Our Ladakh high-pass expedition was beyond words. Local drivers and luxury campsite setups under crystal star skies were unmatched."',
    name: 'Vikram Sengupta',
    city: 'Mumbai, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    trip: 'Ladakh High Altitude Odyssey',
  },
  {
    id: 5,
    quote: '"Varanasi at dawn on a private wooden boat with a Vedic scholar guide arranged by BHROMON changed how I view Indian philosophy forever."',
    name: 'Ananya Deshmukh',
    city: 'Pune, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    trip: 'Ghats of Varanasi Experience',
  },
];

export default function Testimonials() {
  const [startIndex, setStartIndex] = useState(0);

  // Generate 3 consecutive cards cyclically
  const visible = [
    TESTIMONIALS[startIndex % TESTIMONIALS.length],
    TESTIMONIALS[(startIndex + 1) % TESTIMONIALS.length],
    TESTIMONIALS[(startIndex + 2) % TESTIMONIALS.length],
  ];

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  return (
    <section
      id="testimonials"
      className="bg-[#F5EBDD] py-16 sm:py-20 px-5 sm:px-8 lg:px-14 scroll-mt-20 border-t border-[#D8CEC1]/40"
    >
      <div className="max-w-[1380px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-4 xl:col-span-3">
            <p className="text-[10px] tracking-[0.3em] text-[#A5422B] font-semibold uppercase mb-2">
              TESTIMONIALS
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#101F31] font-normal leading-[0.98] tracking-tight mb-4">
              Happy Travellers
              <br />
              <span className="font-editorial italic">Happier Stories</span>
            </h2>
            <p className="text-[13px] text-[#69665F] leading-relaxed mb-6">
              Real reflections from wanderers who trusted BHROMON for their landmark journeys across India.
            </p>

            {/* Circular Carousel Arrow Buttons with Tactile Spring Feel */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonials"
                className="w-10 h-10 rounded-full bg-white hover:bg-[#101F31] hover:text-white border border-[#D8CEC1] text-[#101F31] flex items-center justify-center transition-all spring-jelly shadow-2xs hover:shadow-md cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonials"
                className="w-10 h-10 rounded-full bg-white hover:bg-[#101F31] hover:text-white border border-[#D8CEC1] text-[#101F31] flex items-center justify-center transition-all spring-jelly shadow-2xs hover:shadow-md cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Indicator dots */}
              <div className="flex items-center gap-1.5 ml-2">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStartIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      startIndex === idx ? 'w-5 bg-[#A5422B]' : 'w-1.5 bg-[#D8CEC1] hover:bg-[#101F31]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 3 Minimalist Cards */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D8CEC1]/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    {/* 5 Gold Stars & Trip Tag */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-[#C9A66B]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#C9A66B] text-[#C9A66B]" />
                        ))}
                      </div>
                      <span className="text-[9.5px] font-bold text-[#A5422B] tracking-wider uppercase bg-[#F5EBDD] px-2 py-0.5 rounded-md">
                        Verified Traveler
                      </span>
                    </div>

                    {/* Customer Quote */}
                    <p className="text-[13px] sm:text-[13.5px] text-[#303438] leading-relaxed mb-6 font-normal">
                      {item.quote}
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#D8CEC1]/40">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#F5EBDD]"
                    />
                    <div>
                      <h4 className="text-[13px] font-bold text-[#101F31] leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#69665F]">
                        {item.city}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
