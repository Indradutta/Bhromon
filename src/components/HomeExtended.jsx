import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Users, MapPin, Headphones, Award, Compass, Heart, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WHY_REASONS = [
  {
    icon: Compass,
    title: 'Deeply Curated Routes',
    desc: 'Every itinerary is researched on-ground by local experts who know the terrain, timing, and hidden gems that no guidebook reveals.',
    color: '#123C2A',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Transparent',
    desc: 'No hidden costs, no bait-and-switch pricing. What you see in your dossier is exactly what you pay — fully insured, fully documented.',
    color: '#B85C32',
  },
  {
    icon: Users,
    title: 'Dedicated Journey Manager',
    desc: 'From first enquiry to your last goodbye, one senior travel specialist is exclusively assigned to your journey for personal continuity.',
    color: '#D7A43A',
  },
  {
    icon: MapPin,
    title: 'Local Custodians Network',
    desc: 'We work only with certified local guides, family-run heritage properties, and artisan communities who share our philosophy of respectful travel.',
    color: '#123C2A',
  },
  {
    icon: Headphones,
    title: '24/7 On-Route Support',
    desc: 'Our Kolkata concierge desk stays active round the clock. Any crisis — weather, health, logistics — is handled immediately by our team.',
    color: '#B85C32',
  },
  {
    icon: Heart,
    title: 'Responsible Tourism',
    desc: 'We prioritize low-impact travel, plastic-free trails, and reinvesting directly into local communities and ecological conservation.',
    color: '#D7A43A',
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Dr. Aparajita Basu',
    role: 'Paediatric Surgeon, Kolkata',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    tour: 'Sacred Monasteries & Kanchenjunga',
    rating: 5,
    text: '"The meticulous attention to detail was unlike anything I have experienced with a travel company. Our journey manager had arranged a dawn private entry to Pemayangtse — something I could not have organized myself in five years."',
    destination: 'Sikkim',
  },
  {
    id: 2,
    name: 'Siddharth & Meera Raghavan',
    role: 'Architects, Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    tour: 'Royal Forts & Palaces of Rajputana',
    rating: 5,
    text: '"Bhromon transformed what could have been a generic heritage trip into an intimate encounter with living history. Dining under desert stars in the Thar with a local musician was the highlight of our lives together."',
    destination: 'Rajasthan',
  },
  {
    id: 3,
    name: 'James Willoughby',
    role: 'Travel Writer, London',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    tour: 'Ghats of Varanasi',
    rating: 5,
    text: '"I have covered over 60 countries for major travel publications. Varanasi at dawn from a Bhromon river boat moved me to tears. The writing cannot capture it — but Bhromon can arrange the experience."',
    destination: 'Varanasi',
  },
  {
    id: 4,
    name: 'Nalini Krishnaswamy',
    role: 'University Professor & Author',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    tour: 'Kerala Backwaters & Spice Hills',
    rating: 5,
    text: '"The private houseboat was an experience of absolute serenity. No engine noise, no commercial boats, just the sound of water and coconut palms. The caretaker curated our meals from local catch every morning."',
    destination: 'Kerala',
  },
];

