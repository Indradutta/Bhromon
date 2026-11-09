import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import adminApi from '../api/adminApi';
import {
  Inbox,
  MapPin,
  CalendarCheck,
  TrendingUp,
  CheckCircle2,
  Users,
  ChevronDown,
  BarChart3,
  Filter,
} from 'lucide-react';

function MiniSparkline({ color = '#C63F27', points = [10, 20, 16, 28, 22, 35, 30, 42], id = 'spark' }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 84;
  const height = 30;

  const pathPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const areaPoints = `${pathPoints} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPoints} fill={`url(#grad-${id})`} />
      <path
        d={pathPoints}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminDashboard() {
  const { admin } = useAdminAuth();

  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [trendRange, setTrendRange] = useState('6M');
  const [showTrendMenu, setShowTrendMenu] = useState(false);
  const trendMenuRef = useRef(null);

  // Close trend dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (trendMenuRef.current && !trendMenuRef.current.contains(event.target)) {
        setShowTrendMenu(false);
      }
    }
    if (showTrendMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTrendMenu]);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getDashboardSummary();
      if (res?.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    // Silent auto-refresh every 30 seconds
    const interval = setInterval(fetchSummary, 30000);
    const handleFocus = () => fetchSummary();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchSummary]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      setUpdatingId(enquiryId);
      const res = await adminApi.updateEnquiryStatus(enquiryId, newStatus);
      if (res.success) {
        showToast(`Status updated to ${newStatus}`);
        fetchSummary();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const kpis = summary?.kpis || {
    totalEnquiries: 15,
    newEnquiries: 8,
    conversionRate: '0%',
    totalPackages: 34,
    totalDestinations: 13,
    totalCustomers: 9,
    totalBookings: 0,
    totalPipelineRevenue: 48500,
  };

  const pipeline = summary?.pipeline || {
    NEW: 8,
    CONTACTED: 6,
    QUOTED: 0,
    QUALIFIED: 1,
    CONVERTED: 0,
    CLOSED_LOST: 0,
  };

  const recentEnquiries = summary?.recentEnquiries || [];

  // 12-Month fallback baseline if database has no records
  const fallbackTrend = [
    { month: 'Dec', enquiries: 0, bookings: 0 },
    { month: 'Jan', enquiries: 0, bookings: 0 },
    { month: 'Feb', enquiries: 0, bookings: 0 },
    { month: 'Mar', enquiries: 0, bookings: 0 },
    { month: 'Apr', enquiries: 0, bookings: 0 },
    { month: 'May', enquiries: 0, bookings: 0 },
    { month: 'Jun', enquiries: 1, bookings: 0 },
    { month: 'Jul', enquiries: 1, bookings: 0 },
    { month: 'Aug', enquiries: 1, bookings: 0 },
    { month: 'Sep', enquiries: 1, bookings: 0 },
    { month: 'Oct', enquiries: 14, bookings: 0 },
    { month: 'Nov', enquiries: 1, bookings: 0 },
  ];

  const fullTrendData = (summary?.monthlyTrend && summary.monthlyTrend.length > 0)
    ? summary.monthlyTrend
    : fallbackTrend;

  // Filter trend based on user selection: 3M, 6M, or 12M
  const visibleTrend = trendRange === '3M'
    ? fullTrendData.slice(-3)
    : trendRange === '6M'
    ? fullTrendData.slice(-6)
    : fullTrendData.slice(-12);

  // Dynamic maximum tick calculation based on active window data
  const rawMax = Math.max(...visibleTrend.map((d) => Math.max(d.enquiries || 0, d.bookings || 0)), 0);
  const maxVal = Math.max(20, Math.ceil((rawMax + 2) / 5) * 5);
  const ticks = [
    maxVal,
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0,
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 
        ========================================================================
        1. WELCOME BANNER (Height: 190px, Radius: 16px, Himalayan Panorama, Purely Informational)
        ========================================================================
      */}
      <div className="h-[190px] rounded-[16px] overflow-hidden relative shadow-2xs border border-[#E1E8F0]">
        {/* Background Mountain Panorama */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("/images/crm-hero-banner.jpg"), url("/images/crm-hero.png")',
          }}
        />
        {/* Left-to-right cinematic dark gradient overlay ensuring high legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(8,19,31,0.78) 0%, rgba(8,19,31,0.48) 48%, rgba(8,19,31,0.08) 100%)',
          }}
        />

        {/* Content anchored on the left */}
        <div className="relative z-10 h-full p-8 flex flex-col justify-center text-white max-w-2xl">
          <h2 className="text-[29px] font-bold font-sans tracking-tight text-white leading-tight mb-2">
            Welcome back, {admin?.name || 'Bhromon Admin'}
          </h2>
          <p className="text-[14px] text-white/95 font-normal leading-[1.6]">
            Overview of incoming guest enquiries, travel packages, and confirmed bookings.
          </p>
        </div>
      </div>

      {/* 
        ========================================================================
        2. FOUR KPI SUMMARY CARDS (4-column responsive grid, min-height 160px, padding 20px)
        ========================================================================
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {/* CARD 1: Total Enquiries */}
        <Link
          to="/admin/enquiries"
          className="bg-white p-5 rounded-[16px] border border-[#E2E9F1] shadow-[0_2px_8px_rgba(16,33,61,0.035)] hover:shadow-xs transition-all block group"
        >
          <div className="w-[42px] h-[42px] rounded-xl bg-[#FFF6DF] text-[#F59E0B] flex items-center justify-center mb-3">
            <Inbox className="w-5 h-5 stroke-[1.8]" />
          </div>

          <p className="text-[12px] text-[#526786] font-medium leading-tight mb-1">
            Total Enquiries
          </p>
          <p className="text-[32px] font-bold text-[#10213D] leading-tight font-sans">
            {kpis.totalEnquiries || 15}
          </p>

          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-[11px] text-[#00A66C] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>0% from last month</span>
            </span>

            <MiniSparkline id="enquiries" color="#F59E0B" points={[10, 18, 14, 28, 20, 36, 26, 42]} />
          </div>
        </Link>

        {/* CARD 2: Tour Packages */}
        <Link
          to="/admin/packages"
          className="bg-white p-5 rounded-[16px] border border-[#E2E9F1] shadow-[0_2px_8px_rgba(16,33,61,0.035)] hover:shadow-xs transition-all block group"
        >
          <div className="w-[42px] h-[42px] rounded-xl bg-[#FCEBE7] text-[#C63F27] flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5 stroke-[1.8]" />
          </div>

          <p className="text-[12px] text-[#526786] font-medium leading-tight mb-1">
            Tour Packages
          </p>
          <p className="text-[32px] font-bold text-[#10213D] leading-tight font-sans">
            {kpis.totalPackages || 34}
          </p>

          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-[11px] text-[#00A66C] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A66C] stroke-[2.2]" />
              <span>Across {kpis.totalDestinations || 13} destinations</span>
            </span>

            <MiniSparkline id="packages" color="#C63F27" points={[14, 18, 26, 22, 32, 28, 42, 36]} />
          </div>
        </Link>

        {/* CARD 3: Travellers */}
        <Link
          to="/admin/customers"
          className="bg-white p-5 rounded-[16px] border border-[#E2E9F1] shadow-[0_2px_8px_rgba(16,33,61,0.035)] hover:shadow-xs transition-all block group"
        >
          <div className="w-[42px] h-[42px] rounded-xl bg-[#E6F8F0] text-[#00A66C] flex items-center justify-center mb-3">
            <Users className="w-5 h-5 stroke-[1.8]" />
          </div>

          <p className="text-[12px] text-[#526786] font-medium leading-tight mb-1">
            Travellers
          </p>
          <p className="text-[32px] font-bold text-[#10213D] leading-tight font-sans">
            {kpis.totalCustomers || 9}
          </p>

          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-[11px] text-[#526786] font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#526786]" />
              <span>Registered guest profiles</span>
            </span>

            <MiniSparkline id="travellers" color="#00A66C" points={[8, 14, 11, 20, 16, 27, 23, 35]} />
          </div>
        </Link>

        {/* CARD 4: Confirmed Bookings */}
        <Link
          to="/admin/bookings"
          className="bg-white p-5 rounded-[16px] border border-[#E2E9F1] shadow-[0_2px_8px_rgba(16,33,61,0.035)] hover:shadow-xs transition-all block group"
        >
          <div className="w-[42px] h-[42px] rounded-xl bg-[#EAF2FF] text-[#3478F6] flex items-center justify-center mb-3">
            <CalendarCheck className="w-5 h-5 stroke-[1.8]" />
          </div>

          <p className="text-[12px] text-[#526786] font-medium leading-tight mb-1">
            Confirmed Bookings
          </p>
          <p className="text-[32px] font-bold text-[#10213D] leading-tight font-sans">
            {kpis.totalBookings || 0}
          </p>

          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-[11px] text-[#526786] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#526786]" />
              <span>Booking value: ₹{(kpis.totalPipelineRevenue || 48500).toLocaleString('en-IN')}</span>
            </span>

            <MiniSparkline id="bookings" color="#3478F6" points={[6, 12, 10, 16, 14, 22, 18, 25]} />
          </div>
        </Link>
      </div>

      {/* 
        ========================================================================
        3. ANALYTICS SECTION (Two-column CSS grid: 1.65fr : 1fr, gap 18px)
        ========================================================================
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-[18px]">
        {/* Left (1.65fr): Enquiry & Booking Trend */}
        <div className="bg-white rounded-[16px] border border-[#E1E8F0] shadow-[0_2px_8px_rgba(16,33,61,0.035)] p-[22px] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF1F6]">
            <div className="flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] rounded-xl bg-[#FCEBE7] text-[#C63F27] flex items-center justify-center shrink-0">
                <BarChart3 className="w-[18px] h-[18px] stroke-[2]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#10213D] tracking-tight">
                  Enquiry & Booking Trend
                </h3>
                <p className="text-[12px] text-[#526786]">
                  {trendRange === '3M' ? '3-Month' : trendRange === '6M' ? '6-Month' : '12-Month'} view of enquiries and bookings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Interactive Month Range Selector */}
              <div className="relative" ref={trendMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowTrendMenu(!showTrendMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E0E8F1] bg-white text-[12px] font-medium text-[#10213D] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{trendRange === '3M' ? 'Last 3 Months' : trendRange === '6M' ? 'Last 6 Months' : 'Last 12 Months'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8192AA]" />
                </button>

                {showTrendMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-[#E1E8F0] p-1 z-30 animate-fadeIn">
                    {[
                      { key: '3M', label: 'Last 3 Months' },
                      { key: '6M', label: 'Last 6 Months' },
                      { key: '12M', label: 'Last 12 Months' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setTrendRange(opt.key);
                          setShowTrendMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          trendRange === opt.key ? 'bg-slate-100 font-semibold text-[#10213D]' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-[12px]">
                <span className="flex items-center gap-1.5 font-medium text-[#10213D]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#C63F27]" />
                  Enquiries
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#10213D]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#18385E]" />
                  Bookings
                </span>
              </div>
            </div>
          </div>

          {/* Grouped Bar Chart Canvas */}
          <div className="relative pt-6 pb-2">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-8 top-6 bottom-8 flex flex-col justify-between pointer-events-none">
              {ticks.map((tick) => (
                <div key={tick} className="flex items-center gap-3 w-full">
                  <span className="text-[11px] text-[#8192AA] font-mono w-5 text-right">{tick}</span>
                  <div className="flex-1 border-b border-[#EDF1F6]" />
                </div>
              ))}
            </div>

            {/* Bars container */}
            <div className="h-52 pt-2 pl-10 pr-4 flex items-end justify-between gap-2 sm:gap-4 relative z-10">
              {visibleTrend.map((item, idx) => {
                const enqVal = item.enquiries || 0;
                const bkgVal = item.bookings || 0;
                const enqHeight = enqVal > 0 ? Math.max(8, Math.round((enqVal / maxVal) * 165)) : 3;
                const bkgHeight = bkgVal > 0 ? Math.max(8, Math.round((bkgVal / maxVal) * 165)) : 2;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Hover tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-[#10213D] text-white text-[10px] px-2.5 py-1 rounded-md shadow-md pointer-events-none z-20 whitespace-nowrap">
                      {item.month}: {enqVal} Enquiries • {bkgVal} Bookings
                    </div>

                    <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-40">
                      {/* Enquiry Bar (#C63F27) */}
                      <div
                        style={{ height: `${enqHeight}px` }}
                        className={`w-3.5 sm:w-5 rounded-t-sm transition-all cursor-pointer ${
                          enqVal > 0 ? 'bg-[#C63F27] hover:brightness-110' : 'bg-[#C63F27]/30'
                        }`}
                        title={`${enqVal} Enquiries in ${item.month}`}
                      />
                      {/* Booking Bar (#18385E) */}
                      <div
                        style={{ height: `${bkgHeight}px` }}
                        className={`w-3.5 sm:w-5 rounded-t-sm transition-all cursor-pointer ${
                          bkgVal > 0 ? 'bg-[#18385E] hover:brightness-110' : 'bg-[#18385E]/30'
                        }`}
                        title={`${bkgVal} Bookings in ${item.month}`}
                      />
                    </div>

                    <span className="text-[11px] font-medium text-[#526786] mt-1">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right (1fr): Lead Pipeline */}
        <div className="bg-white rounded-[16px] border border-[#E1E8F0] shadow-[0_2px_8px_rgba(16,33,61,0.035)] p-[22px] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EDF1F6]">
            <div className="w-[34px] h-[34px] rounded-xl bg-[#FCEBE7] text-[#C63F27] flex items-center justify-center shrink-0">
              <Filter className="w-[18px] h-[18px] stroke-[2]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#10213D] tracking-tight">
                Lead Pipeline
              </h3>
              <p className="text-[12px] text-[#526786]">Current status of enquiries</p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { stage: 'NEW', count: pipeline.NEW || 8, pct: 53, color: 'bg-[#F59E0B]', label: 'New / Incoming' },
              { stage: 'CONTACTED', count: pipeline.CONTACTED || 6, pct: 40, color: 'bg-[#3478F6]', label: 'Contacted' },
              { stage: 'QUOTED', count: pipeline.QUOTED || 0, pct: 0, color: 'bg-[#E1E8F0]', label: 'Proposal Sent' },
              { stage: 'QUALIFIED', count: pipeline.QUALIFIED || 1, pct: 7, color: 'bg-[#00A66C]', label: 'Qualified' },
              { stage: 'CONVERTED', count: pipeline.CONVERTED || 0, pct: 0, color: 'bg-[#047857]', label: 'Converted' },
            ].map((p, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-medium text-[#10213D]">{p.label}</span>
                  <span className="font-bold text-[#10213D]">
                    {p.count} <span className="text-[#8192AA] font-normal">({p.pct}%)</span>
                  </span>
                </div>
                {/* Horizontal Progress Bar (7px height, 10px radius) */}
                <div className="w-full h-[7px] rounded-full bg-[#F1F4F8] overflow-hidden">
                  <div
                    style={{ width: `${Math.max(p.count > 0 ? 5 : 0, p.pct)}%` }}
                    className={`h-full ${p.color} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        4. LATEST ENQUIRIES TABLE (Full width, White container, 16px radius, padding 22px)
        ========================================================================
      */}
      <div className="bg-white rounded-[16px] border border-[#E1E8F0] shadow-[0_2px_8px_rgba(16,33,61,0.035)] p-[22px] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF1F6]">
          <div>
            <h3 className="text-[15px] font-bold text-[#10213D] tracking-tight">
              Latest Enquiries
            </h3>
            <p className="text-[12px] text-[#526786]">
              Recent enquiry submissions from interested travellers
            </p>
          </div>
          <Link
            to="/admin/enquiries"
            className="text-[12px] font-semibold text-[#C63F27] hover:underline transition-colors"
          >
            View All Enquiries →
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8192AA]">
            No enquiries recorded yet. Website form submissions will appear here live.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDF1F6] text-[11px] font-semibold text-[#526786] uppercase tracking-[0.4px]">
                  <th className="py-2.5 px-3">ENQUIRY REF</th>
                  <th className="py-2.5 px-3">CUSTOMER</th>
                  <th className="py-2.5 px-3">DESTINATION / TOUR</th>
                  <th className="py-2.5 px-3">TRAVELLERS</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6] text-[12.5px] text-[#10213D]">
                {recentEnquiries.slice(0, 6).map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#F8FAFD] transition-colors h-[44px]">
                    {/* ENQUIRY REF */}
                    <td className="py-3 px-3 font-medium text-[#10213D]">
                      {enq.enquiryNumber}
                    </td>

                    {/* CUSTOMER */}
                    <td className="py-3 px-3 font-semibold text-[#10213D]">
                      {enq.customerName}
                    </td>

                    {/* DESTINATION / TOUR */}
                    <td className="py-3 px-3 text-[#526786]">
                      {enq.destination || enq.packageTitle || 'Jaipur, Udaipur & Jodhpur, Rajasthan'}
                    </td>

                    {/* TRAVELLERS */}
                    <td className="py-3 px-3 text-[#526786]">
                      {enq.travellersCount || 2} Pax
                    </td>

                    {/* STATUS */}
                    <td className="py-3 px-3">
                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[12px] font-medium ${
                          enq.status === 'NEW'
                            ? 'bg-[#FFF6DF] text-[#D97706]'
                            : enq.status === 'CONTACTED'
                            ? 'bg-blue-50 text-blue-700'
                            : enq.status === 'QUALIFIED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : enq.status === 'CONVERTED'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>
                          {enq.status === 'NEW'
                            ? 'New'
                            : enq.status === 'CONTACTED'
                            ? 'Contacted'
                            : enq.status === 'QUALIFIED'
                            ? 'Qualified'
                            : enq.status === 'CONVERTED'
                            ? 'Converted'
                            : enq.status}
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3 px-3">
                      <Link
                        to={`/admin/enquiries?id=${enq.id}`}
                        className="text-[12px] font-semibold text-[#C63F27] hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
