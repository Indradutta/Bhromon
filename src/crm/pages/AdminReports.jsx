import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  RefreshCw,
  DollarSign,
  CalendarCheck,
  Inbox,
  Users,
  Compass,
  CreditCard,
  PieChart,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import adminApi from '../api/adminApi';

const PERIOD_OPTIONS = [
  { id: 'all', label: 'All Time' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
];

export default function AdminReports() {
  const [period, setPeriod] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadAllReports = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, revenueRes, funnelRes] = await Promise.all([
        adminApi.getReportsOverview({ period }),
        adminApi.getRevenueBreakdown(),
        adminApi.getLeadFunnel(),
      ]);

      if (overviewRes?.data) setOverviewData(overviewRes.data);
      if (revenueRes?.data) setRevenueData(revenueRes.data);
      if (funnelRes?.data) setFunnelData(funnelRes.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
      showToast(err.message || 'Error loading reports data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, [period]);

  // Silent auto-refresh every 30 seconds and on window focus
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllReports();
    }, 30000);
    const onFocus = () => loadAllReports();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [period]);

  const handleExportCsv = async (type) => {
    setIsExporting(true);
    try {
      await adminApi.exportCsv(type);
      showToast(`Exported ${type} to CSV successfully`);
    } catch (err) {
      showToast(err.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = overviewData?.kpis || {};
  const topPackages = overviewData?.topPackages || [];
  const methodDist = revenueData?.methodDistribution || {};
  const monthlyTrendsList = revenueData?.monthlyTrendsList || [];
  const funnel = funnelData?.funnel || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#B3452C]" />
            <span>Business Intelligence & Executive Reports</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time financial analytics, revenue tracking, customer growth, and tour performance metrics.
          </p>
        </div>

        {/* Global Controls: Period, CSV, Print */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter Buttons */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  period === opt.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export CSV Dropdown / Button */}
          <div className="relative group">
            <button
              type="button"
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#B3452C]" />
              <span>Export CSV</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 hidden group-hover:block z-30 animate-fadeIn text-xs">
              <button
                type="button"
                onClick={() => handleExportCsv('bookings')}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Bookings</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv('invoices')}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Invoices</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv('enquiries')}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-orange-600" />
                <span>Export Leads</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv('customers')}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
                <span>Export Customers</span>
              </button>
            </div>
          </div>

          {/* Print Report */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 6 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Gross Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross Booked</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-display">
            ₹{(kpis.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10.5px] font-medium text-emerald-700 mt-0.5 block">
            Across {kpis.totalBookings || 0} departures
          </span>
        </div>

        {/* Realized / Collected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Collected</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-600 font-display">
            ₹{(kpis.totalCollected || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10.5px] font-medium text-slate-500 mt-0.5 block">
            {kpis.collectionRate || 0}% collection rate
          </span>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Outstanding</span>
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-600 font-display">
            ₹{(kpis.totalOutstanding || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10.5px] font-medium text-amber-700 mt-0.5 block">
            Pending settlements
          </span>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-[#B3452C]" />
          </div>
          <p className="text-xl font-black text-slate-900 font-display">
            {kpis.totalBookings || 0}
          </p>
          <span className="text-[10.5px] font-medium text-emerald-600 mt-0.5 block">
            {kpis.confirmedBookings || 0} confirmed
          </span>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Conversion</span>
            <PieChart className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-black text-purple-600 font-display">
            {kpis.conversionRate || 0}%
          </p>
          <span className="text-[10.5px] font-medium text-slate-500 mt-0.5 block">
            {kpis.convertedEnquiries || 0} of {kpis.totalEnquiries || 0} leads
          </span>
        </div>

        {/* Total Travelers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Directory</span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-xl font-black text-slate-900 font-display">
            {kpis.totalCustomers || 0}
          </p>
          <span className="text-[10.5px] font-medium text-slate-500 mt-0.5 block">
            Active customer profiles
          </span>
        </div>
      </div>

      {/* Monthly Realized Revenue Velocity Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 font-display">
              Payment Collections & Revenue Realization Velocity
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">6-Month historical billing cycle</span>
        </div>

        <div className="h-52 pt-4 flex items-end justify-between gap-3 sm:gap-6 px-2">
          {monthlyTrendsList.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
              No payment logs recorded yet. New payments will automatically populate this timeline.
            </div>
          ) : (
            monthlyTrendsList.map((m, idx) => {
              const maxRevVal = Math.max(...monthlyTrendsList.map((item) => item.revenue || 0), 1);
              const height = m.revenue > 0 ? Math.max(16, Math.round((m.revenue / maxRevVal) * 140)) : 4;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-lg shadow-md pointer-events-none z-20 whitespace-nowrap">
                    {m.label}: ₹{Number(m.revenue || 0).toLocaleString('en-IN')}
                  </div>

                  <div className="w-full flex items-end justify-center h-40">
                    <div
                      style={{ height: `${height}px` }}
                      className={`w-4 sm:w-8 rounded-t-lg transition-all cursor-pointer ${
                        m.revenue > 0 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 hover:brightness-110 shadow-xs' : 'bg-slate-100'
                      }`}
                    />
                  </div>

                  <div className="text-center">
                    <span className="text-[11px] font-semibold text-slate-600 block">
                      {m.month}
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-medium">
                      ₹{m.revenue > 0 ? (m.revenue >= 100000 ? `${(m.revenue / 100000).toFixed(1)}L` : `${Math.round(m.revenue / 1000)}k`) : '0'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Visual Analytics Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7/12): Top Performing Tour Packages */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#B3452C]" />
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Top Performing Tour Packages
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Ranked by revenue</span>
          </div>

          {topPackages.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No package departure records recorded for this period.
            </p>
          ) : (
            <div className="space-y-3.5">
              {topPackages.map((pkg, idx) => {
                const maxRev = topPackages[0]?.revenue || 1;
                const pct = Math.round((pkg.revenue / maxRev) * 100);

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 truncate max-w-[70%]">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate text-slate-900">{pkg.title}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900">
                          ₹{pkg.revenue.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-normal ml-1.5">
                          ({pkg.bookingsCount} {pkg.bookingsCount === 1 ? 'trip' : 'trips'})
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#B3452C] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (5/12): Lead Conversion Funnel */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#B3452C]" />
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Lead Conversion Funnel
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Pipeline velocity</span>
          </div>

          <div className="space-y-2.5">
            {funnel.map((item) => {
              const totalLeads = funnelData?.totalLeads || 1;
              const pct = Math.round((item.count / totalLeads) * 100);

              const colorClass =
                item.status === 'CONVERTED'
                  ? 'bg-emerald-500 text-emerald-700'
                  : item.status === 'QUOTED'
                  ? 'bg-purple-500 text-purple-700'
                  : item.status === 'NEW'
                  ? 'bg-blue-500 text-blue-700'
                  : item.status === 'CLOSED_LOST'
                  ? 'bg-slate-300 text-slate-500'
                  : 'bg-amber-500 text-amber-700';

              return (
                <div key={item.status} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colorClass.split(' ')[0]}`} />
                    <span className="font-bold text-slate-800">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">{pct}%</span>
                    <span className="font-bold text-slate-900 min-w-6 text-right">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Methods & Collection Channels Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#B3452C]" />
            <h3 className="font-bold text-sm text-slate-900 font-display">
              Payment Methods & Settlement Channels
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Recorded receipts distribution</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(methodDist).map(([method, amount]) => (
            <div key={method} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold uppercase truncate">
                {method.replace('_', ' ')}
              </span>
              <p className="text-sm font-extrabold text-slate-900">
                ₹{amount.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
