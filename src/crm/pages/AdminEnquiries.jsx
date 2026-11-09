import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../api/adminApi';
import {
  Inbox,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  User,
  MapPin,
  ChevronRight,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Inquiries' },
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'QUOTED', label: 'Quoted' },
  { key: 'QUALIFIED', label: 'Qualified' },
  { key: 'CONVERTED', label: 'Converted' },
  { key: 'CLOSED_LOST', label: 'Closed / Lost' },
];

export default function AdminEnquiries() {
  const [searchParams] = useSearchParams();
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [deleteConfirmEnquiry, setDeleteConfirmEnquiry] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteEnquiry = async (enquiryId) => {
    try {
      setIsDeleting(true);
      const res = await adminApi.deleteEnquiry(enquiryId);
      if (res?.success) {
        showToast('Inquiry deleted successfully');
        // Notify header to immediately purge notification for this enquiry and avoid phantom notifications
        window.dispatchEvent(new CustomEvent('bhromon_enquiry_deleted', { detail: { id: enquiryId } }));
        setDeleteConfirmEnquiry(null);
        if (selectedEnquiry?.id === enquiryId) {
          setSelectedEnquiry(null);
        }
        fetchEnquiries();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete inquiry');
    } finally {
      setIsDeleting(false);
    }
  };

  // New enquiry form state
  const [newFormData, setNewFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    destination: 'Rajasthan',
    travellersCount: 2,
    adultsCount: 2,
    childrenCount: 0,
    budget: '₹50,000 - ₹1,00,000',
    priority: 'HIGH',
    source: 'PHONE',
    message: '',
  });

  // Follow-up form state inside drawer
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [followUpType, setFollowUpType] = useState('CALL');

  const fetchEnquiries = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await adminApi.getEnquiries(params);
      if (res.success && Array.isArray(res.data?.enquiries)) {
        setEnquiries(res.data.enquiries);

        // If URL had ?id=..., select that enquiry
        const queryId = searchParams.get('id');
        if (queryId) {
          const matched = res.data.enquiries.find((e) => e.id === queryId);
          if (matched) setSelectedEnquiry(matched);
        }
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, searchQuery, searchParams]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Silent auto-refresh every 30 seconds and on window focus
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEnquiries();
    }, 30000);
    const onFocus = () => fetchEnquiries();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchEnquiries]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      const res = await adminApi.updateEnquiryStatus(enquiryId, newStatus);
      if (res.success) {
        showToast(`Lead status updated to ${newStatus}`);
        if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
        fetchEnquiries();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed');
    }
  };

  const handleCreateNewEnquiry = async (e) => {
    e.preventDefault();
    const cleanPhone = newFormData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      showToast('Phone number must be exactly 10 digits (e.g. 9876543210)');
      return;
    }

    try {
      const res = await adminApi.createEnquiry({
        ...newFormData,
        phone: cleanPhone,
      });
      if (res.success) {
        showToast(`Lead ${res.data.enquiryNumber} created successfully!`);
        setIsNewModalOpen(false);
        setNewFormData({
          customerName: '',
          email: '',
          phone: '',
          destination: 'Rajasthan',
          travellersCount: 2,
          adultsCount: 2,
          childrenCount: 0,
          budget: '₹50,000 - ₹1,00,000',
          priority: 'HIGH',
          source: 'PHONE',
          message: '',
        });
        fetchEnquiries();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create enquiry');
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry || !followUpNotes.trim()) return;

    try {
      const res = await adminApi.addFollowUp(selectedEnquiry.id, {
        scheduledAt: new Date(followUpDate).toISOString(),
        type: followUpType,
        notes: followUpNotes.trim(),
      });
      if (res.success) {
        showToast('Follow-up scheduled');
        setFollowUpNotes('');
        // Reload single enquiry details
        const refreshed = await adminApi.getEnquiryById(selectedEnquiry.id);
        if (refreshed.success) setSelectedEnquiry(refreshed.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to schedule follow-up');
    }
  };

  const handleOpenDetail = async (enquiry) => {
    try {
      const res = await adminApi.getEnquiryById(enquiry.id);
      if (res.success) {
        setSelectedEnquiry(res.data);
      } else {
        setSelectedEnquiry(enquiry);
      }
    } catch {
      setSelectedEnquiry(enquiry);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Guest Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Incoming travel inquiries from guests, requests, and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#B3452C] hover:bg-[#963922] text-white shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Inquiry</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Scrollable Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs font-semibold">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, ref..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#B3452C] transition-all"
          />
        </div>
      </div>

      {/* Enquiries Data List */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-400">
          Loading synchronized inquiry records...
        </div>
      ) : enquiries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#B3452C] flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Inquiries Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No inquiry matches the active status filter "{filterStatus}". You can log a manual walk-in or phone inquiry anytime.
          </p>
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#B3452C] text-white cursor-pointer"
          >
            + Create First Lead
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Column: Traveler & Circuit Info */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#B3452C] flex items-center justify-center shrink-0 mt-0.5">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">
                      {enq.customerName || enq.customer?.fullName}
                    </span>
                    <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {enq.enquiryNumber}
                    </span>
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        enq.priority === 'HIGH' || enq.priority === 'URGENT'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}
                    >
                      {enq.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-1 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B3452C]" />
                    <span>{enq.destination || enq.package?.title || 'Custom Tour Expedition'}</span>
                    {enq.package?.title && (
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({enq.package.title})
                      </span>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                    <a
                      href={`tel:${enq.phone || enq.customer?.phone}`}
                      className="flex items-center gap-1 hover:text-[#B3452C] transition-colors"
                    >
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{enq.phone || enq.customer?.phone}</span>
                    </a>
                    <a
                      href={`mailto:${enq.email || enq.customer?.email}`}
                      className="flex items-center gap-1 hover:text-[#B3452C] transition-colors"
                    >
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{enq.email || enq.customer?.email}</span>
                    </a>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{enq.travellersCount || 2} Pax</span>
                    </span>
                    {enq.travelDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Date: {enq.travelDate}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Status & Inspector Actions */}
              <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                {/* Status Dropdown */}
                <select
                  value={enq.status}
                  onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all ${
                    enq.status === 'NEW'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : enq.status === 'CONTACTED'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : enq.status === 'QUOTED'
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : enq.status === 'QUALIFIED'
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : enq.status === 'CONVERTED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <option value="NEW">● NEW</option>
                  <option value="CONTACTED">● CONTACTED</option>
                  <option value="QUOTED">● QUOTED</option>
                  <option value="QUALIFIED">● QUALIFIED</option>
                  <option value="CONVERTED">● CONVERTED</option>
                  <option value="CLOSED_LOST">● CLOSED / LOST</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleOpenDetail(enq)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#B3452C] hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Inspector</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmEnquiry(enq)}
                  className="p-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 text-xs transition-colors cursor-pointer"
                  title="Delete Inquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Modal: Log Inbound Lead Manually                              */}
      {/* ------------------------------------------------------------- */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#B3452C]/10 text-[#B3452C] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Log New Inbound Lead
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewEnquiry} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFormData.customerName}
                  onChange={(e) => setNewFormData({ ...newFormData, customerName: e.target.value })}
                  placeholder="e.g. Vikramaditya Singhania"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newFormData.email}
                    onChange={(e) => setNewFormData({ ...newFormData, email: e.target.value })}
                    placeholder="vikram@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newFormData.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewFormData({ ...newFormData, phone: digits });
                    }}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination / Circuit</label>
                  <input
                    type="text"
                    value={newFormData.destination}
                    onChange={(e) => setNewFormData({ ...newFormData, destination: e.target.value })}
                    placeholder="e.g. Rajasthan, Kerala, Ladakh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Travelers Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newFormData.travellersCount}
                    onChange={(e) => setNewFormData({ ...newFormData, travellersCount: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={newFormData.source}
                    onChange={(e) => setNewFormData({ ...newFormData, source: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                  >
                    <option value="PHONE">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="WALK_IN">Walk-in Office</option>
                    <option value="WEBSITE">Website Form</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newFormData.priority}
                    onChange={(e) => setNewFormData({ ...newFormData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                  >
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Budget</label>
                  <input
                    type="text"
                    value={newFormData.budget}
                    onChange={(e) => setNewFormData({ ...newFormData, budget: e.target.value })}
                    placeholder="₹50,000 - ₹1,00,000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specific Client Desires / Notes</label>
                <textarea
                  rows="3"
                  value={newFormData.message}
                  onChange={(e) => setNewFormData({ ...newFormData, message: e.target.value })}
                  placeholder="e.g. Heritage palace suite, private guide for Udaipur fort..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B3452C] hover:bg-[#963922] text-white font-semibold shadow-xs cursor-pointer"
                >
                  Save Lead Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Slide-over Drawer: Full Enquiry Details & Follow-up Scheduler  */}
      {/* ------------------------------------------------------------- */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
            onClick={() => setSelectedEnquiry(null)}
          />

          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#B3452C] bg-[#B3452C]/10 px-2 py-0.5 rounded">
                    {selectedEnquiry.enquiryNumber}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {selectedEnquiry.status}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {selectedEnquiry.customerName}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmEnquiry(selectedEnquiry)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-colors"
                  title="Delete this inquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700">
              {/* Quick Contact Bar */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone</span>
                  <a href={`tel:${selectedEnquiry.phone}`} className="font-bold text-slate-900 hover:text-[#B3452C]">
                    {selectedEnquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Email</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="font-bold text-slate-900 hover:text-[#B3452C]">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <a
                  href={`https://wa.me/${(selectedEnquiry.phone || '').replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Inquiry Particulars */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Travel Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Destination</span>
                    <strong className="text-slate-800">{selectedEnquiry.destination || 'Custom Circuit'}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Travel Date</span>
                    <strong className="text-slate-800">{selectedEnquiry.travelDate || 'Flexible'}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Group Size</span>
                    <strong className="text-slate-800">{selectedEnquiry.travellersCount || 2} Pax</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Budget Category</span>
                    <strong className="text-slate-800">{selectedEnquiry.budget || 'Custom'}</strong>
                  </div>
                </div>
                {selectedEnquiry.message && (
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 text-slate-700">
                    <span className="text-[10px] font-bold text-amber-900 block mb-0.5">Customer Desires & Notes:</span>
                    <p className="leading-relaxed">{selectedEnquiry.message}</p>
                  </div>
                )}
              </div>

              {/* Workflow Status Progression */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Lead Stage Workflow
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {['NEW', 'CONTACTED', 'QUOTED', 'QUALIFIED', 'CONVERTED', 'CLOSED_LOST'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedEnquiry.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        selectedEnquiry.status === st
                          ? 'bg-[#B3452C] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow-Up Scheduler */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B3452C]" />
                    <span>Schedule Client Follow-Up</span>
                  </h4>
                </div>

                <form onSubmit={handleAddFollowUp} className="space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Scheduled Date</label>
                      <input
                        type="date"
                        required
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Type</label>
                      <select
                        value={followUpType}
                        onChange={(e) => setFollowUpType(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="CALL">Phone Call</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="EMAIL">Email</option>
                        <option value="MEETING">In-Person Meeting</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                      placeholder="e.g. Call to finalize 5-star hotel options in Jaipur..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
                  >
                    + Add to Follow-up Schedule
                  </button>
                </form>

                {/* Existing follow-ups list */}
                {selectedEnquiry.followUps && selectedEnquiry.followUps.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Scheduled Tasks</span>
                    {selectedEnquiry.followUps.map((fu) => (
                      <div key={fu.id} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{fu.type}: </span>
                          <span className="text-slate-600">{fu.notes}</span>
                          <span className="block text-[10px] text-slate-400">
                            Due: {new Date(fu.scheduledAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${fu.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {fu.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Delete Inquiry Action */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmEnquiry(selectedEnquiry)}
                    className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete This Inquiry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Modal: Confirm Delete Inquiry                                 */}
      {/* ------------------------------------------------------------- */}
      {deleteConfirmEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete Inquiry?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete inquiry <span className="font-semibold text-slate-800">{deleteConfirmEnquiry.enquiryNumber}</span> from <span className="font-semibold text-slate-800">{deleteConfirmEnquiry.customerName || 'traveler'}</span>? This cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmEnquiry(null)}
                disabled={isDeleting}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEnquiry(deleteConfirmEnquiry.id)}
                disabled={isDeleting}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
