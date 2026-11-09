import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Star } from 'lucide-react';
import { TOURS_DATA } from '../pages/TourPackages';
import publicApi from '../api/publicApi';

export default function HomeFeaturedTours() {
  const fallbackFeatured = TOURS_DATA.filter((tour) => tour.featured).slice(0, 4);
  const [featuredTours, setFeaturedTours] = useState(fallbackFeatured);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const res = await publicApi.getPackages({ featured: true, limit: 4 });
        if (isMounted && res?.data && res.data.length > 0) {
          const normalized = res.data.map((p) => ({
            id: p.legacyId || p.id,
            title: p.title,
            region: p.region || p.destinationText || 'India',
            destination: p.destinationText || p.region || 'India',
            durationDays: p.durationDays || 5,
            durationText: p.durationText || `${p.durationDays} Days`,
            price: p.price,
            rating: p.rating || 4.9,
            image: p.image,
            type: p.category || p.type || 'Cultural',
            description: p.description,
          }));
          setFeaturedTours(normalized);
        }
      } catch (err) {
        console.warn('Using static featured tours fallback:', err.message);
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="featured-tours" className="scroll-mt-24 bg-[#F4F1E8] px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-7 grid gap-5 md:grid-cols-[1fr_0.8fr] md:items-end">
          <div>
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8e604a]">Featured packages</p>
            <h2 className="font-display text-3xl leading-[0.98] text-[#172A3A] sm:text-5xl">Handpicked<br className="hidden sm:block" /> Journeys for You</h2>
          </div>
          <div className="flex items-end justify-between gap-4 md:pb-1">
            <p className="max-w-sm text-xs leading-relaxed text-stone-600">Thoughtfully planned journeys across India, with the places, people and details worth travelling for.</p>
            <Link to="/#tour-packages" className="shrink-0 inline-flex items-center gap-2 text-xs font-semibold text-[#172A3A] transition hover:text-[#A5462D]">
              View all packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredTours.map((tour) => (
            <Link key={tour.id} to={`/tours/${tour.id}#tour-details`} className="group overflow-hidden rounded-xl bg-[#FFFCF7] shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={tour.image} alt={tour.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute bottom-3 left-3 rounded-md bg-[#FFF9EC]/95 px-3 py-1 text-[10px] font-semibold text-[#273A42]">{tour.type}</span>
              </div>
              <div className="p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-stone-500">
                  <span className="flex min-w-0 items-center gap-1 truncate"><MapPin className="h-3.5 w-3.5 shrink-0 text-[#A5462D]" />{tour.region}</span>
                  <span className="flex shrink-0 items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#D79B37] text-[#D79B37]" />{tour.rating}</span>
                </div>
                <h3 className="mb-2 font-sans text-sm font-semibold leading-snug text-[#172A3A] group-hover:text-[#A5462D]">{tour.title}</h3>
                <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-stone-500">{tour.description}</p>
                <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-600">
                  <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{tour.durationText}</span>
                  <span className="font-semibold text-[#A5462D]">₹{tour.price.toLocaleString('en-IN')}+</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
