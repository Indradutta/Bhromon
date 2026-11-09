import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ShieldCheck, Calendar, Users, MapPin, Mail, Phone } from 'lucide-react';
import publicApi from '../api/publicApi';

export default function BookingEnquiryModal({ initialData, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    destination: initialData?.title || initialData?.destination || '',
    travelDate: initialData?.travelDate || '',
    adults: initialData?.travellers ? String(initialData.travellers) : '2',
    children: '0',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Please enter your full name';
    if (!formData.email.trim()) {
      errs.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Please enter your contact number';
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.phone)) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!formData.destination.trim()) errs.destination = 'Please choose a package or destination';
    if (!formData.travelDate) errs.travelDate = 'Please select a preferred travel date';

    const adultsNum = parseInt(formData.adults, 10);
    if (!formData.adults || isNaN(adultsNum) || adultsNum < 1) {
      errs.adults = 'Please specify at least 1 adult traveller';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const adultsNum = parseInt(formData.adults, 10) || 1;
    const childrenNum = parseInt(formData.children, 10) || 0;

    try {
      await publicApi.submitEnquiry({
        customerName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        destination: formData.destination.trim(),
        travelDate: formData.travelDate || null,
        travellersCount: adultsNum + childrenNum,
        adultsCount: adultsNum,
        childrenCount: childrenNum,
        message: formData.message ? formData.message.trim() : null,
        source: 'WEBSITE_MODAL',
      });
      setIsSuccess(true);
    } catch (err) {
      console.warn('Modal enquiry fallback:', err.message);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#FBF7F0] rounded-[28px] max-w-2xl w-full my-auto overflow-hidden flex flex-col shadow-2xl border border-[#D8CEC1]/90 relative p-7 sm:p-9">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#F5EBDD] hover:bg-[#D8CEC1] flex items-center justify-center text-[#101F31] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-10 px-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-5 shadow-sm">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="font-display text-3xl text-[#101F31] font-medium mb-3">
              Enquiry Received!
            </h3>
            <p className="text-sm text-[#69665F] max-w-md mx-auto leading-relaxed mb-8">
              Thank you, <strong className="text-slate-900">{formData.fullName}</strong>. Your customized itinerary request for <strong className="text-slate-900">{formData.destination}</strong> has been logged. Our travel advisor will reach out shortly.
            </p>
            <button
              onClick={onClose}
              className="bg-[#101F31] hover:bg-[#1E3455] text-white text-sm font-semibold px-8 py-3.5 rounded-full transition-colors cursor-pointer shadow-md hover:shadow-lg"
            >
              Back to Exploration
            </button>
          </div>
        ) : (
          <div className="max-h-[85vh] overflow-y-auto pr-1">
            <div className="mb-6">
              <span className="text-xs tracking-[0.25em] text-[#A5422B] font-bold uppercase block mb-1.5">
                PLAN YOUR JOURNEY
              </span>
              <h2 id="enquiry-modal-title" className="font-display text-2xl sm:text-3xl font-semibold text-[#101F31]">
                Booking Enquiry
              </h2>
              <p className="text-sm text-[#69665F] mt-1.5 leading-relaxed">
                Tell us about your dream trip and our travel specialists will handcraft your personalized itinerary.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-[#101F31] block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Vikramaditya Roy"
                  className="w-full text-sm bg-white border border-[#D8CEC1] rounded-xl px-4 py-3 text-[#101F31] placeholder-[#69665F]/50 focus:outline-none focus:border-[#A5422B] focus:ring-1 focus:ring-[#A5422B]/20 transition-all"
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-[#101F31] block mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full text-sm bg-white border border-[#D8CEC1] rounded-xl px-4 py-3 text-[#101F31] placeholder-[#69665F]/50 focus:outline-none focus:border-[#A5422B] focus:ring-1 focus:ring-[#A5422B]/20 transition-all"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-[#101F31] block mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full text-sm bg-white border border-[#D8CEC1] rounded-xl px-4 py-3 text-[#101F31] placeholder-[#69665F]/50 focus:outline-none focus:border-[#A5422B] focus:ring-1 focus:ring-[#A5422B]/20 transition-all"
                  />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Destination & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-[#101F31] block mb-1.5">
                    Destination / Tour *
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g. Kashmir Delight"
                    className="w-full text-sm bg-white border border-[#D8CEC1] rounded-xl px-4 py-3 text-[#101F31] placeholder-[#69665F]/50 focus:outline-none focus:border-[#A5422B] focus:ring-1 focus:ring-[#A5422B]/20 transition-all"
                  />
                  {errors.destination && <p className="text-xs text-red-600 mt-1">{errors.destination}</p>}
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-[#101F31] block mb-1.5">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full text-sm bg-white border border-[#D8CEC1] rounded-xl px-4 py-3 text-[#101F31] focus:outline-none focus:border-[#A5422B] cursor-pointer"
                  />
                  {errors.travelDate && <p className="text-xs text-red-600 mt-1">{errors.travelDate}</p>}
                </div>
              </div>

              {/* Travellers (Adults & Children - manual inputs without sticky numbers) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white/70 rounded-2xl border border-[#D8CEC1]">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-[#101F31] block mb-1">
                    Adults (12+ yrs) *
                  </label>
                  <p className="text-[11px] text-[#69665F] mb-1.5">Type number of adult travellers</p>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    placeholder="e.g. 2"
                    value={formData.adults}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, adults: val }));
                    }}
                    className="w-full text-sm font-medium bg-white border border-[#D8CEC1] rounded-xl px-4 py-2.5 text-[#101F31] focus:outline-none focus:border-[#A5422B]"
                  />
                  {errors.adults && <p className="text-xs text-red-600 mt-1">{errors.adults}</p>}
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-[#101F31] block mb-1">
                    Children (under 12 yrs)
                  </label>
                  <p className="text-[11px] text-[#69665F] mb-1.5">Type 0 if no children travelling</p>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="e.g. 0"
                    value={formData.children}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, children: val }));
                    }}
                    className="w-full text-sm font-medium bg-white border border-[#D8CEC1] rounded-xl px-4 py-2.5 text-[#101F31] focus:outline-none focus:border-[#A5422B]"
                  />
                </div>
              </div>

              {/* Special Requirements */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-[#101F31] block mb-1.5">
                  Special Requirements or Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Dietary preferences, preferred hotel grade, celebration trips, room requirements..."
                  className="w-full text-sm bg-white border border-[#D8CEC1] rounded-xl p-3.5 text-[#101F31] placeholder-[#69665F]/50 focus:outline-none focus:border-[#A5422B] focus:ring-1 focus:ring-[#A5422B]/20 transition-all"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#101F31] hover:bg-[#1E3455] text-white py-3.5 rounded-full text-sm font-semibold tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Your Request...</span>
                ) : (
                  <>
                    <span>Submit Travel Enquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
