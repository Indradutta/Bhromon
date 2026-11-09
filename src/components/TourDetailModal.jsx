import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Users,
  Compass,
  Bed,
  Utensils,
  Car
} from 'lucide-react';

export default function TourDetailModal({ tour, onClose, onOpenBooking }) {
  const [activeTab, setActiveTab] = useState('itinerary');

  if (!tour) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-tour-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-[#FBF7F0] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-[#D8CEC1]/80 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header Media */}
        <div className="relative h-56 sm:h-64 shrink-0 overflow-hidden bg-[#101F31]">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101F31] via-[#101F31]/30 to-transparent" />
          
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="bg-[#A5422B] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm mb-2 inline-block">
              {tour.type}
            </span>
            <h2 id="modal-tour-title" className="font-display text-2xl sm:text-3xl font-medium leading-tight mb-1">
              {tour.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C9A66B]" />
                {tour.destination}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                {tour.durationText}
              </span>
              <span className="text-white font-bold text-sm text-[#C9A66B]">
                Starting from ₹{tour.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-[#D8CEC1]/70 px-5 pt-3 gap-6 bg-[#F5EBDD] text-xs font-semibold overflow-x-auto">
          {[
            { id: 'itinerary', label: 'Day-by-Day Itinerary' },
            { id: 'inclusions', label: 'Inclusions & Exclusions' },
            { id: 'policies', label: 'Important Info & Policy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#A5422B] text-[#A5422B]'
                  : 'border-transparent text-[#69665F] hover:text-[#101F31]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-[#303438] text-[13.5px] leading-relaxed">
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              <p className="text-[#69665F] italic mb-3">
                {tour.description}
              </p>

              {tour.itinerary && tour.itinerary.length > 0 ? (
                <div className="space-y-3">
                  {tour.itinerary.map((item, idx) => {
                    const dayNum = item.dayNumber ?? item.day ?? (idx + 1);
                    const dayTitle = item.title || `Day ${dayNum} Exploration`;
                    const dayDesc = item.description ?? item.desc ?? '';
                    return (
                      <div key={idx} className="flex gap-3 bg-white p-3.5 rounded-xl border border-[#D8CEC1]/50 shadow-2xs">
                        <div className="w-8 h-8 rounded-full bg-[#101F31] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {dayNum}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#101F31] text-sm mb-0.5">
                            Day {dayNum}: {dayTitle}
                          </h4>
                          <p className="text-xs text-[#69665F]">
                            {dayDesc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-white rounded-xl border border-[#D8CEC1]/60">
                  <p>Comprehensive day-by-day itinerary will be prepared customized to your travel dates and pace.</p>
                </div>
              )}

              {/* Highlights row */}
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="bg-[#F5EBDD] p-3 rounded-xl flex items-center gap-2">
                  <Bed className="w-4 h-4 text-[#A5422B]" />
                  <span className="text-xs font-medium">Boutique Stays</span>
                </div>
                <div className="bg-[#F5EBDD] p-3 rounded-xl flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#A5422B]" />
                  <span className="text-xs font-medium">Curated Meals</span>
                </div>
                <div className="bg-[#F5EBDD] p-3 rounded-xl flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#A5422B]" />
                  <span className="text-xs font-medium">Private Transport</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inclusions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white p-4 rounded-xl border border-[#D8CEC1]/60">
                <h4 className="font-bold text-[#101F31] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Inclusions
                </h4>
                <ul className="space-y-2 text-xs text-[#69665F]">
                  {(tour.inclusions || [
                    'Boutique accommodation on twin sharing basis',
                    'Daily wholesome breakfast and regional dinners',
                    'Private AC transportation for all sightseeing',
                    'Dedicated experienced local journey guide',
                    'All monument entry permits and toll taxes'
                  ]).map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#D8CEC1]/60">
                <h4 className="font-bold text-[#101F31] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 text-rose-800">
                  <XCircle className="w-4 h-4 text-rose-600" /> Exclusions
                </h4>
                <ul className="space-y-2 text-xs text-[#69665F]">
                  {(tour.exclusions || [
                    'Airfare / train tickets to origin destination',
                    'Personal expenses, laundry, tips and telephone calls',
                    'Optional adventure activities and gear rentals',
                    'Travel and medical insurance',
                    'Anything not explicitly mentioned in inclusions'
                  ]).map((exc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1 shrink-0" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-3 text-xs text-[#69665F]">
              <div className="bg-white p-4 rounded-xl border border-[#D8CEC1]/60">
                <h4 className="font-bold text-[#101F31] mb-1">Cancellation & Refund Policy</h4>
                <p>Free cancellation up to 30 days prior to departure. 50% refund between 15–29 days. Non-refundable within 14 days of travel date.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#D8CEC1]/60">
                <h4 className="font-bold text-[#101F31] mb-1">Important Information</h4>
                <p>Valid government photo ID required at check-in. For high altitude circuits (Ladakh/Kedarnath), adequate acclimatization is scheduled into the itinerary.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#D8CEC1]/70 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#69665F] uppercase tracking-wider block">Price per adult</span>
            <span className="font-bold text-lg sm:text-xl text-[#A5422B]">
              ₹{tour.price.toLocaleString('en-IN')}*
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#69665F] hover:text-[#101F31] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenBooking) onOpenBooking(tour);
              }}
              className="bg-[#101F31] hover:bg-[#1E3455] text-white px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Enquire & Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
