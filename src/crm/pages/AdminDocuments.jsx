import React, { useState, useEffect, useMemo, useRef } from 'react';
import adminApi from '../api/adminApi';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileCheck2,
  FileBadge,
  Plane,
  Building,
  CreditCard,
  Receipt,
  File,
  X,
  ExternalLink,
  Calendar,
  User,
  Plus,
  Lock,
} from 'lucide-react';

const DOC_TYPES = [
  { value: 'ALL', label: 'All Documents' },
  { value: 'PASSPORT', label: 'Passport', icon: FileBadge, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'AADHAAR', label: 'Aadhaar / ID', icon: FileCheck2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'VISA', label: 'Visa', icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { value: 'TICKETS', label: 'Flight / Rail Tickets', icon: Plane, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { value: 'HOTEL_VOUCHER', label: 'Hotel Vouchers', icon: Building, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'INSURANCE', label: 'Travel Insurance', icon: Shield, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { value: 'RECEIPT', label: 'Payment Receipts', icon: CreditCard, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { value: 'INVOICE', label: 'Tax Invoices', icon: Receipt, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'OTHER', label: 'Other Documents', icon: File, color: 'text-slate-600 bg-slate-50 border-slate-200' },
];

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    passportsAndIds: 0,
    visasAndTickets: 0,
    vouchersAndInsurance: 0,
    receiptsAndInvoices: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);

  // Upload state
  const [uploadForm, setUploadForm] = useState({
    customerId: '',
    bookingId: '',
    documentType: 'PASSPORT',
    fileName: '',
    fileData: '',
    mimeType: '',
    fileSize: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replace state
  const [replaceForm, setReplaceForm] = useState({
    fileName: '',
    fileData: '',
    mimeType: '',
    fileSize: 0,
  });

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getDocuments({
        type: activeType,
        search: searchQuery,
      });
      if (res?.success) {
        setDocuments(res.data.documents || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load travel documents:', err);
      showToast(err.message || 'Error loading documents');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [custRes, bkgRes] = await Promise.all([
        adminApi.getCustomers({ limit: 100 }).catch(() => null),
        adminApi.getBookings({ limit: 100 }).catch(() => null),
      ]);
      if (custRes?.success && custRes.data?.customers) {
        setCustomers(custRes.data.customers);
      }
      if (bkgRes?.success && bkgRes.data?.bookings) {
        setBookings(bkgRes.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load customers or bookings for selector:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeType]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  // Filtered customer bookings
  const availableBookingsForCustomer = useMemo(() => {
    if (!uploadForm.customerId) return bookings;
    return bookings.filter((b) => b.customerId === uploadForm.customerId);
  }, [bookings, uploadForm.customerId]);

  // Handle file select for upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds the 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileData: reader.result,
        mimeType: file.type || 'application/pdf',
        fileSize: file.size,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submit new document upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.customerId) {
      alert('Please select a customer for this document.');
      return;
    }
    if (!uploadForm.fileName) {
      alert('Please choose a file to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await adminApi.uploadDocument(uploadForm);
      if (res?.success) {
        showToast(`Document "${uploadForm.fileName}" uploaded securely.`);
        setShowUploadModal(false);
        setUploadForm({
          customerId: '',
          bookingId: '',
          documentType: 'PASSPORT',
          fileName: '',
          fileData: '',
          mimeType: '',
          fileSize: 0,
        });
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
      showToast(err.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle replace file
  const handleReplaceChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReplaceForm({
        fileName: file.name,
        fileData: reader.result,
        mimeType: file.type || 'application/pdf',
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!activeDoc?.id || !replaceForm.fileName) return;

    try {
      setIsSubmitting(true);
      const res = await adminApi.replaceDocument(activeDoc.id, replaceForm);
      if (res?.success) {
        showToast(`Document "${activeDoc.fileName}" replaced with new version.`);
        setShowReplaceModal(false);
        setReplaceForm({ fileName: '', fileData: '', mimeType: '', fileSize: 0 });
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to replace document:', err);
      showToast(err.message || 'Replace failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete document
  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${doc.fileName}"? This action is logged for compliance.`)) {
      return;
    }

    try {
      const res = await adminApi.deleteDocument(doc.id);
      if (res?.success) {
        showToast(`Document "${doc.fileName}" deleted.`);
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
      showToast(err.message || 'Delete failed');
    }
  };

  // Handle download
  const handleDownload = (doc) => {
    adminApi.downloadDocument(doc.id, doc.fileName).catch((err) => {
      showToast(err.message || 'Download failed');
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '1 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

  const getTypeBadge = (type) => {
    const item = DOC_TYPES.find((d) => d.value === type) || DOC_TYPES[DOC_TYPES.length - 1];
    const Icon = item.icon || FileText;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${item.color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{item.label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            Travel Documents
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Encrypted repository for guest passports, visas, flight tickets, hotel vouchers, and travel policies.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setUploadForm({
              customerId: customers[0]?.id || '',
              bookingId: '',
              documentType: 'PASSPORT',
              fileName: '',
              fileData: '',
              mimeType: '',
              fileSize: 0,
            });
            setShowUploadModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#B3452C] hover:bg-[#963922] text-white text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-98 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Documents</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.totalDocuments}</span>
          <span className="text-[11px] text-slate-400 block font-medium mt-0.5">In secure vault</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Passports & IDs</span>
            <FileBadge className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.passportsAndIds}</span>
          <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Verified identity docs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Visas & Tickets</span>
            <Plane className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.visasAndTickets}</span>
          <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Boarding & approvals</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vouchers & Policies</span>
            <Building className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.vouchersAndInsurance}</span>
          <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Hotel & insurance</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDocuments()}
              placeholder="Search by customer name, booking ref, or filename..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#B3452C]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDocuments}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {DOC_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setActiveType(t.value)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeType === t.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Security & Access Notice */}
      <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#B3452C]" />
          <span>
            <strong>Access Control:</strong> All customer travel credentials are encrypted and strictly restricted to authorized administrators and tour custodians.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">256-Bit TLS Encrypted</span>
      </div>

      {/* Documents Grid / Table */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading travel documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No Documents Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No travel documents matching "${searchQuery}".`
              : 'No travel documents uploaded in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Badge & Date */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {getTypeBadge(doc.documentType)}
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDate(doc.uploadedAt)}
                  </span>
                </div>

                {/* File Title */}
                <h4
                  className="text-sm font-bold text-slate-900 truncate mb-1"
                  title={doc.fileName}
                >
                  {doc.fileName}
                </h4>

                {/* File Meta */}
                <div className="text-[11px] text-slate-400 font-medium mb-3 flex items-center gap-2">
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>•</span>
                  <span>{doc.mimeType || 'PDF document'}</span>
                </div>

                {/* Customer & Booking Details */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold truncate">{doc.customer?.fullName || 'General Guest'}</span>
                  </div>

                  {doc.booking ? (
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{doc.booking.bookingNumber}</span>
                      {doc.booking.package?.title && (
                        <span className="truncate">({doc.booking.package.title})</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Direct customer profile document
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* View */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDoc(doc);
                      setShowViewModal(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="View preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[11px]">View</span>
                  </button>

                  {/* Download */}
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Download</span>
                  </button>

                  {/* Replace */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDoc(doc);
                      setReplaceForm({ fileName: '', fileData: '', mimeType: '', fileSize: 0 });
                      setShowReplaceModal(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Replace with new file"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Replace</span>
                  </button>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                  title="Delete document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 
        ========================================================================
        UPLOAD DOCUMENT MODAL
        ========================================================================
      */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#B3452C]" />
                <span>Upload Travel Document</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {/* Select Customer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer / Guest Profile *
                </label>
                <select
                  required
                  value={uploadForm.customerId}
                  onChange={(e) => setUploadForm({ ...uploadForm, customerId: e.target.value, bookingId: '' })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#B3452C]"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.email || c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Linked Booking (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Link to Booking (Optional)
                </label>
                <select
                  value={uploadForm.bookingId}
                  onChange={(e) => setUploadForm({ ...uploadForm, bookingId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#B3452C]"
                >
                  <option value="">-- Not tied to a specific booking --</option>
                  {availableBookingsForCustomer.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} - {b.package?.title || 'Tour'} ({formatDate(b.startDate)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#B3452C]"
                >
                  {DOC_TYPES.filter((t) => t.value !== 'ALL').map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload Drop Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document File (PDF, PNG, JPG - max 15MB) *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-[#B3452C]/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadForm.fileName ? (
                    <div className="space-y-1">
                      <FileText className="w-8 h-8 text-[#B3452C] mx-auto" />
                      <p className="text-xs font-bold text-slate-800">{uploadForm.fileName}</p>
                      <p className="text-[11px] text-slate-400">
                        {formatFileSize(uploadForm.fileSize)} • Click to choose a different file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                      <p className="text-xs font-medium text-slate-700">
                        Click or drag file to upload
                      </p>
                      <p className="text-[11px] text-slate-400">PDF, JPG, PNG up to 15MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadForm.fileName}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#B3452C] hover:bg-[#963922] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Save & Upload</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        VIEW DOCUMENT MODAL
        ========================================================================
      */}
      {showViewModal && activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                  {activeDoc.fileName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeDoc.customer?.fullName} • {formatDate(activeDoc.uploadedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Viewer Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-full max-w-lg bg-white rounded-xl shadow-md border border-slate-200/80 p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#B3452C]/10 text-[#B3452C] flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{activeDoc.fileName}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Document Type: <strong>{activeDoc.documentType}</strong>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    File Size: {formatFileSize(activeDoc.fileSize)} • MIME: {activeDoc.mimeType}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-semibold text-slate-800">{activeDoc.customer?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-mono text-slate-700">{activeDoc.customer?.email}</span>
                  </div>
                  {activeDoc.booking && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Booking Ref:</span>
                      <span className="font-mono font-semibold text-[#B3452C]">
                        {activeDoc.booking.bookingNumber}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Encrypted Storage:</span>
                    <span className="text-emerald-600 font-medium">Verified AES-256</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-400">Authenticated Vault Access</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(activeDoc)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#B3452C] hover:bg-[#963922] cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        REPLACE DOCUMENT MODAL
        ========================================================================
      */}
      {showReplaceModal && activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#B3452C]" />
                <span>Replace Document</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowReplaceModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Replacing <strong>"{activeDoc.fileName}"</strong> for {activeDoc.customer?.fullName}. The new file will overwrite the existing file while maintaining the document audit history.
              </p>

              <div
                onClick={() => replaceInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-[#B3452C]/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
              >
                <input
                  ref={replaceInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleReplaceChange}
                  className="hidden"
                />
                {replaceForm.fileName ? (
                  <div className="space-y-1">
                    <FileText className="w-8 h-8 text-[#B3452C] mx-auto" />
                    <p className="text-xs font-bold text-slate-800">{replaceForm.fileName}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatFileSize(replaceForm.fileSize)} • Click to choose a different file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                    <p className="text-xs font-medium text-slate-700">Choose replacement file</p>
                    <p className="text-[11px] text-slate-400">PDF, JPG, PNG</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !replaceForm.fileName}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#B3452C] hover:bg-[#963922] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Replacing...' : 'Replace File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
