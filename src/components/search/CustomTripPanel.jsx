import React, { useState } from 'react';
import { MapPin, Calendar, Users, Sparkles, Send } from 'lucide-react';
import { formatReadableDate } from './searchData';

export default function CustomTripPanel({
  destination,
  travelDate,
  travellers,
  onSubmitCustomTrip,
  isSubmitting,
}) {
  const [region, setRegion] = useState(destination || '');
  const [stylePreference, setStylePreference] = useState('Luxury Heritage');
  const [durationPreference, setDurationPreference] = useState('7–10 Days');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitCustomTrip) {
      onSubmitCustomTrip({
        category: 'customTrip',
        destination: region || destination || 'Bespoke India Journey',
        travelDate,
        travellers,
        stylePreference,
        durationPreference,
        notes,
      });
    }
  };

  return (
    <div className="w-full pt-2">
      <div className="bg-[#F7F3ED]/70 rounded-2xl p-4 sm:p-5 border border-[#E9E1D8]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#B3452C]" />
          <h4 className="font-display text-sm sm:text-base font-bold text-[#1F2937]">
            Tailor-Made Bespoke Expedition Planner
          </h4>
        </div>
        <p className="text-xs text-[#6B7280] mb-4 max-w-xl font-normal leading-relaxed">
          Tell us your ideal regions and travel desires. Our master expedition curators will craft a personalized itinerary just for you.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Preferred Region / Circuit */}
          <div className="bg-white p-3 rounded-xl border border-[#E9E1D8]">
            <label className="text-[10.5px] font-bold text-[#1F2937] uppercase tracking-wider block mb-1">
              Destination / Region
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#B3452C] shrink-0" />
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Kashmir, Spiti, Rajasthan"
                className="w-full text-xs font-medium text-[#1F2937] placeholder-[#A3A3A3] bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Travel Style */}
          <div className="bg-white p-3 rounded-xl border border-[#E9E1D8]">
            <label className="text-[10.5px] font-bold text-[#1F2937] uppercase tracking-wider block mb-1">
              Journey Style
            </label>
            <select
              value={stylePreference}
              onChange={(e) => setStylePreference(e.target.value)}
              className="w-full text-xs font-medium text-[#1F2937] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Luxury Heritage">Luxury Heritage & Palaces</option>
              <option value="Spiritual & Cultural">Spiritual & Vedic Immersion</option>
              <option value="Himalayan Adventure">High Altitude Mountain Treks</option>
              <option value="Pristine Coastlines">Private Houseboats & Coasts</option>
              <option value="Wildlife Safari">Private Wildlife & Safaris</option>
            </select>
          </div>

          {/* Preferred Duration */}
          <div className="bg-white p-3 rounded-xl border border-[#E9E1D8]">
            <label className="text-[10.5px] font-bold text-[#1F2937] uppercase tracking-wider block mb-1">
              Estimated Duration
            </label>
            <select
              value={durationPreference}
              onChange={(e) => setDurationPreference(e.target.value)}
              className="w-full text-xs font-medium text-[#1F2937] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="3–5 Days">3–5 Days (Short Retreat)</option>
              <option value="7–10 Days">7–10 Days (Curated Classic)</option>
              <option value="12–15 Days">12–15 Days (Deep Immersion)</option>
              <option value="16+ Days">16+ Days (Grand Circuit)</option>
            </select>
          </div>

          {/* Special Requests / Notes */}
          <div className="sm:col-span-3 bg-white p-3 rounded-xl border border-[#E9E1D8]">
            <label className="text-[10.5px] font-bold text-[#1F2937] uppercase tracking-wider block mb-1">
              Special Requests or Desired Experiences (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Private cooking class, river-facing suite, dietary preferences..."
              className="w-full text-xs font-normal text-[#1F2937] placeholder-[#A3A3A3] bg-transparent focus:outline-none"
            />
          </div>

          {/* Action Row */}
          <div className="sm:col-span-3 pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B3452C]" />
                {formatReadableDate(travelDate) || 'Flexible date'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#B3452C]" />
                {travellers?.adults || 2} Adults
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#B3452C] hover:bg-[#963922] text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Crafting Request...</span>
              ) : (
                <>
                  <span>Begin Custom Enquiry</span>
                  <Send className="w-3 h-3 stroke-[2]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
