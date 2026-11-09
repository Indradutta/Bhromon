import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  ArrowUp,
} from 'lucide-react';

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.592 0 9 1.592 9 4.708V8z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function BhromonFooter() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer
      id="footer"
      className="relative text-stone-800 pt-16 sm:pt-20 pb-10 overflow-hidden bg-[#FDF6EF] border-t border-[#E8DFC8]"
    >
      {/* 
        ========================================================================
        INDIAN MONUMENTS PANORAMA SKYLINE BACKGROUND
        Asset: /images/sidebar/a4208907-a08a-463d-a9f9-bb3879d3e670.png
        ========================================================================
      */}
      <div
        className="absolute inset-0 pointer-events-none bg-no-repeat bg-bottom"
        style={{
          backgroundImage: "url('/images/sidebar/a4208907-a08a-463d-a9f9-bb3879d3e670.png')",
          backgroundPosition: 'center bottom',
          backgroundSize: '100% auto',
        }}
        aria-hidden="true"
      />

      {/* Gentle gradient scrim in the upper sky to keep column typography crystal-clear */}
      <div
        className="absolute inset-x-0 top-0 h-[65%] pointer-events-none bg-gradient-to-b from-[#FDF6EF] via-[#FDF6EF]/90 to-transparent"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-14">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-300/80">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <span className="font-brand text-2xl tracking-[0.14em] text-[#111111] font-bold block">
                BHROMON
              </span>
              <span className="text-[9.5px] tracking-[0.24em] text-[#A5422B] font-bold uppercase mt-0.5 block">
                Travel Beyond Borders
              </span>
            </div>
            <p className="text-[13px] text-stone-700 font-normal leading-relaxed max-w-xs mb-6">
              Thoughtfully curated travel experiences across India and beyond. We craft journeys that create memories for a lifetime.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { Icon: InstagramIcon, label: 'Instagram', href: '#' },
                { Icon: FacebookIcon, label: 'Facebook', href: '#' },
                { Icon: YoutubeIcon, label: 'YouTube', href: '#' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/90 border border-stone-300 hover:bg-[#A5422B] hover:border-[#A5422B] hover:text-white flex items-center justify-center text-stone-700 transition-all shadow-xs cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-[11px] tracking-[0.22em] font-bold text-[#A5422B] uppercase mb-5">
              Navigation
            </h3>
            <nav className="flex flex-col gap-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '#about' },
                { label: 'Destinations', href: '#destinations' },
                { label: 'Tour Packages', href: '#featured-tours' },
                { label: 'Travel Journal', href: '#journal-preview' },
                { label: 'Contact Us', href: '#footer' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-[13.5px] font-medium text-stone-800 hover:text-[#A5422B] transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-[11px] tracking-[0.22em] font-bold text-[#A5422B] uppercase mb-5">
              Contact Us
            </h3>
            <div className="flex flex-col gap-4 text-[13px] text-stone-800">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#A5422B] shrink-0 mt-0.5" />
                <span className="font-medium text-stone-800">[Company Address, City, State — Placeholder]</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#A5422B] shrink-0" />
                <a href="tel:+919XXXXXXXXX" className="font-medium text-stone-800 hover:text-[#A5422B] transition-colors">
                  +91 9X XXXX XXXXX (Placeholder)
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#A5422B] shrink-0" />
                <a href="mailto:hello@bhromon.com" className="font-medium text-stone-800 hover:text-[#A5422B] transition-colors">
                  hello@bhromon.com
                </a>
              </div>
              <div className="text-[12px] font-medium text-stone-600 mt-1">
                Business Hours: Mon–Sat, 10 AM – 7 PM IST
              </div>
            </div>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-[11px] tracking-[0.22em] font-bold text-[#A5422B] uppercase mb-5">
              Travel Updates
            </h3>
            <p className="text-[13px] text-stone-700 font-normal leading-relaxed mb-4">
              Subscribe for curated travel stories, deals and destination guides.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.email.value;
                if (email) {
                  alert('Thank you for subscribing! (Demo — not yet connected to backend)');
                  e.target.reset();
                }
              }}
              className="flex gap-2"
            >
              <input
                name="email"
                type="email"
                required
                placeholder="Your email address"
                className="flex-1 bg-white/95 text-stone-900 placeholder-stone-400 text-[13px] px-4 py-2.5 rounded-full border border-stone-300 focus:outline-none focus:border-[#A5422B] focus:ring-1 focus:ring-[#A5422B] shadow-xs transition-colors min-w-0"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-[#A5422B] hover:bg-[#8C3520] text-white flex items-center justify-center shrink-0 transition-colors shadow-sm cursor-pointer"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar - Styled with a soft frosted glass capsule to float harmoniously above the monuments */}
        <div className="mt-8 py-3.5 px-6 rounded-2xl bg-white/75 backdrop-blur-sm border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-medium text-stone-700">
          <span>© {new Date().getFullYear()} BHROMON. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#A5422B] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#A5422B] transition-colors">Terms & Conditions</a>
          </div>
          {/* Back to top */}
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="w-8 h-8 rounded-full bg-white border border-stone-300 hover:bg-[#A5422B] hover:border-[#A5422B] hover:text-white flex items-center justify-center text-stone-700 transition-all shadow-xs cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
