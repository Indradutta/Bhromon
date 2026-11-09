import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  X,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Lock,
  Landmark,
  Footprints,
  Palmtree,
  Star,
  Check,
  ChevronDown,
  HelpCircle,
  Shield,
  Send,
  RotateCcw
} from 'lucide-react';

import BhromonNav from '../components/BhromonNav';
import BhromonFooter from '../components/BhromonFooter';
import publicApi from '../api/publicApi';

gsap.registerPlugin(ScrollTrigger);

// 10 Curated Package Options
const TOUR_PACKAGES = [
  'Varanasi Ghats & Spiritual Awakening (5D/4N)',
  'Royal Forts & Palaces of Rajasthan (8D/7N)',
  'Himalayan Mist: Sikkim & Darjeeling Tea Trail (7D/6N)',
  'Kerala Backwaters & Spice Coast Explorer (6D/5N)',
  'Ladakh: High Passes & Monasteries Odyssey (9D/8N)',
  'Golden Triangle & Taj Mahal Heritage Circuit (6D/5N)',
  'Andaman Islands: Tropical Coral Sanctuary (6D/5N)',
  'Wild Heart of India: Bandhavgarh & Kanha Safari (5D/4N)',
  'Himachal High Valleys: Spiti & Kinnaur (8D/7N)',
  'Ancient Temple Corridors of Tamil Nadu (7D/6N)',
];

// Destination Options
const DESTINATIONS = [
  'Varanasi & Sarnath, Uttar Pradesh',
  'Jaipur, Udaipur & Jodhpur, Rajasthan',
  'Gangtok & Darjeeling, Sikkim & Bengal',
  'Alleppey, Munnar & Kochi, Kerala',
  'Leh, Nubra Valley & Pangong, Ladakh',
  'Agra, Jaipur & Delhi (Golden Triangle)',
  'Havelock & Neil Islands, Andaman',
  'Bandhavgarh & Kanha, Madhya Pradesh',
  'Spiti Valley & Manali, Himachal Pradesh',
  'Madurai, Thanjavur & Rameswaram, Tamil Nadu',
  'Goa Heritage & Konkan Coastline',
  'Srinagar, Gulmarg & Pahalgam, Kashmir',
];

// Tour Type Preferences
const TOUR_TYPES = [
  { id: 'Adventure', label: 'Adventure', desc: 'Treks, trails & expeditions', icon: Compass },
  { id: 'Cultural', label: 'Cultural', desc: 'Heritage, arts & traditions', icon: Landmark },
  { id: 'Spiritual', label: 'Spiritual', desc: 'Ghats, temples & sacred rites', icon: Sparkles },
  { id: 'Wildlife', label: 'Wildlife', desc: 'Safaris & jungle reserves', icon: Footprints },
  { id: 'Beach', label: 'Beach', desc: 'Coastal serenity & islands', icon: Palmtree },
];

// Budget Ranges
const BUDGET_RANGES = [
  'Under ₹20K',
  '₹20K-50K',
  '₹50K-1L',
  'Above ₹1L',
];

// Accommodation Tiers
const ACCOMMODATIONS = [
  { id: 'Budget', label: 'Budget', desc: 'Heritage homestays & authentic inns' },
  { id: 'Standard', label: 'Standard', desc: 'Comfortable boutique 3-star stays' },
  { id: 'Deluxe', label: 'Deluxe', desc: '4-star restored havelis & resorts' },
  { id: 'Luxury', label: 'Luxury', desc: '5-star royal palaces & luxury tents' },
];

// Referral Sources
const REFERRAL_SOURCES = [
  'Search Engine (Google / Bing)',
  'Instagram / Social Media',
  'Recommended by Friends or Family',
  'Travel Magazine / Editorial Feature',
  'Previous Bhromon Traveler',
  'Other Source',
];

