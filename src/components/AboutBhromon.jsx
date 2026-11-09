import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Users, Award, Headphones, X, Sparkles } from 'lucide-react';

const WHY_FEATURES = [
  {
    Icon: ShieldCheck,
    title: 'Trusted Travel Partner',
    desc: 'Thoughtfully planned journeys with dependable travel support.',
  },
  {
    Icon: Users,
    title: 'Personalized Experience',
    desc: 'Trips tailored to your interests, schedule, and travel style.',
  },
  {
    Icon: Award,
    title: 'Best Price Guarantee',
    desc: 'Transparent package pricing and clear inclusions.',
  },
  {
    Icon: Headphones,
    title: '24/7 Support',
    desc: 'Help and travel assistance throughout your journey.',
  },
];

export default function AboutBhromon({ onOpenStory }) {
  const [showStoryModal, setShowStoryModal] = useState(false);

  const handleStoryClick = (e) => {
    e.preventDefault();
    if (onOpenStory) {
      onOpenStory();
    } else {
      setShowStoryModal(true);
    }
  };

  return (
    <>
      <section
        id="about"
        className="bg-[#F5EBDD] py-16 sm:py-24 px-5 sm:px-8 lg:px-14 scroll-mt-20 overflow-hidden relative"
      >
        <div className="max-w-[1380px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Editorial Content */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#A5422B]" />
                <p className="text-[10px] tracking-[0.3em] text-[#A5422B] font-semibold uppercase">
                  ABOUT BHROMON • OUR PHILOSOPHY
                </p>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl lg:text-[54px] text-[#101F31] font-normal leading-[0.98] tracking-tight mb-5">
                Travel Beyond
                <br />
                <span className="font-editorial italic">Borders</span>
              </h2>

              <p className="text-[13.5px] sm:text-[14.5px] text-[#69665F] leading-[1.7] max-w-lg mb-8 font-normal">
                At BHROMON, we believe travel is more than just visiting places — it's about
                discovering new perspectives, meeting amazing people, and creating stories that stay
                with you forever.
              </p>

              <button
                type="button"
                onClick={handleStoryClick}
                className="inline-flex items-center gap-2.5 bg-[#101F31] hover:bg-[#1E3455] text-white rounded-full px-7 py-3.5 text-[12px] sm:text-[13px] font-semibold tracking-wide transition-all shadow-md hover:shadow-lg hover:translate-x-0.5 group cursor-pointer mb-12 spring-jelly"
              >
                <span>Know Our Story</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Section 8: Why Choose BHROMON (4 Compact Trust Features) */}
              <div className="w-full pt-8 border-t border-[#D8CEC1]/70">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-3">
                  {WHY_FEATURES.map(({ Icon, title, desc }) => (
                    <div
                      key={title}
                      className="group flex flex-col items-start text-left p-2 rounded-xl hover:bg-white/40 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-white/90 border border-[#D8CEC1]/60 flex items-center justify-center text-[#101F31] mb-2 shadow-2xs group-hover:scale-110 group-hover:bg-[#101F31] group-hover:text-white transition-all">
                        <Icon className="w-4 h-4 text-[#A5422B] group-hover:text-white stroke-[1.8] transition-colors" />
                      </div>
                      <h4 className="text-[11px] font-bold text-[#101F31] leading-tight mb-1">
                        {title}
                      </h4>
                      <p className="text-[10px] text-[#69665F] leading-tight">
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Organic Mask Photo + Floating Badge + Handwritten Phrase + Stamp */}
            <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center pt-4 lg:pt-0">
              {/* Outer Wrapper with Vintage Stamp & Handwritten Text */}
              <div className="relative w-full max-w-[500px] flex items-center justify-center">
                {/* Floating Experience Badge with gentle breathing oscillation */}
                <div className="absolute -top-4 -left-4 sm:left-2 z-20 bg-white/90 backdrop-blur-md border border-[#D8CEC1] p-3 rounded-2xl shadow-xl animate-float flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#101F31] text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                  </div>
                  <div>
                    <span className="block font-brand text-xs font-bold text-[#101F31]">
                      12+ Years
                    </span>
                    <span className="block text-[9px] tracking-wider uppercase text-[#69665F] font-semibold">
                      Curated Journeys
                    </span>
                  </div>
                </div>

                {/* Organic Brushstroke / Torn Paper Mask Photo */}
                <div className="relative w-[280px] sm:w-[360px] h-[340px] sm:h-[420px] overflow-hidden drop-shadow-xl transition-transform duration-700 hover:scale-102">
                  {/* Clip path polygon or SVG border simulating organic edge */}
                  <img
                    src="/images/hiker.jpg"
                    alt="Traveller with backpack overlooking majestic Himalayan mountain range"
                    className="w-full h-full object-cover"
                    style={{
                      clipPath:
                        'polygon(12% 0%, 88% 0%, 100% 12%, 96% 45%, 100% 88%, 85% 100%, 15% 98%, 0% 85%, 4% 40%, 0% 12%)',
                      borderRadius: '32px',
                    }}
                  />
                  {/* Subtle inner shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Handwritten Cursive Note in Upper-Right */}
                <div className="absolute -top-3 sm:top-2 -right-2 sm:right-0 z-20 pointer-events-none select-none text-right">
                  <div className="font-handwriting text-2xl sm:text-[30px] text-[#303438] leading-tight -rotate-3">
                    Different Places,
                    <br />
                    Same You,
                    <br />
                    A Better You
                  </div>
                </div>

                {/* Vintage Circular Postmark Stamp Illustration in Lower-Right */}
                <div className="absolute -bottom-6 -right-4 sm:right-2 z-10 pointer-events-none select-none opacity-40 text-[#101F31]">
                  <svg
                    width="110"
                    height="110"
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <circle cx="50" cy="50" r="42" strokeDasharray="3 2" />
                    <circle cx="50" cy="50" r="36" />
                    <path d="M12 50 L88 50 M16 44 L84 44 M16 56 L84 56" />
                    <text
                      x="50"
                      y="32"
                      textAnchor="middle"
                      fontSize="6.5"
                      letterSpacing="0.2em"
                      fill="currentColor"
                      fontWeight="bold"
                    >
                      BHROMON POST
                    </text>
                    <text
                      x="50"
                      y="74"
                      textAnchor="middle"
                      fontSize="5.5"
                      letterSpacing="0.18em"
                      fill="currentColor"
                    >
                      AUTHENTIC JOURNEYS
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expandable About Us Story Modal */}
      {showStoryModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowStoryModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FBF7F0] rounded-3xl max-w-xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto border border-[#D8CEC1]/80 shadow-2xl"
          >
            <button
              onClick={() => setShowStoryModal(false)}
              aria-label="Close modal"
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5EBDD] hover:bg-[#D8CEC1] flex items-center justify-center text-[#101F31] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] tracking-[0.25em] text-[#A5422B] font-semibold uppercase block mb-1">
              OUR MISSION & HERITAGE
            </span>
            <h3 className="font-display text-3xl text-[#101F31] font-normal mb-4">
              The Story of BHROMON
            </h3>

            <div className="space-y-4 text-[13.5px] text-[#69665F] leading-relaxed">
              <p>
                Founded with a deep love for the incredible diversity of the Indian subcontinent,
                <strong> BHROMON</strong> (meaning <em>travel and wanderlust</em>) began as a passion
                project to introduce travellers to the soul of every region.
              </p>
              <p>
                From the timeless ghats of Varanasi to the quiet lagoons of Kerala, our philosophy is
                built on conscious exploration, respectful cultural connection, and handcrafted itineraries.
              </p>
              <div className="p-4 bg-[#F5EBDD] rounded-xl border border-[#D8CEC1]/60">
                <h4 className="text-[12px] font-bold text-[#101F31] uppercase tracking-wider mb-1">
                  Our Guiding Principles
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[12px] text-[#303438]">
                  <li>Handpicked local guides with deep regional knowledge</li>
                  <li>Transparent pricing with zero hidden surcharges</li>
                  <li>Sustainable travel supporting local artisan guilds</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#D8CEC1]/60 flex items-center justify-between">
              <span className="text-[11px] text-[#69665F]">BHROMON — Travel Beyond Borders</span>
              <button
                onClick={() => setShowStoryModal(false)}
                className="bg-[#101F31] text-white text-[12px] font-semibold px-5 py-2.5 rounded-full hover:bg-[#1E3455] transition-colors cursor-pointer"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
