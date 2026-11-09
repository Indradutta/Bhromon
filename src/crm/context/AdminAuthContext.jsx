import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import adminApi from '../api/adminApi';

const AdminAuthContext = createContext(null);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_TIMEOUT_MS = 25 * 60 * 1000;    // 25 minutes (5 min grace warning)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const lastActivityRef = useRef(Date.now());

  // Reset inactivity timer on user interactions
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (sessionWarning) setSessionWarning(false);
  }, [sessionWarning]);

  // Check existing session cookie on initial load
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getMe();
      if (res?.success && res?.data?.admin) {
        setAdmin(res.data.admin);
        setIsAuthenticated(true);
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch {
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Inactivity tracking loop
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        // Automatic session timeout logout
        setSessionExpired(true);
        logout();
      } else if (elapsed >= WARNING_TIMEOUT_MS) {
        setSessionWarning(true);
      }
    }, 15000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const login = async (identifier, password, otp = null, requireOtp = false) => {
    try {
      setIsLoading(true);
      setError(null);
      setSessionExpired(false);
      const res = await adminApi.login(identifier, password, otp, requireOtp);
      if (res?.data?.otpRequired) {
        return { success: false, otpRequired: true, destination: res.data.destination, devOtp: res.data.devOtp };
      }
      if (res?.success && res?.data?.admin) {
        setAdmin(res.data.admin);
        setIsAuthenticated(true);
        lastActivityRef.current = Date.now();
        return { success: true, admin: res.data.admin };
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      const msg = err.message || 'Invalid email, mobile, or password';
      setError(msg);
      setIsAuthenticated(false);
      setAdmin(null);
      return {
        success: false,
        error: msg,
        status: err.status,
        data: err.data,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await adminApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await adminApi.updateProfile(profileData);
    if (res?.success && res?.data?.admin) {
      setAdmin(res.data.admin);
    }
    return res;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await adminApi.changePassword(currentPassword, newPassword);
  };

  const value = {
    admin,
    isAuthenticated,
    isLoading,
    error,
    sessionWarning,
    sessionExpired,
    resetInactivityTimer,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshAuth: checkSession,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

export default AdminAuthContext;
