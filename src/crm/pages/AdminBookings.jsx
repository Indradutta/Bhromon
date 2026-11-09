import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../api/adminApi';
import {
  CalendarCheck,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Plus,
  IndianRupee,
  Receipt,
  CreditCard,
  X,
  RefreshCw,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  Trash2,
  FileText,
  DollarSign,
  TrendingUp,
  Printer,
  Upload,
  Download,
  Eye,
  FileCheck2,
  FileBadge,
  Plane,
  Building,
  Shield,
  File,
  Users,
  Baby,
  Edit2,
} from 'lucide-react';

const STATUS_FILTERS = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];
const PAYMENT_STATUS_FILTERS = [
  { label: 'All Payments', value: 'ALL' },
  { label: 'Fully Paid', value: 'PAID' },
  { label: 'Partial Due', value: 'PARTIAL' },
  { label: 'Unpaid', value: 'UNPAID' },
];
const PAYMENT_METHODS = ['UPI', 'NEFT', 'CARD', 'CASH', 'BANK_TRANSFER'];

const DOC_TYPES = [
  { value: 'PASSPORT', label: 'Passport', icon: FileBadge, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'AADHAAR', label: 'Aadhaar / ID', icon: FileCheck2, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'VISA', label: 'Visa', icon: FileText, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { value: 'TICKETS', label: 'Flight / Rail Tickets', icon: Plane, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { value: 'HOTEL_VOUCHER', label: 'Hotel Voucher', icon: Building, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'INSURANCE', label: 'Travel Insurance', icon: Shield, color: 'text-teal-700 bg-teal-50 border-teal-200' },
  { value: 'RECEIPT', label: 'Payment Receipt', icon: CreditCard, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { value: 'INVOICE', label: 'Tax Invoice', icon: Receipt, color: 'text-orange-700 bg-orange-50 border-orange-200' },
  { value: 'OTHER', label: 'Other Document', icon: File, color: 'text-slate-700 bg-slate-50 border-slate-200' },
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [activePaymentStatus, setActivePaymentStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Auxiliary data for booking creation
  const [customersList, setCustomersList] = useState([]);
  const [packagesList, setPackagesList] = useState([]);

  // Slide-over Drawer for Booking Inspector
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // Record Payment Modal State
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Create Booking Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Manage Booking Tab Selection: 'manifest' | 'documents' | 'financials' | 'expedition'
  const [inspectorTab, setInspectorTab] = useState('manifest');
  const [manifestGuests, setManifestGuests] = useState([]);
  const [isSavingManifest, setIsSavingManifest] = useState(false);

  // In-Drawer Document Management State
  const [docUploadForm, setDocUploadForm] = useState({
    documentType: 'PASSPORT',
    assignedGuest: 'All Travelers',
    fileName: '',
    fileData: '',
    mimeType: '',
    fileSize: 0,
  });
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [showDocUploadBox, setShowDocUploadBox] = useState(false);
  const docInputRef = useRef(null);

  // Optional Initial Document upload inside Create Booking Modal
  const [initialDocFile, setInitialDocFile] = useState(null);
  const initialDocInputRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [bookingForm, setBookingForm] = useState({
    customerId: '',
    packageId: '',
    startDate: today,
    endDate: nextWeek,
    numberOfAdults: '',
    numberOfChildren: '',
    totalAmount: '',
    paidAmount: '',
    paymentMethod: 'UPI',
    transactionReference: '',
    status: 'CONFIRMED',
    specialRequests: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Check URL query parameter to auto-open create modal when triggered from header
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      openCreateModal();
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch Bookings and Stats
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getBookings({
        search: searchQuery,
        status: activeStatus,
        paymentStatus: activePaymentStatus,
      });
      if (res?.data) {
        setBookings(res.data.bookings || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast(err.message || 'Error fetching bookings');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeStatus, activePaymentStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  // Silent auto-refresh every 30 seconds and on window focus
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings();
    }, 30000);
    const onFocus = () => fetchBookings();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchBookings]);

  useEffect(() => {
    loadDependencies();
  }, []);

  // Load Customers & Packages for the creation dropdowns
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

  // Fetch Booking Details by ID
  const fetchBookingDetails = useCallback(async (id) => {
    if (!id) return;
    setIsDetailsLoading(true);
    try {
      const res = await adminApi.getBookingById(id);
      if (res?.data) {
        setBookingDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch booking details:', err);
      showToast('Error loading booking details');
    } finally {
      setIsDetailsLoading(false);
    }
  }, []);

  const openBookingInspector = (id) => {
    setSelectedBookingId(id);
    fetchBookingDetails(id);
  };

  const closeBookingInspector = () => {
    setSelectedBookingId(null);
    setBookingDetails(null);
  };

  // Quick Status Updater from Drawer
  const handleStatusChange = async (newStatus) => {
    if (!bookingDetails) return;
    try {
      const res = await adminApi.updateBookingStatus(bookingDetails.id, newStatus);
      if (res?.data) {
        setBookingDetails(res.data);
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingDetails.id ? { ...b, status: newStatus } : b))
        );
        showToast(`Booking marked as ${newStatus}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update booking status');
    }
  };

  // Synchronize Guest Manifest when bookingDetails changes
  useEffect(() => {
    if (!bookingDetails) return;

    if (bookingDetails.guestManifest) {
      try {
        const parsed =
          typeof bookingDetails.guestManifest === 'string'
            ? JSON.parse(bookingDetails.guestManifest)
            : bookingDetails.guestManifest;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setManifestGuests(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse existing manifest:', e);
      }
    }

    // Default slots generation based on booking counts
    const slots = [];
    const adultCount = Math.max(1, bookingDetails.numberOfAdults || 1);
    const childCount = Math.max(0, bookingDetails.numberOfChildren || 0);

    for (let i = 0; i < adultCount; i++) {
      slots.push({
        id: `adult_${i + 1}`,
        type: i === 0 ? 'Lead Adult' : 'Adult',
        name: i === 0 ? (bookingDetails.customer?.fullName || '') : '',
        age: i === 0 ? '35' : '',
        gender: i === 0 ? 'Male' : 'Female',
        idNumber: '',
        contact: i === 0 ? (bookingDetails.customer?.phone || '') : '',
      });
    }

    for (let j = 0; j < childCount; j++) {
      slots.push({
        id: `child_${j + 1}`,
        type: 'Child',
        name: '',
        age: '',
        gender: 'Child',
        idNumber: '',
        contact: '',
      });
    }

    setManifestGuests(slots);
  }, [bookingDetails]);

  // Save updated guest party manifest to database
  const handleSaveManifest = async () => {
    if (!bookingDetails) return;
    try {
      setIsSavingManifest(true);
      const adultCount = manifestGuests.filter((g) => g.type.includes('Adult')).length;
      const childCount = manifestGuests.filter((g) => g.type === 'Child').length;

      const res = await adminApi.updateBookingManifest(bookingDetails.id, {
        guestManifest: manifestGuests,
        numberOfAdults: adultCount,
        numberOfChildren: childCount,
      });

      if (res?.success) {
        showToast('Guest party details saved successfully.');
        setBookingDetails((prev) => ({
          ...prev,
          guestManifest: JSON.stringify(manifestGuests),
          numberOfAdults: adultCount,
          numberOfChildren: childCount,
        }));
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingDetails.id
              ? { ...b, numberOfAdults: adultCount, numberOfChildren: childCount }
              : b
          )
        );
      }
    } catch (err) {
      console.error('Failed to update guest manifest:', err);
      showToast(err.message || 'Error updating guest details');
    } finally {
      setIsSavingManifest(false);
    }
  };

  const addAdultGuest = () => {
    setManifestGuests((prev) => [
      ...prev,
      {
        id: `adult_${Date.now()}`,
        type: 'Adult',
        name: '',
        age: '',
        gender: 'Male',
        idNumber: '',
        contact: '',
      },
    ]);
  };

  const addChildGuest = () => {
    setManifestGuests((prev) => [
      ...prev,
      {
        id: `child_${Date.now()}`,
        type: 'Child',
        name: '',
        age: '',
        gender: 'Child',
        idNumber: '',
        contact: '',
      },
    ]);
  };

  const removeGuest = (id) => {
    if (manifestGuests.length <= 1) {
      alert('A tour booking must have at least one lead passenger.');
      return;
    }
    setManifestGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGuestField = (id, field, value) => {
    setManifestGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  // In-Drawer Document Management Handlers
  const handleDocFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds the 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocUploadForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileData: reader.result,
        mimeType: file.type || 'application/pdf',
        fileSize: file.size,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadBookingDoc = async (e) => {
    e.preventDefault();
    if (!bookingDetails?.customerId || !bookingDetails?.id) return;
    if (!docUploadForm.fileName) {
      alert('Please choose a document file to attach.');
      return;
    }

    try {
      setIsUploadingDoc(true);
      const res = await adminApi.uploadDocument({
        customerId: bookingDetails.customerId,
        bookingId: bookingDetails.id,
        documentType: docUploadForm.documentType,
        fileName:
          docUploadForm.assignedGuest && docUploadForm.assignedGuest !== 'All Travelers'
            ? `[${docUploadForm.assignedGuest}] ${docUploadForm.fileName}`
            : docUploadForm.fileName,
        fileData: docUploadForm.fileData,
        mimeType: docUploadForm.mimeType,
        fileSize: docUploadForm.fileSize,
      });

      if (res?.success) {
        showToast(`Document "${docUploadForm.fileName}" attached to this booking.`);
        setDocUploadForm({
          documentType: 'PASSPORT',
          assignedGuest: 'All Travelers',
          fileName: '',
          fileData: '',
          mimeType: '',
          fileSize: 0,
        });
        setShowDocUploadBox(false);
        fetchBookingDetails(bookingDetails.id);
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
      showToast(err.message || 'Failed to upload document');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteBookingDoc = async (docId, fileName) => {
    if (!window.confirm(`Permanently delete "${fileName}" from this booking record?`)) return;
    try {
      const res = await adminApi.deleteDocument(docId);
      if (res?.success) {
        showToast(`Document "${fileName}" deleted.`);
        fetchBookingDetails(bookingDetails.id);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete document');
    }
  };

  const handleDownloadBookingDoc = (docId, fileName) => {
    adminApi.downloadDocument(docId, fileName).catch((err) => {
      showToast(err.message || 'Download failed');
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '1 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle initial document file selection in Create Booking modal
  const handleInitialDocSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds the 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setInitialDocFile({
        documentType: 'PASSPORT',
        fileName: file.name,
        fileData: reader.result,
        mimeType: file.type || 'application/pdf',
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  // Open Create Booking Modal
  const openCreateModal = () => {
    loadDependencies();
    setInitialDocFile(null);
    setBookingForm({
      customerId: customersList[0]?.id || '',
      packageId: packagesList[0]?.id || '',
      startDate: today,
      endDate: nextWeek,
      numberOfAdults: '',
      numberOfChildren: '',
      totalAmount: '',
      paidAmount: '',
      paymentMethod: 'UPI',
      transactionReference: `UPI-TXN-${Date.now().toString().slice(-6)}`,
      status: 'CONFIRMED',
      specialRequests: '',
    });
    setIsCreateModalOpen(true);
  };

  // When package changes in create modal, auto-update price & duration
  const handlePackageChange = (packageId) => {
    const pkg = packagesList.find((p) => p.id === packageId);
    if (pkg) {
      const adults = parseInt(bookingForm.numberOfAdults, 10);
      const total = adults > 0 ? (pkg.price || 25000) * adults : (pkg.price || 25000);
      const start = new Date(bookingForm.startDate || today);
      const end = new Date(start.getTime() + (pkg.durationDays || 5) * 86400000);
      setBookingForm((prev) => ({
        ...prev,
        packageId,
        totalAmount: total,
        endDate: end.toISOString().split('T')[0],
      }));
    } else {
      setBookingForm((prev) => ({ ...prev, packageId }));
    }
  };

  // Submit Create Booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.customerId) {
      showToast('Please select a traveler customer');
      return;
    }
    const adults = parseInt(bookingForm.numberOfAdults, 10);
    if (!adults || adults < 1) {
      showToast('Please enter adults count (at least 1)');
      return;
    }
    const total = parseFloat(bookingForm.totalAmount);
    if (!total || total <= 0) {
      showToast('Please enter a valid positive Total Booking Price');
      return;
    }
    const paid = parseFloat(bookingForm.paidAmount) || 0;
    if (paid < 0) {
      showToast('Initial advance paid cannot be negative');
      return;
    }
    if (paid > total) {
      showToast(
        `Initial advance paid (₹${paid.toLocaleString()}) cannot exceed total booking price (₹${total.toLocaleString()})`
      );
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const payload = {
        ...bookingForm,
        numberOfAdults: adults,
        numberOfChildren: parseInt(bookingForm.numberOfChildren, 10) || 0,
        totalAmount: total,
        paidAmount: paid,
      };

      const res = await adminApi.createBooking(payload);
      const createdBooking = res.data;

      // If an initial travel document was selected during booking creation, upload it now
      if (initialDocFile?.fileData && createdBooking?.id) {
        try {
          await adminApi.uploadDocument({
            customerId: bookingForm.customerId,
            bookingId: createdBooking.id,
            documentType: initialDocFile.documentType || 'PASSPORT',
            fileName: initialDocFile.fileName,
            fileData: initialDocFile.fileData,
            mimeType: initialDocFile.mimeType,
            fileSize: initialDocFile.fileSize,
          });
        } catch (docErr) {
          console.error('Failed to attach initial document:', docErr);
        }
      }

      showToast(res.message || 'Booking created successfully!');
      setIsCreateModalOpen(false);
      setInitialDocFile(null);
      await fetchBookings();

      // Automatically slide open the Manage Booking drawer so admin can manage guests & documents
      if (createdBooking?.id) {
        openBookingInspector(createdBooking.id);
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
      showToast(err.message || 'Failed to create booking');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Open Record Payment Modal
  const openRecordPaymentModal = () => {
    if (!bookingDetails) return;
    setPaymentAmount(bookingDetails.balanceAmount > 0 ? bookingDetails.balanceAmount : '');
    setPaymentMethod('UPI');
    setTransactionRef(`UPI-REC-${Date.now().toString().slice(-6)}`);
    setIsRecordPaymentOpen(true);
  };

  // Submit Record Payment with strict balance verification
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid positive payment amount');
      return;
    }

    if (bookingDetails?.balanceAmount !== undefined && amount > bookingDetails.balanceAmount) {
      showToast(
        `Payment amount (₹${amount.toLocaleString()}) cannot exceed remaining balance of ₹${bookingDetails.balanceAmount.toLocaleString()}`
      );
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await adminApi.recordBookingPayment(bookingDetails.id, {
        amount,
        paymentMethod,
        transactionReference: transactionRef.trim() || null,
      });

      showToast(res.message || 'Payment recorded successfully!');
      setIsRecordPaymentOpen(false);

      // Open official receipt popup
      if (res.data?.payment) {
        setViewingReceipt({
          payment: res.data.payment,
          booking: res.data.booking || bookingDetails,
        });
      }

      // Refresh inspector and main list
      if (res.data?.booking) {
        setBookingDetails(res.data.booking);
      } else {
        fetchBookingDetails(bookingDetails.id);
      }
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to record payment');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (bkg, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete booking "${bkg.bookingNumber}"?`)) return;
    try {
      const res = await adminApi.deleteBooking(bkg.id);
      showToast(res.message || 'Booking deleted');
      if (selectedBookingId === bkg.id) {
        closeBookingInspector();
      }
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to delete booking');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPaymentBadge = (bkg) => {
    if (bkg.balanceAmount <= 0) {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">PAID IN FULL</span>;
    }
    if (bkg.paidAmount > 0) {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">PARTIAL DUE</span>;
    }
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">UNPAID</span>;
  };

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
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bookings & Departures</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#B3452C]/10 text-[#B3452C] font-semibold">
              {stats?.totalBookings || bookings.length} Expeditions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmed tour departures, traveler manifests, automated receipt generation, and balance collections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B3452C] hover:bg-[#9a3b25] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Booking</span>
          </button>
        </div>
      </div>

      {/* Executive Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl font-bold text-slate-900 font-display">
            {stats?.totalBookings || 0}
          </span>
          <span className="text-[10px] text-emerald-600 block font-medium mt-0.5">
            {stats?.confirmedBookings || 0} Confirmed
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-bold text-amber-600 font-display">
            {stats?.pendingBookings || 0}
          </span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Awaiting Action</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl font-bold text-slate-900 font-display">
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Gross Booked</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-bold text-emerald-700 font-display">
            ₹{(stats?.collectedRevenue || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 block font-medium mt-0.5">
            {stats?.totalRevenue ? Math.round((stats.collectedRevenue / stats.totalRevenue) * 100) : 0}% Realized
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs col-span-2">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Outstanding Balance Due</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl font-bold text-rose-600 font-display">
            ₹{(stats?.pendingBalance || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-rose-500 block font-medium mt-0.5">Requires Payment Follow-Up</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Booking # (BKG-...), customer name, phone, or package..."
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

          {/* Payment Status Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-slate-500">Payment:</span>
            <select
              value={activePaymentStatus}
              onChange={(e) => setActivePaymentStatus(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#B3452C]"
            >
              {PAYMENT_STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Departure Status Tabs */}
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

      {/* Bookings Directory List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#B3452C]" />
          <p className="text-xs">Loading bookings and departures...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No bookings match "${searchQuery}". Try modifying your search query.`
              : 'There are no bookings under this status filter. Create a new booking to get started.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B3452C] text-white text-xs font-semibold hover:bg-[#9a3b25] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create Booking
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((bkg) => {
            const startDate = new Date(bkg.startDate);
            const endDate = new Date(bkg.endDate);
            const daysUntil = Math.ceil((startDate - new Date()) / 86400000);

            return (
              <div
                key={bkg.id}
                onClick={() => openBookingInspector(bkg.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Left Section: Ref, Customer, Package & Dates */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-100 border border-blue-200/60 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CalendarCheck className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-[#B3452C] transition-colors">
                        {bkg.bookingNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(bkg.status)}`}>
                        {bkg.status}
                      </span>
                      {getPaymentBadge(bkg)}
                      {daysUntil > 0 && daysUntil <= 14 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Departs in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-800">
                      {bkg.package?.title || 'Bespoke Private Expedition'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {bkg.customer?.fullName || 'Traveler'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} –{' '}
                        {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-slate-400">
                        {bkg.numberOfAdults} Adults {bkg.numberOfChildren > 0 ? `• ${bkg.numberOfChildren} Children` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section: Financials & Action Buttons */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left lg:text-right space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                      Financial Status
                    </span>
                    <span className="text-base font-bold text-slate-900 block font-display">
                      ₹{bkg.totalAmount.toLocaleString()}
                    </span>
                    <div className="text-xs flex items-center lg:justify-end gap-2">
                      <span className="text-emerald-700 font-semibold">
                        Paid: ₹{bkg.paidAmount.toLocaleString()}
                      </span>
                      {bkg.balanceAmount > 0 && (
                        <span className="text-rose-600 font-medium">
                          (Due: ₹{bkg.balanceAmount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => openBookingInspector(bkg.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#B3452C] hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteBooking(bkg, e)}
                      className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Booking"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* BOOKING INSPECTOR SLIDE-OVER DRAWER                       */}
      {/* ========================================================= */}
      {selectedBookingId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left">
            {/* Top Header */}
            <div>
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B3452C] to-amber-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">
                        {bookingDetails?.bookingNumber || 'Booking Inspector'}
                      </h3>
                      {bookingDetails && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(bookingDetails.status)}`}>
                          {bookingDetails.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Created on {bookingDetails ? new Date(bookingDetails.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeBookingInspector}
                  className="p-2 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Quick Updater Strip */}
              {bookingDetails && (
                <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Departure State:</span>
                  <div className="flex items-center gap-1.5">
                    {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(st)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          bookingDetails.status === st
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

              {/* Clean Section Navigation Tabs */}
              {bookingDetails && (
                <div className="px-6 py-2 bg-white border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('manifest')}
                    className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      inspectorTab === 'manifest'
                        ? 'bg-[#B3452C] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Guest Manifest ({manifestGuests.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorTab('documents')}
                    className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      inspectorTab === 'documents'
                        ? 'bg-[#B3452C] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Travel Documents ({bookingDetails.documents?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorTab('financials')}
                    className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      inspectorTab === 'financials'
                        ? 'bg-[#B3452C] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Payments ({bookingDetails.payments?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorTab('expedition')}
                    className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      inspectorTab === 'expedition'
                        ? 'bg-[#B3452C] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Expedition Info</span>
                  </button>
                </div>
              )}

              {/* Drawer Content */}
              <div className="p-6 space-y-6">
                {isDetailsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mb-2 text-[#B3452C]" />
                    <p className="text-xs font-medium">Fetching booking details & manifest...</p>
                  </div>
                ) : !bookingDetails ? (
                  <p className="text-xs text-rose-500">Failed to load booking details.</p>
                ) : (
                  <>
                    {/* ========================================================= */}
                    {/* TAB 1: GUEST MANIFEST (Adults & Children Details)          */}
                    {/* ========================================================= */}
                    {inspectorTab === 'manifest' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-[#B3452C]" />
                              <span>Traveler Manifest & Party Details</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Enter names, ages, and passport/ID numbers for all adults and children in this party.
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={addAdultGuest}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Adult</span>
                            </button>
                            <button
                              type="button"
                              onClick={addChildGuest}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Baby className="w-3.5 h-3.5 text-amber-600" />
                              <span>Child</span>
                            </button>
                          </div>
                        </div>

                        {/* List of Traveler Cards */}
                        <div className="space-y-3">
                          {manifestGuests.map((guest, idx) => (
                            <div
                              key={guest.id || idx}
                              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                    guest.type === 'Lead Adult'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : guest.type === 'Child'
                                      ? 'bg-sky-100 text-sky-900 border border-sky-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {guest.type} #{idx + 1}
                                </span>

                                {guest.type !== 'Lead Adult' && (
                                  <button
                                    type="button"
                                    onClick={() => removeGuest(guest.id)}
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Remove passenger"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Full Name *
                                  </label>
                                  <input
                                    type="text"
                                    value={guest.name || ''}
                                    onChange={(e) => updateGuestField(guest.id, 'name', e.target.value)}
                                    placeholder="Name as on Passport / Aadhaar"
                                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] bg-slate-50/50 focus:bg-white"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                      Age
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="120"
                                      value={guest.age || ''}
                                      onChange={(e) => updateGuestField(guest.id, 'age', e.target.value)}
                                      placeholder="Age"
                                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] bg-slate-50/50 focus:bg-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                      Gender
                                    </label>
                                    <select
                                      value={guest.gender || 'Male'}
                                      onChange={(e) => updateGuestField(guest.id, 'gender', e.target.value)}
                                      className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] bg-white"
                                    >
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Child">Child</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  ID / Passport Number
                                </label>
                                <input
                                  type="text"
                                  value={guest.idNumber || ''}
                                  onChange={(e) => updateGuestField(guest.id, 'idNumber', e.target.value)}
                                  placeholder="e.g. Z1234567 or Aadhaar 1234 5678 9012"
                                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] bg-slate-50/50 focus:bg-white font-mono"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Save Manifest CTA */}
                        <button
                          type="button"
                          onClick={handleSaveManifest}
                          disabled={isSavingManifest}
                          className="w-full py-3 rounded-xl bg-[#B3452C] hover:bg-[#963922] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                        >
                          {isSavingManifest ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving Traveler Details...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Save Guest Party Details</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* TAB 2: TRAVEL DOCUMENTS (Attached to this booking)        */}
                    {/* ========================================================= */}
                    {inspectorTab === 'documents' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <FileCheck2 className="w-4 h-4 text-[#B3452C]" />
                              <span>Booking Travel Documents</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Upload and manage passports, visas, flight tickets, vouchers, and policies for this booking.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowDocUploadBox(!showDocUploadBox)}
                            className="px-3 py-1.5 rounded-xl bg-[#B3452C] hover:bg-[#963922] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{showDocUploadBox ? 'Cancel Upload' : 'Upload Document'}</span>
                          </button>
                        </div>

                        {/* Collapsible Document Upload Box */}
                        {showDocUploadBox && (
                          <form
                            onSubmit={handleUploadBookingDoc}
                            className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3 animate-fadeIn"
                          >
                            <h5 className="text-xs font-bold text-amber-900">
                              Upload Document to {bookingDetails.bookingNumber}
                            </h5>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Document Type *
                                </label>
                                <select
                                  value={docUploadForm.documentType}
                                  onChange={(e) => setDocUploadForm({ ...docUploadForm, documentType: e.target.value })}
                                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                                >
                                  {DOC_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Assign to Passenger
                                </label>
                                <select
                                  value={docUploadForm.assignedGuest}
                                  onChange={(e) => setDocUploadForm({ ...docUploadForm, assignedGuest: e.target.value })}
                                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                                >
                                  <option value="All Travelers">All Travelers (General Booking)</option>
                                  {manifestGuests.map((g, i) => (
                                    <option key={g.id || i} value={g.name || `${g.type} #${i + 1}`}>
                                      {g.name ? `${g.name} (${g.type})` : `${g.type} #${i + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* File Upload Zone */}
                            <div
                              onClick={() => docInputRef.current?.click()}
                              className="border-2 border-dashed border-slate-300 hover:border-[#B3452C] rounded-xl p-4 text-center cursor-pointer transition-colors bg-white"
                            >
                              <input
                                ref={docInputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                onChange={handleDocFileSelect}
                                className="hidden"
                              />
                              {docUploadForm.fileName ? (
                                <div className="space-y-0.5">
                                  <FileText className="w-6 h-6 text-[#B3452C] mx-auto" />
                                  <p className="text-xs font-bold text-slate-800">{docUploadForm.fileName}</p>
                                  <p className="text-[10px] text-slate-400">
                                    {formatFileSize(docUploadForm.fileSize)} • Click to choose different file
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                                  <p className="text-xs font-semibold text-slate-700">Choose document file</p>
                                  <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 15MB</p>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setShowDocUploadBox(false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isUploadingDoc || !docUploadForm.fileName}
                                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#B3452C] hover:bg-[#963922] disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                              >
                                {isUploadingDoc ? 'Uploading...' : 'Save & Attach'}
                              </button>
                            </div>
                          </form>
                        )}

                        {/* List of Attached Documents */}
                        {bookingDetails.documents && bookingDetails.documents.length > 0 ? (
                          <div className="space-y-2.5">
                            {bookingDetails.documents.map((doc) => {
                              const badge = DOC_TYPES.find((d) => d.value === doc.documentType) || DOC_TYPES[0];
                              const BadgeIcon = badge.icon || File;

                              return (
                                <div
                                  key={doc.id}
                                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 group hover:border-slate-300 transition-all"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[#B3452C]">
                                      <BadgeIcon className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-xs font-bold text-slate-900 truncate" title={doc.fileName}>
                                          {doc.fileName}
                                        </h5>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}>
                                          {badge.label}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                        <span>{formatFileSize(doc.fileSize)}</span>
                                        <span>•</span>
                                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setViewingDoc(doc)}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                                      title="View preview"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadBookingDoc(doc.id, doc.fileName)}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                                      title="Download file"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBookingDoc(doc.id, doc.fileName)}
                                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                                      title="Delete document"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
                            <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs font-semibold text-slate-700">No Documents Uploaded</p>
                            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                              No guest passports, tickets, or vouchers attached yet. Click 'Upload Document' above to attach one.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* TAB 3: PAYMENTS & FINANCIALS                              */}
                    {/* ========================================================= */}
                    {inspectorTab === 'financials' && (
                      <div className="space-y-5">
                        {/* Financial Summary & Payment Progress Bar */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Financial Ledger & Balance
                            </h4>
                            {getPaymentBadge(bookingDetails)}
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                              <span>
                                Collected: ₹{bookingDetails.paidAmount.toLocaleString()} (
                                {Math.round((bookingDetails.paidAmount / (bookingDetails.totalAmount || 1)) * 100)}%)
                              </span>
                              <span>Total: ₹{bookingDetails.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 transition-all duration-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round((bookingDetails.paidAmount / (bookingDetails.totalAmount || 1)) * 100)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Financial Metrics Cards */}
                          <div className="grid grid-cols-3 gap-2 pt-2">
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-medium block">Total Price</span>
                              <span className="text-sm font-bold text-slate-900 font-display">
                                ₹{bookingDetails.totalAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-medium block">Collected</span>
                              <span className="text-sm font-bold text-emerald-700 font-display">
                                ₹{bookingDetails.paidAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-medium block">Balance Due</span>
                              <span className="text-sm font-bold text-rose-600 font-display">
                                ₹{bookingDetails.balanceAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Action to Record Payment */}
                          {bookingDetails.balanceAmount > 0 && (
                            <button
                              type="button"
                              onClick={openRecordPaymentModal}
                              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Record Payment & Issue Receipt</span>
                            </button>
                          )}
                        </div>

                        {/* Payment Receipts History */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Issued Payment Receipts ({bookingDetails.payments?.length || 0})
                          </h4>

                          {bookingDetails.payments?.length === 0 ? (
                            <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
                              No payment receipts recorded yet for this booking.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {bookingDetails.payments.map((pmt) => (
                                <div key={pmt.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs shadow-2xs">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-slate-900">{pmt.receiptNumber}</span>
                                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                                        {pmt.paymentMethod}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      {new Date(pmt.paymentDate).toLocaleString()} • {pmt.transactionReference || 'Ref: Direct'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">
                                      ₹{pmt.amount.toLocaleString()}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setViewingReceipt({ payment: pmt, booking: bookingDetails })}
                                      className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10.5px] font-semibold cursor-pointer transition-colors"
                                    >
                                      Receipt ↗
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* TAB 4: EXPEDITION INFO & DEPARTURE                        */}
                    {/* ========================================================= */}
                    {inspectorTab === 'expedition' && (
                      <div className="space-y-4">
                        {/* Customer Profile Box */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#B3452C]" /> Primary Contact & Guest
                          </h4>

                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-sm text-slate-900">{bookingDetails.customer?.fullName}</p>
                              <p className="text-xs text-slate-500">
                                {bookingDetails.customer?.city || 'Location unlisted'}, {bookingDetails.customer?.country}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {bookingDetails.customer?.phone && (
                                <a
                                  href={`https://wa.me/${bookingDetails.customer.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <a
                                href={`mailto:${bookingDetails.customer?.email}`}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                title="Send Email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                            <span>Email: <strong>{bookingDetails.customer?.email}</strong></span>
                            <span>Phone: <strong>{bookingDetails.customer?.phone}</strong></span>
                          </div>
                        </div>

                        {/* Tour Expedition Details */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#B3452C]" /> Expedition Details
                          </h4>

                          <p className="font-bold text-sm text-slate-900">
                            {bookingDetails.package?.title || 'Custom Tour Expedition'}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Departure Date</span>
                              <span className="font-semibold text-slate-800">
                                {new Date(bookingDetails.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Return Date</span>
                              <span className="font-semibold text-slate-800">
                                {new Date(bookingDetails.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Party Headcount</span>
                              <span className="font-semibold text-slate-800">
                                {bookingDetails.numberOfAdults} Adults, {bookingDetails.numberOfChildren} Children
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Duration</span>
                              <span className="font-semibold text-slate-800">
                                {bookingDetails.package?.durationText || 'Standard Itinerary'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Special Requests */}
                        {bookingDetails.specialRequests && (
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Special Manifest Notes</h4>
                            <p className="text-xs text-slate-600 bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl">
                              {bookingDetails.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteBooking(bookingDetails)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Cancel / Remove Booking
              </button>

              <button
                type="button"
                onClick={closeBookingInspector}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RECORD PAYMENT MODAL                                      */}
      {/* ========================================================= */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Record Booking Payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordPaymentOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Booking Reference:</span>
                  <strong className="font-mono text-slate-900">{bookingDetails?.bookingNumber}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Outstanding Balance:</span>
                  <strong className="text-rose-600 font-bold">₹{bookingDetails?.balanceAmount?.toLocaleString()}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Payment Amount (₹) *</label>
                  {bookingDetails?.balanceAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(String(bookingDetails.balanceAmount))}
                      className="text-[10.5px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Fill Full Balance (₹{bookingDetails.balanceAmount.toLocaleString()})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  max={bookingDetails?.balanceAmount || undefined}
                  required
                  placeholder="Enter collected amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
                {parseFloat(paymentAmount) > (bookingDetails?.balanceAmount || 0) && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Cannot collect more than outstanding balance of ₹{(bookingDetails?.balanceAmount || 0).toLocaleString()}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Transaction Reference / UTR</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-123456789 or NEFT Ref"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmittingPayment ? 'Recording...' : 'Generate Receipt & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CREATE NEW BOOKING WIZARD MODAL                           */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#B3452C]" />
                <h3 className="font-bold text-base text-slate-900">Create New Tour Booking</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-5 space-y-4">
              {/* Traveler selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Select Customer / Traveler *</label>
                <select
                  required
                  value={bookingForm.customerId}
                  onChange={(e) => setBookingForm({ ...bookingForm, customerId: e.target.value })}
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

              {/* Tour Package selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tour Package</label>
                <select
                  value={bookingForm.packageId}
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

              {/* Travel Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.startDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Return Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.endDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Passengers Breakdown (Manual inputs without locked default numbers) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Adults Count *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 2"
                    value={bookingForm.numberOfAdults}
                    onChange={(e) => {
                      const val = e.target.value;
                      const pkg = packagesList.find((p) => p.id === bookingForm.packageId);
                      const count = parseInt(val, 10);
                      setBookingForm((prev) => ({
                        ...prev,
                        numberOfAdults: val,
                        totalAmount: count > 0 && pkg?.price ? String(pkg.price * count) : prev.totalAmount,
                      }));
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Children Count</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={bookingForm.numberOfChildren}
                    onChange={(e) => setBookingForm({ ...bookingForm, numberOfChildren: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Financials & Initial Advance with Price >= Advance Validation */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Total Booking Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 70000"
                    value={bookingForm.totalAmount}
                    onChange={(e) => setBookingForm({ ...bookingForm, totalAmount: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Initial Advance Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 20000"
                    value={bookingForm.paidAmount}
                    onChange={(e) => setBookingForm({ ...bookingForm, paidAmount: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                {parseFloat(bookingForm.paidAmount || 0) > parseFloat(bookingForm.totalAmount || 0) && (
                  <div className="col-span-2 text-rose-600 text-xs font-semibold flex items-center gap-1.5 p-2 bg-rose-50 rounded-lg border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Total Booking Price must be greater than or equal to Initial Advance Paid.</span>
                  </div>
                )}

                {bookingForm.paidAmount > 0 && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Payment Mode</label>
                      <select
                        value={bookingForm.paymentMethod}
                        onChange={(e) => setBookingForm({ ...bookingForm, paymentMethod: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Transaction Ref</label>
                      <input
                        type="text"
                        value={bookingForm.transactionReference}
                        onChange={(e) => setBookingForm({ ...bookingForm, transactionReference: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Optional Initial Travel Document Upload */}
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-[#B3452C]" />
                    <span className="text-xs font-bold text-slate-800">Attach Travel Document (Optional)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Passport, ID, or Ticket</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Document Type
                    </label>
                    <select
                      value={initialDocFile?.documentType || 'PASSPORT'}
                      onChange={(e) =>
                        setInitialDocFile((prev) =>
                          prev ? { ...prev, documentType: e.target.value } : { documentType: e.target.value }
                        )
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      {DOC_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      File Selection
                    </label>
                    <input
                      ref={initialDocInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleInitialDocSelect}
                      className="hidden"
                    />
                    {initialDocFile?.fileName ? (
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
                        <span className="truncate font-medium max-w-[150px]" title={initialDocFile.fileName}>
                          {initialDocFile.fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInitialDocFile(null)}
                          className="text-emerald-700 hover:text-rose-600 ml-1"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => initialDocInputRef.current?.click()}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-[#B3452C] bg-white text-slate-600 hover:text-[#B3452C] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose File</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Special Notes & Manifest Requests</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Vegetarian meal on flights, ground floor room request, anniversary greeting..."
                  value={bookingForm.specialRequests}
                  onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>

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
                  disabled={isSubmittingBooking}
                  className="px-5 py-2 rounded-xl bg-[#B3452C] hover:bg-[#9a3b25] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmittingBooking ? 'Finalizing Booking...' : 'Confirm & Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* OFFICIAL PAYMENT RECEIPT POPUP MODAL                      */}
      {/* ========================================================= */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-70 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Official Payment Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 uppercase tracking-tight">BHROMON TRAVELS</h4>
                  <p className="text-slate-500 text-[11px]">GSTIN: 19ABCDE1234F1Z5 • Licensed Tour Operator</p>
                  <p className="text-slate-500 text-[11px]">Kolkata, West Bengal • Support: +91 98765 43210</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-emerald-700 block">
                    {viewingReceipt.payment.receiptNumber}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(viewingReceipt.payment.paymentDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Traveler & Booking Details */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-bold">Received From</span>
                  <span className="font-bold text-slate-900 block text-xs">
                    {viewingReceipt.booking?.customer?.fullName || 'Traveler Guest'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {viewingReceipt.booking?.customer?.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-bold">Booking Details</span>
                  <span className="font-mono font-bold text-slate-900 block text-xs">
                    {viewingReceipt.booking?.bookingNumber}
                  </span>
                  <span className="text-slate-600 text-[11px] truncate block">
                    {viewingReceipt.booking?.package?.title || 'Tour Expedition'}
                  </span>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="space-y-2 border-t border-b border-slate-100 py-3">
                <div className="flex justify-between text-slate-600">
                  <span>Payment Mode</span>
                  <span className="font-semibold text-slate-900">{viewingReceipt.payment.paymentMethod}</span>
                </div>
                {viewingReceipt.payment.transactionReference && (
                  <div className="flex justify-between text-slate-600">
                    <span>Transaction / UTR Ref</span>
                    <span className="font-mono text-slate-800">{viewingReceipt.payment.transactionReference}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-emerald-700 pt-1 border-t border-slate-100">
                  <span>Amount Received</span>
                  <span>₹{viewingReceipt.payment.amount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Remaining Booking Balance</span>
                  <span className="font-bold text-rose-600">
                    ₹{(viewingReceipt.booking?.balanceAmount ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 italic">
                  This is a computer-generated official receipt.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingReceipt(null)}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ATTACHED DOCUMENT PREVIEW MODAL                           */}
      {/* ========================================================= */}
      {viewingDoc && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#B3452C]" />
                <h4 className="font-bold text-sm text-slate-900 truncate max-w-sm">
                  {viewingDoc.fileName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#B3452C]/10 text-[#B3452C] flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900">{viewingDoc.fileName}</h5>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type: <strong>{viewingDoc.documentType}</strong> • Size: {formatFileSize(viewingDoc.fileSize)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Uploaded: {new Date(viewingDoc.uploadedAt).toLocaleString()}
                </p>
              </div>

              <div className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-left text-xs space-y-1.5 shadow-2xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{bookingDetails?.bookingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guest:</span>
                  <span className="font-semibold text-slate-800">{bookingDetails?.customer?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage Security:</span>
                  <span className="text-emerald-600 font-semibold">Encrypted Vault (AES-256)</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadBookingDoc(viewingDoc.id, viewingDoc.fileName)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#B3452C] hover:bg-[#963922] cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
