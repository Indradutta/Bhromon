import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';
import {
  Compass,
  Plus,
  Star,
  MapPin,
  Clock,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  X,
  Search,
  Sparkles,
  Layers,
  Calendar,
  Utensils,
  RefreshCw,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

const CATEGORIES = ['ALL', 'Cultural', 'Spiritual', 'Wildlife', 'Adventure', 'Wellness'];
const REGIONS = ['North', 'South', 'East', 'West', 'Central', 'North-East'];
const AVAILABILITY_OPTIONS = ['Available', 'Limited', 'Sold Out'];

const IMAGE_PRESETS = [
  { label: 'Udaipur Lake Palace', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Varanasi Ghats', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Ladakh Pangong Lake', url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kerala Backwaters', url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Ranthambore Tiger', url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Hampi Ancient Temples', url: 'https://images.unsplash.com/photo-1600100397608-f010f4439c2c?auto=format&fit=crop&w=1200&q=80' },
];

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeAvailability, setActiveAvailability] = useState('ALL');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [selectedViewPackage, setSelectedViewPackage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'details' | 'itinerary'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    destinationId: '',
    destinationText: '',
    region: 'North',
    category: 'Cultural',
    type: 'Cultural',
    durationDays: 5,
    durationText: '5 Days / 4 Nights',
    price: 35000,
    rating: 4.9,
    availability: 'Available',
    featured: false,
    isActive: true,
    description: '',
    image: IMAGE_PRESETS[0].url,
    inclusions: ['5-Star Luxury Heritage Hotel Stays', 'Private AC Chauffeur throughout tour', 'All monument entry tickets & passes', 'Dedicated local English-speaking heritage guide'],
    exclusions: ['Airfare / Train tickets to starting point', 'Personal expenses, laundry, and tips', 'Optional adventure sports & camera fees'],
    tags: ['Heritage', 'Luxury', 'Private Tour'],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrival & Royal Welcome',
        description: 'Arrive at destination airport. Private luxury transfer to your heritage palace hotel. Enjoy evening sunset boat ride and welcome dinner.',
        meals: 'Dinner',
        activities: 'Private airport pickup, boat safari, welcome cultural gala',
      },
      {
        dayNumber: 2,
        title: 'Fortresses & Heritage Exploration',
        description: 'Full-day guided exploration of UNESCO World Heritage palaces, historic museum corridors, and local artisan markets.',
        meals: 'Breakfast, Dinner',
        activities: 'Guided palace tour, royal armoury visit, bazaar walk',
      },
    ],
  });

  // Temporary inputs for array fields
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [newTag, setNewTag] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const fetchPackages = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (activeCategory !== 'ALL') params.category = activeCategory;
      if (activeAvailability !== 'ALL') params.availability = activeAvailability;
      if (activeStatus !== 'ALL') params.status = activeStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await adminApi.getPackages(params);
      if (res?.success && Array.isArray(res.data?.packages)) {
        setPackages(res.data.packages);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
      showToast('Error loading packages');
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, activeAvailability, activeStatus, searchQuery]);

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await adminApi.getDestinations();
      if (res?.success && Array.isArray(res.data)) {
        setDestinations(res.data);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchPackages();
    // Silent auto-refresh every 30 seconds
    const interval = setInterval(fetchPackages, 30000);
    const handleFocus = () => fetchPackages();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPackages]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingId(null);
    setActiveTab('basic');
    setFormData({
      title: '',
      slug: '',
      destinationId: destinations[0]?.id || '',
      destinationText: destinations[0]?.name || 'Rajasthan, India',
      region: 'North',
      category: 'Cultural',
      type: 'Cultural',
      durationDays: 5,
      durationText: '5 Days / 4 Nights',
      price: 35000,
      rating: 4.9,
      availability: 'Available',
      featured: false,
      isActive: true,
      description: 'Curated luxury expedition featuring exclusive heritage properties, private guides, and cultural masterclasses across iconic sights.',
      image: IMAGE_PRESETS[0].url,
      inclusions: ['5-Star Luxury Heritage Hotel Stays', 'Private AC Chauffeur throughout tour', 'All monument entry tickets', 'Local English-speaking guide'],
      exclusions: ['Airfare / Train tickets', 'Personal expenses and tips', 'Optional camera fees'],
      tags: ['Heritage', 'Luxury', 'Private Tour'],
      itinerary: [
        {
          dayNumber: 1,
          title: 'Arrival & Royal Welcome',
          description: 'Private airport pickup, check-in to heritage hotel, and evening welcome gala dinner.',
          meals: 'Dinner',
          activities: 'Airport transfer, boat cruise, dinner',
        },
      ],
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal with full itinerary
  const handleOpenEdit = async (pkg) => {
    try {
      setModalMode('edit');
      setEditingId(pkg.id);
      setActiveTab('basic');
      setIsSubmitting(true);
      setIsModalOpen(true);
      setFormData({
        title: pkg.title || '',
        slug: pkg.slug || '',
        destinationId: pkg.destinationId || '',
        destinationText: pkg.destinationText || '',
        region: pkg.region || 'North',
        category: pkg.category || 'Cultural',
        type: pkg.type || 'Cultural',
        durationDays: pkg.durationDays || 5,
        durationText: pkg.durationText || `${pkg.durationDays || 5} Days / ${Math.max(1, (pkg.durationDays || 5) - 1)} Nights`,
        price: pkg.price || 35000,
        rating: pkg.rating || 4.9,
        availability: pkg.availability || 'Available',
        featured: Boolean(pkg.featured),
        isActive: Boolean(pkg.isActive),
        description: pkg.description || '',
        image: pkg.image || IMAGE_PRESETS[0].url,
        inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
        exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions : [],
        tags: Array.isArray(pkg.tags) ? pkg.tags : [],
        itinerary: Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 ? pkg.itinerary : [],
      });

      const res = await adminApi.getPackageById(pkg.id);
      if (res?.success && res.data) {
        const data = res.data;
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          destinationId: data.destinationId || '',
          destinationText: data.destinationText || '',
          region: data.region || 'North',
          category: data.category || 'Cultural',
          type: data.type || 'Cultural',
          durationDays: data.durationDays || 5,
          durationText: data.durationText || `${data.durationDays} Days / ${data.durationDays - 1} Nights`,
          price: data.price || 35000,
          rating: data.rating || 4.9,
          availability: data.availability || 'Available',
          featured: Boolean(data.featured),
          isActive: Boolean(data.isActive),
          description: data.description || '',
          image: data.image || IMAGE_PRESETS[0].url,
          inclusions: Array.isArray(data.inclusions) ? data.inclusions : [],
          exclusions: Array.isArray(data.exclusions) ? data.exclusions : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          itinerary: Array.isArray(data.itinerary) && data.itinerary.length > 0
            ? data.itinerary
            : [
                {
                  dayNumber: 1,
                  title: 'Arrival & Welcome',
                  description: 'Private transfer to hotel and orientation.',
                  meals: 'Dinner',
                  activities: 'Transfer and welcome gala',
                },
              ],
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to load full package');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick toggle status (Active / Inactive)
  const handleToggleActive = async (pkg) => {
    try {
      const nextActive = !pkg.isActive;
      const res = await adminApi.updatePackageStatus(pkg.id, { isActive: nextActive });
      if (res.success) {
        showToast(`Package "${pkg.title}" is now ${nextActive ? 'Active' : 'Archived'}`);
        fetchPackages();
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle status');
    }
  };

  // Quick change availability
  const handleChangeAvailability = async (pkg, availability) => {
    try {
      const res = await adminApi.updatePackageStatus(pkg.id, { availability });
      if (res.success) {
        showToast(`Availability set to ${availability}`);
        fetchPackages();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update availability');
    }
  };

  // Delete Package
  const handleDeletePackage = async (pkg) => {
    if (!window.confirm(`Are you sure you want to delete "${pkg.title}"?`)) return;
    try {
      const res = await adminApi.deletePackage(pkg.id);
      if (res.success) {
        showToast(res.message || 'Package deleted');
        fetchPackages();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete package');
    }
  };

  // Handle Local Image File Upload
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, image: event.target.result }));
      showToast('Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const payload = {
        ...formData,
        destinationId: formData.destinationId ? formData.destinationId : null,
      };

      if (modalMode === 'create') {
        const res = await adminApi.createPackage(payload);
        if (res.success) {
          showToast(`Expedition "${res.data.title}" created successfully!`);
          setIsModalOpen(false);
          fetchPackages();
        }
      } else {
        const res = await adminApi.updatePackage(editingId, payload);
        if (res.success) {
          showToast(`Expedition "${res.data.title}" updated successfully!`);
          setIsModalOpen(false);
          fetchPackages();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save package');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Itinerary Day Helpers
  const handleAddDay = () => {
    const nextDayNum = formData.itinerary.length + 1;
    setFormData({
      ...formData,
      itinerary: [
        ...formData.itinerary,
        {
          dayNumber: nextDayNum,
          title: `Day ${nextDayNum} Excursion & Exploration`,
          description: 'Detailed sightseeing, private guided activities, and evening leisure.',
          meals: 'Breakfast',
          activities: 'Sightseeing, cultural experience',
        },
      ],
      durationDays: Math.max(formData.durationDays, nextDayNum),
      durationText: `${Math.max(formData.durationDays, nextDayNum)} Days / ${Math.max(formData.durationDays, nextDayNum) - 1} Nights`,
    });
  };

  const handleRemoveDay = (index) => {
    if (formData.itinerary.length <= 1) return;
    const updated = formData.itinerary.filter((_, i) => i !== index).map((day, i) => ({
      ...day,
      dayNumber: i + 1,
    }));
    setFormData({
      ...formData,
      itinerary: updated,
    });
  };

  const handleUpdateDay = (index, field, value) => {
    const updated = [...formData.itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, itinerary: updated });
  };

  // Inclusions / Exclusions / Tags helpers
  const handleAddInclusion = () => {
    if (!newInclusion.trim()) return;
    setFormData({ ...formData, inclusions: [...formData.inclusions, newInclusion.trim()] });
    setNewInclusion('');
  };

  const handleRemoveInclusion = (idx) => {
    setFormData({ ...formData, inclusions: formData.inclusions.filter((_, i) => i !== idx) });
  };

  const handleAddExclusion = () => {
    if (!newExclusion.trim()) return;
    setFormData({ ...formData, exclusions: [...formData.exclusions, newExclusion.trim()] });
    setNewExclusion('');
  };

  const handleRemoveExclusion = (idx) => {
    setFormData({ ...formData, exclusions: formData.exclusions.filter((_, i) => i !== idx) });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
    setNewTag('');
  };

  const handleRemoveTag = (idx) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) });
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Tour Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your curated travel expeditions and itineraries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#B9472E] hover:bg-[#A53B26] text-white shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Package</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs font-semibold">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Expeditions' : cat}
            </button>
          ))}
        </div>

        {/* Right Controls: Availability, Status & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Availability Select */}
          <select
            value={activeAvailability}
            onChange={(e) => setActiveAvailability(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:border-[#B3452C]"
          >
            <option value="ALL">All Availability</option>
            <option value="Available">Available</option>
            <option value="Limited">Limited Seats</option>
            <option value="Sold Out">Sold Out</option>
          </select>

          {/* Status Select */}
          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:border-[#B3452C]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Archived</option>
          </select>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, region, city..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#B3452C] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Package Catalog Grid */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-400">
          Loading synchronized tour expeditions...
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#B3452C] flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Tour Packages Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No expeditions match the current category or search filters. You can add a new tour package anytime.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#B3452C] text-white text-xs font-semibold shadow-xs hover:bg-[#963922] cursor-pointer"
          >
            + Create New Expedition
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedViewPackage(pkg)}
              className="bg-white rounded-2xl border border-[#E6EAF0] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#B9472E]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Clean Image Cover */}
                <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = IMAGE_PRESETS[0].url;
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-xs ${
                        pkg.isActive
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-700/80 text-white'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Minimal Content */}
                <div className="p-4 space-y-1.5">
                  <h3 className="font-semibold text-sm text-[#18263D] group-hover:text-[#B9472E] transition-colors line-clamp-1">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-[#687A94] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B9472E] shrink-0" />
                    <span>{pkg.destinationText}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-[#687A94] shrink-0" />
                    <span>{pkg.durationText}</span>
                  </p>
                </div>
              </div>

              {/* Minimal Card Footer */}
              <div className="px-4 py-3 bg-[#FAFBFD] border-t border-[#E6EAF0] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#687A94] block uppercase font-medium">Price</span>
                  <span className="text-sm font-bold text-[#18263D]">
                    ₹{pkg.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#687A94]"> / person</span>
                </div>
                <span className="text-xs font-semibold text-[#B9472E] group-hover:underline">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 
        ========================================================================
        STRUCTURED TOUR PACKAGE DETAIL & EDIT MODAL
        ========================================================================
      */}
      {selectedViewPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setSelectedViewPackage(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E6EAF0] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-slideUp">
            {/* Modal Header Cover */}
            <div className="h-48 relative overflow-hidden bg-slate-900 shrink-0">
              <img
                src={selectedViewPackage.image}
                alt={selectedViewPackage.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = IMAGE_PRESETS[0].url;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedViewPackage(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#F5C2B6] uppercase tracking-wider block mb-1">
                    {selectedViewPackage.destinationText} • {selectedViewPackage.durationText}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-sans tracking-tight leading-snug">
                    {selectedViewPackage.title}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-300 block">Price / person</span>
                  <span className="text-xl font-bold text-white">
                    ₹{selectedViewPackage.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Overview Description */}
              <div>
                <h4 className="text-xs font-bold text-[#18263D] uppercase tracking-wider mb-2">
                  Tour Overview
                </h4>
                <p className="text-[#4A5568] leading-relaxed text-sm font-normal">
                  {selectedViewPackage.description}
                </p>
              </div>

              {/* Day-by-Day Itinerary */}
              {selectedViewPackage.itinerary && selectedViewPackage.itinerary.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#18263D] uppercase tracking-wider mb-3">
                    Day-by-Day Itinerary
                  </h4>
                  <div className="space-y-3">
                    {selectedViewPackage.itinerary.map((day, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#FAFBFD] border border-[#E6EAF0] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#B9472E]">
                            Day {day.dayNumber || day.day || idx + 1}: {day.title || 'Sightseeing'}
                          </span>
                          {day.meals && (
                            <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                              {day.meals}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 leading-relaxed text-xs">
                          {day.description || day.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedViewPackage.inclusions && selectedViewPackage.inclusions.length > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                    <h5 className="font-bold text-xs text-emerald-900 uppercase tracking-wider">
                      Included
                    </h5>
                    <ul className="space-y-1 text-slate-700">
                      {selectedViewPackage.inclusions.map((inc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedViewPackage.exclusions && selectedViewPackage.exclusions.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-2">
                    <h5 className="font-bold text-xs text-rose-900 uppercase tracking-wider">
                      Excluded
                    </h5>
                    <ul className="space-y-1 text-slate-700">
                      {selectedViewPackage.exclusions.map((exc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">✕</span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E6EAF0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleActive(selectedViewPackage);
                    setSelectedViewPackage((prev) => ({ ...prev, isActive: !prev.isActive }));
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                    selectedViewPackage.isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                  }`}
                >
                  {selectedViewPackage.isActive ? 'Active (Live)' : 'Draft (Archived)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const toDelete = selectedViewPackage;
                    setSelectedViewPackage(null);
                    handleDeletePackage(toDelete);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedViewPackage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedViewPackage;
                    setSelectedViewPackage(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#B9472E] hover:bg-[#A53B26] text-white shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Package</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3-Tab Master Package & Itinerary Builder Modal                 */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#B3452C]/10 text-[#B3452C] flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    {modalMode === 'create' ? 'Create New Tour Expedition' : `Edit Expedition: ${formData.title}`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Define itinerary details, pricing tiers, and public highlights
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex items-center border-b border-slate-200 px-5 bg-white text-xs font-bold text-slate-500">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'basic'
                    ? 'border-[#B3452C] text-[#B3452C]'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                1. Basic Info & Pricing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'border-[#B3452C] text-[#B3452C]'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                2. Details & Inclusions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('itinerary')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'itinerary'
                    ? 'border-[#B3452C] text-[#B3452C]'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <span>3. Day-by-Day Itinerary</span>
                <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-[#B3452C] text-[10px]">
                  {formData.itinerary.length}
                </span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
              {/* TAB 1: BASIC INFO & PRICING */}
              {activeTab === 'basic' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expedition Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Royal Rajasthan: Palaces & Fortresses of Mewar"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Destination Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.destinationText}
                        onChange={(e) => setFormData({ ...formData, destinationText: e.target.value })}
                        placeholder="e.g. Udaipur & Jaipur, Rajasthan"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Linked Destination Region</label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                      >
                        {REGIONS.map((r) => (
                          <option key={r} value={r}>{r} India</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                      >
                        {CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Duration Days *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.durationDays}
                        onChange={(e) => {
                          const days = parseInt(e.target.value, 10) || 1;
                          setFormData({
                            ...formData,
                            durationDays: days,
                            durationText: `${days} Days / ${Math.max(1, days - 1)} Nights`,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Duration Label</label>
                      <input
                        type="text"
                        value={formData.durationText}
                        onChange={(e) => setFormData({ ...formData, durationText: e.target.value })}
                        placeholder="5 Days / 4 Nights"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Base Price / Person (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] font-bold text-[#B3452C]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Availability</label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                      >
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.9 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                      />
                    </div>
                  </div>

                  {/* Primary Cover Image: File Upload & URL Option */}
                  <div className="space-y-2.5">
                    <label className="block font-bold text-slate-700">Primary Cover Image *</label>

                    {/* Image Preview & Upload Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      {/* Image Preview Box */}
                      <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative shrink-0 flex items-center justify-center">
                        {formData.image ? (
                          <img
                            src={formData.image}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = IMAGE_PRESETS[0].url;
                            }}
                          />
                        ) : (
                          <div className="text-center text-slate-400 p-2">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1 stroke-1" />
                            <span className="text-[10px]">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Upload and URL Inputs */}
                      <div className="flex-1 w-full space-y-2">
                        {/* File Upload Button */}
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="package-image-file"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs cursor-pointer transition-all active:scale-98"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#B3452C]" />
                            <span>Upload Image from Device</span>
                          </label>
                          <input
                            id="package-image-file"
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                          <span className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                        </div>

                        {/* Image URL Input */}
                        <input
                          type="text"
                          required
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="Or paste an image URL (https://images.unsplash.com/...)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#B3452C] bg-white"
                        />

                        {/* Presets */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
                          {IMAGE_PRESETS.map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => setFormData({ ...formData, image: p.url })}
                              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes: Featured & IsActive */}
                  <div className="pt-2 flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded text-[#B3452C] focus:ring-[#B3452C]"
                      />
                      <span className="font-bold text-slate-800">Featured Expedition (Homepage Spotlight)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 rounded text-[#B3452C] focus:ring-[#B3452C]"
                      />
                      <span className="font-bold text-slate-800">Active (Visible to public)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: DETAILS & INCLUSIONS */}
              {activeTab === 'details' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expedition Overview Description *</label>
                    <textarea
                      rows="4"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Comprehensive overview of this travel journey, highlight landscapes, heritage landmarks, and unique cultural encounters..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] leading-relaxed"
                    />
                  </div>

                  {/* Inclusions List */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">Package Inclusions</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newInclusion}
                        onChange={(e) => setNewInclusion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddInclusion();
                          }
                        }}
                        placeholder="e.g. 5-Star Heritage Hotel Stays..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                      />
                      <button
                        type="button"
                        onClick={handleAddInclusion}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {formData.inclusions.map((inc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{inc}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInclusion(idx)}
                            className="text-emerald-700 hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exclusions List */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">Package Exclusions</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newExclusion}
                        onChange={(e) => setNewExclusion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddExclusion();
                          }
                        }}
                        placeholder="e.g. Flight tickets, personal expenses..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                      />
                      <button
                        type="button"
                        onClick={handleAddExclusion}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {formData.exclusions.map((exc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-red-50/60 border border-red-100 text-red-900">
                          <span className="flex items-center gap-1.5">
                            <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span>{exc}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExclusion(idx)}
                            className="text-red-700 hover:text-red-900 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">Tags / Badges</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="e.g. Wildlife, Photography, Luxury..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black cursor-pointer"
                      >
                        + Add Tag
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.tags.map((t, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          <span>{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(idx)}
                            className="text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DAY-BY-DAY ITINERARY BUILDER */}
              {activeTab === 'itinerary' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-900">Day-by-Day Journey Itinerary</h4>
                      <p className="text-[11px] text-slate-500">
                        Add day titles, activities, meals, and descriptive encounters for travelers.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDay}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B3452C] hover:bg-[#963922] text-white font-semibold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Day</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.itinerary.map((day, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#B3452C] bg-[#B3452C]/10 px-2 py-0.5 rounded">
                            Day {day.dayNumber || idx + 1}
                          </span>
                          {formData.itinerary.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDay(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded cursor-pointer"
                              title="Delete Day"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Day Title *</label>
                          <input
                            type="text"
                            required
                            value={day.title}
                            onChange={(e) => handleUpdateDay(idx, 'title', e.target.value)}
                            placeholder="e.g. Arrival in Udaipur & Sunset Pichola Cruise"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Description *</label>
                          <textarea
                            rows="2"
                            required
                            value={day.description}
                            onChange={(e) => handleUpdateDay(idx, 'description', e.target.value)}
                            placeholder="Detailed activities, landmark highlights, and scenic notes..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 flex items-center gap-1">
                              <Utensils className="w-3 h-3 text-[#B3452C]" />
                              <span>Meals Provided</span>
                            </label>
                            <input
                              type="text"
                              value={day.meals || ''}
                              onChange={(e) => handleUpdateDay(idx, 'meals', e.target.value)}
                              placeholder="e.g. Breakfast, Dinner"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#B3452C]" />
                              <span>Key Sightseeing / Activities</span>
                            </label>
                            <input
                              type="text"
                              value={day.activities || ''}
                              onChange={(e) => handleUpdateDay(idx, 'activities', e.target.value)}
                              placeholder="e.g. Lake boat ride, palace walking tour"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab === 'itinerary' ? 'details' : 'basic')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      ← Previous Tab
                    </button>
                  )}
                  {activeTab !== 'itinerary' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab === 'basic' ? 'details' : 'itinerary')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 cursor-pointer"
                    >
                      Next Tab →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#B3452C] hover:bg-[#963922] text-white font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Expedition...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{modalMode === 'create' ? 'Save & Publish Package' : 'Save Changes'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
