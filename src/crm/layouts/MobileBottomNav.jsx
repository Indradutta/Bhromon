import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Mail,
  Compass,
  CalendarCheck,
  Menu,
} from 'lucide-react';

export default function MobileBottomNav({ onOpenMenu }) {
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      path: '/admin/dashboard',
      icon: Home,
    },
    {
      id: 'enquiries',
      label: 'Inquiries',
      path: '/admin/enquiries',
      icon: Mail,
    },
    {
      id: 'packages',
      label: 'Packages',
      path: '/admin/packages',
      icon: Compass,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      path: '/admin/bookings',
      icon: CalendarCheck,
    },
    {
      id: 'menu',
      label: 'Menu',
      action: onOpenMenu,
      icon: Menu,
    },
  ];

  // Determine current active tab index (0 to 4)
  const activeIndex = location.pathname.startsWith('/admin/dashboard')
    ? 0
    : location.pathname.startsWith('/admin/enquiries')
    ? 1
    : location.pathname.startsWith('/admin/packages')
    ? 2
    : location.pathname.startsWith('/admin/bookings')
    ? 3
    : 0;

  const ActiveIcon = navItems[activeIndex]?.icon || Home;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-2 pt-1 pointer-events-none select-none">
      {/* Floating Curved Navigation Island matching Image 3 Reference */}
      <div className="max-w-md mx-auto pointer-events-auto relative">
        {/* 
          ======================================================================
          ORGANIC CONVEX CURVED NOTCH DOME (Smoothly wraps around active button)
          Rises 18px above the flat top edge, moving with activeIndex
          ======================================================================
        */}
        <div
          className="absolute -top-[16px] pointer-events-none transition-all duration-300 ease-out z-10"
          style={{
            left: `calc(${activeIndex * 20}% + 10% - 40px)`,
            filter: 'drop-shadow(0 -3px 8px rgba(16, 33, 61, 0.05))',
          }}
        >
          <svg
            width="80"
            height="18"
            viewBox="0 0 80 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Smooth cubic bezier dome curve merging seamlessly with white bar */}
            <path
              d="M 0 18 C 18 18 22 0 40 0 C 58 0 62 18 80 18 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* 
          ======================================================================
          ELEVATED CIRCULAR ACTIVE BUTTON (Floats above active tab dome)
          ======================================================================
        */}
        <div
          className="absolute -top-[20px] pointer-events-none transition-all duration-300 ease-out z-20"
          style={{
            left: `calc(${activeIndex * 20}% + 10% - 24px)`,
          }}
        >
          <div className="w-12 h-12 rounded-full bg-white border-2 border-[#C63F27] text-[#C63F27] shadow-[0_8px_20px_rgba(198,63,39,0.28)] flex items-center justify-center animate-fadeIn">
            <ActiveIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* 
          ======================================================================
          MAIN BAR BODY (White card, rounded-2xl, soft shadow, 5 tab slots)
          ======================================================================
        */}
        <div className="bg-white rounded-t-[26px] rounded-b-[22px] border border-[#E5EAF0] shadow-[0_-8px_30px_rgba(16,33,61,0.08)] px-2 pt-2 pb-1.5 relative overflow-hidden">
          <div className="flex items-center justify-around h-14 relative z-10">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeIndex;

              if (item.action) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[#8192AA] group-hover:text-[#10213D] transition-colors">
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <span className="text-[10px] font-medium text-[#8192AA] group-hover:text-[#10213D] -mt-0.5">
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none group relative"
                >
                  {isActive ? (
                    /* Active Tab: Icon is hoisted to the floating circle, active bold label below */
                    <div className="flex flex-col items-center justify-end h-full pt-4">
                      <span className="text-[11px] font-bold text-[#10213D] tracking-tight">
                        {item.label}
                      </span>
                    </div>
                  ) : (
                    /* Inactive Tab: Gray line icon + muted label */
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[#8192AA] group-hover:text-[#10213D] transition-colors">
                        <Icon className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <span className="text-[10px] font-medium text-[#8192AA] group-hover:text-[#10213D] -mt-0.5">
                        {item.label}
                      </span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* iOS-style Home Indicator Capsule */}
          <div className="w-28 h-1 bg-slate-300/80 rounded-full mx-auto mt-1 mb-0.5" />
        </div>
      </div>
    </nav>
  );
}