const GALLERY_IMAGES = [
  { id: 1, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=75', alt: 'Ladakh Mountains', span: 'row-span-2', tag: 'Ladakh' },
  { id: 2, src: 'https://images.unsplash.com/photo-1561016928-9c038adf1fc3?auto=format&fit=crop&w=800&q=75', alt: 'Varanasi Ghats', span: '', tag: 'Varanasi' },
  { id: 3, src: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=75', alt: 'Rajasthan Fort', span: '', tag: 'Rajasthan' },
  { id: 4, src: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=75', alt: 'Kerala Backwaters', span: 'col-span-2', tag: 'Kerala' },
  { id: 5, src: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=75', alt: 'Sikkim Monastery', span: '', tag: 'Sikkim' },
  { id: 6, src: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=75', alt: 'Goa Beach', span: '', tag: 'Goa' },
];

const BLOG_TEASER = [
  {
    id: 1,
    cat: 'Adventure',
    title: 'Echoes of the High Passes: Crossing Ladakh\'s Moonscapes',
    date: 'Oct 20, 2026',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=75',
  },
  {
    id: 2,
    cat: 'Culture',
    title: 'Dawn on the Manikarnika: Sacred Fire and Water in Varanasi',
    date: 'Oct 18, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1562016928-9c038adf1fc3?auto=format&fit=crop&w=800&q=75',
  },
  {
    id: 3,
    cat: 'Luxury',
    title: 'The Spice Route by Water: Kerala\'s Emerald Backwater Labyrinth',
    date: 'Oct 12, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1609137144822-4463c271d798?auto=format&fit=crop&w=800&q=75',
  },
];

export default function HomeExtended() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.why-card-item',
        { opacity: 0, y: 35 },
        {
          opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.why-section', start: 'top 82%' }
        }
      );
      gsap.fromTo('.testimonial-card-item',
        { opacity: 0, y: 35 },
        {
          opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.testimonials-section', start: 'top 82%' }
        }
      );
      gsap.fromTo('.gallery-item',
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1, scale: 1, duration: 0.65, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: '.gallery-section', start: 'top 82%' }
        }
      );
      gsap.fromTo('.blog-teaser-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.blog-teaser-section', start: 'top 82%' }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* =====================================================================
          SECTION: WHY CHOOSE US
          ===================================================================== */}
      <section id="why-us" className="why-section py-12 sm:py-14 px-6 sm:px-12 lg:px-16 max-w-[1440px] mx-auto scroll-mt-24">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
            <span className="text-[9px] font-semibold tracking-[0.24em] text-stone-600 uppercase">The Bhromon difference</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-[#111111] font-normal leading-tight">
            A little more care, at every step.
          </h2>
          <p className="max-w-sm text-xs leading-relaxed text-stone-600">Good journeys are made in the details: thoughtful planning, local knowledge and a real person to call.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-y border-stone-300/80 py-5 lg:grid-cols-4 lg:gap-6">
          {WHY_REASONS.slice(0, 4).map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="why-card-item group flex items-center gap-3 py-2 transition-all duration-300"
              >
                <div
                  className="w-10 h-10 rounded-full flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${reason.color}18`, color: reason.color }}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="font-sans text-xs text-[#111111] font-semibold leading-tight">{reason.title}</h3>
                  <p className="mt-1 text-[10px] leading-relaxed text-stone-500">{reason.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          SECTION: TESTIMONIALS
          ===================================================================== */}
      <section id="testimonials" className="testimonials-section py-14 sm:py-16 bg-[#FAF6F0] border-y border-stone-200/80 px-6 sm:px-12 lg:px-16 scroll-mt-24">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="inline-flex items-center gap-2.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#D7A43A]" />
                <span className="text-xs font-semibold tracking-[0.24em] text-stone-600 uppercase">Voices of Our Travelers</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-[#111111] font-normal leading-[0.98]">
                Happy Travellers<br />
                <span className="font-editorial italic text-[#B85C32]">Happier Stories</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Award key={i} className="w-4 h-4 text-[#D7A43A] fill-[#D7A43A]" />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-600">4.97 / 5 from 1,200+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <div key={t.id} className="testimonial-card-item bg-white rounded-lg p-5 border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300">
                {/* Quote */}
                <div className="mb-5">
                  <div className="font-editorial text-5xl text-[#B85C32]/20 leading-none mb-2">"</div>
                  <p className="font-editorial text-base sm:text-lg text-stone-800 leading-relaxed italic">{t.text}</p>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between gap-4 pt-5 border-t border-stone-100">
                  <div className="flex items-center gap-3.5">
                    <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-[#123C2A]/10" />
                    <div>
                      <div className="text-sm font-semibold text-[#111111]">{t.name}</div>
                      <div className="text-xs text-stone-500">{t.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end gap-0.5 mb-0.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <span key={i} className="text-[#D7A43A] text-xs">★</span>
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">{t.destination}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION: GALLERY
          ===================================================================== */}
      <section id="gallery" className="gallery-section py-14 sm:py-16 px-6 sm:px-12 lg:px-16 max-w-[1440px] mx-auto scroll-mt-24">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-[0.72fr_2fr] md:items-center">
        <div className="text-left">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#B85C32]" />
            <span className="text-[9px] font-semibold tracking-[0.24em] text-stone-600 uppercase">Travel gallery</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-[#111111] font-normal leading-[0.98]">
            Moments<br /><span className="font-editorial italic text-[#123C2A]">from the Road</span>
          </h2>
          <Link to="/#journal" className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#123C2A]">See more photos <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>

        {/* Mosaic Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          {GALLERY_IMAGES.slice(0, 5).map((img) => (
            <div
              key={img.id}
              className="gallery-item relative aspect-[0.72] overflow-hidden rounded-lg sm:rounded-xl group"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                <span className="inline-flex items-center gap-1.5 bg-white/90 text-[#111111] text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {img.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION: BLOG / NEWS TEASER
          ===================================================================== */}
      <section id="journal-preview" className="blog-teaser-section py-14 sm:py-16 bg-[#FAF6F0] border-y border-stone-200/80 px-6 sm:px-12 lg:px-16 scroll-mt-24">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 md:grid-cols-[0.72fr_2fr]">
          <div className="mb-3 block">
            <div>
              <div className="inline-flex items-center gap-2.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
                <span className="text-xs font-semibold tracking-[0.24em] text-stone-600 uppercase">Bhromon Travel Journal</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-[#111111] font-normal leading-[0.98]">
                Stories, Tips<br /><span className="font-editorial italic text-[#123C2A]">and Travel Guides</span>
              </h2>
            </div>
            <Link
              to="/blog"
              className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#123C2A] hover:text-[#B85C32] transition-colors group"
            >
              <span>Read All Articles</span>
              <ArrowRight className="w-4 h-4 stroke-[2] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:col-start-2 md:row-start-1 md:grid-cols-3 lg:gap-5">
            {BLOG_TEASER.map((article) => (
              <Link
                key={article.id}
                to="/blog"
                className="blog-teaser-card group block bg-white rounded-lg overflow-hidden border border-stone-200/70 shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-32 overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600" />
                  <span className="absolute top-4 left-4 bg-[#123C2A] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                    {article.cat}
                  </span>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-sans text-xs text-[#111111] font-semibold leading-snug mb-3 group-hover:text-[#123C2A] transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                    <span>{article.date}</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION: CONTACT INFO + CTA
          ===================================================================== */}
      <section className="relative mt-4 min-h-[270px] overflow-hidden bg-[#102b3c] sm:min-h-[320px]">
        <img src="/images/darjeeling-himalayas.jpg" alt="Mountain landscape in the last light of day" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061725]/75 via-[#061725]/30 to-[#061725]/45" />
        <div className="relative mx-auto flex min-h-[270px] max-w-[1440px] items-center justify-between gap-6 px-6 py-10 text-white sm:min-h-[320px] sm:px-12 lg:px-16">
          <div>
            <h2 className="font-display text-3xl font-normal leading-tight sm:text-4xl">Ready for Your Next Adventure?</h2>
            <p className="mt-2 text-xs text-white/75">Tell us what you love. We’ll help plan the rest.</p>
            <Link to="/booking" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fbf2df] px-5 py-2.5 text-[11px] font-semibold text-[#172A3A] hover:bg-white">
              Plan your trip <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="hidden items-end gap-5 text-xs text-white/80 sm:flex">
            <a href="tel:+919876543210" className="hover:text-white">+91 98765 43210</a>
            <a href="mailto:hello@bhromon.com" className="hover:text-white">hello@bhromon.com</a>
          </div>
        </div>
      </section>
    </div>
  );
}
