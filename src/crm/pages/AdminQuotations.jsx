import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';
import {
  FileText,
  Search,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  Sparkles,
  RefreshCw,
  X,
  ChevronRight,
  TrendingUp,
  Receipt,
  MessageSquare,
  ShieldCheck,
  Percent,
  Trash2,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

const STATUS_FILTERS = ['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

export default function AdminQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Dropdown dependency states
  const [customersList, setCustomersList] = useState([]);
  const [packagesList, setPackagesList] = useState([]);

  // Slide-over Drawer for Quotation Inspector
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // Convert to Booking Modal
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertAdvance, setConvertAdvance] = useState('');
  const [convertMethod, setConvertMethod] = useState('UPI');
  const [convertTxnRef, setConvertTxnRef] = useState('');
  const [isSubmittingConvert, setIsSubmittingConvert] = useState(false);

  // Create Quotation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customerId: '',
    packageId: '',
    title: '',
    travelDate: nextMonth,
    durationDays: 7,
    numberOfTravellers: 2,
    basePrice: 50000,
    discountAmount: 0,
    taxPercentage: 5.0,
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'DRAFT',
    inclusions: [
      'Deluxe Heritage Accommodation with Breakfast',
      'Private AC Chauffeur throughout tour',
      'All monument entry tickets & passes',
      'Local English-speaking tour guide',
    ],
    exclusions: [
      'Airfare and train tickets',
      'Personal expenses, laundry, and tips',
      'Alcoholic beverages and special meals',
    ],
    terms: 'Valid for 14 days from issue. 50% advance required upon confirmation.',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Fetch Quotations & Stats
  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getQuotations({
        search: searchQuery,
        status: activeStatus,
      });
      if (res?.data) {
        setQuotations(res.data.quotations || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load quotations:', err);
      showToast(err.message || 'Error fetching quotations');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuotations();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchQuotations]);

  // Silent auto-refresh every 30 seconds and on window focus
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuotations();
    }, 30000);
    const onFocus = () => fetchQuotations();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchQuotations]);

  // Load Customers & Packages for creation dropdown
  const loadDependencies = async () => {
    try {
      const [custRes, pkgRes] = await Promise.all([
        adminApi.getCustomers({ limit: 100 }),
        adminApi.getPackages({ limit: 100 }),
      ]);
      if (custRes?.data?.customers) setCustomersList(custRes.data.customers);
      if (pkgRes?.data?.packages) setPackagesList(pkgRes.data.packages);
    } catch (e) {
      console.error('Failed to load dependencies', e);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  // Fetch Quotation by ID
  const fetchQuotationDetails = useCallback(async (id) => {
    if (!id) return;
    setIsDetailsLoading(true);
    try {
      const res = await adminApi.getQuotationById(id);
      if (res?.data) {
        setQuotationDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch quotation details:', err);
      showToast('Error loading quotation details');
    } finally {
      setIsDetailsLoading(false);
    }
  }, []);

  const openQuotationInspector = (id) => {
    setSelectedQuotationId(id);
    fetchQuotationDetails(id);
  };

  const closeQuotationInspector = () => {
    setSelectedQuotationId(null);
    setQuotationDetails(null);
  };

  // Status Quick Changer
  const handleStatusChange = async (newStatus) => {
    if (!quotationDetails) return;
    try {
      const res = await adminApi.updateQuotationStatus(quotationDetails.id, newStatus);
      if (res?.data) {
        setQuotationDetails(res.data);
        setQuotations((prev) =>
          prev.map((q) => (q.id === quotationDetails.id ? { ...q, status: newStatus } : q))
        );
        showToast(`Quotation status updated to ${newStatus}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update quotation status');
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    loadDependencies();
    const defaultCust = customersList[0];
    const defaultPkg = packagesList[0];
    setFormData({
      customerId: defaultCust?.id || '',
      packageId: defaultPkg?.id || '',
      title: defaultPkg?.title ? `Exclusive Expedition: ${defaultPkg.title}` : 'Custom Tour Proposal',
      travelDate: nextMonth,
      durationDays: defaultPkg?.durationDays || 7,
      numberOfTravellers: 2,
      basePrice: defaultPkg?.price ? defaultPkg.price * 2 : 50000,
      discountAmount: 0,
      taxPercentage: 5.0,
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'DRAFT',
      inclusions: [
        'Deluxe Heritage Accommodation with Breakfast',
        'Private AC Chauffeur throughout tour',
        'All monument entry tickets & passes',
        'Local English-speaking tour guide',
      ],
      exclusions: [
        'Airfare and train tickets',
        'Personal expenses, laundry, and tips',
        'Alcoholic beverages and special meals',
      ],
      terms: 'Valid for 14 days from issue. 50% advance required upon confirmation.',
    });
    setIsCreateModalOpen(true);
  };

  // Handle Package Selection in Create Form
  const handlePackageChange = (packageId) => {
    const pkg = packagesList.find((p) => p.id === packageId);
    if (pkg) {
      const travellers = parseInt(formData.numberOfTravellers, 10) || 2;
      const base = (pkg.price || 25000) * travellers;
      setFormData((prev) => ({
        ...prev,
        packageId,
        title: `Curated Expedition: ${pkg.title}`,
        durationDays: pkg.durationDays || 7,
        basePrice: base,
      }));
    } else {
      setFormData((prev) => ({ ...prev, packageId }));
    }
  };

  // Submit Create Quotation
  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    if (!formData.customerId) {
      showToast('Please select a customer for this proposal');
      return;
    }
    setIsSubmittingQuotation(true);
    try {
      const res = await adminApi.createQuotation(formData);
      showToast(res.message || 'Quotation created successfully!');
      setIsCreateModalOpen(false);
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Failed to create quotation');
    } finally {
      setIsSubmittingQuotation(false);
    }
  };

  // Convert to Booking
  const openConvertModal = () => {
    if (!quotationDetails) return;
    setConvertAdvance(Math.round(quotationDetails.grandTotal * 0.4));
    setConvertMethod('UPI');
    setConvertTxnRef(`ADV-${Date.now().toString().slice(-6)}`);
    setIsConvertModalOpen(true);
  };

  const handleConvertQuotation = async (e) => {
    e.preventDefault();
    if (!quotationDetails) return;
    setIsSubmittingConvert(true);
    try {
      const res = await adminApi.convertQuotationToBooking(quotationDetails.id, {
        initialAdvance: parseFloat(convertAdvance) || 0,
        paymentMethod: convertMethod,
        transactionReference: convertTxnRef.trim() || null,
      });

      showToast(res.message || 'Quotation converted into confirmed booking!');
      setIsConvertModalOpen(false);
      closeQuotationInspector();
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Failed to convert quotation');
    } finally {
      setIsSubmittingConvert(false);
    }
  };

  // Delete Quotation
  const handleDeleteQuotation = async (qtn, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete quotation "${qtn.quotationNumber}"?`)) return;
    try {
      const res = await adminApi.deleteQuotation(qtn.id);
      showToast(res.message || 'Quotation deleted');
      if (selectedQuotationId === qtn.id) {
        closeQuotationInspector();
      }
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Failed to delete quotation');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'EXPIRED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Live calculations for Create Modal
  const calculatedTaxable = Math.max(0, (formData.basePrice || 0) - (formData.discountAmount || 0));
  const calculatedTax = Math.round(calculatedTaxable * ((formData.taxPercentage || 5) / 100));
  const calculatedTotal = calculatedTaxable + calculatedTax;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl animate-fade-in border border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quotations & Proposals</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#B3452C]/10 text-[#B3452C] font-semibold">
              {stats?.totalQuotations || quotations.length} Proposals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated GST pricing calculations, luxury proposal generation, and direct conversion to bookings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B3452C] hover:bg-[#9a3b25] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Quotation</span>
          </button>
        </div>
      </div>

      {/* Executive Financial Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Proposals</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl font-bold text-slate-900 font-display">
            {stats?.totalQuotations || 0}
          </span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">All Generated</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Drafts</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl font-bold text-slate-700 font-display">
            {stats?.draftCount || 0}
          </span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">In Preparation</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Sent</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-xl font-bold text-blue-600 font-display">
            {stats?.sentCount || 0}
          </span>
          <span className="text-[10px] text-blue-500 block font-medium mt-0.5">Awaiting Client</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-bold text-emerald-700 font-display">
            {stats?.acceptedCount || 0}
          </span>
          <span className="text-[10px] text-emerald-600 block font-medium mt-0.5">Ready to Book</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs col-span-2">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Quoted Value</span>
            <TrendingUp className="w-4 h-4 text-[#B3452C]" />
          </div>
          <span className="text-xl font-bold text-slate-900 font-display">
            ₹{(stats?.totalQuotedValue || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 block font-medium mt-0.5">
            Accepted: ₹{(stats?.acceptedValue || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Proposal # (QTN-...), client name, or tour title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B3452C]/20 focus:border-[#B3452C] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#B3452C]" />
          <p className="text-xs">Loading quotations & proposals...</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Proposals Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No proposals match "${searchQuery}". Try modifying your search query.`
              : 'There are no proposals under this status filter. Draft your first quotation to get started.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B3452C] text-white text-xs font-semibold hover:bg-[#9a3b25] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create Quotation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {quotations.map((qtn) => {
            return (
              <div
                key={qtn.id}
                onClick={() => openQuotationInspector(qtn.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Left Section: Ref, Title, Customer */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-100 border border-orange-200/60 text-[#B3452C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-[#B3452C] transition-colors">
                        {qtn.quotationNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(qtn.status)}`}>
                        {qtn.status}
                      </span>
                      {qtn.bookings?.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          BOOKED: {qtn.bookings[0].bookingNumber}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-800">
                      {qtn.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {qtn.customer?.fullName || 'Client'}
                      </span>
                      {qtn.travelDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(qtn.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span>{qtn.durationDays} Days • {qtn.numberOfTravellers} Travellers</span>
                    </div>
                  </div>
                </div>

                {/* Right Section: Pricing & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left lg:text-right space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                      Grand Total (GST Incl.)
                    </span>
                    <span className="text-base font-bold text-slate-900 block font-display">
                      ₹{qtn.grandTotal.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Base: ₹{qtn.basePrice.toLocaleString()} + 5% GST
                    </span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => openQuotationInspector(qtn.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#B3452C] hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {(!qtn.bookings || qtn.bookings.length === 0) && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteQuotation(qtn, e)}
                        className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Quotation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* QUOTATION INSPECTOR DRAWER                                */}
      {/* ========================================================= */}
      {selectedQuotationId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left">
            <div>
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B3452C] to-amber-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">
                        {quotationDetails?.quotationNumber || 'Quotation Inspector'}
                      </h3>
                      {quotationDetails && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(quotationDetails.status)}`}>
                          {quotationDetails.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Drafted on {quotationDetails ? new Date(quotationDetails.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeQuotationInspector}
                  className="p-2 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Quick Changer Strip */}
              {quotationDetails && (
                <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Proposal State:</span>
                  <div className="flex items-center gap-1.5">
                    {['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(st)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          quotationDetails.status === st
                            ? 'bg-[#B3452C] text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Body */}
              <div className="p-6 space-y-6">
                {isDetailsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mb-2 text-[#B3452C]" />
                    <p className="text-xs">Fetching proposal calculations...</p>
                  </div>
                ) : !quotationDetails ? (
                  <p className="text-xs text-rose-500">Failed to load quotation details.</p>
                ) : (
                  <>
                    {/* Proposal Details Box */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-sm text-slate-900">{quotationDetails.title}</h4>

                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Travel Date</span>
                          <span className="font-semibold text-slate-800">
                            {quotationDetails.travelDate
                              ? new Date(quotationDetails.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                              : 'Open / Flexible'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Duration & Pax</span>
                          <span className="font-semibold text-slate-800">
                            {quotationDetails.durationDays} Days • {quotationDetails.numberOfTravellers} Adults
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Valid Until</span>
                          <span className="font-semibold text-slate-800">
                            {quotationDetails.validUntil
                              ? new Date(quotationDetails.validUntil).toLocaleDateString('en-GB')
                              : '14 days'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Traveler Profile</span>
                          <span className="font-semibold text-slate-800">
                            {quotationDetails.customer?.fullName}
                          </span>
                        </div>
                      </div>

                      {/* WhatsApp Dispatch Button */}
                      {quotationDetails.customer?.phone && (
                        <div className="pt-2">
                          <a
                            href={`https://wa.me/${quotationDetails.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Greetings ${quotationDetails.customer.fullName}! BHROMON has prepared your customized travel proposal (${quotationDetails.quotationNumber}): "${quotationDetails.title}" for ₹${quotationDetails.grandTotal.toLocaleString()} inclusive of 5% GST. Let us know if you would like us to reserve your departure!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Share Proposal via WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Financial & GST Breakdown */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-[#B3452C]" /> Itemized GST Pricing Breakdown
                      </h4>

                      <div className="space-y-2 text-xs divide-y divide-slate-100">
                        <div className="flex justify-between py-1 text-slate-600">
                          <span>Base Expedition Tariff</span>
                          <strong className="text-slate-900">₹{quotationDetails.basePrice.toLocaleString()}</strong>
                        </div>

                        {quotationDetails.discountAmount > 0 && (
                          <div className="flex justify-between py-1 text-emerald-700">
                            <span>Promotional Discount</span>
                            <strong>-₹{quotationDetails.discountAmount.toLocaleString()}</strong>
                          </div>
                        )}

                        <div className="flex justify-between py-1 text-slate-600">
                          <span>Taxable Value</span>
                          <strong className="text-slate-900">
                            ₹{(quotationDetails.basePrice - quotationDetails.discountAmount).toLocaleString()}
                          </strong>
                        </div>

                        <div className="flex justify-between py-1 text-slate-600">
                          <span>Tour Operator GST ({quotationDetails.taxPercentage}%)</span>
                          <strong className="text-slate-900">₹{quotationDetails.taxAmount.toLocaleString()}</strong>
                        </div>

                        <div className="flex justify-between pt-2 text-sm font-bold text-slate-900 bg-amber-50/60 p-2.5 rounded-xl">
                          <span>Grand Total (Payable)</span>
                          <span className="text-[#B3452C] font-display text-base">
                            ₹{quotationDetails.grandTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Convert to Booking CTA */}
                    {quotationDetails.bookings?.length === 0 ? (
                      <button
                        type="button"
                        onClick={openConvertModal}
                        className="w-full py-3 rounded-xl bg-[#B3452C] hover:bg-[#9a3b25] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Convert Proposal to Confirmed Booking</span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                        <span>This proposal is linked to confirmed booking:</span>
                        <strong className="font-mono">{quotationDetails.bookings[0].bookingNumber}</strong>
                      </div>
                    )}

                    {/* Inclusions & Exclusions */}
                    <div className="space-y-4">
                      {Array.isArray(quotationDetails.inclusions) && quotationDetails.inclusions.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Inclusions</h4>
                          <div className="space-y-1">
                            {quotationDetails.inclusions.map((inc, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{inc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {Array.isArray(quotationDetails.exclusions) && quotationDetails.exclusions.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">Exclusions</h4>
                          <div className="space-y-1">
                            {quotationDetails.exclusions.map((exc, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{exc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {(!quotationDetails?.bookings || quotationDetails.bookings.length === 0) && (
                <button
                  type="button"
                  onClick={() => handleDeleteQuotation(quotationDetails)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Proposal
                </button>
              )}

              <button
                type="button"
                onClick={closeQuotationInspector}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer ml-auto"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONVERT TO BOOKING MODAL                                  */}
      {/* ========================================================= */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Convert to Confirmed Booking</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConvertQuotation} className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Proposal Reference:</span>
                  <strong className="font-mono text-slate-900">{quotationDetails?.quotationNumber}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Payable:</span>
                  <strong className="font-bold text-slate-900">₹{quotationDetails?.grandTotal?.toLocaleString()}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Initial Advance Collected (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={convertAdvance}
                  onChange={(e) => setConvertAdvance(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#B3452C]"
                />
              </div>

              {parseFloat(convertAdvance) > 0 && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Payment Mode</label>
                    <select
                      value={convertMethod}
                      onChange={(e) => setConvertMethod(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="UPI">UPI</option>
                      <option value="NEFT">NEFT / RTGS</option>
                      <option value="CARD">Credit / Debit Card</option>
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Transaction Reference / UTR</label>
                    <input
                      type="text"
                      value={convertTxnRef}
                      onChange={(e) => setConvertTxnRef(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingConvert}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmittingConvert ? 'Converting...' : 'Confirm & Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CREATE NEW QUOTATION MODAL                                */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#B3452C]" />
                <h3 className="font-bold text-base text-slate-900">Draft New Tour Proposal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-5 space-y-4">
              {/* Select Customer */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Select Customer / Client *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Choose Traveler from CRM Directory --</option>
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone} - {c.city || 'India'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Package */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tour Package Base</label>
                <select
                  value={formData.packageId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Custom Tailored Itinerary --</option>
                  {packagesList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (₹{p.price?.toLocaleString()} - {p.durationText})
                    </option>
                  ))}
                </select>
              </div>

              {/* Proposal Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Proposal Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>

              {/* Travel Date & Pax */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Travel Date</label>
                  <input
                    type="date"
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value, 10) || 1 })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Travellers Pax</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfTravellers}
                    onChange={(e) => setFormData({ ...formData, numberOfTravellers: parseInt(e.target.value, 10) || 1 })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Pricing Builder with GST */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-[#B3452C]" /> Automated GST Pricing Calculator
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Base Tariff (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Discount Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Taxable Base:</span>
                    <strong>₹{calculatedTaxable.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>5% Tour Operator GST:</span>
                    <strong>₹{calculatedTax.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="text-[#B3452C] font-display text-base">₹{calculatedTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuotation}
                  className="px-5 py-2 rounded-xl bg-[#B3452C] hover:bg-[#9a3b25] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmittingQuotation ? 'Drafting...' : 'Save Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
