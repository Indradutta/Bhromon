import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Layout & Pages
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BookingEnquiry from './pages/BookingEnquiry';
import Contact from './pages/Contact';
import TourDetail from './pages/TourDetail';
import TourPackages from './pages/TourPackages';

// CRM Architecture, Context & Views
import { AdminAuthProvider } from './crm/context/AdminAuthContext';
import AdminProtectedRoute from './crm/components/AdminProtectedRoute';
import AdminLayout from './crm/layouts/AdminLayout';
import AdminLogin from './crm/pages/AdminLogin';
import AdminDashboard from './crm/pages/AdminDashboard';
import AdminEnquiries from './crm/pages/AdminEnquiries';
import AdminPackages from './crm/pages/AdminPackages';
import AdminCustomers from './crm/pages/AdminCustomers';
import AdminBookings from './crm/pages/AdminBookings';
import AdminQuotations from './crm/pages/AdminQuotations';
import AdminInvoices from './crm/pages/AdminInvoices';
import AdminReports from './crm/pages/AdminReports';
import AdminSettings from './crm/pages/AdminSettings';
import AdminHotels from './crm/pages/AdminHotels';

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* ========================================================= */}
          {/* 1. PUBLIC WEBSITE ROUTES (Unified with Preloader & Nav)   */}
          {/* ========================================================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Home />} />
            <Route path="/tours" element={<TourPackages embedded={true} />} />
            <Route path="/tours/:id" element={<TourDetail embedded={true} />} />
            <Route path="/blog" element={<Blog embedded={true} />} />
            <Route path="/booking" element={<BookingEnquiry embedded={true} />} />
            <Route path="/contact" element={<Contact embedded={true} />} />
          </Route>

          {/* ========================================================= */}
          {/* 2. ADMIN CRM AUTHENTICATION                               */}
          {/* ========================================================= */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ========================================================= */}
          {/* 3. PROTECTED ADMIN CRM SYSTEM (Strict Single Admin Model) */}
          {/* ========================================================= */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="hotels" element={<AdminHotels />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="documents" element={<Navigate to="/admin/bookings" replace />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="quotations" element={<AdminQuotations />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
