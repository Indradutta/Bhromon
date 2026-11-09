import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminProtectedRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0F172A] text-white">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-[#B3452C]/30 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#B3452C] animate-pulse" />
            </div>
            <Loader2 className="w-16 h-16 text-[#B3452C] absolute inset-0 animate-spin opacity-40" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold tracking-wide text-white font-display">
              BHROMON CRM
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verifying administrative security session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
