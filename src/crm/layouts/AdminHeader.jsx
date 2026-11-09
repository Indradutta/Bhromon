import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';
import {
  Bell,
  Search,
  Plus,
  Check,
  X,
  Trash2,
  Mail,
  CalendarCheck,
  Users,
} from 'lucide-react';

// Helpers for persistent notification states in localStorage
const getDismissedIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem('bhromon_dismissed_notifications') || '[]'));
  } catch {
    return new Set();
  }
};

const saveDismissedIds = (set) => {
  try {
    localStorage.setItem('bhromon_dismissed_notifications', JSON.stringify(Array.from(set)));
  } catch {}
};

const getReadIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem('bhromon_read_notifications') || '[]'));
  } catch {
    return new Set();
  }
};

const saveReadIds = (set) => {
  try {
    localStorage.setItem('bhromon_read_notifications', JSON.stringify(Array.from(set)));
  } catch {}
};

export default function AdminHeader({ onOpenMobile }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ'
  const [notifSearch, setNotifSearch] = useState('');

  // Notifications dynamically fetched from real DB and filtered by dismissed cache
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for explicit enquiry deletion so notifications never phantom-fire
  useEffect(() => {
    const handleEnquiryDeleted = (e) => {
      const deletedId = e.detail?.id;
      if (!deletedId) return;
      const notifId = `enq-${deletedId}`;
      const dismissed = getDismissedIds();
      dismissed.add(notifId);
      saveDismissedIds(dismissed);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    };

    window.addEventListener('bhromon_enquiry_deleted', handleEnquiryDeleted);
    return () => window.removeEventListener('bhromon_enquiry_deleted', handleEnquiryDeleted);
  }, []);

  // Fetch real dynamic operational notifications from database
  useEffect(() => {
    let isMounted = true;
    const dismissed = getDismissedIds();
    const readSet = getReadIds();

    Promise.all([
      adminApi.getDashboardSummary().catch(() => null),
      adminApi.getBookings({ limit: 5 }).catch(() => null),
    ]).then(([dashRes, bkgRes]) => {
      if (!isMounted) return;

      const items = [];
      const hasInitialBaseline = sessionStorage.getItem('bhromon_notif_baseline_set');
      let minEnquiryTime = parseInt(sessionStorage.getItem('bhromon_min_enquiry_time') || '0', 10);

      // 1. Real recent inquiries from DB
      if (dashRes?.data?.recentEnquiries && Array.isArray(dashRes.data.recentEnquiries)) {
        const enquiries = dashRes.data.recentEnquiries;

        // On first load, baseline the timestamp of the oldest visible recent inquiry
        if (!hasInitialBaseline && enquiries.length > 0) {
          const times = enquiries
            .map((e) => (e.createdAt ? new Date(e.createdAt).getTime() : 0))
            .filter(Boolean);
          if (times.length > 0) {
            minEnquiryTime = Math.min(...times);
            sessionStorage.setItem('bhromon_min_enquiry_time', String(minEnquiryTime));
            sessionStorage.setItem('bhromon_notif_baseline_set', 'true');
          }
        }

        enquiries.forEach((e) => {
          const id = `enq-${e.id}`;
          const eTime = e.createdAt ? new Date(e.createdAt).getTime() : 0;

          // If an older inquiry surfaced only because a newer one was deleted, do not treat it as new
          if (hasInitialBaseline && minEnquiryTime > 0 && eTime < minEnquiryTime && !dismissed.has(id)) {
            dismissed.add(id);
            saveDismissedIds(dismissed);
            return;
          }

          if (!dismissed.has(id)) {
            items.push({
              id,
              title: e.status === 'NEW' ? 'New Enquiry Received' : `Enquiry: ${e.status}`,
              desc: `${e.customerName || 'Guest'} requested ${e.destination || 'Custom Tour'}.`,
              time: e.createdAt
                ? new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent',
              type: 'enquiry',
              read: readSet.has(id),
              link: `/admin/enquiries?id=${e.id}`,
            });
          }
        });
      }

      // 2. Real recent bookings from DB
      if (bkgRes?.data?.bookings && Array.isArray(bkgRes.data.bookings)) {
        bkgRes.data.bookings.forEach((b) => {
          const id = `bkg-${b.id}`;
          if (!dismissed.has(id)) {
            items.push({
              id,
              title: b.status === 'CONFIRMED' ? 'Booking Confirmed' : `Booking ${b.status}`,
              desc: `Booking #${b.bookingNumber} for ${b.customer?.fullName || 'Traveler'}.`,
              time: b.createdAt
                ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent',
              type: 'booking',
              read: readSet.has(id),
              link: `/admin/bookings`,
            });
          }
        });
      }

      setNotifications(items);
    });

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const allCount = notifications.length;

  // Filtered list by tab and search
  const filteredNotifications = notifications
    .filter((n) => {
      if (activeTab === 'UNREAD') return !n.read;
      if (activeTab === 'READ') return n.read;
      return true; // ALL
    })
    .filter((n) => {
      if (!notifSearch.trim()) return true;
      const q = notifSearch.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q);
    });

  // Action: Mark single notification as read & persist in localStorage
  const handleToggleRead = (id, e) => {
    e.stopPropagation();
    const readSet = getReadIds();
    readSet.add(id);
    saveReadIds(readSet);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Action: Dismiss / Clear single notification & persist in localStorage
  const handleDismiss = (id, e) => {
    e.stopPropagation();
    const dismissed = getDismissedIds();
    dismissed.add(id);
    saveDismissedIds(dismissed);

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Action: Clear all notifications & persist in localStorage
  const handleClearAll = (e) => {
    e.stopPropagation();
    const dismissed = getDismissedIds();
    notifications.forEach((n) => dismissed.add(n.id));
    saveDismissedIds(dismissed);

    setNotifications([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/enquiries?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="h-[64px] bg-white border-b border-[#E1E8F0] px-6 lg:px-8 flex items-center justify-between shrink-0 relative z-30">
      {/* 
        ========================================================================
        LEFT: Sleek Minimal Search Bar
        ========================================================================
      */}
      <div className="flex items-center flex-1 max-w-[420px]">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8192AA] absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search enquiries, customers, bookings..."
              className="w-full h-[38px] pl-9 pr-4 rounded-xl bg-[#F5F8FC] border border-[#E0E8F1] text-[13px] text-[#10213D] placeholder-[#8192AA] focus:outline-none focus:border-[#C63F27] focus:bg-white transition-all font-sans"
            />
          </div>
        </form>
      </div>

      {/* 
        ========================================================================
        RIGHT: Compact Proportional Action Buttons (38x38)
        ========================================================================
      */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Notification Trigger Button */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-[38px] h-[38px] rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#334155] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all relative cursor-pointer shadow-2xs"
            aria-label="View notifications"
          >
            <Bell className="w-[17px] h-[17px] stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#C63F27] text-white text-[9px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Overlay */}
          {isNotifOpen && (
            <div
              className="absolute right-0 top-[46px] w-[380px] max-w-[calc(100vw-1.5rem)] rounded-[22px] bg-white/95 backdrop-blur-xl border border-[#E1EAF4] p-3.5 z-50 animate-fadeIn text-[#10213D]"
              style={{
                boxShadow: '0 16px 40px rgba(16, 33, 61, 0.14)',
              }}
            >
              {/* Top Bar: Bell with Badge, Search Filter, and Clear All */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EDF1F6]">
                {/* 3D-styled Bell Squircle with Count Badge */}
                <div className="w-9 h-9 rounded-xl bg-[#10213D] text-white flex items-center justify-center relative shrink-0 shadow-xs">
                  <Bell className="w-4 h-4 fill-white text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[9.5px] font-bold flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {/* Filter Search Input */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#8192AA] absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={notifSearch}
                    onChange={(e) => setNotifSearch(e.target.value)}
                    className="w-full h-[32px] pl-8 pr-3 rounded-[10px] bg-[#F4F7FB] border border-[#E2EAF3] text-xs text-[#10213D] placeholder-[#8192AA] focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>

                {/* Clear All CTA */}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11.5px] font-semibold text-[#C63F27] hover:underline flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Title & Tabs */}
              <div className="flex items-center justify-between pt-3 pb-2.5">
                <span className="font-bold text-[13.5px] text-[#10213D] tracking-tight">
                  Notifications
                </span>

                <div className="flex items-center gap-1 bg-[#F1F5FA] p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ALL')}
                    className={`px-2.5 py-1 rounded-[7px] font-medium transition-all cursor-pointer ${
                      activeTab === 'ALL'
                        ? 'bg-white text-[#C63F27] font-semibold shadow-2xs'
                        : 'text-[#526786] hover:text-[#10213D]'
                    }`}
                  >
                    All ({allCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('UNREAD')}
                    className={`px-2.5 py-1 rounded-[7px] font-medium transition-all cursor-pointer ${
                      activeTab === 'UNREAD'
                        ? 'bg-white text-[#C63F27] font-semibold shadow-2xs'
                        : 'text-[#526786] hover:text-[#10213D]'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('READ')}
                    className={`px-2.5 py-1 rounded-[7px] font-medium transition-all cursor-pointer ${
                      activeTab === 'READ'
                        ? 'bg-white text-[#C63F27] font-semibold shadow-2xs'
                        : 'text-[#526786] hover:text-[#10213D]'
                    }`}
                  >
                    Read
                  </button>
                </div>
              </div>

              {/* Notification Items List: Separate Pill Cards matching Reference Image 2 */}
              <div className="space-y-2.5 my-1 max-h-[330px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-slate-200">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#8192AA] bg-[#F9FBFE] rounded-2xl border border-dashed border-[#E0E8F2]">
                    No notifications in this view.
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        navigate(notif.link);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3 rounded-[18px] transition-all cursor-pointer flex items-start gap-3 relative group border ${
                        notif.read
                          ? 'bg-white/90 border-[#E8EFF6] hover:border-[#D0DFEE]'
                          : 'bg-gradient-to-r from-[#F4F8FD] to-[#FFFFFF] border-[#CFDFEE] shadow-[0_3px_12px_rgba(37,99,235,0.05)] hover:shadow-[0_6px_18px_rgba(37,99,235,0.08)]'
                      }`}
                    >
                      {/* Squircle Colored Icon matching Reference Image 2 */}
                      <div
                        className={`w-9 h-9 rounded-[13px] flex items-center justify-center shrink-0 shadow-2xs text-white ${
                          notif.type === 'enquiry'
                            ? 'bg-[#2563EB]'
                            : notif.type === 'booking'
                            ? 'bg-[#10B981]'
                            : 'bg-[#F97316]'
                        }`}
                      >
                        {notif.type === 'enquiry' && <Mail className="w-4 h-4 stroke-[2.2]" />}
                        {notif.type === 'booking' && <CalendarCheck className="w-4 h-4 stroke-[2.2]" />}
                        {notif.type === 'customer' && <Users className="w-4 h-4 stroke-[2.2]" />}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 pr-12">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[12.5px] font-bold text-[#10213D] leading-snug truncate">
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#526786] leading-relaxed line-clamp-2 mt-0.5">
                          {notif.desc}
                        </p>
                        <span className="text-[10px] text-[#8192AA] font-normal block mt-1">
                          {notif.time}
                        </span>
                      </div>

                      {/* Right Action Icons: Mark Read (Check) & Clear (Cross) */}
                      <div className="absolute top-3 right-2.5 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleToggleRead(notif.id, e)}
                          title={notif.read ? 'Already read' : 'Mark as read'}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            notif.read
                              ? 'text-[#00A66C] bg-emerald-50'
                              : 'text-[#8192AA] hover:text-[#00A66C] hover:bg-emerald-50 bg-white/80 border border-[#E0E8F2]'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDismiss(notif.id, e)}
                          title="Dismiss notification"
                          className="w-6 h-6 rounded-lg bg-white/80 border border-[#E0E8F2] flex items-center justify-center text-[#8192AA] hover:text-[#D92D20] hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Footer Link */}
              <div className="pt-2.5 border-t border-[#EDF1F6] text-center">
                <Link
                  to="/admin/enquiries"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[12px] font-semibold text-[#C63F27] hover:underline"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button: Proportional Plus Icon (38x38) */}
        <Link
          to="/admin/bookings?create=true"
          title="New Booking"
          aria-label="Create New Booking"
          className="w-[38px] h-[38px] rounded-xl bg-[#C63F27] hover:bg-[#B3341E] text-white flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
        </Link>
      </div>
    </header>
  );
}
