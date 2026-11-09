import React, { useState, useEffect } from 'react';
import {
  Shield,
  Building,
  History,
  Save,
  CheckCircle2,
  Filter,
  Globe,
  Percent,
  MapPin,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import adminApi from '../api/adminApi';

const ENTITY_FILTERS = [
  'ALL',
  'AUTH',
  'BOOKING',
  'ENQUIRY',
  'QUOTATION',
  'INVOICE',
  'SETTINGS',
  'PACKAGE',
];

export default function AdminSettings() {
  const { admin } = useAdminAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    companyName: 'BHROMON',
    companyEmail: 'contact@bhromon.com',
    companyPhone: '+91 98765 43210',
    companyAddress: 'Heritage Towers, 14 Park Street, Kolkata, West Bengal - 700016',
    taxGstPercentage: 5.0,
    defaultCommissionPercentage: 10.0,
    currency: 'INR',
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeEntityFilter, setActiveEntityFilter] = useState('ALL');
  const [auditPage, setAuditPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadSettingsAndLogs = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, logsRes] = await Promise.all([
        adminApi.getAdminSettings(),
        adminApi.getAuditLogs({ entityType: activeEntityFilter, page: auditPage, limit: 15 }),
      ]);

      if (settingsRes?.data) {
        setSettingsForm({
          companyName: settingsRes.data.companyName || 'BHROMON',
          companyEmail: settingsRes.data.companyEmail || 'contact@bhromon.com',
          companyPhone: settingsRes.data.companyPhone || '+91 98765 43210',
          companyAddress: settingsRes.data.companyAddress || '',
          taxGstPercentage: settingsRes.data.taxGstPercentage || 5.0,
          defaultCommissionPercentage: settingsRes.data.defaultCommissionPercentage || 10.0,
          currency: settingsRes.data.currency || 'INR',
        });
      }

      if (logsRes?.data?.logs) {
        setAuditLogs(logsRes.data.logs);
        setTotalLogs(logsRes.data.pagination?.total || logsRes.data.logs.length);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      showToast(err.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndLogs();
  }, [activeEntityFilter, auditPage]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await adminApi.updateAdminSettings(settingsForm);
      if (res?.success) {
        showToast('Company settings updated successfully');
        loadSettingsAndLogs();
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          System Settings & Audit Trail
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure legal enterprise metadata, tax rates, contact channels, and inspect immutable system audit records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7/12): Company & Financial Parameters Form */}
        <form
          onSubmit={handleSaveSettings}
          className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Building className="w-4 h-4 text-[#B3452C]" />
              <span>Business & Financial Parameters</span>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#B3452C] hover:bg-[#963922] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Trade Name</label>
              <input
                type="text"
                required
                value={settingsForm.companyName}
                onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Support Email</label>
              <input
                type="email"
                required
                value={settingsForm.companyEmail}
                onChange={(e) => setSettingsForm({ ...settingsForm, companyEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Phone / WhatsApp</label>
              <input
                type="text"
                required
                value={settingsForm.companyPhone}
                onChange={(e) => setSettingsForm({ ...settingsForm, companyPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Operational Currency</label>
              <input
                type="text"
                value={settingsForm.currency}
                onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Registered Office Address</label>
              <textarea
                rows="2"
                value={settingsForm.companyAddress}
                onChange={(e) => setSettingsForm({ ...settingsForm, companyAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">GST Tax Rate (%) — Tour Operator</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="28"
                  value={settingsForm.taxGstPercentage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, taxGstPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] font-bold text-[#B3452C]"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">SAC 998555: CGST 2.5% + SGST 2.5%</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Markup / Commission (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={settingsForm.defaultCommissionPercentage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, defaultCommissionPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B3452C] font-bold text-slate-700"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Applied to customized quotation costing</p>
            </div>
          </div>
        </form>

        {/* Right Column (5/12): Administrator Profile Card */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-sm text-slate-900">
            <Shield className="w-4 h-4 text-[#B3452C]" />
            <span>Administrator Security Profile</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Name</span>
                <span className="font-bold text-slate-900">{admin?.name || 'Administrator'}</span>
              </div>
              <User className="w-4 h-4 text-slate-400" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Email Account</span>
                <span className="font-bold text-slate-900">{admin?.email || 'admin@bhromon.com'}</span>
              </div>
              <Mail className="w-4 h-4 text-slate-400" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Access Security Model</span>
                <span className="font-bold text-slate-800">Single Administrator (SUPER_ADMIN)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Session Security</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Protected with HTTP-only SameSite JSON Web Token cookies. Automatic timeout on inactivity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Audit Trail Log Feed */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#B3452C]" />
            <h3 className="font-bold text-sm text-slate-900 font-display">
              Live Audit Trail ({totalLogs} Total Records)
            </h3>
          </div>

          {/* Entity Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px] font-semibold">
            {ENTITY_FILTERS.map((ef) => (
              <button
                key={ef}
                type="button"
                onClick={() => {
                  setActiveEntityFilter(ef);
                  setAuditPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeEntityFilter === ef
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ef}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Feed */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Loading system audit logs...
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No audit records matching filter "{activeEntityFilter}".
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">
                    {log.entityType}
                  </span>
                  {log.details && (
                    <span className="text-slate-500 text-[11px] truncate max-w-xs font-mono">
                      {log.details}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px] self-end sm:self-auto">
                  {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
