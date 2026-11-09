import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import MobileBottomNav from './MobileBottomNav';
import { X } from 'lucide-react';

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-[#F5F8FC] text-[#10213D] antialiased font-sans">
      {/* 1. Desktop Persistent Sidebar (Exact 250px width) */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-40 w-[250px]">
        <AdminSidebar onCloseMobile={() => {}} />
      </div>

      {/* 2. Mobile/Tablet Quick Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-[250px] max-w-[85vw] h-full z-10 animate-slideRight shadow-2xl">
            <AdminSidebar onCloseMobile={() => setIsMobileOpen(false)} />

            {/* Close button floating on mobile drawer edge */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-[-44px] w-9 h-9 rounded-xl bg-slate-900/90 text-white flex items-center justify-center border border-white/20 cursor-pointer shadow-lg"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Operational Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onOpenMobile={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:px-[26px] lg:py-[30px] w-full mx-auto pb-24 lg:pb-8 animate-fadeIn">
          <Outlet />
        </main>
      </div>

      {/* 4. Mobile & Tablet Curved Elevated Bottom Navigation Bar */}
      <MobileBottomNav onOpenMenu={() => setIsMobileOpen(true)} />
    </div>
  );
}
