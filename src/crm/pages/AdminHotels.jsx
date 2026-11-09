import React, { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import {
  Building,
  Plus,
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Edit2,
  Trash2,
  RefreshCw,
  ExternalLink,
  Tag,
  Package,
  X,
  Bed,
  Sparkles,
  Wifi,
  Coffee,
  Waves,
  Utensils,
  Car,
  ShieldAlert,
} from 'lucide-react';

const COMMON_FACILITIES = [
  'Free Wi-Fi',
  'Swimming Pool',
  'Spa & Wellness Sanctuary',
  'Fine Dining Restaurant',
  'Complimentary Breakfast',
  '24/7 Concierge Service',
  'Airport & Station Transfers',
  'Valet Parking',
  'Heritage Guided Tour',
  'Fitness Center',
  'Private Verandah / Balcony',
  'Doctor on Call',
];

export default function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState({
    totalHotels: 0,
    activeHotels: 0,
    underRenovation: 0,
    fiveStarCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [starFilter, setStarFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    destinationId: '',
    city: '',
    starRating: 5,
    address: '',
    contactPhone: '',
    contactEmail: '',
    standardPricePerNight: 15000,
    roomType: 'Deluxe Heritage Room',
    status: 'ACTIVE',
    amenities: [],
    images: [],
    imageUrlInput: '',
    notes: '',
    linkedPackageIds: [],
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const fetchHotels = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getHotels({
        search: searchQuery,
        status: statusFilter,
        minStars: starFilter !== 'ALL' ? starFilter : undefined,
      });
      if (res?.success) {
        setHotels(res.data.hotels || []);
        if (res.data.destinations) setDestinations(res.data.destinations);
        if (res.data.packages) setPackages(res.data.packages);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load hotels:', err);
      showToast(err.message || 'Error loading hotels');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [statusFilter, starFilter]);

  const openCreateModal = () => {
    setEditingHotel(null);
    setForm({
      name: '',
      destinationId: destinations[0]?.id || '',
      city: '',
      starRating: 5,
      address: '',
      contactPhone: '',
      contactEmail: '',
      standardPricePerNight: 15000,
      roomType: 'Deluxe Heritage Room',
      status: 'ACTIVE',
      amenities: ['Free Wi-Fi', 'Complimentary Breakfast', 'Swimming Pool'],
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
      imageUrlInput: '',
      notes: '',
      linkedPackageIds: [],
    });
    setShowModal(true);
  };

  const openEditModal = (hotel) => {
    setEditingHotel(hotel);

    let parsedAmenities = [];
    try {
      parsedAmenities = typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities) : hotel.amenities || [];
    } catch {
      parsedAmenities = [];
    }

    let parsedImages = [];
    try {
      parsedImages = typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images || [];
    } catch {
      parsedImages = [];
    }

    const linkedIds = hotel.packageHotels ? hotel.packageHotels.map((ph) => ph.packageId) : [];

    setForm({
      name: hotel.name || '',
      destinationId: hotel.destinationId || '',
      city: hotel.city || '',
      starRating: hotel.starRating || 4,
      address: hotel.address || '',
      contactPhone: hotel.contactPhone || '',
      contactEmail: hotel.contactEmail || '',
      standardPricePerNight: hotel.standardPricePerNight || 0,
      roomType: hotel.roomType || 'Standard Room',
      status: hotel.status || 'ACTIVE',
      amenities: parsedAmenities,
      images: parsedImages,
      imageUrlInput: '',
      notes: hotel.notes || '',
      linkedPackageIds: linkedIds,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim()) {
      alert('Please fill in hotel name and location city.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingHotel) {
        const res = await adminApi.updateHotel(editingHotel.id, form);
        if (res?.success) {
          showToast(`Hotel "${form.name}" updated successfully.`);
          setShowModal(false);
          fetchHotels();
        }
      } else {
        const res = await adminApi.createHotel(form);
        if (res?.success) {
          showToast(`Hotel "${form.name}" registered successfully.`);
          setShowModal(false);
          fetchHotels();
        }
      }
    } catch (err) {
      console.error('Failed to save hotel:', err);
      showToast(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (hotel) => {
    if (!window.confirm(`Are you sure you want to remove "${hotel.name}"? This unlinks it from associated packages.`)) {
      return;
    }

    try {
      const res = await adminApi.deleteHotel(hotel.id);
      if (res?.success) {
        showToast(`Hotel "${hotel.name}" deleted.`);
        fetchHotels();
      }
    } catch (err) {
      console.error('Failed to delete hotel:', err);
      showToast(err.message || 'Delete failed');
    }
  };

  const toggleFacility = (facility) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(facility);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter((f) => f !== facility) : [...prev.amenities, facility],
      };
    });
  };

  const togglePackageLink = (pkgId) => {
    setForm((prev) => {
      const exists = prev.linkedPackageIds.includes(pkgId);
      return {
        ...prev,
        linkedPackageIds: exists
          ? prev.linkedPackageIds.filter((id) => id !== pkgId)
          : [...prev.linkedPackageIds, pkgId],
      };
    });
  };

  const addImageUrl = () => {
    if (!form.imageUrlInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, prev.imageUrlInput.trim()],
      imageUrlInput: '',
    }));
  };

  const removeImageUrl = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      case 'UNDER_RENOVATION':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Under Renovation
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Inactive
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hotel Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Directory of partner luxury resorts, heritage palaces, and boutique lodges linked to tour packages.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#B3452C] hover:bg-[#963922] text-white text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Hotel</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Hotels</span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.totalHotels}</span>
          <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Partner properties</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Properties</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.activeHotels}</span>
          <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Available for booking</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Under Renovation</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.underRenovation}</span>
          <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Temporary maintenance</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">5-Star Luxury</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.fiveStarCount}</span>
          <span className="text-[11px] text-slate-400 block font-medium mt-0.5">Premier heritage suites</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchHotels()}
            placeholder="Search hotels by name, city, address, or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#B3452C]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_RENOVATION">Under Renovation</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Star Filter */}
          <select
            value={starFilter}
            onChange={(e) => setStarFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="ALL">All Star Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>

          <button
            type="button"
            onClick={fetchHotels}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Hotels Grid */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading partner hotels...</p>
        </div>
      ) : hotels.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Building className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No Hotels Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? `No properties matching "${searchQuery}".` : 'No hotels registered yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {hotels.map((hotel) => {
            let hotelAmenities = [];
            try {
              hotelAmenities = typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities) : hotel.amenities || [];
            } catch {
              hotelAmenities = [];
            }

            let hotelImages = [];
            try {
              hotelImages = typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images || [];
            } catch {
              hotelImages = [];
            }

            const coverImage = hotelImages[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={hotel.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image banner with rating & status */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={coverImage}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    {/* Status Pill */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(hotel.status)}
                    </div>

                    {/* Star Rating Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      {Array.from({ length: hotel.starRating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[11px] font-bold text-slate-800 ml-0.5">
                        {hotel.starRating}★
                      </span>
                    </div>

                    {/* Title & City over gradient */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base font-bold tracking-tight truncate drop-shadow-xs">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-200 mt-0.5 drop-shadow-xs">
                        <MapPin className="w-3 h-3 text-[#F5C2B6]" />
                        <span className="truncate">{hotel.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    {/* Room Type & Nightly Rate */}
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{hotel.roomType || 'Standard Room'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 font-sans">
                          ₹{(hotel.standardPricePerNight || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400"> / night</span>
                      </div>
                    </div>

                    {/* Description Notes */}
                    {hotel.notes && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {hotel.notes}
                      </p>
                    )}

                    {/* Facilities Chips */}
                    {hotelAmenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {hotelAmenities.slice(0, 4).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-[10.5px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                          >
                            {amenity}
                          </span>
                        ))}
                        {hotelAmenities.length > 4 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 font-medium">
                            +{hotelAmenities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Linked Tour Packages */}
                    <div className="pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Package className="w-3 h-3 text-slate-400" />
                          Linked Packages ({hotel.packageHotels?.length || 0})
                        </span>
                      </div>
                      {hotel.packageHotels && hotel.packageHotels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {hotel.packageHotels.map((ph) => (
                            <span
                              key={ph.id}
                              className="text-[10.5px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium border border-stone-200"
                            >
                              {ph.package?.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          No packages directly linked yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {hotel.contactPhone || hotel.contactEmail || 'No direct phone logged'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(hotel)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(hotel)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Delete property"
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

      {/* 
        ========================================================================
        CREATE / EDIT HOTEL MODAL
        ========================================================================
      */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#B3452C]" />
                <span>{editingHotel ? 'Edit Hotel Property' : 'Register New Partner Hotel'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Hotel Name & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. The Oberoi Udaivilas"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Circuit
                  </label>
                  <select
                    value={form.destinationId}
                    onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#B3452C]"
                  >
                    <option value="">-- Direct City Destination --</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City / State & Star Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Udaipur, Rajasthan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Star Rating (1-5) *
                  </label>
                  <select
                    value={form.starRating}
                    onChange={(e) => setForm({ ...form, starRating: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#B3452C]"
                  >
                    <option value={5}>5-Star Luxury</option>
                    <option value={4}>4-Star Premium</option>
                    <option value={3}>3-Star Comfort</option>
                    <option value={2}>2-Star Standard</option>
                    <option value={1}>1-Star Budget</option>
                  </select>
                </div>
              </div>

              {/* Room Type & Nightly Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Room Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.roomType}
                    onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                    placeholder="e.g. Premier Lake View Pavilion"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price / Night (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.standardPricePerNight}
                    onChange={(e) => setForm({ ...form, standardPricePerNight: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property Status *
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'ACTIVE', label: 'Active' },
                    { id: 'UNDER_RENOVATION', label: 'Under Renovation' },
                    { id: 'INACTIVE', label: 'Inactive' },
                  ].map((s) => (
                    <label key={s.id} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={form.status === s.id}
                        onChange={() => setForm({ ...form, status: s.id })}
                        className="text-[#B3452C] focus:ring-0 accent-[#B3452C]"
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Physical Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Haridas Ji Ki Magri, Mulla Talai, Udaipur, Rajasthan 313001"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#B3452C]"
                />
              </div>

              {/* Contact Info (Phone & Email) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="+91 294 243 3300"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="reservations@hotel.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
              </div>

              {/* Facilities / Amenities Multi-select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Facilities & Amenities
                </label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  {COMMON_FACILITIES.map((facility) => {
                    const isChecked = form.amenities.includes(facility);
                    return (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleFacility(facility)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#B3452C] text-white border-[#B3452C]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {facility}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Images URLs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Images (Photo URLs)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={form.imageUrlInput}
                    onChange={(e) => setForm({ ...form, imageUrlInput: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#B3452C]"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Add Photo
                  </button>
                </div>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group w-16 h-12 rounded-lg overflow-hidden border border-slate-200">
                        <img src={img} alt="Hotel preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImageUrl(idx)}
                          className="absolute inset-0 bg-rose-900/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition-opacity cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property Description & Heritage Background
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Historic significance, architectural styling, view details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#B3452C]"
                />
              </div>

              {/* Link to Tour Packages */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Link to Tour Packages
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  {packages.map((pkg) => {
                    const isLinked = form.linkedPackageIds.includes(pkg.id);
                    return (
                      <label
                        key={pkg.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:border-slate-300 text-xs"
                      >
                        <span className="font-medium text-slate-800">{pkg.title}</span>
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={() => togglePackageLink(pkg.id)}
                          className="text-[#B3452C] focus:ring-0 accent-[#B3452C]"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#B3452C] hover:bg-[#963922] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingHotel ? 'Save Hotel Changes' : 'Register Hotel'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
