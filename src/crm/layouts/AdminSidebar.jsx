import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import sidebarIllustration from '../../assets/sidebar.png';
import {
  House,
  Mail,
  FileText,
  CalendarPlus,
  MapPin,
  Users,
  ReceiptText,
  ChartNoAxesColumn,
  Settings,
  ChevronRight,
  LogOut,
  Building,
  FileCheck2,
} from 'lucide-react';

export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: House },
  { name: 'Enquiries', path: '/admin/enquiries', icon: Mail },
  { name: 'Quotations', path: '/admin/quotations', icon: FileText },
  { name: 'Bookings', path: '/admin/bookings', icon: CalendarPlus },
  { name: 'Tour Packages', path: '/admin/packages', icon: MapPin },
  { name: 'Hotels', path: '/admin/hotels', icon: Building },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Invoices & Billing', path: '/admin/invoices', icon: ReceiptText },
  { name: 'Reports & Analytics', path: '/admin/reports', icon: ChartNoAxesColumn },
  { name: 'Settings & Logs', path: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ onCloseMobile }) {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Close profile popup when clicking anywhere outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <aside
      className="sidebar h-full w-[250px] flex flex-col relative select-none overflow-hidden isolate"
      style={{
        borderRight: '1px solid #D8E6F1',
      }}
    >
      {/* 
        ========================================================================
        CUSTOM TRAVEL ILLUSTRATION BACKGROUND (Exact Uploaded sidebar.png)
        - Background color: #DCEFFC with uploaded travel illustration
        - Anchored to center bottom, fills 100% width
        - Positioned behind all sidebar content with -z-10
        ========================================================================
      */}
      <div
        className="sidebar-background absolute inset-0 -z-10 pointer-events-none"
        style={{
          backgroundColor: '#DCEFFC',
          backgroundImage: `url(${sidebarIllustration}), url('/images/sidebar/sidebar.png')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
          backgroundSize: '100% 100%',
        }}
      />

      {/* 
        ========================================================================
        SIDEBAR CONTENT (Relative Z-10, clean upper section, readable items)
        ========================================================================
      */}
      <div className="sidebar-content relative z-10 flex flex-col h-full w-full">
        {/* 
          1. Brand Logo (Centered, aligned 64px height, exact BHROMON asset)
        */}
        <div className="h-[64px] px-5 flex items-center justify-center shrink-0">
          <Link
            to="/admin/dashboard"
            onClick={onCloseMobile}
            className="flex items-center justify-center group focus:outline-none"
            title="Bhromon Travel CRM"
          >
            <img
              src="/images/logo1.png"
              alt="BHROMON"
              className="h-7.5 w-auto max-w-[150px] object-contain group-hover:opacity-95 transition-opacity"
            />
          </Link>
        </div>

        {/* 
          2. Navigation Menu with Smooth Animated Sliding Selection Indicator
        */}
        <div className="flex-1 overflow-y-auto px-[16px] py-1 scrollbar-thin scrollbar-thumb-sky-200/50">
          <div className="relative">
            {/* Smooth animated sliding selection capsule */}
            {NAV_ITEMS.findIndex((item) => location.pathname.startsWith(item.path)) !== -1 && (
              <div
                className="absolute left-0 right-0 h-[46px] rounded-[14px] bg-white/85 border border-white/95 shadow-[0_2px_10px_rgba(16,33,61,0.06)] pointer-events-none transition-all duration-300 ease-out z-0"
                style={{
                  transform: `translateY(${
                    NAV_ITEMS.findIndex((item) => location.pathname.startsWith(item.path)) * 51
                  }px)`,
                }}
              />
            )}

            <div className="space-y-[5px]">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={`relative z-10 flex items-center h-[46px] px-[14px] rounded-[14px] transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? 'text-[#C63F27]'
                        : 'text-[#10213D] hover:text-[#C63F27] hover:bg-white/35'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 stroke-[1.8] transition-colors duration-200 ${
                        isActive ? 'text-[#C63F27]' : 'text-[#10213D]'
                      }`}
                    />

                    <span
                      className={`ml-[18px] text-[14px] tracking-tight truncate transition-colors duration-200 ${
                        isActive ? 'font-semibold text-[#C63F27]' : 'font-medium text-[#10213D]'
                      }`}
                    >
                      {item.name}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* 
          3. Admin Profile Footer (64px height, anchored to bottom, closes on outside click)
        */}
        <div className="p-[14px] shrink-0 relative" ref={profileRef}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center h-[64px] px-[12px] rounded-[16px] bg-white/45 border border-white/70 shadow-2xs hover:bg-white/65 transition-all cursor-pointer"
          >
            {/* Circular terracotta avatar with initials BA */}
            <div className="w-9 h-9 rounded-full bg-[#C63F27] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs">
              {admin?.name
                ? admin.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'BA'}
            </div>

            <div className="flex-1 min-w-0 ml-2.5">
              <p className="text-[13px] font-semibold text-[#10213D] truncate leading-tight">
                {admin?.name || 'Bhromon Admin'}
              </p>
              <p className="text-[11px] text-[#526786] truncate leading-tight mt-0.5">
                Super Admin
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-[#8192AA] shrink-0 ml-1" />
          </div>

          {/* Profile Popover / Logout Menu */}
          {showProfileMenu && (
            <div className="absolute bottom-[80px] left-[14px] right-[14px] bg-white rounded-2xl shadow-xl border border-[#D8E6F1] p-2 z-50 text-xs animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-[#10213D] truncate">{admin?.name || 'Bhromon Admin'}</p>
                <p className="text-[11px] text-[#526786] truncate">{admin?.email || 'admin@bhromon.com'}</p>
              </div>
              <Link
                to="/admin/settings"
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3 py-2 text-[#10213D] hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer mt-1"
              >
                <Settings className="w-4 h-4 text-[#526786]" />
                <span>System Settings</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