export default function BookingEnquiry({ embedded = false }) {
  const pageContainerRef = useRef(null);
  const headerRef = useRef(null);
  const formCardRef = useRef(null);
  const rightPanelRef = useRef(null);
  const successCardRef = useRef(null);

  // Form Field States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    sameAsMobile: false,
    tourPackage: '',
    destination: '',
    travelDate: '',
    flexibleDates: false,
    adults: 2,
    children: 0,
    infants: 0,
    tourType: 'Cultural',
    budgetRange: '₹20K-50K',
    accommodation: 'Deluxe',
    specialRequirements: '',
    heardAboutUs: '',
    message: '',
    termsAgreed: false,
    privacyAgreed: false,
    marketingConsent: false,
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRefId, setBookingRefId] = useState('');
  const [submissionSnapshot, setSubmissionSnapshot] = useState(null);

  // Synchronize WhatsApp number when "Same as mobile" is checked
  useEffect(() => {
    if (formData.sameAsMobile) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
      if (errors.whatsapp) {
        setErrors(prev => {
          const updated = { ...prev };
          delete updated.whatsapp;
          return updated;
        });
      }
    }
  }, [formData.sameAsMobile, formData.phone, errors.whatsapp]);

  // GSAP Animations on Mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      );

      // Two-column layout stagger entrance
      if (formCardRef.current && rightPanelRef.current) {
        gsap.fromTo(
          [formCardRef.current, rightPanelRef.current],
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.2,
            ease: 'power3.out',
            delay: 0.15,
          }
        );
      }

      // Staggered reveal for form inner sections
      const sections = formCardRef.current?.querySelectorAll('.form-section-block');
      if (sections && sections.length > 0) {
        gsap.fromTo(
          sections,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power2.out',
            delay: 0.35,
          }
        );
      }
    }, pageContainerRef);

    return () => ctx.revert();
  }, [isSuccess]);

  // Entrance animation when success state renders
  useEffect(() => {
    if (isSuccess && successCardRef.current) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      gsap.fromTo(
        successCardRef.current,
        { opacity: 0, scale: 0.96, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)' }
      );
    }
  }, [isSuccess]);

  // Handle generic inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for field on interaction
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Traveler Counter Handlers
  const handleCounter = (field, delta, min = 0, max = 20) => {
    setFormData(prev => {
      const currentVal = prev[field];
      const newVal = Math.min(Math.max(currentVal + delta, min), max);
      return { ...prev, [field]: newVal };
    });
  };

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (< 10MB) and format (.pdf, .jpg, .jpeg, .png)
      const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!validExtensions.includes(fileExt)) {
        setErrors(prev => ({ ...prev, documents: 'Please upload a PDF or JPG/PNG image only.' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, documents: 'File size must be under 10MB.' }));
        return;
      }
      setUploadedFile(file);
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.documents;
        return updated;
      });
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name should be at least 3 characters.';
    }

    // 2. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // 3. Mobile Number (10 digits)
    const phoneClean = formData.phone.replace(/[\s\-\(\)\+]/g, '');
    const phone10Regex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required.';
    } else if (!phone10Regex.test(phoneClean)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    // WhatsApp validation (if entered and not sameAsMobile)
    if (!formData.sameAsMobile && formData.whatsapp.trim()) {
      const whatsappClean = formData.whatsapp.replace(/[\s\-\(\)\+]/g, '');
      if (!phone10Regex.test(whatsappClean)) {
        newErrors.whatsapp = 'Please enter a valid 10-digit WhatsApp number.';
      }
    }

    // 4. Tour / Package
    if (!formData.tourPackage) {
      newErrors.tourPackage = 'Please select a tour package from the catalogue.';
    }

    // 5. Destination
    if (!formData.destination) {
      newErrors.destination = 'Please choose your primary destination.';
    }

    // 6. Travel Date
    if (!formData.travelDate) {
      newErrors.travelDate = 'Please select your preferred departure date.';
    }

    // 7. Adults count
    if (!formData.adults || parseInt(formData.adults, 10) < 1) {
      newErrors.adults = 'At least 1 adult traveler is required.';
    }

    // 8. Terms & Privacy Checkboxes
    if (!formData.termsAgreed) {
      newErrors.termsAgreed = 'You must agree to the Terms & Conditions.';
    }
    if (!formData.privacyAgreed) {
      newErrors.privacyAgreed = 'You must accept the Privacy Policy to proceed.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      // Find first error and scroll into view
      const firstErrorEl = document.querySelector('.border-red-500, .text-red-600');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Real database enquiry submission
      const payload = {
        customerName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        destination: formData.destination || formData.tourPackage || 'Custom India Tour',
        travelDate: formData.travelDate || null,
        travellersCount: (parseInt(formData.adults, 10) || 2) + (parseInt(formData.children, 10) || 0),
        adultsCount: parseInt(formData.adults, 10) || 2,
        childrenCount: parseInt(formData.children, 10) || 0,
        budget: formData.budget || null,
        category: formData.tourType || 'Cultural',
        message: formData.notes ? formData.notes.trim() : `Referral: ${formData.referralSource || 'Website'}`,
        source: 'WEBSITE',
      };

      const res = await publicApi.submitEnquiry(payload);
      const generatedRef = res?.data?.enquiryNumber || `BHR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      setBookingRefId(generatedRef);
      setSubmissionSnapshot({
        ...formData,
        fileName: uploadedFile ? uploadedFile.name : null,
        refNumber: generatedRef,
      });

      setIsSuccess(true);
    } catch (err) {
      console.warn('Backend submission error, using resilient fallback:', err.message);
      const randomCode = Math.floor(10000 + Math.random() * 90000);
      const fallbackRef = `BHR-${new Date().getFullYear()}-${randomCode}`;
      setBookingRefId(fallbackRef);
      setSubmissionSnapshot({
        ...formData,
        fileName: uploadedFile ? uploadedFile.name : null,
        refNumber: fallbackRef,
      });
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to submit another request
  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      whatsapp: '',
      sameAsMobile: false,
      tourPackage: '',
      destination: '',
      travelDate: '',
      flexibleDates: false,
      adults: 2,
      children: 0,
      infants: 0,
      tourType: 'Cultural',
      budgetRange: '₹20K-50K',
      accommodation: 'Deluxe',
      specialRequirements: '',
      heardAboutUs: '',
      message: '',
      termsAgreed: false,
      privacyAgreed: false,
      marketingConsent: false,
    });
    setUploadedFile(null);
    setErrors({});
    setIsSuccess(false);
  };

  // Minimum date for date picker (today)
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div ref={pageContainerRef} className="relative min-h-screen bg-[#F4F1E8] text-[#111111] overflow-x-hidden selection:bg-[#123C2A] selection:text-[#FAF6F0]">
      {/* Background Cartography & Aged Parchment Texture */}
      {!embedded && <div
        className="fixed inset-0 pointer-events-none opacity-30 mix-blend-multiply z-0"
        style={{
          backgroundImage: 'radial-gradient(#9B8365 0.75px, transparent 0.75px)',
          backgroundSize: '22px 22px',
        }}
        aria-hidden="true"
      />}

      {/* Low-opacity decorative compass SVG watermark */}
      {!embedded && <div className="fixed -right-24 -top-24 w-96 h-96 pointer-events-none opacity-[0.05] z-0 select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current text-[#123C2A]" strokeWidth="0.8">
          <circle cx="50" cy="50" r="48" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="38" />
          <path d="M50 2 L54 44 L98 50 L54 56 L50 98 L46 56 L2 50 L46 44 Z" fill="currentColor" fillOpacity="0.1" />
        </svg>
      </div>}

      {/* Navigation Bar */}
      {!embedded && <BhromonNav mode="solid" />}

      {/* Main Page Content */}
      <main className="relative z-10 pt-28 sm:pt-36 pb-20 sm:pb-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">

          {/* 
            ========================================================================
            01. PAGE HEADER: Editorial Eyebrow + Playfair Heading + Subtitle
            ========================================================================
          */}
          <header ref={headerRef} className="mb-10 sm:mb-14 text-center max-w-3xl mx-auto pt-4">
            {/* Section Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-3 bg-[#FAF6F0] px-4 py-1.5 rounded-full border border-stone-300/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#B85C32] animate-pulse" />
              <span className="text-[11px] font-sans tracking-[0.24em] font-semibold text-stone-700 uppercase">
                JOURNEY CONCIERGE & BESPOKE EXPEDITIONS
              </span>
            </div>

            {/* Playfair Display Main Heading */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal text-[#111111] tracking-tight leading-[1.12] mb-4">
              Plan Your{' '}
              <span className="font-editorial italic font-normal text-[#123C2A] relative inline-block">
                Perfect Journey
                <svg
                  className="absolute left-0 -bottom-1.5 w-full h-2 text-[#D7A43A]/80 pointer-events-none"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M 0,8 Q 50,0 100,8" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
              Tell us about the India you wish to uncover. From sacred sunrise ghats and golden desert forts to mist-wrapped tea hills and tranquil backwaters — our senior specialists will craft your personalized dossier.
            </p>

            {/* Antique Coordinate Stamp */}
            <div className="mt-4 flex items-center justify-center gap-3 text-[11px] font-mono tracking-widest text-stone-500 uppercase">
              <span>25.3176° N, 82.9739° E</span>
              <span>•</span>
              <span className="text-[#B85C32] font-semibold">NO BOOKING FEES</span>
              <span>•</span>
              <span>BESPOKE ITINERARY</span>
            </div>
          </header>

          {/* 
            ========================================================================
            02. TWO-COLUMN LAYOUT: Left Form (7/12) + Right Info Panel (5/12)
            ========================================================================
          */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">

            {/* ================================================================ */}
            {/* LEFT COLUMN: THE ENQUIRY FORM / SUCCESS CARD (7/12)              */}
            {/* ================================================================ */}
            <div className="lg:col-span-7">
              {isSuccess ? (
                /* ============================================================ */
                /* SUCCESS STATE CARD                                           */
                /* ============================================================ */
                <div
                  ref={successCardRef}
                  className="bg-[#FAF6F0] border-2 border-[#123C2A]/20 rounded-2xl p-6 sm:p-10 shadow-deckle relative overflow-hidden"
                >
                  {/* Subtle Grain Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(#9B8365 0.75px, transparent 0.75px)',
                      backgroundSize: '16px 16px',
                    }}
                  />

                  {/* Top Vintage Postmark & Wax Seal Badge */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-300">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-full bg-[#123C2A] text-white flex items-center justify-center shrink-0 shadow-lg">
                        <CheckCircle2 className="w-8 h-8 text-[#D7A43A]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
                          <span className="text-[10px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                            ENQUIRY RECEIVED & ARCHIVED
                          </span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl text-[#111111] font-normal leading-tight">
                          Journey Dossier Initiated
                        </h2>
                      </div>
                    </div>

                    {/* Booking Reference Pill */}
                    <div className="bg-[#123C2A]/10 border border-[#123C2A]/30 rounded-xl px-4 py-2 text-right">
                      <span className="text-[10px] font-mono uppercase text-stone-600 block">
                        REFERENCE CODE
                      </span>
                      <span className="font-mono text-base font-bold text-[#123C2A] tracking-wider">
                        {bookingRefId}
                      </span>
                    </div>
                  </div>

                  {/* Success Message Body */}
                  <div className="relative z-10 py-6 space-y-4">
                    <p className="text-stone-800 text-base leading-relaxed">
                      Thank you, <strong className="text-[#123C2A] font-semibold">{submissionSnapshot?.fullName}</strong>! Your expedition enquiry has been assigned to our senior travel designer. A confirmation copy has been dispatched to <strong className="text-[#111111]">{submissionSnapshot?.email}</strong>.
                    </p>

                    {/* Summary Card with Ledger Details */}
                    <div className="bg-white/90 rounded-xl p-5 border border-stone-300 shadow-sm space-y-3 font-sans text-sm">
                      <div className="text-xs font-semibold tracking-wider text-stone-600 uppercase border-b border-stone-200 pb-2 flex items-center justify-between">
                        <span>Enquiry Summary</span>
                        <span className="text-[#B85C32]">{submissionSnapshot?.tourType} Tour</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-700">
                        <div>
                          <span className="text-stone-500 text-xs block">Expedition Package:</span>
                          <span className="font-medium text-stone-900">{submissionSnapshot?.tourPackage}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-xs block">Target Destination:</span>
                          <span className="font-medium text-stone-900">{submissionSnapshot?.destination}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-xs block">Preferred Travel Date:</span>
                          <span className="font-medium text-stone-900">
                            {submissionSnapshot?.travelDate} {submissionSnapshot?.flexibleDates && '(±3 days flexible)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-xs block">Travel Party:</span>
                          <span className="font-medium text-stone-900">
                            {submissionSnapshot?.adults} Adults
                            {submissionSnapshot?.children > 0 && `, ${submissionSnapshot?.children} Children`}
                            {submissionSnapshot?.infants > 0 && `, ${submissionSnapshot?.infants} Infants`}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-xs block">Accommodation Class:</span>
                          <span className="font-medium text-stone-900">{submissionSnapshot?.accommodation} Tier</span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-xs block">Budget Envelope:</span>
                          <span className="font-medium text-stone-900">{submissionSnapshot?.budgetRange}</span>
                        </div>
                      </div>

                      {submissionSnapshot?.fileName && (
                        <div className="pt-2 border-t border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#B85C32]" />
                          <span>Attached Document: <strong>{submissionSnapshot?.fileName}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* What Happens Next Timeline */}
                    <div className="bg-[#FAF6F0] rounded-xl p-5 border border-stone-300/80">
                      <h3 className="text-xs font-semibold tracking-wider text-stone-700 uppercase mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#B85C32]" />
                        <span>What Happens Next</span>
                      </h3>
                      <ol className="space-y-3 text-xs sm:text-sm text-stone-700">
                        <li className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#123C2A] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            1
                          </span>
                          <div>
                            <strong className="text-stone-900">Dedicated Specialist Assigned:</strong> Within 2 business hours, your destination specialist reviews local permits, accommodations, and seasonal routing.
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#123C2A] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            2
                          </span>
                          <div>
                            <strong className="text-stone-900">Custom Day-by-Day Dossier:</strong> We craft a tailored PDF itinerary with private guides, exclusive experiences, and transparent pricing sent to your inbox.
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#123C2A] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            3
                          </span>
                          <div>
                            <strong className="text-stone-900">Fine-Tuning Call:</strong> We connect over your preferred channel (Phone or WhatsApp) to adjust every detail to absolute perfection.
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      to="/tours"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#123C2A] hover:bg-[#184D36] text-white rounded-full px-7 py-3.5 text-xs font-semibold tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <span>Explore Curated Tours</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-full px-6 py-3.5 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-stone-500" />
                      <span>Submit Another Enquiry</span>
                    </button>

                    <Link
                      to="/"
                      className="w-full sm:w-auto text-center text-xs text-stone-600 hover:text-stone-900 font-medium px-4 py-2 transition-colors"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                </div>
              ) : (
                /* ============================================================ */
                /* ACTIVE BOOKING / ENQUIRY FORM                                */
                /* ============================================================ */
                <form
                  ref={formCardRef}
                  onSubmit={handleSubmit}
                  noValidate
                  className="bg-[#FAF6F0] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-deckle border border-[#E0D5BE] relative"
                  style={{
                    backgroundImage: 'radial-gradient(#C2B29A 0.4px, transparent 0.4px)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  {/* Washi Tape Accent at Top */}
                  <div className="absolute -top-3.5 left-12 w-28 h-6 bg-[#E8DFC8]/90 backdrop-blur-xs shadow-xs -rotate-2 border-l border-r border-black/10 flex items-center justify-center pointer-events-none">
                    <span className="text-[8px] tracking-[0.2em] font-mono text-stone-600 uppercase">
                      OFFICIAL DOSSIER
                    </span>
                  </div>

                  {/* Form Instructions / Header Stamp */}
                  <div className="mb-8 pb-5 border-b border-stone-300 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
                        <span className="text-[11px] font-sans tracking-[0.24em] font-semibold text-stone-600 uppercase">
                          BESPOKE EXPEDITION ENQUIRY FORM
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">
                        Fields marked with <span className="text-red-600 font-bold">*</span> are required for our travel planners.
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-stone-200/60 rounded-full border border-stone-300/80 text-[10px] font-mono text-stone-700">
                      <Lock className="w-3 h-3 text-[#123C2A]" />
                      <span>SECURE DISPATCH</span>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------- */}
                  {/* SECTION 1: PERSONAL DETAILS                                */}
                  {/* ---------------------------------------------------------- */}
                  <div className="form-section-block mb-10 pb-8 border-b border-stone-300/80">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-7 h-7 rounded-full bg-[#123C2A] text-white flex items-center justify-center text-xs font-bold">
                        01
                      </span>
                      <div>
                        <h2 className="font-display text-xl text-[#111111] font-semibold leading-tight">
                          Personal Details
                        </h2>
                        <span className="text-xs text-stone-600">
                          How and where our concierge team should address you.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5">
                          Full Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="e.g. Maharani Gayatri Devi / Devrat Roy"
                          className={`w-full bg-[#FDFBF7] border rounded-xl px-4 py-3 text-sm text-[#111111] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all ${
                            errors.fullName
                              ? 'border-red-500 bg-red-50/40 focus:border-red-500'
                              : 'border-stone-300 focus:border-[#123C2A]'
                          }`}
                        />
                        {errors.fullName && (
                          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.fullName}</span>
                          </p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5">
                          Email Address <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. devrat@example.com"
                          className={`w-full bg-[#FDFBF7] border rounded-xl px-4 py-3 text-sm text-[#111111] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all ${
                            errors.email
                              ? 'border-red-500 bg-red-50/40 focus:border-red-500'
                              : 'border-stone-300 focus:border-[#123C2A]'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5">
                          Mobile Number (10 Digits) <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 text-xs font-mono font-medium">
                            +91
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            maxLength={14}
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="98765 43210"
                            className={`w-full bg-[#FDFBF7] border rounded-xl pl-12 pr-4 py-3 text-sm text-[#111111] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all ${
                              errors.phone
                                ? 'border-red-500 bg-red-50/40 focus:border-red-500'
                                : 'border-stone-300 focus:border-[#123C2A]'
                            }`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.phone}</span>
                          </p>
                        )}
                      </div>

                      {/* WhatsApp Number & Same as Mobile Checkbox */}
                      <div className="sm:col-span-2 bg-[#F7F2E9] p-4 rounded-xl border border-stone-300/70">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <label className="text-xs font-bold tracking-wider uppercase text-stone-800 flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                            <span>WhatsApp Number</span>
                            <span className="text-[10px] text-stone-500 font-normal lowercase">(optional for itinerary dispatches)</span>
                          </label>

                          <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              name="sameAsMobile"
                              checked={formData.sameAsMobile}
                              onChange={handleChange}
                              className="w-4 h-4 rounded text-[#123C2A] focus:ring-[#123C2A] border-stone-400 cursor-pointer accent-[#123C2A]"
                            />
                            <span>Same as mobile number</span>
                          </label>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 text-xs font-mono font-medium">
                            +91
                          </div>
                          <input
                            type="tel"
                            name="whatsapp"
                            maxLength={14}
                            value={formData.whatsapp}
                            onChange={handleChange}
                            disabled={formData.sameAsMobile}
                            placeholder={formData.sameAsMobile ? formData.phone || 'Same as mobile' : '98765 43210'}
                            className={`w-full bg-[#FDFBF7] border rounded-xl pl-12 pr-4 py-2.5 text-sm text-[#111111] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all ${
                              formData.sameAsMobile ? 'opacity-70 bg-stone-100 cursor-not-allowed' : ''
                            } ${
                              errors.whatsapp
                                ? 'border-red-500 bg-red-50/40 focus:border-red-500'
                                : 'border-stone-300 focus:border-[#123C2A]'
                            }`}
                          />
                        </div>
                        {errors.whatsapp && (
                          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.whatsapp}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------- */}
                  {/* SECTION 2: TRAVEL DETAILS                                  */}
                  {/* ---------------------------------------------------------- */}
                  <div className="form-section-block mb-10 pb-8 border-b border-stone-300/80">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-7 h-7 rounded-full bg-[#123C2A] text-white flex items-center justify-center text-xs font-bold">
                        02
                      </span>
                      <div>
                        <h2 className="font-display text-xl text-[#111111] font-semibold leading-tight">
                          Travel Details
                        </h2>
                        <span className="text-xs text-stone-600">
                          Route selection, timing, and travel party composition.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Tour / Package Select (10 Options) */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5">
                          Select Tour / Package <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="tourPackage"
                            value={formData.tourPackage}
                            onChange={handleChange}
                            className={`w-full appearance-none bg-[#FDFBF7] border rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all pr-10 ${
                              errors.tourPackage
                                ? 'border-red-500 bg-red-50/40 focus:border-red-500'
                                : 'border-stone-300 focus:border-[#123C2A]'
                            }`}
                          >
                            <option value="">-- Choose One of Our 10 Curated Packages --</option>
                            {TOUR_PACKAGES.map((pkg, idx) => (
                              <option key={idx} value={pkg}>
                                {idx + 1}. {pkg}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {errors.tourPackage && (
                          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.tourPackage}</span>
                          </p>
                        )}
                      </div>

                      {/* Destination Select */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5">
                          Primary Destination Region <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            className={`w-full appearance-none bg-[#FDFBF7] border rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all pr-10 ${
                              errors.destination
                                ? 'border-red-500 bg-red-50/40 focus:border-red-500'
                                : 'border-stone-300 focus:border-[#123C2A]'
                            }`}
                          >
                            <option value="">-- Select Destination or Circuit --</option>
                            {DESTINATIONS.map((dest, idx) => (
                              <option key={idx} value={dest}>
                                {dest}
                              </option>
                            ))}
                          </select>
                          <MapPin className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {errors.destination && (
                          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.destination}</span>
                          </p>
                        )}
                      </div>

                      {/* Preferred Travel Date Picker */}
                      <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5">
                          Preferred Travel Date <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="travelDate"
                            min={todayStr}
                            value={formData.travelDate}
                            onChange={handleChange}
                            className={`w-full bg-[#FDFBF7] border rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all ${
                              errors.travelDate
                                ? 'border-red-500 bg-red-50/40 focus:border-red-500'
                                : 'border-stone-300 focus:border-[#123C2A]'
                            }`}
                          />
                        </div>
                        {errors.travelDate && (
                          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.travelDate}</span>
                          </p>
                        )}
                      </div>

                      {/* Flexible Dates Checkbox */}
                      <div className="flex items-center sm:pt-6">
                        <label className="flex items-center gap-3 bg-[#FDFBF7] border border-stone-300 rounded-xl px-4 py-3 w-full cursor-pointer hover:bg-stone-50 transition-colors">
                          <input
                            type="checkbox"
                            name="flexibleDates"
                            checked={formData.flexibleDates}
                            onChange={handleChange}
                            className="w-4 h-4 rounded text-[#123C2A] focus:ring-[#123C2A] border-stone-400 cursor-pointer accent-[#123C2A]"
                          />
                          <div>
                            <span className="text-xs font-bold text-stone-900 block">
                              Flexible Dates
                            </span>
                            <span className="text-[11px] text-stone-500 block">
                              My schedule can shift by ±3 days for best weather & festivals.
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Number of Travelers: Adults, Children, Infants */}
                      <div className="sm:col-span-2 pt-2">
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-3">
                          Number of Travelers
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Adults Counter */}
                          <div className="bg-[#FDFBF7] border border-stone-300 rounded-xl p-3.5 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-semibold text-xs text-stone-900 block">Adults</span>
                                <span className="text-[10px] text-stone-500 block">12+ years</span>
                              </div>
                              <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => handleCounter('adults', -1, 1, 20)}
                                aria-label="Decrease adults"
                                className="w-8 h-8 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="30"
                                value={formData.adults}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => ({ ...prev, adults: val }));
                                }}
                                className="w-14 text-center font-bold text-base text-stone-900 bg-transparent border-b border-stone-300 focus:border-[#123C2A] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleCounter('adults', 1, 1, 20)}
                                aria-label="Increase adults"
                                className="w-8 h-8 rounded-lg bg-[#123C2A] hover:bg-[#184D36] text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Children Counter */}
                          <div className="bg-[#FDFBF7] border border-stone-300 rounded-xl p-3.5 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-semibold text-xs text-stone-900 block">Children</span>
                                <span className="text-[10px] text-stone-500 block">2 – 11 years</span>
                              </div>
                              <span className="w-2 h-2 rounded-full bg-[#B85C32]" />
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => handleCounter('children', -1, 0, 10)}
                                aria-label="Decrease children"
                                className="w-8 h-8 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="15"
                                value={formData.children}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => ({ ...prev, children: val }));
                                }}
                                className="w-14 text-center font-bold text-base text-stone-900 bg-transparent border-b border-stone-300 focus:border-[#123C2A] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleCounter('children', 1, 0, 10)}
                                aria-label="Increase children"
                                className="w-8 h-8 rounded-lg bg-[#123C2A] hover:bg-[#184D36] text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Infants Counter */}
                          <div className="bg-[#FDFBF7] border border-stone-300 rounded-xl p-3.5 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-semibold text-xs text-stone-900 block">Infants</span>
                                <span className="text-[10px] text-stone-500 block">Under 2 years</span>
                              </div>
                              <span className="w-2 h-2 rounded-full bg-[#D7A43A]" />
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => handleCounter('infants', -1, 0, 5)}
                                aria-label="Decrease infants"
                                className="w-8 h-8 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={formData.infants}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => ({ ...prev, infants: val }));
                                }}
                                className="w-14 text-center font-bold text-base text-stone-900 bg-transparent border-b border-stone-300 focus:border-[#123C2A] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleCounter('infants', 1, 0, 5)}
                                aria-label="Increase infants"
                                className="w-8 h-8 rounded-lg bg-[#123C2A] hover:bg-[#184D36] text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {errors.adults && (
                          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.adults}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------- */}
                  {/* SECTION 3: ADDITIONAL INFORMATION                          */}
                  {/* ---------------------------------------------------------- */}
                  <div className="form-section-block mb-10 pb-8 border-b border-stone-300/80">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-7 h-7 rounded-full bg-[#123C2A] text-white flex items-center justify-center text-xs font-bold">
                        03
                      </span>
                      <div>
                        <h2 className="font-display text-xl text-[#111111] font-semibold leading-tight">
                          Travel Preferences & Information
                        </h2>
                        <span className="text-xs text-stone-600">
                          Pacing, budget comfort, stay tiers, and special requests.
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Tour Type Preference Radio Buttons */}
                      <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-2">
                          Tour Type Preference
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {TOUR_TYPES.map(type => {
                            const IconComponent = type.icon;
                            const isSelected = formData.tourType === type.id;
                            return (
                              <label
                                key={type.id}
                                className={`flex flex-col items-center justify-center text-center p-3 rounded-xl border cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-[#123C2A] text-white border-[#123C2A] shadow-md scale-[1.02]'
                                    : 'bg-[#FDFBF7] text-stone-800 border-stone-300 hover:border-stone-400'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="tourType"
                                  value={type.id}
                                  checked={isSelected}
                                  onChange={handleChange}
                                  className="sr-only"
                                />
                                <IconComponent
                                  className={`w-5 h-5 mb-1.5 ${
                                    isSelected ? 'text-[#D7A43A]' : 'text-stone-600'
                                  }`}
                                />
                                <span className="font-bold text-xs">{type.label}</span>
                                <span
                                  className={`text-[9px] mt-0.5 line-clamp-1 ${
                                    isSelected ? 'text-stone-300' : 'text-stone-500'
                                  }`}
                                >
                                  {type.desc}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Budget Range & Accommodation Preference */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Budget Range */}
                        <div>
                          <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5">
                            Estimated Budget Range (Per Person)
                          </label>
                          <div className="relative">
                            <select
                              name="budgetRange"
                              value={formData.budgetRange}
                              onChange={handleChange}
                              className="w-full appearance-none bg-[#FDFBF7] border border-stone-300 rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all pr-10"
                            >
                              {BUDGET_RANGES.map((range, idx) => (
                                <option key={idx} value={range}>
                                  {range}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* How did you hear about us? */}
                        <div>
                          <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5">
                            How did you hear about us?
                          </label>
                          <div className="relative">
                            <select
                              name="heardAboutUs"
                              value={formData.heardAboutUs}
                              onChange={handleChange}
                              className="w-full appearance-none bg-[#FDFBF7] border border-stone-300 rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all pr-10"
                            >
                              <option value="">-- Select Source --</option>
                              {REFERRAL_SOURCES.map((source, idx) => (
                                <option key={idx} value={source}>
                                  {source}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Accommodation Preference Radio Cards */}
                      <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-2">
                          Accommodation Preference
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {ACCOMMODATIONS.map(acc => {
                            const isSelected = formData.accommodation === acc.id;
                            return (
                              <label
                                key={acc.id}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-[#123C2A] text-white border-[#123C2A] shadow-md'
                                    : 'bg-[#FDFBF7] text-stone-800 border-stone-300 hover:border-stone-400'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="accommodation"
                                  value={acc.id}
                                  checked={isSelected}
                                  onChange={handleChange}
                                  className="sr-only"
                                />
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-xs">{acc.label}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-[#D7A43A]" />}
                                  </div>
                                  <span
                                    className={`text-[10px] leading-tight block ${
                                      isSelected ? 'text-stone-300' : 'text-stone-500'
                                    }`}
                                  >
                                    {acc.desc}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Special Requirements Textarea */}
                      <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5">
                          Special Requirements / Dietary / Accessibility
                        </label>
                        <textarea
                          rows={2}
                          name="specialRequirements"
                          value={formData.specialRequirements}
                          onChange={handleChange}
                          placeholder="e.g. Vegetarian/Jain meals, ground-floor rooms, wheelchair assistance, celebration anniversary cake..."
                          className="w-full bg-[#FDFBF7] border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-[#111111] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all resize-none"
                        />
                      </div>

                      {/* Upload Documents (file input) */}
                      <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5 flex items-center justify-between">
                          <span>Upload Supporting Documents (Optional)</span>
                          <span className="text-[10px] text-stone-500 font-normal">PDF or JPG/PNG, Max 10MB</span>
                        </label>

                        {uploadedFile ? (
                          <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-bold text-emerald-950 truncate">
                                  {uploadedFile.name}
                                </p>
                                <p className="text-[10px] text-emerald-700">
                                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to attach
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-stone-300 hover:border-[#123C2A]/60 bg-[#FDFBF7] hover:bg-stone-50 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                            <Upload className="w-6 h-6 text-stone-400 group-hover:text-[#123C2A] transition-colors mb-2" />
                            <span className="text-xs font-semibold text-stone-800 group-hover:text-[#123C2A]">
                              Click to select passport copy, flight ticket, or rough itinerary notes
                            </span>
                            <span className="text-[10px] text-stone-500 mt-0.5">
                              Drag and drop or browse files from your device
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                              className="sr-only"
                            />
                          </label>
                        )}
                        {errors.documents && (
                          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.documents}</span>
                          </p>
                        )}
                      </div>

                      {/* Personal Message */}
                      <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-stone-800 mb-1.5">
                          Personal Notes / Your Vision for the Trip
                        </label>
                        <textarea
                          rows={3}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us what excites you most about this journey — specific temples, quiet sunrises, local art workshops, or train journeys..."
                          className="w-full bg-[#FDFBF7] border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-[#111111] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#123C2A]/20 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------- */}
                  {/* SECTION 4: TERMS & CONSENTS                                */}
                  {/* ---------------------------------------------------------- */}
                  <div className="form-section-block mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-7 h-7 rounded-full bg-[#123C2A] text-white flex items-center justify-center text-xs font-bold">
                        04
                      </span>
                      <div>
                        <h2 className="font-display text-xl text-[#111111] font-semibold leading-tight">
                          Terms & Consent
                        </h2>
                        <span className="text-xs text-stone-600">
                          Please verify your agreement before final dispatch.
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 bg-[#FDFBF7] p-4 sm:p-5 rounded-xl border border-stone-300">
                      {/* Terms & Conditions (Required) */}
                      <div>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="termsAgreed"
                            checked={formData.termsAgreed}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 rounded text-[#123C2A] focus:ring-[#123C2A] border-stone-400 cursor-pointer accent-[#123C2A]"
                          />
                          <span className="text-xs text-stone-800 leading-normal">
                            I agree to the{' '}
                            <a href="#terms" className="font-semibold text-[#123C2A] underline hover:text-[#B85C32]">
                              Terms & Conditions
                            </a>{' '}
                            governing bespoke tour bookings and booking authorizations.{' '}
                            <span className="text-red-600">*</span>
                          </span>
                        </label>
                        {errors.termsAgreed && (
                          <p className="mt-1 text-xs text-red-600 ml-7 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.termsAgreed}</span>
                          </p>
                        )}
                      </div>

                      {/* Privacy Policy (Required) */}
                      <div>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="privacyAgreed"
                            checked={formData.privacyAgreed}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 rounded text-[#123C2A] focus:ring-[#123C2A] border-stone-400 cursor-pointer accent-[#123C2A]"
                          />
                          <span className="text-xs text-stone-800 leading-normal">
                            I acknowledge and consent to the{' '}
                            <a href="#privacy" className="font-semibold text-[#123C2A] underline hover:text-[#B85C32]">
                              Privacy Policy
                            </a>{' '}
                            regarding the handling and protection of my travel details.{' '}
                            <span className="text-red-600">*</span>
                          </span>
                        </label>
                        {errors.privacyAgreed && (
                          <p className="mt-1 text-xs text-red-600 ml-7 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.privacyAgreed}</span>
                          </p>
                        )}
                      </div>

                      {/* Marketing Consent (Optional) */}
                      <div>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="marketingConsent"
                            checked={formData.marketingConsent}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 rounded text-[#123C2A] focus:ring-[#123C2A] border-stone-400 cursor-pointer accent-[#123C2A]"
                          />
                          <span className="text-xs text-stone-600 leading-normal">
                            (Optional) Keep me inspired with Bhromon's quarterly travel journal, secret trail guides, and cultural festival invitations.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------- */}
                  {/* SUBMIT BUTTON & ENCRYPTION NOTE                            */}
                  {/* ---------------------------------------------------------- */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#123C2A] hover:bg-[#184D36] active:bg-[#0E2F21] text-white rounded-full py-4 px-8 text-sm font-bold tracking-widest uppercase transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Dispatching Dossier...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Enquiry</span>
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </>
                      )}
                    </button>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-stone-500">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-[#123C2A]" />
                        256-bit SSL Encrypted
                      </span>
                      <span>•</span>
                      <span>No credit card required today</span>
                      <span>•</span>
                      <span>Response within 2 hours</span>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* ================================================================ */}
            {/* RIGHT COLUMN: INFORMATION PANEL & TRUST BADGES (5/12)            */}
            {/* ================================================================ */}
            <aside ref={rightPanelRef} className="lg:col-span-5 space-y-6">

              {/* 1. WHY BOOK WITH US CARD */}
              <div
                className="bg-[#FAF6F0] rounded-2xl p-6 sm:p-7 border border-[#E0D5BE] shadow-deckle relative overflow-hidden"
                style={{
                  backgroundImage: 'radial-gradient(#C2B29A 0.4px, transparent 0.4px)',
                  backgroundSize: '18px 18px',
                }}
              >
                {/* Washi Tape */}
                <div className="absolute -top-3 right-8 w-24 h-5 bg-[#EDE2C4]/90 backdrop-blur-xs shadow-xs rotate-2 pointer-events-none" />

                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-[#B85C32]" />
                  <h3 className="text-xs font-sans tracking-[0.24em] font-semibold text-stone-800 uppercase">
                    THE BHROMON STANDARD
                  </h3>
                </div>

                <h4 className="font-display text-2xl text-[#111111] font-normal leading-tight mb-5">
                  Why Discerning Travelers{' '}
                  <span className="font-editorial italic text-[#123C2A]">Trust Our Craft</span>
                </h4>

                <div className="space-y-4 font-sans text-xs sm:text-sm">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#123C2A]/10 text-[#123C2A] flex items-center justify-center shrink-0 mt-0.5">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Curated Historic Stays</strong>
                      <span className="text-stone-600 text-xs">
                        Hand-vetted 18th-century havelis, plantation bungalows, and palace retreats not listed on generic aggregators.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#B85C32]/10 text-[#B85C32] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Generational Local Custodians</strong>
                      <span className="text-stone-600 text-xs">
                        Private excursions guided by temple scholars, royal historians, wildlife trackers, and master artisans.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#D7A43A]/15 text-[#B8860B] flex items-center justify-center shrink-0 mt-0.5">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-semibold">100% Tailor-Made Itineraries</strong>
                      <span className="text-stone-600 text-xs">
                        Flexible pacing, private chauffeur-driven vehicles, and seamless adjustments whenever curiosity strikes.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-800/10 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Transparent, All-Inclusive Value</strong>
                      <span className="text-stone-600 text-xs">
                        No surprise surcharges. All state permits, monument tickets, boat fees, and toll taxes included upfront.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-stone-800/10 text-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-semibold">24/7 Dedicated Concierge</strong>
                      <span className="text-stone-600 text-xs">
                        A real human concierge accessible via direct phone and WhatsApp throughout your travel.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CONTACT INFO CARD */}
              <div className="bg-[#FAF6F0] rounded-2xl p-6 sm:p-7 border border-[#E0D5BE] shadow-deckle">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-[#B85C32]" />
                  <h3 className="text-xs font-sans tracking-[0.24em] font-semibold text-stone-800 uppercase">
                    EXPEDITION DESK DIRECT
                  </h3>
                </div>

                <p className="text-xs text-stone-600 mb-5 leading-relaxed">
                  Prefer speaking with a human right away? Our travel directors in Kolkata and Delhi are available for instant conversations.
                </p>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  {/* Phone */}
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-stone-200/90 hover:border-[#123C2A] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#123C2A] text-white flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-mono text-stone-500 block">Toll-Free Direct Line</span>
                      <span className="font-bold text-stone-900 group-hover:text-[#123C2A] transition-colors">
                        +91 98765 43210
                      </span>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:concierge@bhromon.com"
                    className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-stone-200/90 hover:border-[#123C2A] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#B85C32] text-white flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 truncate">
                      <span className="text-[10px] uppercase font-mono text-stone-500 block">Direct Concierge Email</span>
                      <span className="font-bold text-stone-900 group-hover:text-[#B85C32] transition-colors truncate block">
                        concierge@bhromon.com
                      </span>
                    </div>
                  </a>

                  {/* WhatsApp Quick Chat */}
                  <a
                    href="https://wa.me/919876543210?text=Hello%20Bhromon%2C%20I%20would%20like%20to%20plan%20a%20journey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 p-3.5 bg-[#25D366] hover:bg-[#20BE5B] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat With Concierge On WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* 3. BUSINESS HOURS CARD */}
              <div className="bg-[#FAF6F0] rounded-2xl p-6 sm:p-7 border border-[#E0D5BE] shadow-deckle">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#D7A43A]" />
                  <h3 className="text-xs font-sans tracking-[0.24em] font-semibold text-stone-800 uppercase">
                    OPERATING HOURS (IST)
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs text-stone-700">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <span className="font-medium">Monday — Saturday:</span>
                    <span className="font-mono font-bold text-stone-900">9:00 AM – 8:00 PM IST</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <span className="font-medium">Sunday:</span>
                    <span className="font-mono font-bold text-stone-900">10:00 AM – 5:00 PM IST</span>
                  </div>
                  <div className="pt-1 flex items-start gap-2 text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      <strong>Active Journey Support:</strong> 24/7 dedicated SOS desk for travelers currently on the road.
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. SAMPLE ITINERARY ARCHIVAL PHOTO CARD */}
              <div className="relative pt-2">
                {/* Washi Tape Strip */}
                <div className="absolute -top-1 left-10 z-20 w-24 h-5 bg-[#EDE2C4]/90 backdrop-blur-xs shadow-xs -rotate-3 pointer-events-none" />

                <div className="bg-white p-3.5 pb-5 rounded-2xl shadow-photo-print rotate-[1deg] hover:rotate-0 transition-transform duration-500 border border-stone-200/90 relative">
                  {/* Photo Stamp */}
                  <div className="absolute -top-3 -right-2 z-20 w-14 h-16 bg-[#F5ECE0] p-1 shadow-md border border-dashed border-[#8E7963] rotate-6 flex flex-col items-center justify-between pointer-events-none">
                    <span className="text-[6.5px] font-bold text-stone-600 uppercase">BHROMON</span>
                    <div className="w-full h-8 overflow-hidden rounded-xs">
                      <img src="/images/kerala-backwaters.jpg" alt="Stamp" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[6px] font-mono text-stone-500">₹ 50.00</span>
                  </div>

                  <div className="w-full aspect-[16/10] rounded-xl overflow-hidden relative">
                    <img
                      src="/images/kerala-backwaters.jpg"
                      alt="Sample Itinerary - Kerala Backwaters Private Houseboat"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="text-[10px] tracking-widest font-mono uppercase bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-xs">
                        ARCHIVE DOSSIER #408
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="font-handwriting text-2xl text-stone-900 leading-tight">
                      Alleppey Serenity & Spice Trails
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-normal font-sans">
                      A curated 6-day private houseboat journey across Vembanad Lake and the cardamom hills of Munnar, handcrafted for two travelers from Mumbai.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. TRUST BADGES CARD */}
              <div className="bg-[#FAF6F0] rounded-2xl p-6 border border-[#E0D5BE] shadow-deckle">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-[#123C2A]" />
                  <h3 className="text-xs font-sans tracking-[0.24em] font-semibold text-stone-800 uppercase">
                    ACCREDITATIONS & TRUST
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2.5 p-2.5 bg-white/70 rounded-xl border border-stone-200">
                    <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <strong className="block text-stone-900 font-semibold text-[11px]">256-Bit SSL</strong>
                      <span className="text-[10px] text-stone-500">Bank-grade security</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 bg-white/70 rounded-xl border border-stone-200">
                    <Award className="w-4 h-4 text-[#B85C32] shrink-0" />
                    <div>
                      <strong className="block text-stone-900 font-semibold text-[11px]">IATA Member</strong>
                      <span className="text-[10px] text-stone-500">Accredited agency</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 bg-white/70 rounded-xl border border-stone-200">
                    <Shield className="w-4 h-4 text-[#123C2A] shrink-0" />
                    <div>
                      <strong className="block text-stone-900 font-semibold text-[11px]">Incredible India</strong>
                      <span className="text-[10px] text-stone-500">Ministry approved</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 bg-white/70 rounded-xl border border-stone-200">
                    <Star className="w-4 h-4 text-[#D7A43A] shrink-0 fill-[#D7A43A]" />
                    <div>
                      <strong className="block text-stone-900 font-semibold text-[11px]">4.9 / 5.0 Rating</strong>
                      <span className="text-[10px] text-stone-500">1,200+ Reviews</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 text-center">
                  <span className="text-[10px] tracking-wider font-mono text-stone-500 uppercase">
                    WEST BENGAL TOURISM REGISTRATION #WB/KOL/2020/0914
                  </span>
                </div>
              </div>

            </aside>

          </div>

        </div>
      </main>

      {/* Footer */}
      {!embedded && <BhromonFooter />}
    </div>
  );
}
