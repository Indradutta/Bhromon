// BHROMON Public Website API Client
// Connects public catalog, search, and booking forms to the shared backend database

const BASE_URL = '/api/v1/public';

async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg = data?.message || data?.errors?.[0]?.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const publicApi = {
  /**
   * Fetch all active tour packages with optional filtering
   */
  async getPackages(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all' && params.category !== 'All') {
      query.append('category', params.category);
    }
    if (params.destination && params.destination !== 'All') {
      query.append('destination', params.destination);
    }
    if (params.search) {
      query.append('search', params.search);
    }
    if (params.featured) {
      query.append('featured', 'true');
    }
    if (params.limit) {
      query.append('limit', String(params.limit));
    }

    const qs = query.toString();
    const url = qs ? `${BASE_URL}/packages?${qs}` : `${BASE_URL}/packages`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  /**
   * Fetch package by ID (or slug)
   */
  async getPackage(identifier) {
    const res = await fetch(`${BASE_URL}/packages/${encodeURIComponent(identifier)}`);
    return handleResponse(res);
  },

  /**
   * Fetch destinations
   */
  async getDestinations() {
    const res = await fetch(`${BASE_URL}/destinations`);
    return handleResponse(res);
  },

  /**
   * Submit new traveler enquiry or booking request
   */
  async submitEnquiry(enquiryData) {
    const res = await fetch(`${BASE_URL}/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enquiryData),
    });
    return handleResponse(res);
  },

  /**
   * Get public site settings & contact metadata
   */
  async getSettings() {
    const res = await fetch(`${BASE_URL}/settings`);
    return handleResponse(res);
  },
};

export default publicApi;
