import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Trash2,
  Edit,
  Tag,
  Shield,
  Send,
  RefreshCw,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const STATUS_FILTERS = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'INACTIVE'];
const SOURCE_OPTIONS = ['WEBSITE', 'WHATSAPP', 'PHONE', 'WALK_IN', 'REFERRAL', 'DIRECT'];

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [activeSource, setActiveSource] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Slide-over Drawer for Customer 360
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState('overview'); // 'overview' | 'bookings' | 'enquiries' | 'timeline'

  // Communication Note in Drawer
  const [commType, setCommType] = useState('CALL_NOTE');
  const [commDirection, setCommDirection] = useState('OUTBOUND');
  const [commContent, setCommContent] = useState('');
  const [isLoggingComm, setIsLoggingComm] = useState(false);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    city: '',
    country: 'India',
    leadStatus: 'NEW',
    source: 'PHONE',
    tags: '',
    notes: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Fetch Customers List
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCustomers({
        search: searchQuery,
        leadStatus: activeStatus,
        source: activeSource,
      });
      if (res?.data?.customers) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      showToast(err.message || 'Error fetching customers');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeStatus, activeSource]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  // Silent auto-refresh every 30 seconds and on window focus
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCustomers();
    }, 30000);
    const onFocus = () => fetchCustomers();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchCustomers]);

  // Fetch Full Customer 360 Profile
  const fetchCustomerProfile = useCallback(async (id) => {
    if (!id) return;
    setIsProfileLoading(true);
    try {
      const res = await adminApi.getCustomerById(id);
      if (res?.data) {
        setCustomerProfile(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      showToast('Error loading customer 360 profile');
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const openCustomerProfile = (id) => {
    setSelectedCustomerId(id);
    setActiveDrawerTab('overview');
    fetchCustomerProfile(id);
  };

  const closeDrawer = () => {
    setSelectedCustomerId(null);
    setCustomerProfile(null);
  };

  // Quick Lead Status Update from Drawer
  const handleStatusChange = async (newStatus) => {
    if (!customerProfile) return;
    try {
      await adminApi.updateCustomer(customerProfile.id, { leadStatus: newStatus });
      setCustomerProfile((prev) => ({ ...prev, leadStatus: newStatus }));
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerProfile.id ? { ...c, leadStatus: newStatus } : c))
      );
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      showToast(err.message || 'Failed to update status');
    }
  };

  // Log Communication Entry
  const handleAddCommunication = async (e) => {
    e.preventDefault();
    if (!commContent.trim() || !customerProfile) return;
    setIsLoggingComm(true);
    try {
      const res = await adminApi.addCustomerCommunication(customerProfile.id, {
        type: commType,
        direction: commDirection,
        content: commContent.trim(),
      });
      if (res?.data) {
        setCustomerProfile((prev) => ({
          ...prev,
          communicationLogs: [res.data, ...(prev.communicationLogs || [])],
        }));
        setCommContent('');
        showToast('Communication note logged');
      }
    } catch (err) {
      showToast(err.message || 'Failed to log note');
    } finally {
      setIsLoggingComm(false);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      city: '',
      country: 'India',
      leadStatus: 'NEW',
      source: 'PHONE',
      tags: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cust, e) => {
    if (e) e.stopPropagation();
    setModalMode('edit');
    setEditingId(cust.id);
    setFormData({
      fullName: cust.fullName || '',
      email: cust.email || '',
      phone: cust.phone || '',
      alternatePhone: cust.alternatePhone || '',
      city: cust.city || '',
      country: cust.country || 'India',
      leadStatus: cust.leadStatus || 'NEW',
      source: cust.source || 'PHONE',
      tags: Array.isArray(cust.tags) ? cust.tags.join(', ') : '',
      notes: cust.notes || '',
    });
    setIsModalOpen(true);
  };

  // Submit Modal (Create or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      showToast('Phone number must be exactly 10 digits (e.g. 9876543210)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: cleanPhone,
        alternatePhone: formData.alternatePhone.trim() || null,
        city: formData.city.trim() || null,
        country: formData.country.trim() || 'India',
        leadStatus: formData.leadStatus,
        source: formData.source,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        notes: formData.notes.trim() || null,
      };

      if (modalMode === 'create') {
        const res = await adminApi.createCustomer(payload);
        showToast(res.message || 'Customer profile created successfully');
      } else {
        const res = await adminApi.updateCustomer(editingId, payload);
        showToast(res.message || 'Customer updated successfully');
        if (selectedCustomerId === editingId) {
          fetchCustomerProfile(editingId);
        }
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error('Submit error:', err);
      showToast(err.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (cust, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete customer "${cust.fullName}"? All associated communications and records will be deleted.`)) return;
    try {
      const res = await adminApi.deleteCustomer(cust.id);
      showToast(res.message || 'Customer profile deleted permanently');
      setCustomers((prev) => prev.filter((c) => c.id !== cust.id));
      if (selectedCustomerId === cust.id) {
        closeDrawer();
      }
      fetchCustomers();
    } catch (err) {
      showToast(err.message || 'Failed to delete customer');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONTACTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'QUALIFIED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CONVERTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INACTIVE':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
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
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Traveler Profiles</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#B3452C]/10 text-[#B3452C] font-semibold">
              {customers.length} Profiles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified directory for passenger profiles, communication history, and lifetime bookings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B3452C] hover:bg-[#9a3b25] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone number, or city..."
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

          {/* Source Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-slate-500">Source:</span>
            <select
              value={activeSource}
              onChange={(e) => setActiveSource(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#B3452C]"
            >
              <option value="ALL">All Sources</option>
              {SOURCE_OPTIONS.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lead Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeStatus === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#B3452C]" />
          <p className="text-xs">Loading customer directory...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Customers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No passenger profiles match "${searchQuery}". Try modifying your search criteria.`
              : 'Start building your traveler database by adding your first client profile.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B3452C] text-white text-xs font-semibold hover:bg-[#9a3b25] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Customer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((cust) => {
            const cleanPhone = cust.phone ? cust.phone.replace(/[^0-9]/g, '') : '';
            return (
              <div
                key={cust.id}
                onClick={() => openCustomerProfile(cust.id)}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Avatar, Name, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-[#B3452C]/20 border border-[#B3452C]/20 flex items-center justify-center font-bold text-[#B3452C] text-sm shrink-0 group-hover:scale-105 transition-transform">
                        {cust.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-[#B3452C] transition-colors">
                          {cust.fullName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{cust.city || 'Location unlisted'}, {cust.country}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadge(
                        cust.leadStatus
                      )}`}
                    >
                      {cust.leadStatus}
                    </span>
                  </div>

                  {/* Contact Badges */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={`mailto:${cust.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="truncate hover:text-[#B3452C]"
                      >
                        {cust.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{cust.phone}</span>
                      </div>

                      {/* Quick Communication Actions */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        )}
                        <a
                          href={`tel:${cust.phone}`}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          title="Call Traveler"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {Array.isArray(cust.tags) && cust.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cust.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {cust.tags.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          +{cust.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Metrics & Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {cust._count?.enquiries || 0} Inquiries
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      {cust._count?.bookings || 0} Bookings
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => openEditModal(cust, e)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomer(cust, e)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete / Archive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openCustomerProfile(cust.id)}
                      className="text-xs font-semibold text-[#B3452C] hover:underline flex items-center pl-1"
                    >
                      View 360 →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* CUSTOMER 360 SLIDE-OVER INSPECTOR DRAWER                  */}
      {/* ========================================================= */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left">
            {/* Top Sticky Header */}
            <div>
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B3452C] to-amber-600 flex items-center justify-center font-bold text-white text-lg shadow-sm">
                    {customerProfile?.fullName ? customerProfile.fullName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">
                        {customerProfile?.fullName || 'Customer Profile'}
                      </h3>
                      {customerProfile && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(customerProfile.leadStatus)}`}>
                          {customerProfile.leadStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Client ID: <span className="font-mono text-slate-700">{selectedCustomerId}</span> • Source: {customerProfile?.source || 'PHONE'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="p-2 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Quick Changer */}
              {customerProfile && (
                <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Lead Pipeline State:</span>
                  <div className="flex items-center gap-1.5">
                    {['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'INACTIVE'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(st)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          customerProfile.leadStatus === st
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

              {/* Drawer Navigation Tabs */}
              <div className="flex items-center border-b border-slate-200 px-6 gap-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab('overview')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                    activeDrawerTab === 'overview'
                      ? 'border-[#B3452C] text-[#B3452C]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Overview & Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab('bookings')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeDrawerTab === 'bookings'
                      ? 'border-[#B3452C] text-[#B3452C]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Bookings</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-700">
                    {customerProfile?.bookings?.length || 0}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab('enquiries')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeDrawerTab === 'enquiries'
                      ? 'border-[#B3452C] text-[#B3452C]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Inquiries</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-700">
                    {customerProfile?.enquiries?.length || 0}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab('timeline')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeDrawerTab === 'timeline'
                      ? 'border-[#B3452C] text-[#B3452C]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Timeline</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-700">
                    {customerProfile?.communicationLogs?.length || 0}
                  </span>
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="p-6 space-y-6">
                {isProfileLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mb-2 text-[#B3452C]" />
                    <p className="text-xs">Fetching 360 profile metrics...</p>
                  </div>
                ) : !customerProfile ? (
                  <p className="text-xs text-rose-500">Failed to load customer profile details.</p>
                ) : (
                  <>
                    {/* TAB 1: OVERVIEW & CONTACT */}
                    {activeDrawerTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Quick Contact Box */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Contact Channels</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <span className="text-[11px] text-slate-400 block">Primary Email</span>
                              <a href={`mailto:${customerProfile.email}`} className="font-semibold text-slate-800 hover:text-[#B3452C]">
                                {customerProfile.email}
                              </a>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] text-slate-400 block">Contact Phone</span>
                              <a href={`tel:${customerProfile.phone}`} className="font-semibold text-slate-800 hover:text-[#B3452C]">
                                {customerProfile.phone}
                              </a>
                            </div>
                            {customerProfile.alternatePhone && (
                              <div className="space-y-1">
                                <span className="text-[11px] text-slate-400 block">Alternate Phone</span>
                                <span className="font-semibold text-slate-800">{customerProfile.alternatePhone}</span>
                              </div>
                            )}
                            <div className="space-y-1">
                              <span className="text-[11px] text-slate-400 block">Location</span>
                              <span className="font-semibold text-slate-800">
                                {customerProfile.city || 'Not specified'}, {customerProfile.country}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center gap-2">
                            {customerProfile.phone && (
                              <a
                                href={`https://wa.me/${customerProfile.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Direct
                              </a>
                            )}
                            <a
                              href={`tel:${customerProfile.phone}`}
                              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" /> Direct Call
                            </a>
                          </div>
                        </div>

                        {/* Lifetime Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                            <span className="text-xl font-bold text-slate-900 block font-display">
                              {customerProfile.bookings?.length || 0}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-medium">Bookings</span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                            <span className="text-xl font-bold text-slate-900 block font-display">
                              {customerProfile.enquiries?.length || 0}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-medium">Inquiries</span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                            <span className="text-xl font-bold text-slate-900 block font-display">
                              ₹{(customerProfile.bookings || [])
                                .reduce((acc, b) => acc + (b.totalAmount || 0), 0)
                                .toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-medium">Lifetime Value</span>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Internal Traveler Notes</h4>
                          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                            {customerProfile.notes || 'No special notes or travel preferences logged yet for this client.'}
                          </div>
                        </div>

                        {/* Tags */}
                        {Array.isArray(customerProfile.tags) && customerProfile.tags.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Assigned Tags</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {customerProfile.tags.map((tag, i) => (
                                <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: LINKED BOOKINGS */}
                    {activeDrawerTab === 'bookings' && (
                      <div className="space-y-4">
                        {customerProfile.bookings?.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs font-semibold text-slate-700">No Bookings On Record</p>
                            <p className="text-[11px] text-slate-500">This client has not finalized any departures yet.</p>
                          </div>
                        ) : (
                          customerProfile.bookings.map((bkg) => (
                            <div key={bkg.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-xs text-slate-900">{bkg.bookingNumber}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                  {bkg.status}
                                </span>
                              </div>

                              <h4 className="font-bold text-xs text-slate-800">
                                {bkg.package?.title || 'Custom Tour Package'}
                              </h4>

                              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                                <span>{new Date(bkg.startDate).toLocaleDateString()} – {new Date(bkg.endDate).toLocaleDateString()}</span>
                                <span className="font-semibold text-slate-900">Total: ₹{bkg.totalAmount.toLocaleString()}</span>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                                <span>Paid: <strong className="text-emerald-700">₹{bkg.paidAmount.toLocaleString()}</strong></span>
                                <span>Balance: <strong className="text-rose-600">₹{bkg.balanceAmount.toLocaleString()}</strong></span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 3: LINKED INQUIRIES */}
                    {activeDrawerTab === 'enquiries' && (
                      <div className="space-y-4">
                        {customerProfile.enquiries?.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs font-semibold text-slate-700">No Inquiries Found</p>
                            <p className="text-[11px] text-slate-500">No website leads or direct inquiries recorded.</p>
                          </div>
                        ) : (
                          customerProfile.enquiries.map((enq) => (
                            <div key={enq.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-xs text-slate-900">{enq.enquiryNumber}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                  {enq.status}
                                </span>
                              </div>

                              <p className="text-xs text-slate-700 font-medium">{enq.destination || enq.package?.title || 'Tour Inquiry'}</p>
                              {enq.message && (
                                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                                  "{enq.message}"
                                </p>
                              )}
                              <p className="text-[10px] text-slate-400">
                                Received on {new Date(enq.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 4: TIMELINE & COMMUNICATION LOG */}
                    {activeDrawerTab === 'timeline' && (
                      <div className="space-y-5">
                        {/* Add Communication Form */}
                        <form onSubmit={handleAddCommunication} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-[#B3452C]" /> Log Call / Note
                          </h4>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <select
                              value={commType}
                              onChange={(e) => setCommType(e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                            >
                              <option value="CALL_NOTE">Phone Call</option>
                              <option value="WHATSAPP">WhatsApp</option>
                              <option value="EMAIL">Email</option>
                              <option value="MEETING">In-Person Meeting</option>
                              <option value="SMS">SMS</option>
                            </select>

                            <select
                              value={commDirection}
                              onChange={(e) => setCommDirection(e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                            >
                              <option value="OUTBOUND">Outbound (Agent to Client)</option>
                              <option value="INBOUND">Inbound (Client to Agent)</option>
                            </select>
                          </div>

                          <textarea
                            rows={3}
                            placeholder="Enter notes on the conversation, objections, special requests, or agreed follow-up dates..."
                            value={commContent}
                            onChange={(e) => setCommContent(e.target.value)}
                            required
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#B3452C]/20 focus:border-[#B3452C]"
                          />

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={isLoggingComm || !commContent.trim()}
                              className="px-3 py-1.5 rounded-lg bg-[#B3452C] hover:bg-[#9a3b25] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              {isLoggingComm ? 'Saving...' : 'Add Note to Timeline'}
                            </button>
                          </div>
                        </form>

                        {/* Timeline Entries */}
                        <div className="space-y-3">
                          {customerProfile.communicationLogs?.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-6">
                              No interaction logs recorded yet. Add your first call or message note above.
                            </p>
                          ) : (
                            customerProfile.communicationLogs.map((log) => (
                              <div key={log.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {log.type.replace('_', ' ')} • {log.direction}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(log.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                  {log.content}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Bottom Drawer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(customerProfile)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteCustomer(customerProfile, e)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT CUSTOMER MODAL                                 */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#B3452C]" />
                <h3 className="font-bold text-base text-slate-900">
                  {modalMode === 'create' ? 'Add New Traveler Profile' : 'Edit Customer Profile'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suman Chattopadhyay"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#B3452C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="suman@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#B3452C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: digits });
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    placeholder="Kolkata"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Lead Status</label>
                  <select
                    value={formData.leadStatus}
                    onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {STATUS_FILTERS.filter((s) => s !== 'ALL').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {SOURCE_OPTIONS.map((src) => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Luxury, Honeymoon, Senior Citizen, High Priority"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Internal Traveler Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any dietary preferences, hotel room choices, or family travel details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#B3452C] hover:bg-[#9a3b25] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Customer' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
