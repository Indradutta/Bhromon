import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import adminApi from '../api/adminApi';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AdminLogin() {
  const { login, isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form inputs & refs
  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('bhromon_remembered_admin') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem('bhromon_remembered_admin');
  });

  const identifierInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Inline field errors (pure JavaScript, eliminates native browser "!" tooltip, no separate popup card)
  const [fieldErrors, setFieldErrors] = useState({ identifier: '', password: '' });

  // Lockout & Security
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);

  // Forgot Password / Reset Flow
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: request code, 2: reset
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [devResetCode, setDevResetCode] = useState('');

  // Success toast
  const [successToast, setSuccessToast] = useState('');

  // Session timeout detection from query string
  const [sessionTimeoutNotice, setSessionTimeoutNotice] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reason') === 'session_expired') {
      setSessionTimeoutNotice(true);
    }
  }, [location]);

  // Live countdown timer for lockout
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMsg('');
    setSuccessToast('');

    const cleanId = identifier.trim();
    const cleanPwd = password.trim();

    // Pure JavaScript inline validation: simple message directly on the box, no separate popup card
    if (!cleanId) {
      setFieldErrors({ identifier: 'Please fill in this box', password: '' });
      identifierInputRef.current?.focus();
      return;
    }

    if (!cleanPwd) {
      setFieldErrors({ identifier: '', password: 'Please fill in this box' });
      passwordInputRef.current?.focus();
      return;
    }

    setFieldErrors({ identifier: '', password: '' });

    setIsSubmitting(true);
    try {
      const result = await login(cleanId, password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('bhromon_remembered_admin', cleanId);
        } else {
          localStorage.removeItem('bhromon_remembered_admin');
        }
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        // Handle lockout or failed attempt
        if (result.data?.locked) {
          setLockoutRemaining(result.data.remainingSeconds || 900);
          setErrorMsg('Account locked due to 5 consecutive failed attempts.');
        } else if (result.data?.remainingAttempts !== undefined) {
          setAttemptsRemaining(result.data.remainingAttempts);
          setErrorMsg(`Invalid credentials. ${result.data.remainingAttempts} attempts remaining.`);
        } else {
          setErrorMsg(result.error || 'Invalid email, username or password.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (type = 'email') => {
    if (type === 'mobile') {
      setIdentifier('9876543210');
    } else {
      setIdentifier('admin@bhromon.com');
    }
    setPassword('Admin@Bhromon2026!');
    setErrorMsg('');
    setFieldErrors({ identifier: '', password: '' });
  };

  // Forgot password request code
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');

    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your registered email or mobile number.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await adminApi.forgotPassword(forgotIdentifier.trim());
      if (res?.success) {
        setForgotStep(2);
        setForgotMsg('Verification code generated successfully.');
        if (res.data?.devResetCode) {
          setDevResetCode(res.data.devResetCode);
          setResetCode(res.data.devResetCode);
        }
      } else {
        setForgotError(res?.message || 'Failed to generate reset code.');
      }
    } catch (err) {
      setForgotError(err.message || 'No administrator account found with those details.');
    } finally {
      setIsResetting(false);
    }
  };

  // Submit new password
  const handlePerformPasswordReset = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');

    if (!resetCode.trim()) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 8) {
      setForgotError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await adminApi.resetPassword(forgotIdentifier.trim(), resetCode.trim(), newPassword);
      if (res?.success) {
        setShowForgotModal(false);
        setSuccessToast('Password reset successfully! You can now log in.');
        setPassword(newPassword);
        setForgotStep(1);
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setForgotError(res?.message || 'Failed to reset password.');
      }
    } catch (err) {
      setForgotError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsResetting(false);
    }
  };

  const formatLockoutTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center lg:justify-end px-4 sm:px-8 lg:pr-[12%] xl:pr-[14%] bg-[#FAF5EE] bg-cover bg-no-repeat bg-center selection:bg-[#B3452C] selection:text-white relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/login-background.png')",
      }}
    >
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-900/90 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 border border-emerald-700 backdrop-blur-md animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Suppress all browser focus-visible selecting lines & outlines */}
      <style>{`
        input:focus, input:focus-visible, input:active,
        input[type="text"]:focus, input[type="text"]:focus-visible,
        input[type="password"]:focus, input[type="password"]:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }
      `}</style>

      {/* Main Login Card - Exact Reference Alignment */}
      <div className="w-full max-w-[420px] bg-white rounded-[28px] p-8 sm:p-9 shadow-[0_20px_50px_rgba(80,30,10,0.08)] border border-stone-200/70 relative z-10 transition-all">
        {/* BHROMON Brand Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/images/logo1.png"
            alt="BHROMON"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Header Title: Only "Login" per user direction */}
        <h1 className="text-[26px] font-bold text-slate-900 text-center tracking-tight leading-tight">
          Login
        </h1>
        <p className="text-xs text-slate-500 text-center mt-1 mb-6 font-normal">
          For Company Administrators
        </p>

        {/* Session Inactivity Alert */}
        {sessionTimeoutNotice && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Your session expired due to inactivity. Please log in again.</span>
          </div>
        )}

        {/* Lockout Countdown Alert */}
        {lockoutRemaining > 0 && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold">Account Temporarily Locked</p>
              <p className="text-[11px] mt-0.5 text-rose-700">
                Too many failed attempts. Try again in{' '}
                <span className="font-mono font-bold">{formatLockoutTimer(lockoutRemaining)}</span>
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && lockoutRemaining === 0 && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Container - noValidate ensures browser never shows native exclamation popup */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Input 1: Email or Username */}
          <div>
            <div
              className={`relative flex items-center rounded-xl border transition-colors ${
                fieldErrors.identifier
                  ? 'border-[#B3452C] bg-red-50/20'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <span className={`pl-3.5 ${fieldErrors.identifier ? 'text-[#B3452C]' : 'text-slate-400'}`}>
                <Mail className="w-4 h-4" />
              </span>
              <input
                ref={identifierInputRef}
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (fieldErrors.identifier) setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                }}
                disabled={lockoutRemaining > 0}
                placeholder="Email or Username"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                className="w-full pl-3 pr-4 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none disabled:opacity-60"
                autoComplete="username"
              />
            </div>
            {fieldErrors.identifier && (
              <p className="text-[11px] text-[#B3452C] mt-1.5 pl-1 font-medium flex items-center gap-1.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.identifier}</span>
              </p>
            )}
          </div>

          {/* Input 2: Password */}
          <div>
            <div
              className={`relative flex items-center rounded-xl border transition-colors ${
                fieldErrors.password
                  ? 'border-[#B3452C] bg-red-50/20'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <span className={`pl-3.5 ${fieldErrors.password ? 'text-[#B3452C]' : 'text-slate-400'}`}>
                <Lock className="w-4 h-4" />
              </span>
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                disabled={lockoutRemaining > 0}
                placeholder="Password"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                className="w-full pl-3 pr-10 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none disabled:opacity-60"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors outline-none focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-[#B3452C] mt-1.5 pl-1 font-medium flex items-center gap-1.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-0.5 text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#B3452C] focus:ring-0 accent-[#B3452C] cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotIdentifier(identifier);
                setShowForgotModal(true);
              }}
              className="text-[#B3452C] hover:underline font-medium cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Primary Action Button: Log In */}
          <button
            type="submit"
            disabled={isSubmitting || lockoutRemaining > 0}
            className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-white bg-[#B3452C] hover:bg-[#9E3922] active:bg-[#85321E] shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Footer Helper */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Quick Demo Access:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('email')}
              className="text-xs font-medium text-[#B3452C] hover:underline cursor-pointer"
            >
              Email
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleFillDemo('mobile')}
              className="text-xs font-medium text-[#B3452C] hover:underline cursor-pointer"
            >
              Mobile
            </button>
          </div>
        </div>
      </div>



      {/* 
        ========================================================================
        FORGOT PASSWORD & RESET MODAL
        ========================================================================
      */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#B3452C]" />
                <span>Reset Administrator Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {forgotError}
              </div>
            )}
            {forgotMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {forgotMsg}
              </div>
            )}
            {devResetCode && (
              <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex justify-between items-center">
                <span>Verification Code: <strong className="font-mono">{devResetCode}</strong></span>
                <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded">15-min validity</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestResetCode} noValidate className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your registered work email address or mobile number to receive a secure 6-digit reset code.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="admin@bhromon.com or 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#B3452C] hover:bg-[#963922] cursor-pointer disabled:opacity-50"
                  >
                    {isResetting ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePerformPasswordReset} noValidate className="space-y-3.5">
                <p className="text-xs text-slate-500">
                  Enter the 6-digit verification code and your new password.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#B3452C]"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#B3452C] hover:bg-[#963922] cursor-pointer disabled:opacity-50"
                  >
                    {isResetting ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
