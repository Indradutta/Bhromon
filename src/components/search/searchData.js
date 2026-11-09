// ============================================================================
// BHROMON Search Data & Helpers
// ============================================================================
import { Compass, Building2, Activity, Plane } from 'lucide-react';
import { TOURS_DATA } from '../../data/tours';

export const SEARCH_CATEGORIES = [
  {
    id: 'tours',
    label: 'Tours',
    Icon: Compass,
    whereLabel: 'WHERE TO?',
    placeholder: 'Destination, city or tour',
    helperText: 'e.g. Ladakh, Kerala, Varanasi',
    dateLabel: 'TRAVEL DATE',
    buttonText: 'Search Tours',
    ariaLabel: 'Search tours',
  },
  {
    id: 'hotels',
    label: 'Hotels',
    Icon: Building2,
    whereLabel: 'WHERE TO STAY?',
    placeholder: 'Heritage palace, haveli or stay',
    helperText: 'e.g. Udaipur, Alleppey, Jaipur',
    dateLabel: 'CHECK-IN DATE',
    buttonText: 'Search Hotels',
    ariaLabel: 'Search heritage hotels and stays',
  },
  {
    id: 'activities',
    label: 'Activities',
    Icon: Activity,
    whereLabel: 'CURATED ACTIVITY?',
    placeholder: 'Adventure, river cruise or ceremony',
    helperText: 'e.g. Ganga Aarti, Kayaking, Safari',
    dateLabel: 'ACTIVITY DATE',
    buttonText: 'Search Activities',
    ariaLabel: 'Search curated activities',
  },
  {
    id: 'customTrip',
    label: 'Custom Trip',
    Icon: Plane,
    whereLabel: 'DREAM DESTINATION?',
    placeholder: 'Tailor-made journey or circuit',
    helperText: 'e.g. 10-day Himalayan & Golden Triangle',
    dateLabel: 'DEPARTURE DATE',
    buttonText: 'Plan My Trip',
    ariaLabel: 'Create custom bespoke journey',
  },
];

export const POPULAR_DESTINATIONS = [
  { id: 'varanasi', name: 'Varanasi', region: 'Uttar Pradesh, India', desc: 'Ancient Ghats, Ganga Aarti & Silk Weavers' },
  { id: 'rajasthan', name: 'Rajasthan', region: 'Jaipur, Jodhpur & Udaipur', desc: 'Royal Forts, Amber Palaces & Desert Starlight' },
  { id: 'kerala', name: 'Kerala', region: 'Alleppey & Munnar', desc: 'Backwater Houseboats & Cardamom Tea Hills' },
  { id: 'ladakh', name: 'Ladakh', region: 'Leh, Nubra & Pangong', desc: 'High Mountain Passes & Starlit Monasteries' },
  { id: 'sikkim', name: 'Sikkim', region: 'Gangtok & Pelling', desc: 'Kanchenjunga Views & Sacred Monasteries' },
  { id: 'darjeeling', name: 'Darjeeling', region: 'West Bengal, India', desc: 'Himalayan Toy Train & Heritage Tea Gardens' },
  { id: 'kashmir', name: 'Kashmir', region: 'Srinagar, Gulmarg & Pahalgam', desc: 'Dal Lake Shikaras & Snow Valley Meadows' },
  { id: 'goa', name: 'Goa', region: 'Fontainhas & South Beaches', desc: 'Portuguese Heritage & Palm Fringed Shores' },
  { id: 'andaman', name: 'Andaman Islands', region: 'Havelock & Neil Island', desc: 'Crystal Waters & Bioluminescent Bays' },
  { id: 'himachal', name: 'Himachal Pradesh', region: 'Spiti & Tirthan Valley', desc: 'Rugged Himalayan Gorges & Pine Forests' },
  { id: 'meghalaya', name: 'Meghalaya', region: 'Cherrapunji & Dawki', desc: 'Living Root Bridges & Emerald Rivers' },
  { id: 'uttarakhand', name: 'Uttarakhand', region: 'Rishikesh & Kedarnath', desc: 'Himalayan Yoga Capitals & Sacred Shrines' },
];

/**
 * Filter destinations from both popular list and TOURS_DATA
 */
export function filterDestinations(query) {
  if (!query || !query.trim()) {
    return POPULAR_DESTINATIONS;
  }
  const q = query.toLowerCase().trim();
  
  // Search popular list
  const popularMatches = POPULAR_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q) ||
      d.desc.toLowerCase().includes(q)
  );

  // Search TOURS_DATA for additional matches
  const tourMatches = TOURS_DATA.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q) ||
      t.region.toLowerCase().includes(q) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
  ).map((t) => ({
    id: `tour-${t.id}`,
    name: t.title,
    region: t.destination,
    desc: `${t.durationText} • ₹${t.price.toLocaleString('en-IN')}`,
    isTour: true,
  }));

  // Combine and deduplicate by name
  const combined = [...popularMatches];
  for (const tm of tourMatches) {
    if (!combined.some((c) => c.name.toLowerCase() === tm.name.toLowerCase())) {
      combined.push(tm);
    }
  }

  return combined;
}

/**
 * Format Date to readable string: "11 Oct 2026"
 */
export function formatReadableDate(dateInput) {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Get ISO Date string: "YYYY-MM-DD"
 */
export function toISODateString(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Build traveller summary string
 */
export function getTravellerSummary({ adults = 2, children = 0, infants = 0 }) {
  const parts = [];
  if (adults > 0) {
    parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`);
  }
  if (children > 0) {
    parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
  }
  if (infants > 0) {
    parts.push(`${infants} Infant${infants > 1 ? 's' : ''}`);
  }
  return parts.length > 0 ? parts.join(', ') : '2 Adults';
}
