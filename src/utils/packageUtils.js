// Utility to normalize tour package data across DB models and legacy mock formats
export function normalizePackage(pkg) {
  if (!pkg) return null;

  // Normalize itinerary days
  let itineraryDays = [];
  if (Array.isArray(pkg.itinerary)) {
    itineraryDays = pkg.itinerary.map((d, idx) => ({
      day: d.dayNumber ?? d.day ?? idx + 1,
      dayNumber: d.dayNumber ?? d.day ?? idx + 1,
      title: d.title || `Day ${d.dayNumber ?? d.day ?? idx + 1}`,
      desc: d.description ?? d.desc ?? '',
      description: d.description ?? d.desc ?? '',
      meals: d.meals || null,
      activities: d.activities || null,
    }));
  }

  // Parse inclusions
  let inclusions = [];
  if (Array.isArray(pkg.inclusions)) {
    inclusions = pkg.inclusions;
  } else if (typeof pkg.inclusions === 'string') {
    try {
      inclusions = JSON.parse(pkg.inclusions || '[]');
    } catch {
      inclusions = [pkg.inclusions];
    }
  }

  // Parse exclusions
  let exclusions = [];
  if (Array.isArray(pkg.exclusions)) {
    exclusions = pkg.exclusions;
  } else if (typeof pkg.exclusions === 'string') {
    try {
      exclusions = JSON.parse(pkg.exclusions || '[]');
    } catch {
      exclusions = [pkg.exclusions];
    }
  }

  // Parse tags
  let tags = [];
  if (Array.isArray(pkg.tags)) {
    tags = pkg.tags;
  } else if (typeof pkg.tags === 'string') {
    try {
      tags = JSON.parse(pkg.tags || '[]');
    } catch {
      tags = [];
    }
  }

  const durationDays = Number(pkg.durationDays) || 5;
  const durationNights = Math.max(1, durationDays - 1);

  return {
    ...pkg,
    id: pkg.id,
    dbId: pkg.id,
    legacyId: pkg.legacyId || pkg.id,
    title: pkg.title || 'Curated Expedition',
    type: pkg.category || pkg.type || 'Cultural',
    category: pkg.category || pkg.type || 'Cultural',
    destination: pkg.destinationText || pkg.destination || pkg.region || 'India',
    destinationText: pkg.destinationText || pkg.destination || pkg.region || 'India',
    region: pkg.region || pkg.destinationText || 'India',
    durationDays,
    durationText: pkg.durationText || `${durationDays} Days / ${durationNights} Nights`,
    price: Number(pkg.price || 0),
    rating: Number(pkg.rating) || 4.9,
    reviewsCount: Number(pkg.reviewsCount) || 120,
    image: pkg.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: pkg.description || '',
    inclusions: inclusions.length > 0 ? inclusions : [
      'Boutique heritage accommodation on twin sharing basis',
      'Daily wholesome breakfast and regional culinary dinners',
      'Private AC vehicle with dedicated professional chauffeur',
      'Experienced English-speaking local cultural guide',
      'Monument entry permits, toll fees and all state taxes',
    ],
    exclusions: exclusions.length > 0 ? exclusions : [
      'Airfare or train journeys to origin city',
      'Personal expenses, laundry, tips and beverage charges',
      'Optional adventure activities and camera permits',
      'Travel and medical insurance',
      'Anything not explicitly mentioned in inclusions',
    ],
    tags,
    itinerary: itineraryDays,
    featured: pkg.featured ?? false,
    isActive: pkg.isActive ?? true,
  };
}
