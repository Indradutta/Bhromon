// BHROMON CRM API Client
// Handles authenticated administrative requests using secure HTTP-only cookies

const AUTH_BASE = '/api/v1/admin/auth';
const DASHBOARD_BASE = '/api/v1/admin/dashboard';
const ENQUIRIES_BASE = '/api/v1/admin/enquiries';
const PACKAGES_BASE = '/api/v1/admin/packages';
const CUSTOMERS_BASE = '/api/v1/admin/customers';
const BOOKINGS_BASE = '/api/v1/admin/bookings';
const QUOTATIONS_BASE = '/api/v1/admin/quotations';
const INVOICES_BASE = '/api/v1/admin/invoices';
const REPORTS_BASE = '/api/v1/admin/reports';
const DOCUMENTS_BASE = '/api/v1/admin/documents';
const HOTELS_BASE = '/api/v1/admin/hotels';

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

export const adminApi = {
  // -------------------------------------------------------------
  // 1. Authentication
  // -------------------------------------------------------------
  async login(identifier, password, otp = null, requireOtp = false) {
    const payload = {
      identifier,
      email: identifier,
      password,
      requireOtp: !!requireOtp,
    };
    if (otp) payload.otp = otp;

    const res = await fetch(`${AUTH_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async sendOtp(identifier) {
    const res = await fetch(`${AUTH_BASE}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier }),
    });
    return handleResponse(res);
  },

  async forgotPassword(identifier) {
    const res = await fetch(`${AUTH_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier }),
    });
    return handleResponse(res);
  },

  async resetPassword(identifier, resetCode, newPassword) {
    const res = await fetch(`${AUTH_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, resetCode, newPassword }),
    });
    return handleResponse(res);
  },

  async logout() {
    const res = await fetch(`${AUTH_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${AUTH_BASE}/me`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${AUTH_BASE}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${AUTH_BASE}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // 2. Executive Dashboard Analytics
  // -------------------------------------------------------------
  async getDashboardSummary() {
    const res = await fetch(`${DASHBOARD_BASE}/summary`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // 3. Lead & Inquiry Pipeline
  // -------------------------------------------------------------
  async getEnquiries(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${ENQUIRIES_BASE}?${query}` : ENQUIRIES_BASE;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getEnquiryById(id) {
    const res = await fetch(`${ENQUIRIES_BASE}/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async createEnquiry(enquiryData) {
    const res = await fetch(ENQUIRIES_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(enquiryData),
    });
    return handleResponse(res);
  },

  async updateEnquiryStatus(id, status, notes) {
    const res = await fetch(`${ENQUIRIES_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(res);
  },

  async deleteEnquiry(id) {
    const res = await fetch(`${ENQUIRIES_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async addFollowUp(enquiryId, followUpData) {
    const res = await fetch(`${ENQUIRIES_BASE}/${enquiryId}/followups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(followUpData),
    });
    return handleResponse(res);
  },

  async updateFollowUp(enquiryId, followUpId, status) {
    const res = await fetch(`${ENQUIRIES_BASE}/${enquiryId}/followups/${followUpId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async addCommunicationLog(enquiryId, logData) {
    const res = await fetch(`${ENQUIRIES_BASE}/${enquiryId}/communications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(logData),
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // 4. Tour Package Catalog & Itinerary Management
  // -------------------------------------------------------------
  async getPackages(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${PACKAGES_BASE}?${query}` : PACKAGES_BASE;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getPackageById(id) {
    const res = await fetch(`${PACKAGES_BASE}/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async createPackage(packageData) {
    const res = await fetch(PACKAGES_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(packageData),
    });
    return handleResponse(res);
  },

  async updatePackage(id, packageData) {
    const res = await fetch(`${PACKAGES_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(packageData),
    });
    return handleResponse(res);
  },

  async updatePackageStatus(id, statusData) {
    const res = await fetch(`${PACKAGES_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(statusData),
    });
    return handleResponse(res);
  },

  async deletePackage(id) {
    const res = await fetch(`${PACKAGES_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getDestinations() {
    const res = await fetch(`${PACKAGES_BASE}/meta/destinations`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // 5. Customer 360 CRM Hub
  // -------------------------------------------------------------
  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${CUSTOMERS_BASE}?${query}` : CUSTOMERS_BASE;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getCustomerById(id) {
    const res = await fetch(`${CUSTOMERS_BASE}/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async createCustomer(customerData) {
    const res = await fetch(CUSTOMERS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(customerData),
    });
    return handleResponse(res);
  },

  async updateCustomer(id, customerData) {
    const res = await fetch(`${CUSTOMERS_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(customerData),
    });
    return handleResponse(res);
  },

  async deleteCustomer(id) {
    const res = await fetch(`${CUSTOMERS_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async addCustomerCommunication(customerId, logData) {
    const res = await fetch(`${CUSTOMERS_BASE}/${customerId}/communications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(logData),
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // 6. Booking Management Hub
  // -------------------------------------------------------------
  async getBookings(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${BOOKINGS_BASE}?${query}` : BOOKINGS_BASE;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getBookingById(id) {
    const res = await fetch(`${BOOKINGS_BASE}/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async createBooking(bookingData) {
    const res = await fetch(BOOKINGS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(bookingData),
    });
    return handleResponse(res);
  },

  async updateBookingStatus(id, status) {
    const res = await fetch(`${BOOKINGS_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async updateBookingManifest(id, manifestData) {
    const res = await fetch(`${BOOKINGS_BASE}/${id}/manifest`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(manifestData),
    });
    return handleResponse(res);
  },

  async recordBookingPayment(bookingId, paymentData) {
    const res = await fetch(`${BOOKINGS_BASE}/${bookingId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(paymentData),
    });
    return handleResponse(res);
  },

  async deleteBooking(id) {
    const res = await fetch(`${BOOKINGS_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // 7. Quotation Proposal Engine
  // -------------------------------------------------------------
  async getQuotations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${QUOTATIONS_BASE}?${query}` : QUOTATIONS_BASE;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getQuotationById(id) {
    const res = await fetch(`${QUOTATIONS_BASE}/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async createQuotation(quotationData) {
    const res = await fetch(QUOTATIONS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(quotationData),
    });
    return handleResponse(res);
  },

  async updateQuotationStatus(id, status) {
    const res = await fetch(`${QUOTATIONS_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async convertQuotationToBooking(id, conversionData = {}) {
    const res = await fetch(`${QUOTATIONS_BASE}/${id}/convert-to-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(conversionData),
    });
    return handleResponse(res);
  },

  async deleteQuotation(id) {
    const res = await fetch(`${QUOTATIONS_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // 8. Invoices & GST Financials
  // -------------------------------------------------------------
  async getInvoices(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${INVOICES_BASE}?${query}` : INVOICES_BASE;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getInvoiceById(id) {
    const res = await fetch(`${INVOICES_BASE}/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async generateInvoice(invoiceData) {
    const res = await fetch(`${INVOICES_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(invoiceData),
    });
    return handleResponse(res);
  },

  async updateInvoiceStatus(id, status) {
    const res = await fetch(`${INVOICES_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async syncInvoice(id) {
    const res = await fetch(`${INVOICES_BASE}/${id}/sync`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async sendInvoice(id) {
    const res = await fetch(`${INVOICES_BASE}/${id}/send`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async cancelInvoice(id, reason) {
    const res = await fetch(`${INVOICES_BASE}/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // 9. Business Analytics & Executive Reports
  // -------------------------------------------------------------
  async getReportsOverview(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${REPORTS_BASE}/overview?${query}` : `${REPORTS_BASE}/overview`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getRevenueBreakdown() {
    const res = await fetch(`${REPORTS_BASE}/revenue-breakdown`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getLeadFunnel() {
    const res = await fetch(`${REPORTS_BASE}/funnel`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async exportCsv(type = 'bookings') {
    const res = await fetch(`${REPORTS_BASE}/export?type=${type}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to generate CSV export');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhromon-${type}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return true;
  },

  // -------------------------------------------------------------
  // 10. Corporate Settings & Live Audit Logs
  // -------------------------------------------------------------
  async getAdminSettings() {
    const res = await fetch(`${REPORTS_BASE}/settings`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async updateAdminSettings(settingsData) {
    const res = await fetch(`${REPORTS_BASE}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(settingsData),
    });
    return handleResponse(res);
  },

  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${REPORTS_BASE}/audit-logs?${query}` : `${REPORTS_BASE}/audit-logs`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // 11. Travel Documents Management
  // -------------------------------------------------------------
  async getDocuments(params = {}) {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleaned).toString();
    const url = query ? `${DOCUMENTS_BASE}?${query}` : DOCUMENTS_BASE;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async uploadDocument(docData) {
    const res = await fetch(DOCUMENTS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(docData),
    });
    return handleResponse(res);
  },

  async downloadDocument(id, fileName = 'document.pdf') {
    const res = await fetch(`${DOCUMENTS_BASE}/${id}/download`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to download document');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return true;
  },

  getViewDocumentUrl(id) {
    return `${DOCUMENTS_BASE}/${id}/view`;
  },

  async replaceDocument(id, replaceData) {
    const res = await fetch(`${DOCUMENTS_BASE}/${id}/replace`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(replaceData),
    });
    return handleResponse(res);
  },

  async deleteDocument(id) {
    const res = await fetch(`${DOCUMENTS_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // 12. Hotel Management
  // -------------------------------------------------------------
  async getHotels(params = {}) {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleaned).toString();
    const url = query ? `${HOTELS_BASE}?${query}` : HOTELS_BASE;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async createHotel(hotelData) {
    const res = await fetch(HOTELS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(hotelData),
    });
    return handleResponse(res);
  },

  async updateHotel(id, hotelData) {
    const res = await fetch(`${HOTELS_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(hotelData),
    });
    return handleResponse(res);
  },

  async deleteHotel(id) {
    const res = await fetch(`${HOTELS_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(res);
  },
};

export default adminApi;
