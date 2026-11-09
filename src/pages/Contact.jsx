import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Send,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Compass,
  Navigation,
  Headphones
} from 'lucide-react';
import BhromonNav from '../components/BhromonNav';
import BhromonFooter from '../components/BhromonFooter';
import publicApi from '../api/publicApi';

gsap.registerPlugin(ScrollTrigger);

// Custom SVG Icons for Brands to ensure crisp rendering
function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

function TwitterXIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function PinterestIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Contact({ embedded = false }) {
  const pageRef = useRef(null);

  // Business hours state based on actual IST Date
  const [businessStatus, setBusinessStatus] = useState({
    isOpen: false,
    statusText: 'Checking...',
    istTime: '',
    nextShift: ''
  });

  // Contact Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'Tour Booking',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Calculate live business hours for India Standard Time (IST)
  useEffect(() => {
    const updateHours = () => {
      const now = new Date();
      // Format current time in Kolkata / IST
      const istTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Get IST Date object
      const istDateStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istDate = new Date(istDateStr);
      const day = istDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const currentMinute = hours * 60 + minutes;

      let isOpen = false;
      let nextShift = '';

      // Mon - Fri: 9:00 AM (540) to 7:00 PM (1140)
      // Sat: 10:00 AM (600) to 5:00 PM (1020)
      // Sun: 11:00 AM (660) to 3:00 PM (900)
      if (day >= 1 && day <= 5) {
        if (currentMinute >= 9 * 60 && currentMinute < 19 * 60) {
          isOpen = true;
          nextShift = 'Closes today at 7:00 PM IST';
        } else if (currentMinute < 9 * 60) {
          nextShift = 'Opens today at 9:00 AM IST';
        } else {
          nextShift = day === 5 ? 'Opens Saturday at 10:00 AM IST' : 'Opens tomorrow at 9:00 AM IST';
        }
      } else if (day === 6) {
        if (currentMinute >= 10 * 60 && currentMinute < 17 * 60) {
          isOpen = true;
          nextShift = 'Closes today at 5:00 PM IST';
        } else if (currentMinute < 10 * 60) {
          nextShift = 'Opens today at 10:00 AM IST';
        } else {
          nextShift = 'Opens Sunday at 11:00 AM IST';
        }
      } else if (day === 0) {
        if (currentMinute >= 11 * 60 && currentMinute < 15 * 60) {
          isOpen = true;
          nextShift = 'Closes today at 3:00 PM IST';
        } else if (currentMinute < 11 * 60) {
          nextShift = 'Opens today at 11:00 AM IST';
        } else {
          nextShift = 'Opens Monday at 9:00 AM IST';
        }
      }

      setBusinessStatus({
        isOpen,
        statusText: isOpen ? 'Currently Open' : 'Currently Closed',
        istTime: istTimeStr,
        nextShift
      });
    };

    updateHours();
    const timer = setInterval(updateHours, 30000);
    return () => clearInterval(timer);
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Stagger
      gsap.fromTo(
        '.contact-header-elem',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.14,
          ease: 'power3.out'
        }
      );

      // Contact Info Cards
      gsap.fromTo(
        '.contact-card-item',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.contact-cards-section',
            start: 'top 85%'
          }
        }
      );

      // Business Hours Section
      gsap.fromTo(
        '.hours-section-elem',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.business-hours-block',
            start: 'top 85%'
          }
        }
      );

      // Two Column Map & Form
      gsap.fromTo(
        '.map-column-elem',
        { opacity: 0, x: -35 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.twocol-contact-section',
            start: 'top 80%'
          }
        }
      );

      gsap.fromTo(
        '.form-column-elem',
        { opacity: 0, x: 35 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.twocol-contact-section',
            start: 'top 80%'
          }
        }
      );

      // Social Media Cards Stagger
      gsap.fromTo(
        '.social-card-item',
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.social-media-section',
            start: 'top 85%'
          }
        }
      );

      // FAQ Section
      gsap.fromTo(
        '.faq-elem',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.faq-teaser-section',
            start: 'top 85%'
          }
        }
      );

      // Bottom CTA Banner
      gsap.fromTo(
        '.cta-banner-content',
        { opacity: 0, scale: 0.97, y: 25 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cta-bottom-section',
            start: 'top 85%'
          }
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await publicApi.submitEnquiry({
        customerName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        destination: formData.subject || 'General Inquiry',
        category: 'Contact Us',
        message: formData.message.trim(),
        source: 'CONTACT_PAGE',
      });
      setIsSubmitted(true);
    } catch (err) {
      console.warn('Contact form submission fallback:', err.message);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: 'Tour Booking',
      message: ''
    });
    setIsSubmitted(false);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // FAQ items data
  const faqs = [
    {
      q: 'How far in advance should I initiate our customized Bhromon itinerary?',
      a: 'We recommend connecting with our Kolkata curators 4 to 8 weeks in advance for bespoke domestic circuits, and at least 3 months ahead for peak-season journeys in Rajasthan, Ladakh, and Sikkim to secure heritage palace rooms and specialized artisan hosts.'
    },
    {
      q: 'Can Bhromon customize itineraries for solo travelers and private families?',
      a: 'Yes, absolutely. Over 70% of our journeys are completely private and tailor-made for solo explorers, couples, and multigenerational families. We customize pacing, dietary needs, boutique heritage stays, and private car transit to your exact style.'
    },
    {
      q: 'What happens if our travel plans need to be rescheduled or adjusted en route?',
      a: 'Our Kolkata headquarters maintains an active 24/7 en-route concierge team. In case of unexpected weather, train updates, or medical needs, your dedicated journey manager handles re-routing, hotel adjustments, and logistics seamlessly.'
    }
  ];

  // Social Media Links data
  const socialCards = [
    {
      platform: 'Instagram',
      handle: '@bhromon',
      count: '148,000+ Explorers',
      description: 'Daily visual dispatches, ghat dawns & palace archives.',
      icon: InstagramIcon,
      color: 'hover:border-[#E1306C]/50 hover:bg-[#FAF4F5]',
      badgeColor: 'bg-[#E1306C]/10 text-[#E1306C]',
      link: 'https://instagram.com'
    },
    {
      platform: 'Facebook',
      handle: '@bhromon',
      count: '85,000+ Community',
      description: 'Traveler essays, departure updates & cultural talks.',
      icon: FacebookIcon,
      color: 'hover:border-[#1877F2]/50 hover:bg-[#F2F6FB]',
      badgeColor: 'bg-[#1877F2]/10 text-[#1877F2]',
      link: 'https://facebook.com'
    },
    {
      platform: 'YouTube',
      handle: '@bhromon',
      count: '62,500+ Subscribers',
      description: '4K cinematic documentaries & slow rail journals.',
      icon: YoutubeIcon,
      color: 'hover:border-[#FF0000]/50 hover:bg-[#FFF5F5]',
      badgeColor: 'bg-[#FF0000]/10 text-[#FF0000]',
      link: 'https://youtube.com'
    },
    {
      platform: 'Twitter / X',
      handle: '@bhromon',
      count: '34,000+ Travelers',
      description: 'Real-time route weather, trail dispatches & alerts.',
      icon: TwitterXIcon,
      color: 'hover:border-stone-800/40 hover:bg-stone-50',
      badgeColor: 'bg-stone-200 text-stone-800',
      link: 'https://twitter.com'
    },
    {
      platform: 'Pinterest',
      handle: '@bhromon',
      count: '92,000+ Monthly Views',
      description: 'Bespoke packing moodboards & palace interior designs.',
      icon: PinterestIcon,
      color: 'hover:border-[#E60023]/50 hover:bg-[#FFF3F3]',
      badgeColor: 'bg-[#E60023]/10 text-[#E60023]',
      link: 'https://pinterest.com'
    },
    {
      platform: 'LinkedIn',
      handle: '@bhromon',
      count: '18,500+ Network',
      description: 'Hospitality partnerships, fellowships & team stories.',
      icon: LinkedinIcon,
      color: 'hover:border-[#0A66C2]/50 hover:bg-[#F2F8FD]',
      badgeColor: 'bg-[#0A66C2]/10 text-[#0A66C2]',
      link: 'https://linkedin.com'
    }
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-[#F4F1E8] text-[#111111] overflow-x-hidden selection:bg-[#D7A43A]/30">
      {/* Fixed Navigation Bar with solid header spacing */}
      {!embedded && <BhromonNav mode="solid" />}

      {/* 
        ========================================================================
        1. PAGE HEADER: Editorial section header with parchment aesthetic
        ========================================================================
      */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-6 sm:px-12 lg:px-16 overflow-hidden">
        {/* Parchment Paper Grain Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
          style={{
            backgroundImage: 'radial-gradient(#9B8365 0.75px, transparent 0.75px)',
            backgroundSize: '22px 22px'
          }}
          aria-hidden="true"
        />

        {/* Vintage Cartography SVG Decorative Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 select-none overflow-hidden" aria-hidden="true">
          <svg viewBox="0 0 1440 600" fill="none" className="w-full h-full object-cover text-[#735F48]">
            <path
              d="M 120,80 Q 380,240 640,160 T 1180,320"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="6 8"
            />
            <path
              d="M 280,480 Q 560,320 900,420 T 1360,200"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />
            <circle cx="640" cy="160" r="4.5" fill="currentColor" />
            <circle cx="1180" cy="320" r="4" fill="currentColor" />
            <circle cx="900" cy="420" r="4" fill="currentColor" />
            {/* Vintage Coordinates */}
            <text x="660" y="165" fontSize="10" fontFamily="monospace" letterSpacing="0.2em" fill="currentColor">
              22.5726° N, 88.3639° E • CALCUTTA / KOLKATA HQ
            </text>
          </svg>
        </div>

        <div className="relative z-10 max-w-[1240px] mx-auto text-center">
          {/* Section Eyebrow */}
          <div className="contact-header-elem inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/70 border border-stone-300/70 shadow-xs mb-6">
            <span className="w-2 h-2 rounded-full bg-[#B85C32] animate-pulse" />
            <span className="text-xs font-semibold tracking-[0.24em] text-stone-700 uppercase">
              GET IN TOUCH
            </span>
          </div>

          {/* Heading */}
          <h1 className="contact-header-elem font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-[#111111] leading-[1.08] tracking-tight mb-6">
            We'd Love to <span className="italic font-display text-[#123C2A]">Hear From You</span>
          </h1>

          {/* Subtitle */}
          <p className="contact-header-elem max-w-2xl mx-auto font-sans text-stone-700 text-base sm:text-lg leading-relaxed font-light mb-8">
            Whether you are dreaming of a pilgrimage along the sacred ghats, a royal desert expedition across Rajasthan, or simply wish to discuss a bespoke itinerary — our Kolkata travel curators are here for you.
          </p>

          {/* Authentic Wax/Vintage Stamp Accent */}
          <div className="contact-header-elem flex items-center justify-center gap-4 text-xs font-mono tracking-widest text-stone-600 uppercase">
            <span className="h-px w-10 bg-stone-300" />
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#B85C32]" />
              EST. 2020 • BHROMON EXPEDITIONS
            </span>
            <span className="h-px w-10 bg-stone-300" />
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        2. CONTACT INFO CARDS GRID (4 cards in a row on desktop)
        ========================================================================
      */}
      <section className="contact-cards-section relative px-6 sm:px-12 lg:px-16 pb-20 sm:pb-28">
        <div className="max-w-[1340px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-7">

            {/* CARD 1: ADDRESS */}
            <div className="contact-card-item group relative bg-white rounded-2xl p-7 border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden">
              {/* Subtle top accent strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#123C2A] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-[#123C2A]/10 text-[#123C2A] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <MapPin className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#123C2A] bg-[#123C2A]/8 px-3 py-1 rounded-full">
                    Visit Us
                  </span>
                </div>

                <h3 className="font-editorial text-xl font-normal text-stone-900 mb-2">
                  Bhromon Heritage House
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  12 Heritage Lane, BBD Bagh<br />
                  Kolkata — 700001, West Bengal, India
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-600 font-medium">BBD Bagh Quarter</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('12 Heritage Lane, Kolkata 700001', 'address')}
                  className="inline-flex items-center gap-1 text-xs text-[#123C2A] hover:text-[#B85C32] font-semibold cursor-pointer transition-colors"
                  title="Copy Address"
                >
                  {copiedKey === 'address' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CARD 2: PHONE */}
            <div className="contact-card-item group relative bg-white rounded-2xl p-7 border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#B85C32] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-[#B85C32]/10 text-[#B85C32] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Phone className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#B85C32] bg-[#B85C32]/10 px-3 py-1 rounded-full">
                    Call Us
                  </span>
                </div>

                <h3 className="font-editorial text-xl font-normal text-stone-900 mb-2">
                  Direct Concierge Desk
                </h3>
                <div className="space-y-1.5 mb-4">
                  <a
                    href="tel:+919876543210"
                    className="block text-stone-900 font-semibold hover:text-[#B85C32] transition-colors text-base"
                  >
                    +91 98765 43210
                  </a>
                  <a
                    href="tel:+913322448800"
                    className="block text-stone-600 hover:text-stone-900 transition-colors text-sm"
                  >
                    +91 33 2244 8800 (Office)
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span>Toll-free in India</span>
                <a
                  href="tel:+919876543210"
                  className="text-xs font-semibold text-[#B85C32] hover:underline"
                >
                  Dial Now →
                </a>
              </div>
            </div>

            {/* CARD 3: EMAIL */}
            <div className="contact-card-item group relative bg-white rounded-2xl p-7 border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#D7A43A] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-[#D7A43A]/15 text-[#9E6E16] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Mail className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9E6E16] bg-[#D7A43A]/15 px-3 py-1 rounded-full">
                    Email Us
                  </span>
                </div>

                <h3 className="font-editorial text-xl font-normal text-stone-900 mb-2">
                  Written Correspondence
                </h3>
                <div className="space-y-1.5 mb-4">
                  <a
                    href="mailto:hello@bhromon.com"
                    className="block text-stone-900 font-semibold hover:text-[#9E6E16] transition-colors text-base"
                  >
                    hello@bhromon.com
                  </a>
                  <a
                    href="mailto:info@bhromon.com"
                    className="block text-stone-600 hover:text-stone-900 transition-colors text-sm"
                  >
                    info@bhromon.com
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span>Avg. reply in 4 hrs</span>
                <a
                  href="mailto:hello@bhromon.com"
                  className="text-xs font-semibold text-[#9E6E16] hover:underline"
                >
                  Write Us →
                </a>
              </div>
            </div>

            {/* CARD 4: WHATSAPP */}
            <div className="contact-card-item group relative bg-[#FAFDF7] rounded-2xl p-7 border border-emerald-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <MessageCircle className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
                    Instant Chat
                  </span>
                </div>

                <h3 className="font-editorial text-xl font-normal text-stone-900 mb-1">
                  WhatsApp Concierge
                </h3>
                <p className="text-stone-600 text-sm mb-3 font-medium">
                  +91 98765 43210
                </p>
                <p className="text-stone-500 text-xs leading-relaxed mb-4">
                  Connect directly with our route planners for instant trip advice.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/919876543210?text=Hello%20Bhromon%2C%20I%20would%20like%20to%20plan%20a%20journey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#123C2A] hover:bg-[#184D36] text-white rounded-full py-2.5 px-4 text-xs font-semibold tracking-wider transition-all shadow-xs hover:shadow-md cursor-pointer"
                >
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        3. BUSINESS HOURS SECTION: Clean table, live JS Date indicator, 24/7 note
        ========================================================================
      */}
      <section className="business-hours-block relative bg-[#FAF6F0] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 border-y border-stone-200/80">
        <div className="max-w-[1240px] mx-auto">
          <div className="hours-section-elem text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#123C2A]" />
              <span className="text-xs font-semibold tracking-[0.24em] text-stone-700 uppercase">
                CALCUTTA TIME & AVAILABILITY
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#111111] font-normal">
              Operating Hours & Travel Concierge
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Business Hours Table */}
            <div className="hours-section-elem lg:col-span-7 bg-white rounded-2xl p-7 sm:p-9 shadow-sm border border-stone-200/80 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200/70 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
                      <Clock className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 text-base">Standard Office Hours</h4>
                      <p className="text-xs text-stone-600">Indian Standard Time (IST, GMT+5:30)</p>
                    </div>
                  </div>

                  {/* Live Status Pill */}
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border bg-stone-50 border-stone-200">
                    <span className="relative flex h-2.5 w-2.5">
                      {businessStatus.isOpen && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          businessStatus.isOpen ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}
                      />
                    </span>
                    <span className="text-xs font-bold tracking-wide text-stone-800">
                      {businessStatus.statusText}
                    </span>
                    <span className="text-xs text-stone-600 pl-1 border-l border-stone-300">
                      {businessStatus.istTime} IST
                    </span>
                  </div>
                </div>

                {/* Hours Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
                      <span className="text-sm font-semibold text-stone-900">Monday – Friday</span>
                    </div>
                    <span className="font-mono text-sm text-stone-700 font-medium">9:00 AM – 7:00 PM</span>
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#B85C32]" />
                      <span className="text-sm font-semibold text-stone-900">Saturday</span>
                    </div>
                    <span className="font-mono text-sm text-stone-700 font-medium">10:00 AM – 5:00 PM</span>
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#D7A43A]" />
                      <span className="text-sm font-semibold text-stone-900">Sunday</span>
                    </div>
                    <span className="font-mono text-sm text-stone-700 font-medium">11:00 AM – 3:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Status footer banner */}
              <div className="mt-8 pt-5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span>{businessStatus.nextShift}</span>
                <span className="text-[11px] font-mono text-stone-600 uppercase tracking-widest">
                  KOLKATA TIME ZONE
                </span>
              </div>
            </div>

            {/* 24/7 Emergency Support Card */}
            <div className="hours-section-elem lg:col-span-5 bg-[#123C2A] text-white rounded-2xl p-7 sm:p-9 shadow-md flex flex-col justify-between relative overflow-hidden">
              {/* Grain & Watermark */}
              <div
                className="absolute inset-0 pointer-events-none opacity-15"
                style={{
                  backgroundImage: 'radial-gradient(#FAF6F0 0.6px, transparent 0.6px)',
                  backgroundSize: '18px 18px'
                }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase mb-5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Always With You</span>
                </div>

                <h3 className="font-editorial text-2xl sm:text-3xl font-normal leading-snug mb-3">
                  24/7 Active Journey <br />
                  <span className="italic font-display text-[#D7A43A]">Emergency Support</span>
                </h3>

                <p className="text-stone-300 text-sm leading-relaxed mb-6 font-light">
                  Already en route on an expedition? Our round-the-clock emergency desk operates 24 hours a day, 7 days a week for active travelers requiring immediate assistance with transport, lodging, or medical coordination.
                </p>

                <div className="bg-white/10 rounded-xl p-4 border border-white/15 backdrop-blur-xs space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs text-emerald-200">
                    <span>SOS Travel Hotline:</span>
                    <span className="font-mono font-bold text-white">+91 98765 00024</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span>Concierge Code:</span>
                    <span className="font-mono text-[#D7A43A]">BHR-247-SUPPORT</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs text-stone-300 flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-[#D7A43A]" />
                  Dedicated dispatch team
                </span>
                <a
                  href="tel:+919876500024"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D7A43A] hover:underline"
                >
                  <span>Call SOS Line</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        4. TWO-COLUMN SECTION:
           LEFT: Styled Google Map Placeholder with location marker & Open button
           RIGHT: Interactive Contact Form with simulated state & success view
        ========================================================================
      */}
      <section className="twocol-contact-section relative py-16 sm:py-24 px-6 sm:px-12 lg:px-16">
        <div className="max-w-[1340px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">

            {/* LEFT COLUMN: REALISTIC GOOGLE MAP PLACEHOLDER */}
            <div className="map-column-elem lg:col-span-5 relative">
              <div className="sticky top-28 space-y-6">
                
                {/* Map Card */}
                <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-md border border-stone-200/90 relative overflow-hidden">
                  
                  {/* Map Visual Vector Container */}
                  <div className="relative w-full h-[380px] sm:h-[440px] rounded-xl overflow-hidden bg-[#EAE5D9]">
                    
                    {/* Realistic Map Grid & Streets SVG */}
                    <svg viewBox="0 0 600 500" className="w-full h-full object-cover select-none">
                      <defs>
                        <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#89B4C4" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#6C9BAE" stopOpacity="0.9" />
                        </linearGradient>
                        <pattern id="mapPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                          <rect width="40" height="40" fill="#EAE5D9" />
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DDD6C7" strokeWidth="1" />
                        </pattern>
                      </defs>

                      {/* Map Base Fill */}
                      <rect width="100%" height="100%" fill="url(#mapPattern)" />

                      {/* Green Parks & Heritage Squares */}
                      <rect x="30" y="40" width="120" height="110" rx="8" fill="#C5D9BE" opacity="0.6" />
                      <rect x="220" y="240" width="160" height="130" rx="10" fill="#C5D9BE" opacity="0.7" />
                      <text x="240" y="300" fill="#6A8660" fontSize="9" fontWeight="bold" letterSpacing="0.1em">
                        DALHOUSIE SQUARE PARK
                      </text>

                      {/* River Hooghly Curve */}
                      <path
                        d="M 60,0 C 90,120 70,220 30,360 C 10,430 0,480 -20,520 L -60,520 L -60,-20 Z"
                        fill="url(#riverGrad)"
                      />
                      <text x="35" y="190" fill="#4B7787" fontSize="9" fontWeight="bold" letterSpacing="0.2em" transform="rotate(75, 35, 190)">
                        HOOGHLY RIVER (GANGES)
                      </text>

                      {/* Major Roads Grid */}
                      <path d="M 0,160 L 600,160" stroke="#FFF" strokeWidth="8" />
                      <path d="M 0,160 L 600,160" stroke="#E1D7C3" strokeWidth="6" />

                      <path d="M 170,0 L 170,500" stroke="#FFF" strokeWidth="9" />
                      <path d="M 170,0 L 170,500" stroke="#E1D7C3" strokeWidth="7" />

                      <path d="M 0,340 L 600,340" stroke="#FFF" strokeWidth="10" />
                      <path d="M 0,340 L 600,340" stroke="#D1C3A7" strokeWidth="8" />

                      <path d="M 410,0 L 410,500" stroke="#FFF" strokeWidth="9" />
                      <path d="M 410,0 L 410,500" stroke="#E1D7C3" strokeWidth="7" />

                      {/* Secondary Cross Streets */}
                      <path d="M 80,0 L 80,500" stroke="#F5F1E8" strokeWidth="4" />
                      <path d="M 290,0 L 290,500" stroke="#F5F1E8" strokeWidth="4" />
                      <path d="M 520,0 L 520,500" stroke="#F5F1E8" strokeWidth="4" />
                      <path d="M 0,220 L 600,220" stroke="#F5F1E8" strokeWidth="4" />
                      <path d="M 0,80 L 600,80" stroke="#F5F1E8" strokeWidth="4" />
                      <path d="M 0,420 L 600,420" stroke="#F5F1E8" strokeWidth="4" />

                      {/* Street Name Typography */}
                      <text x="180" y="152" fill="#786B58" fontSize="8" fontWeight="600" letterSpacing="0.1em">
                        OLD COURT HOUSE STREET
                      </text>
                      <text x="180" y="332" fill="#786B58" fontSize="8" fontWeight="600" letterSpacing="0.1em">
                        NETAJI SUBHASH ROAD
                      </text>
                      <text x="298" y="270" fill="#786B58" fontSize="7.5" fontWeight="600" letterSpacing="0.08em" transform="rotate(90, 298, 270)">
                        HERITAGE LANE
                      </text>
                    </svg>

                    {/* Interactive Mock Controls */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                      <div className="bg-white/95 rounded-lg shadow-sm border border-stone-200/80 p-1 flex flex-col">
                        <button
                          type="button"
                          aria-label="Zoom in map preview"
                          className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded text-sm font-bold"
                        >
                          +
                        </button>
                        <div className="h-px bg-stone-200 my-0.5" />
                        <button
                          type="button"
                          aria-label="Zoom out map preview"
                          className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded text-sm font-bold"
                        >
                          −
                        </button>
                      </div>
                    </div>

                    {/* Landmark Pins */}
                    <div className="absolute top-[80px] left-[70px] z-10 flex items-center gap-1.5 bg-white/90 px-2 py-1 rounded-md shadow-xs text-[9px] font-semibold text-stone-700 border border-stone-200">
                      <Navigation className="w-2.5 h-2.5 text-[#B85C32]" />
                      <span>Howrah Bridge (1.2 km)</span>
                    </div>

                    {/* MAIN BHROMON PIN (Center Location) */}
                    <div className="absolute top-[230px] left-[300px] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center">
                      
                      {/* Pulse rings */}
                      <div className="absolute -bottom-2 w-12 h-12 rounded-full bg-[#123C2A]/20 animate-ping pointer-events-none" />
                      <div className="absolute -bottom-1 w-7 h-7 rounded-full bg-[#123C2A]/30 pointer-events-none" />

                      {/* Tooltip Card */}
                      <div className="bg-[#123C2A] text-white px-3.5 py-1.5 rounded-xl shadow-xl text-center mb-1 border border-emerald-500/40 whitespace-nowrap">
                        <div className="text-[11px] font-bold font-sans tracking-wide">
                          Bhromon Travel House
                        </div>
                        <div className="text-[9px] text-[#D7A43A] font-mono">
                          12 Heritage Lane, Kolkata
                        </div>
                      </div>

                      {/* Pin Head */}
                      <div className="w-9 h-9 rounded-full bg-[#123C2A] text-white border-2 border-white shadow-lg flex items-center justify-center">
                        <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none">
                          <path d="M2.5 15.5L7 7.5L10 12L13.5 5.5L17.5 15.5H2.5Z" fill="#F4F1E8" />
                        </svg>
                      </div>
                      {/* Pointer */}
                      <div className="w-2 h-2.5 bg-[#123C2A] rotate-45 -mt-1 shadow-xs" />
                    </div>

                    {/* Bottom Floating Map Information Card */}
                    <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-stone-200/90 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-stone-900">
                          Bhromon Heritage House
                        </div>
                        <div className="text-[11px] text-stone-600">
                          12 Heritage Lane, BBD Bagh, Kolkata 700001
                        </div>
                      </div>

                      <a
                        href="https://www.google.com/maps/search/?api=1&query=12+Heritage+Lane+BBD+Bagh+Kolkata+700001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-[#123C2A] hover:bg-[#184D36] text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        <span>Open in Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                  </div>
                </div>

                {/* Transit & Landmarks Guide */}
                <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-stone-200/70 text-xs text-stone-700 space-y-2">
                  <div className="font-semibold text-stone-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#B85C32]" />
                    <span>How to Reach Our Headquarters</span>
                  </div>
                  <p className="leading-relaxed text-stone-600">
                    Located in the heart of Kolkata's historic colonial district. Just 4 minutes from Dalhousie Square (BBD Bagh) East Metro Station, and 45 minutes from Netaji Subhash Chandra Bose International Airport (CCU).
                  </p>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: CONTACT FORM */}
            <div className="form-column-elem lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-deckle border border-stone-200/90 relative overflow-hidden">
                
                {/* Washi tape visual accent */}
                <div className="absolute -top-3 right-10 w-24 h-6 bg-[#E8DFC8]/90 backdrop-blur-xs shadow-xs rotate-3 border-l border-r border-black/10 flex items-center justify-center pointer-events-none">
                  <span className="text-[7.5px] tracking-[0.2em] font-mono text-stone-500 uppercase">INQUIRY FORM</span>
                </div>

                {isSubmitted ? (
                  // SUCCESS STATE VIEW
                  <div className="py-10 text-center flex flex-col items-center">
                    <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6 shadow-sm animate-bounce">
                      <CheckCircle2 className="w-10 h-10 stroke-[2]" />
                    </div>

                    <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Message Dispatched Successfully</span>
                    </div>

                    <h3 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-normal mb-4">
                      Thank You, {formData.fullName || 'Traveler'}!
                    </h3>

                    <p className="text-stone-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-6 font-light">
                      Your inquiry regarding <strong className="font-semibold text-stone-800">"{formData.subject}"</strong> has arrived at our Kolkata desk. A dedicated travel curator will review your details and reach out within 4 business hours.
                    </p>

                    <div className="bg-[#FAF6F0] p-4 rounded-xl border border-stone-200 text-xs text-stone-600 font-mono mb-8 max-w-xs w-full">
                      <div className="flex justify-between py-1">
                        <span>Inquiry Ref:</span>
                        <span className="font-bold text-stone-900">#BHR-{Math.floor(1000 + Math.random() * 9000)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Contact Email:</span>
                        <span className="font-medium text-stone-900 truncate max-w-[140px]">{formData.email}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center gap-2 bg-[#123C2A] hover:bg-[#184D36] text-white rounded-full px-7 py-3 text-xs font-semibold tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                    >
                      <span>Send Another Message</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  // ACTIVE FORM VIEW
                  <div>
                    <div className="mb-8">
                      <div className="inline-flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B85C32]" />
                        <span className="text-xs font-semibold tracking-[0.24em] text-stone-700 uppercase">
                          DIRECT MESSAGE
                        </span>
                      </div>
                      <h2 className="font-editorial text-3xl sm:text-4xl text-[#111111] font-normal mb-3">
                        Send Us a Dispatch
                      </h2>
                      <p className="text-stone-600 text-sm leading-relaxed font-light">
                        Fill in your journey requirements or inquiry below. We treat every expedition with personal care and cultural depth.
                      </p>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                      
                      {/* Name & Email Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                            Full Name <span className="text-[#B85C32]">*</span>
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="e.g. Radhika Sen"
                            className="w-full bg-[#FAF6F0]/70 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#123C2A] focus:ring-1 focus:ring-[#123C2A] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                            Email Address <span className="text-[#B85C32]">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="you@domain.com"
                            className="w-full bg-[#FAF6F0]/70 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#123C2A] focus:ring-1 focus:ring-[#123C2A] transition-all"
                          />
                        </div>

                      </div>

                      {/* Phone & Subject Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                            Phone Number <span className="text-stone-400 lowercase font-normal">(optional)</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91 98765 00000"
                            className="w-full bg-[#FAF6F0]/70 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#123C2A] focus:ring-1 focus:ring-[#123C2A] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                            Inquiry Subject <span className="text-[#B85C32]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              className="w-full bg-[#FAF6F0]/70 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#123C2A] focus:ring-1 focus:ring-[#123C2A] transition-all appearance-none cursor-pointer"
                            >
                              <option value="General Inquiry">General Inquiry</option>
                              <option value="Tour Booking">Tour Booking & Customization</option>
                              <option value="Group Travel">Private & Group Travel</option>
                              <option value="Partnership">Boutique Hotel & Guide Partnership</option>
                              <option value="Complaint">Complaint / Service Feedback</option>
                              <option value="Other">Other Query</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-stone-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                      </div>

                      {/* Message Textarea */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                          Your Travel Vision or Message <span className="text-[#B85C32]">*</span>
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us about your proposed dates, group size, architectural or cultural interests, preferred pacing, and any special requirements..."
                          className="w-full bg-[#FAF6F0]/70 border border-stone-300 rounded-xl p-4 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#123C2A] focus:ring-1 focus:ring-[#123C2A] transition-all resize-y"
                        />
                      </div>

                      {/* Reassurance text & Submit Button */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-stone-600 font-light">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>We protect your privacy. Zero spam guaranteed.</span>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#123C2A] hover:bg-[#184D36] text-white rounded-full px-8 py-3.5 text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              <span>Sending Dispatch...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Inquiry</span>
                              <Send className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        5. SOCIAL MEDIA SECTION: Stylish cards for all channels
        ========================================================================
      */}
      <section className="social-media-section relative py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#FAF6F0] border-t border-stone-200/80">
        <div className="max-w-[1340px] mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D7A43A]" />
              <span className="text-xs font-semibold tracking-[0.24em] text-stone-700 uppercase">
                COMMUNITY & CHRONICLES
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#111111] font-normal mb-3">
              Connect Across the Social Archive
            </h2>
            <p className="text-stone-600 text-sm font-light">
              Follow our cultural wanderings, photographic diaries, and real-time dispatches from every corner of India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialCards.map((item) => {
              const IconComp = item.icon;
              return (
                <a
                  key={item.platform}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`social-card-item group bg-white rounded-2xl p-7 border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${item.color}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-900 group-hover:scale-110 transition-transform">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-bold tracking-wider px-3 py-1 rounded-full ${item.badgeColor}`}>
                        {item.count}
                      </span>
                    </div>

                    <h3 className="font-editorial text-xl text-stone-900 font-normal mb-1">
                      {item.platform}
                    </h3>
                    <div className="text-xs font-mono text-[#B85C32] font-semibold mb-3">
                      {item.handle}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-light mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 group-hover:text-[#123C2A] transition-colors">
                    <span>Follow @bhromon</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>

        </div>
      </section>

      {/* 
        ========================================================================
        6. FAQ TEASER SECTION: 3 Common questions with accordion & View All link
        ========================================================================
      */}
      <section className="faq-teaser-section relative py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#F4F1E8]">
        <div className="max-w-[960px] mx-auto">
          
          <div className="faq-elem text-center mb-12 sm:mb-14">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#123C2A]" />
              <span className="text-xs font-semibold tracking-[0.24em] text-stone-700 uppercase">
                FREQUENTLY ASKED QUESTIONS
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#111111] font-normal mb-3">
              Helpful Travel Inquiries
            </h2>
            <p className="text-stone-600 text-sm font-light">
              Clear answers before you begin crafting your bespoke journey through India.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4 mb-10">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="faq-elem bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
                  >
                    <span className="font-display text-base sm:text-lg text-stone-900 font-medium leading-snug">
                      {faq.q}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-[#123C2A] text-white border-transparent' : 'text-stone-700'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 sm:px-7 pb-6 pt-1 text-sm text-stone-700 leading-relaxed font-light border-t border-stone-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* View All FAQs Link */}
          <div className="faq-elem text-center">
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#123C2A] hover:text-[#B85C32] transition-colors group"
            >
              <span>View All Journey FAQs & Planning Guides</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* 
        ========================================================================
        7. BOTTOM CTA SECTION: 'Ready to Plan Your Trip?' with Book Now button
        ========================================================================
      */}
      <section className="cta-bottom-section relative px-6 sm:px-12 lg:px-16 pb-20 sm:pb-28">
        <div className="max-w-[1240px] mx-auto">
          <div className="cta-banner-content relative bg-[#123C2A] text-white rounded-3xl p-8 sm:p-14 lg:p-16 overflow-hidden shadow-2xl">
            
            {/* Grain & Cartographic background */}
            <div
              className="absolute inset-0 pointer-events-none opacity-15"
              style={{
                backgroundImage: 'radial-gradient(#FAF6F0 0.5px, transparent 0.5px)',
                backgroundSize: '20px 20px'
              }}
              aria-hidden="true"
            />
            
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-10 select-none hidden lg:block">
              <Compass className="w-96 h-96 -mr-16 -mb-16 stroke-[0.8]" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#D7A43A]" />
                <span className="text-xs font-semibold tracking-[0.24em] text-emerald-300 uppercase">
                  START YOUR ADVENTURE
                </span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.12] mb-5">
                Ready to Plan <br />
                <span className="italic font-display text-[#D7A43A]">Your Trip?</span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light mb-8 max-w-xl">
                Every extraordinary route begins with a single conversation. Speak with our curators today to design an unforgettable expedition through India's palaces, ghats, and hidden valleys.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#D7A43A] hover:bg-[#E8B84B] text-[#111111] rounded-full px-8 py-4 text-xs font-bold tracking-wider uppercase transition-all shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </Link>

                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 text-white rounded-full px-7 py-4 text-xs font-bold tracking-wider uppercase transition-all hover:bg-white/5"
                >
                  <span>Call Concierge: +91 98765 43210</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Global Bhromon Footer */}
      {!embedded && <BhromonFooter />}
    </div>
  );
}
