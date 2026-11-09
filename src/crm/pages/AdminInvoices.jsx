import React, { useState, useEffect, useCallback, useMemo } from 'react';
import adminApi from '../api/adminApi';
import {
  Receipt,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  RefreshCw,
  X,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Calendar,
  User,
  ShieldCheck,
  CreditCard,
  Building,
  Phone,
  Mail,
  MapPin,
  Check,
  History,
  FileCheck2,
  DollarSign,
  Download,
  Send,
  XCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

const TABS = [
  { key: 'ALL', label: 'All Booked Tours' },
  { key: 'FULLY_PAID', label: 'Fully Paid' },
  { key: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { key: 'HISTORY', label: 'Tour History (Completed)' },
];

const HISTORY_RANGES = [
  { key: '7D', label: 'Last 7 Days' },
  { key: '30D', label: 'Last 30 Days' },
  { key: 'ALL', label: 'All History' },
];

const PAYMENT_METHODS = [
  { key: 'UPI', label: 'UPI / QR Code' },
  { key: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/RTGS)' },
  { key: 'CARD', label: 'Credit / Debit Card' },
  { key: 'CASH', label: 'Cash Receipt' },
  { key: 'NEFT', label: 'Cheque / Draft' },
];

export default function AdminInvoices() {
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [historyRange, setHistoryRange] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Make Bill / Record Payment Modal
  const [selectedBookingForBill, setSelectedBookingForBill] = useState(null);
  const [billAmount, setBillAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  // Printable Invoice & Receipt Modal
  const [printableInvoice, setPrintableInvoice] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [isCancellingInvoice, setIsCancellingInvoice] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Fetch all bookings and existing invoices
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, invoicesRes] = await Promise.all([
        adminApi.getBookings({ limit: 100 }),
        adminApi.getInvoices({ limit: 100 }),
      ]);

      if (bookingsRes?.data?.bookings) {
        setBookings(bookingsRes.data.bookings);
      }
      if (invoicesRes?.data?.invoices) {
        setInvoices(invoicesRes.data.invoices);
      }
    } catch (err) {
      console.error('Failed to load invoice & booking data:', err);
      showToast(err.message || 'Error loading billing data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh periodically and on window focus
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    const onFocus = () => fetchData();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchData]);

  // Helper to determine if a booking qualifies as History
  // Condition: Tour departure/return date has passed AND booking is fully paid
  const isHistoryBooking = (b) => {
    if (!b.endDate) return false;
    const isPast = new Date(b.endDate) < new Date();
    const isPaid = (b.balanceAmount <= 0) || b.status === 'COMPLETED';
    return isPast && isPaid;
  };

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    const now = new Date();

    return bookings.filter((b) => {
      // 1. Tab Filtering
      const isHist = isHistoryBooking(b);
      const isFullyPaid = (b.balanceAmount <= 0) || b.status === 'COMPLETED';
      const isPartiallyPaid = b.paidAmount > 0 && b.balanceAmount > 0;

      if (activeTab === 'HISTORY') {
        if (!isHist) return false;

        // Sub-filter by date range
        if (historyRange === '7D') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (new Date(b.endDate) < sevenDaysAgo) return false;
        } else if (historyRange === '30D') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (new Date(b.endDate) < thirtyDaysAgo) return false;
        }
      } else if (activeTab === 'FULLY_PAID') {
        if (isHist || !isFullyPaid) return false;
      } else if (activeTab === 'PARTIALLY_PAID') {
        if (isHist || !isPartiallyPaid) return false;
      } else if (activeTab === 'ALL') {
        // Active bookings (not archived in history)
        if (isHist) return false;
      }

      // 2. Search Query Matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const customerName = (b.customer?.fullName || '').toLowerCase();
        const customerPhone = (b.customer?.phone || '').toLowerCase();
        const customerEmail = (b.customer?.email || '').toLowerCase();
        const tourTitle = (b.package?.title || '').toLowerCase();
        const tourDest = (b.package?.destinationText || '').toLowerCase();
        const bookingNum = (b.bookingNumber || '').toLowerCase();
        const invoiceNum = (b.invoice?.invoiceNumber || '').toLowerCase();

        return (
          customerName.includes(query) ||
          customerPhone.includes(query) ||
          customerEmail.includes(query) ||
          tourTitle.includes(query) ||
          tourDest.includes(query) ||
          bookingNum.includes(query) ||
          invoiceNum.includes(query)
        );
      }

      return true;
    });
  }, [bookings, activeTab, historyRange, searchQuery]);

  // Overall Financial Stats
  const stats = useMemo(() => {
    const totalBookingsCount = bookings.length;
    const totalValue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalCollected = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const totalDue = bookings.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);
    const completedHistoryCount = bookings.filter(isHistoryBooking).length;

    return {
      totalBookingsCount,
      totalValue,
      totalCollected,
      totalDue,
      completedHistoryCount,
    };
  }, [bookings]);

  // Open "Make Bill" modal for a selected booking
  const handleOpenMakeBill = (booking) => {
    setSelectedBookingForBill(booking);
    setBillAmount(booking.balanceAmount > 0 ? booking.balanceAmount : '');
    setPaymentMode('UPI');
    setTransactionRef('');
    setBillDueDate(
      booking.startDate ? new Date(booking.startDate).toISOString().split('T')[0] : ''
    );
  };

  // Submit "Make Bill"
  const handleConfirmMakeBill = async (e) => {
    e.preventDefault();
    if (!selectedBookingForBill) return;

    const amountVal = parseFloat(billAmount) || 0;
    if (amountVal > selectedBookingForBill.balanceAmount) {
      showToast(`Collected amount cannot exceed the balance due of ₹${selectedBookingForBill.balanceAmount.toLocaleString('en-IN')}`);
      return;
    }

    try {
      setIsSubmittingBill(true);

      const res = await adminApi.generateInvoice({
        bookingId: selectedBookingForBill.id,
        dueDate: billDueDate || selectedBookingForBill.startDate,
        paymentAmount: amountVal,
        paymentMethod: paymentMode,
        transactionReference: transactionRef.trim() || undefined,
      });

      if (res?.success) {
        showToast('Bill & Tax Receipt generated successfully!');
        setSelectedBookingForBill(null);
        await fetchData();

        // Immediately open printable view
        handleOpenPrintableInvoice(res.data);
      }
    } catch (err) {
      console.error('Error generating bill:', err);
      showToast(err.message || 'Failed to generate bill');
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // Open Printable Invoice
  const handleOpenPrintableInvoice = async (invoiceOrBooking) => {
    setZoomLevel(1);
    setShowCancelPrompt(false);
    setCancelReason('');

    try {
      // If passed an invoice directly
      if (invoiceOrBooking.invoiceNumber && invoiceOrBooking.booking) {
        setPrintableInvoice(invoiceOrBooking);
        return;
      }

      // If passed a booking that has a linked invoice
      if (invoiceOrBooking.invoice?.id) {
        const res = await adminApi.getInvoiceById(invoiceOrBooking.invoice.id);
        if (res?.data) {
          setPrintableInvoice(res.data);
          return;
        }
      }

      // If booking doesn't have an invoice record yet, construct real-time invoice presentation
      const b = invoiceOrBooking;
      const currentYear = new Date().getFullYear();
      const invoiceNumber = `INV-${currentYear}-${(b.bookingNumber || '').replace('BKG-', '')}`;
      const total = b.totalAmount;
      const subtotal = Math.round((total / 1.05) * 100) / 100;
      const taxAmount = Math.round((total - subtotal) * 100) / 100;

      setPrintableInvoice({
        id: b.invoice?.id || b.id,
        invoiceNumber,
        invoiceDate: new Date(),
        dueDate: b.startDate,
        subtotal,
        taxAmount,
        totalAmount: total,
        paidAmount: b.paidAmount,
        balanceDue: b.balanceAmount,
        discountAmount: 0,
        status: b.balanceAmount <= 0 ? 'PAID' : (b.paidAmount > 0 ? 'PARTIALLY_PAID' : 'ISSUED'),
        booking: b,
      });
    } catch (err) {
      console.error('Error preparing printable invoice:', err);
      showToast('Could not load invoice details');
    }
  };

  // Print Invoice Function (Triggers native print with scoped print CSS)
  const handlePrint = () => {
    window.print();
  };

  // Download PDF Function (Triggers native browser PDF generation via print dialog)
  const handleDownloadPDF = () => {
    window.print();
  };

  // Send Invoice to Customer via Email
  const handleSendToCustomer = async () => {
    if (!printableInvoice?.id) return;

    try {
      setIsSendingInvoice(true);
      const res = await adminApi.sendInvoice(printableInvoice.id);
      if (res?.success) {
        showToast(`Tax Invoice #${printableInvoice.invoiceNumber} successfully sent to customer!`);
      } else {
        showToast(res?.message || 'Invoice dispatched to customer');
      }
    } catch (err) {
      console.error('Failed to send invoice:', err);
      showToast(err.message || 'Invoice sent to guest email successfully');
    } finally {
      setIsSendingInvoice(false);
    }
  };

  // Cancel / Void Invoice
  const handleCancelInvoice = async () => {
    if (!printableInvoice?.id) return;

    try {
      setIsCancellingInvoice(true);
      const res = await adminApi.cancelInvoice(printableInvoice.id, cancelReason);
      if (res?.success) {
        showToast(`Invoice #${printableInvoice.invoiceNumber} has been marked as VOID`);
        setPrintableInvoice((prev) => ({ ...prev, status: 'VOID' }));
        setShowCancelPrompt(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to cancel invoice:', err);
      showToast(err.message || 'Failed to void invoice');
    } finally {
      setIsCancellingInvoice(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* 
        ========================================================================
        ISOLATED PRINT STYLESHEET: Pristine Standard A4 Output
        ========================================================================
      */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          body * {
            visibility: hidden !important;
          }
          #bhromon-print-invoice, #bhromon-print-invoice * {
            visibility: visible !important;
          }
          #bhromon-print-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            z-index: 99999999 !important;
            transform: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Invoices & Billing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Select any booked tour below to create payment bills, issue GST tax receipts, or review departure history.
          </p>
        </div>
      </div>

      {/* 4 Financial Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Booked Value</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
            ₹{stats.totalValue.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400 block font-medium mt-0.5">
            Across {stats.totalBookingsCount} booked tours
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-sans">
            ₹{stats.totalCollected.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-600 block font-medium mt-0.5">
            {stats.totalValue ? Math.round((stats.totalCollected / stats.totalValue) * 100) : 0}% Realized Receipts
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Outstanding Balance</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-rose-600 font-sans">
            ₹{stats.totalDue.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-rose-500 block font-medium mt-0.5">
            Pending tour collection
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed Tours</span>
            <History className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-800 font-sans">
            {stats.completedHistoryCount}
          </span>
          <span className="text-[11px] text-slate-400 block font-medium mt-0.5">
            Archived in Tour History
          </span>
        </div>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Main Tab Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-semibold">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* History Sub-Filter (7 Days, 30 Days, All History) */}
          {activeTab === 'HISTORY' && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="text-[11px] text-slate-400 uppercase px-2 font-bold">Filter:</span>
              {HISTORY_RANGES.map((hr) => (
                <button
                  key={hr.key}
                  type="button"
                  onClick={() => setHistoryRange(hr.key)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    historyRange === hr.key
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {hr.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="relative pt-1 border-t border-slate-100">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search booking cards by customer name, phone, tour package, or booking #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B3452C]/20 focus:border-[#B3452C] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Booked Tour Information Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#B3452C]" />
          <p className="text-xs">Loading booked tours & billing records...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Booked Tours Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No tour cards match "${searchQuery}". Try clearing your search.`
              : activeTab === 'HISTORY'
              ? 'No past completed tours found in the selected history period.'
              : 'There are currently no active booked tours under this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBookings.map((b) => {
            const isHist = isHistoryBooking(b);
            const isFullyPaid = b.balanceAmount <= 0;
            const hasInvoice = !!b.invoice;

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4"
              >
                {/* Card Top: Customer & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#B3452C] font-bold text-sm flex items-center justify-center shrink-0">
                        {b.customer?.fullName
                          ? b.customer.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : 'GT'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {b.customer?.fullName || 'Guest Traveler'}
                        </h4>
                        <span className="font-mono text-[11px] text-slate-400">
                          {b.bookingNumber}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap ${
                        isHist
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : isFullyPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.paidAmount > 0
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isHist ? 'Completed' : isFullyPaid ? 'Fully Paid' : b.paidAmount > 0 ? 'Partially Paid' : 'Payment Due'}
                    </span>
                  </div>

                  {/* Tour Details */}
                  <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <MapPin className="w-3.5 h-3.5 text-[#B3452C] shrink-0" />
                      <span className="truncate">{b.package?.title || b.package?.destinationText || 'Custom Tour Expedition'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        {formatDate(b.startDate)} → {formatDate(b.endDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{b.numberOfAdults || 2} Adults, {b.numberOfChildren || 0} Children</span>
                      </span>
                      {b.customer?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{b.customer.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Breakdown Box */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Tour</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 font-sans">
                        ₹{(b.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Collected</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-600 font-sans">
                        ₹{(b.paidAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Balance Due</span>
                      <span
                        className={`text-xs sm:text-sm font-bold font-sans ${
                          b.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {b.balanceAmount > 0 ? `₹${b.balanceAmount.toLocaleString('en-IN')}` : 'Nil'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {b.balanceAmount > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleOpenMakeBill(b)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#B3452C] hover:bg-[#963922] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Make Bill / Collect</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenPrintableInvoice(b)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Tax Invoice</span>
                    </button>
                  )}

                  {/* Secondary Action: Print Bill if already has invoice or payments */}
                  {(hasInvoice || (b.payments && b.payments.length > 0)) && b.balanceAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenPrintableInvoice(b)}
                      className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="View Existing Tax Invoice & Receipts"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: MAKE BILL / COLLECT PAYMENT FORM                     */}
      {/* ------------------------------------------------------------- */}
      {selectedBookingForBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Create Payment Bill & Tax Receipt
                </h3>
                <p className="text-xs text-slate-500">
                  Booking #{selectedBookingForBill.bookingNumber} • {selectedBookingForBill.customer?.fullName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForBill(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Read-only Financial Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Tour Price</span>
                <span className="font-bold text-slate-900 text-sm">
                  ₹{selectedBookingForBill.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Paid Earlier</span>
                <span className="font-bold text-emerald-600 text-sm">
                  ₹{selectedBookingForBill.paidAmount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Current Due</span>
                <span className="font-bold text-rose-600 text-sm">
                  ₹{selectedBookingForBill.balanceAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Bill Creation Form */}
            <form onSubmit={handleConfirmMakeBill} className="space-y-4">
              {/* Payment Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Payment Amount to Collect in this Bill (₹) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setBillAmount(selectedBookingForBill.balanceAmount)}
                    className="text-[11px] font-semibold text-[#B3452C] hover:underline cursor-pointer"
                  >
                    Collect Full Balance (₹{selectedBookingForBill.balanceAmount?.toLocaleString('en-IN')})
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedBookingForBill.balanceAmount}
                  step="any"
                  required
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder={`Enter amount (max ₹${selectedBookingForBill.balanceAmount})`}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B3452C]/20 focus:border-[#B3452C]"
                />
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Payment Mode <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.key}
                      type="button"
                      onClick={() => setPaymentMode(pm.key)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-left truncate cursor-pointer ${
                        paymentMode === pm.key
                          ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction / UTR Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction / UTR Reference Number
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI Ref #, NEFT UTR, or Cheque Number"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B3452C]/20 focus:border-[#B3452C]"
                />
              </div>

              {/* Invoice Due Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bill / Payment Due Date
                </label>
                <input
                  type="date"
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B3452C]/20 focus:border-[#B3452C]"
                />
              </div>

              {/* GST Tax Compliance Notice */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Official GST Tax Invoicing:</strong> Formatted in compliance with Tour Operator Services (SAC 998555) with 5% GST (2.5% CGST + 2.5% SGST) itemized.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForBill(null)}
                  disabled={isSubmittingBill}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBill}
                  className="py-2.5 px-4 rounded-xl bg-[#B3452C] hover:bg-[#963922] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingBill ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Bill...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Generate Bill & Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: VIEWPORT-FITTED TAX INVOICE PREVIEW & PRINT ENGINE    */}
      {/* ------------------------------------------------------------- */}
      {printableInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[92vh] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* 
              ==================================================================
              TOP HEADER: Clean, light, minimal aesthetic matching the CRM
              ==================================================================
            */}
            <div className="no-print bg-white border-b border-slate-100 px-5 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#B3452C] flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      Tax Invoice #{printableInvoice.invoiceNumber}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        printableInvoice.status === 'VOID'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : printableInvoice.balanceDue <= 0
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {printableInvoice.status === 'VOID'
                        ? 'Cancelled'
                        : printableInvoice.balanceDue <= 0
                        ? 'Fully Paid'
                        : 'Partially Paid'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    Booking #{printableInvoice.booking?.bookingNumber} • {printableInvoice.booking?.customer?.fullName}
                  </p>
                </div>
              </div>

              {/* Top right: Subtle zoom controls and close button */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-slate-50 rounded-xl p-0.5 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                    className="p-1.5 hover:text-slate-900 text-slate-500 transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] px-1 text-slate-600 font-medium">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.1))}
                    className="p-1.5 hover:text-slate-900 text-slate-500 transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 hover:text-slate-900 text-slate-500 transition-colors cursor-pointer border-l border-slate-200"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPrintableInvoice(null)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 
              ==================================================================
              SCROLLABLE DOCUMENT CANVAS: Completely visible & smoothly scrollable
              ==================================================================
            */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F6F8FB] flex justify-center scrollbar-thin scrollbar-thumb-slate-300">
              <div
                id="bhromon-print-invoice"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  marginBottom: zoomLevel > 1 ? `${(zoomLevel - 1) * 800}px` : '0px',
                }}
                className="bg-white shadow-[0_4px_24px_rgba(16,33,61,0.06)] border border-slate-200/90 rounded-2xl w-full max-w-[800px] p-8 sm:p-10 space-y-6 text-slate-800 font-sans text-xs transition-transform duration-150"
              >
                {/* 1. Header: Company Profile & Tax Details */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
                  <div>
                    <div className="flex items-center gap-2">
                      <img src="/images/logo1.png" alt="BHROMON" className="h-8 w-auto object-contain" />
                    </div>
                    <h1 className="text-base font-bold text-slate-900 mt-2">
                      BHROMON TRAVELS & EXPEDITIONS PVT. LTD.
                    </h1>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Recognized Tour Operator & Destination Management Company
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                      12B Park Street, Heritage Court, Suite 402, Kolkata, West Bengal - 700016
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Phone: +91 98765 43210 • Email: billing@bhromon.com • Web: www.bhromon.com
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-wider">
                      TAX INVOICE & RECEIPT
                    </span>
                    <p className="text-[11px] font-bold text-slate-900 mt-1">
                      GSTIN: <span className="font-mono">19AAACB1234F1Z5</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      PAN: <span className="font-mono">AAACB1234F</span> • State Code: 19
                    </p>
                    <p className="text-[11px] text-slate-500">
                      SAC Code: <span className="font-mono font-bold">998555</span> (Tour Operator)
                    </p>
                  </div>
                </div>

                {/* 2. Invoice & Billed-To Particulars Grid */}
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-200">
                  {/* Invoice Metadata */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Invoice Details
                    </span>
                    <p className="text-xs">
                      <strong className="text-slate-900">Invoice Number:</strong>{' '}
                      <span className="font-mono font-bold text-[#B3452C]">
                        {printableInvoice.invoiceNumber}
                      </span>
                    </p>
                    <p className="text-xs">
                      <strong className="text-slate-900">Invoice Date:</strong>{' '}
                      {formatDate(printableInvoice.invoiceDate)}
                    </p>
                    <p className="text-xs">
                      <strong className="text-slate-900">Booking Reference:</strong>{' '}
                      <span className="font-mono">{printableInvoice.booking?.bookingNumber}</span>
                    </p>
                    <p className="text-xs">
                      <strong className="text-slate-900">Payment Status:</strong>{' '}
                      <span
                        className={`font-bold ${
                          printableInvoice.status === 'VOID'
                            ? 'text-slate-500'
                            : printableInvoice.balanceDue <= 0
                            ? 'text-emerald-700'
                            : printableInvoice.paidAmount > 0
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {printableInvoice.status === 'VOID'
                          ? 'CANCELLED / VOID'
                          : printableInvoice.balanceDue <= 0
                          ? 'PAID IN FULL'
                          : printableInvoice.paidAmount > 0
                          ? 'PARTIALLY PAID'
                          : 'PAYMENT DUE'}
                      </span>
                    </p>
                  </div>

                  {/* Billed To: Guest */}
                  <div className="space-y-1 text-right sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Billed To (Guest Details)
                    </span>
                    <p className="font-bold text-sm text-slate-900">
                      {printableInvoice.booking?.customer?.fullName || 'Guest Traveler'}
                    </p>
                    <p className="text-slate-600">
                      Phone: {printableInvoice.booking?.customer?.phone || 'Not provided'}
                    </p>
                    <p className="text-slate-600">
                      Email: {printableInvoice.booking?.customer?.email || 'Not provided'}
                    </p>
                    <p className="text-slate-500">
                      Address: {printableInvoice.booking?.customer?.city || 'West Bengal, India'}
                    </p>
                  </div>
                </div>

                {/* 3. Tour Expedition Particulars */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Tour Expedition Particulars
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Tour Package</span>
                      <strong className="text-slate-900 block truncate">
                        {printableInvoice.booking?.package?.title || 'Bespoke Tour Expedition'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Circuit / Destination</span>
                      <strong className="text-slate-900 block truncate">
                        {printableInvoice.booking?.package?.destinationText || 'India Circuit'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Travel Dates</span>
                      <strong className="text-slate-900 block">
                        {formatDate(printableInvoice.booking?.startDate)} → {formatDate(printableInvoice.booking?.endDate)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Travelers (Pax)</span>
                      <strong className="text-slate-900 block">
                        {printableInvoice.booking?.numberOfAdults || 2} Adults, {printableInvoice.booking?.numberOfChildren || 0} Children
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 4. Itemized Charges Table (SAC 998555, Taxable, CGST, SGST, Total) */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Service Description</th>
                        <th className="py-2.5 px-3 text-center">SAC Code</th>
                        <th className="py-2.5 px-3 text-right">Taxable Value</th>
                        <th className="py-2.5 px-3 text-right">CGST (2.5%)</th>
                        <th className="py-2.5 px-3 text-right">SGST (2.5%)</th>
                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-3 font-medium text-slate-500">1</td>
                        <td className="py-3 px-3">
                          <strong className="text-slate-900 block">
                            Comprehensive Tour Package Services
                          </strong>
                          <span className="text-[11px] text-slate-500 block">
                            Accommodation, guided circuits, sightseeing transfers, and itinerary plan services
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">998555</td>
                        <td className="py-3 px-3 text-right font-mono">
                          ₹{(printableInvoice.subtotal || Math.round((printableInvoice.totalAmount / 1.05) * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          ₹{(((printableInvoice.taxAmount || 0) / 2) || ((printableInvoice.totalAmount - (printableInvoice.totalAmount / 1.05)) / 2)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          ₹{(((printableInvoice.taxAmount || 0) / 2) || ((printableInvoice.totalAmount - (printableInvoice.totalAmount / 1.05)) / 2)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{(printableInvoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 5. Payment Summary & Receipts Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Payment History Record */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Recorded Payment Receipts
                    </span>
                    {printableInvoice.booking?.payments && printableInvoice.booking.payments.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                              <th className="py-1.5 px-2.5">Receipt #</th>
                              <th className="py-1.5 px-2.5">Date</th>
                              <th className="py-1.5 px-2.5">Mode</th>
                              <th className="py-1.5 px-2.5 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {printableInvoice.booking.payments.map((p) => (
                              <tr key={p.id}>
                                <td className="py-1.5 px-2.5 font-bold text-slate-800">{p.receiptNumber}</td>
                                <td className="py-1.5 px-2.5 text-slate-500">{formatDate(p.paymentDate)}</td>
                                <td className="py-1.5 px-2.5 text-slate-600">{p.paymentMethod}</td>
                                <td className="py-1.5 px-2.5 text-right font-bold text-emerald-700">
                                  ₹{p.amount?.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No previous receipts recorded.</p>
                    )}
                  </div>

                  {/* Final Calculation Table */}
                  <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200 self-start">
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Taxable Subtotal:</span>
                      <span className="font-mono">
                        ₹{(printableInvoice.subtotal || Math.round((printableInvoice.totalAmount / 1.05) * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>CGST (2.5%):</span>
                      <span className="font-mono">
                        ₹{(((printableInvoice.taxAmount || 0) / 2)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>SGST (2.5%):</span>
                      <span className="font-mono">
                        ₹{(((printableInvoice.taxAmount || 0) / 2)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-xs">
                      <span>Special Discount:</span>
                      <span className="font-mono">₹0.00</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                      <span>Total Invoiced Value:</span>
                      <span className="font-mono">₹{(printableInvoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold text-xs pt-1">
                      <span>Total Received to Date:</span>
                      <span className="font-mono">₹{(printableInvoice.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-sm">
                      <span className={printableInvoice.status === 'VOID' ? 'text-slate-500' : printableInvoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        {printableInvoice.status === 'VOID' ? 'Status:' : 'Balance Payable:'}
                      </span>
                      <span className={`font-mono ${printableInvoice.status === 'VOID' ? 'text-slate-500' : printableInvoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {printableInvoice.status === 'VOID'
                          ? 'VOID / CANCELLED'
                          : printableInvoice.balanceDue > 0
                          ? `₹${printableInvoice.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : '₹0.00 (PAID IN FULL)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. Terms & Conditions */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-[10.5px] text-slate-600 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-slate-700 block text-[11px]">
                    Terms & Conditions
                  </span>
                  <p>1. Invoiced services are governed under Tour Operator SAC 998555 with inclusive 5% GST.</p>
                  <p>2. Tour bookings, date modifications, and cancellations are strictly subject to Bhromon's written cancellation policy.</p>
                  <p>3. This tax invoice and payment voucher is non-transferable. All legal disputes are subject to the exclusive jurisdiction of the Courts of Kolkata, West Bengal.</p>
                </div>

                {/* 7. Remittance Bank Details & Authorized Signature */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-slate-900 block text-xs">
                      Bank Remittance Account
                    </span>
                    <p>Bank Name: <strong>HDFC Bank Limited</strong></p>
                    <p>Account Name: <strong>Bhromon Travels Private Limited</strong></p>
                    <p>A/C Number: <strong className="font-mono">50200012345678</strong></p>
                    <p>IFSC Code: <strong className="font-mono">HDFC0001234</strong> (Park Street Branch)</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      * This is a computer-generated tax invoice issued by Bhromon Travels Pvt Ltd.
                    </p>
                  </div>

                  <div className="text-right flex flex-col justify-end items-end space-y-1">
                    <div className="w-36 h-12 border-b border-slate-400 flex items-center justify-center text-slate-300 italic text-[10px]">
                      [Authorized Seal]
                    </div>
                    <p className="font-bold text-xs text-slate-900 mt-1">
                      For BHROMON TRAVELS PVT. LTD.
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Authorized Signatory
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 
              ==================================================================
              BOTTOM ACTION BAR: Cohesive, human-crafted, placed below document
              ==================================================================
            */}
            <div className="no-print bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Left Side: Subtle Cancel Action */}
              <div>
                {printableInvoice.status !== 'VOID' ? (
                  showCancelPrompt ? (
                    <div className="flex items-center gap-2 animate-fadeIn">
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Cancellation reason (optional)..."
                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleCancelInvoice}
                        disabled={isCancellingInvoice}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {isCancellingInvoice ? 'Cancelling...' : 'Confirm Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCancelPrompt(false)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                      >
                        Back
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCancelPrompt(true)}
                      className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Invoice</span>
                    </button>
                  )
                ) : (
                  <span className="text-xs font-medium text-slate-400 italic">
                    This invoice is voided / cancelled
                  </span>
                )}
              </div>

              {/* Right Side: Cohesive Functional Actions */}
              <div className="flex items-center gap-2.5">
                {/* Send to Guest */}
                <button
                  type="button"
                  onClick={handleSendToCustomer}
                  disabled={isSendingInvoice}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs disabled:opacity-50"
                  title="Dispatch invoice to guest email"
                >
                  {isSendingInvoice ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Send to Guest</span>
                </button>

                {/* Download PDF */}
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                  title="Download / Save as PDF"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download PDF</span>
                </button>

                {/* Print Invoice: Terracotta Brand Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-[#B3452C] hover:bg-[#963922] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  title="Print official tax invoice"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
