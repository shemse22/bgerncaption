import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  LogOut,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { ErrorBoundary } from './ErrorBoundary';
import { PaymentRecord, SystemSettings, User } from '../types';
import { Api } from '../lib/api';
import { INITIAL_SETTINGS } from '../lib/storage';

interface AdminPageProps {
  users: User[];
  payments: PaymentRecord[];
  settings: SystemSettings;
  onApprovePayment: (paymentId: string) => { success: boolean; message: string };
  onRejectPayment: (paymentId: string, reason?: string) => void;
  onAddUserMinutes: (userId: string, minutes: number) => void;
  onSaveSettings: (settings: SystemSettings) => void;
}

const ADMIN_AUTH_SESSION_KEY = 'bgern_admin_auth_token';
const ADMIN_AUTH_REMEMBER_KEY = 'bgern_admin_remember_token';

/** Standalone admin route protected by username, email, and password authentication */
export const AdminPage: React.FC<AdminPageProps> = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY) === 'true' ||
        localStorage.getItem(ADMIN_AUTH_REMEMBER_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<string>(() => {
    return sessionStorage.getItem('bgern_admin_username') || 'admin';
  });

  const safeSettings = props.settings || INITIAL_SETTINGS;
  const validUsername = (safeSettings?.adminUsername || 'admin').toLowerCase();
  const validEmail = (safeSettings?.adminEmail || 'thebigel16@gmail.com').toLowerCase();
  const validPassword = safeSettings?.adminPassword || 'bgern@2026';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const inputUser = username.trim().toLowerCase();
    const inputEmail = email.trim().toLowerCase();
    const inputPass = password;

    try {
      // 1. First attempt verification with the server API
      let serverAuthSucceeded = false;
      try {
        const response = await Api.adminLogin({
          username: inputUser,
          email: inputEmail,
          password: inputPass,
        });
        if (response && response.token) {
          serverAuthSucceeded = true;
        }
      } catch {
        // Fallback to client-side credential verification if server route is unavailable
      }

      // 2. Validate credentials (server check or local settings check)
      const isUsernameMatch =
        serverAuthSucceeded ||
        inputUser === validUsername ||
        inputUser === 'admin' ||
        inputUser === 'shemse' ||
        inputUser === 'shemse22';

      const isEmailMatch =
        serverAuthSucceeded ||
        inputEmail === validEmail ||
        inputEmail === 'thebigel16@gmail.com';

      const isPasswordMatch =
        serverAuthSucceeded ||
        inputPass === validPassword ||
        inputPass === 'bgern@2026';

      if (isUsernameMatch && isEmailMatch && isPasswordMatch) {
        sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'true');
        sessionStorage.setItem('bgern_admin_username', username.trim() || 'admin');
        sessionStorage.setItem('bgern_admin_password', inputPass);
        if (rememberMe) {
          localStorage.setItem(ADMIN_AUTH_REMEMBER_KEY, 'true');
          localStorage.setItem('bgern_admin_password', inputPass);
        }
        setAuthenticatedUser(username.trim() || 'admin');
        setIsAuthenticated(true);
      } else {
        setError(
          'Invalid credentials. Please verify your Username, Email, and Password. (የተሳሳተ የተጠቃሚ ስም፣ ኢሜይል ወይም የይለፍ ቃል)'
        );
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const savedPass =
        sessionStorage.getItem('bgern_admin_password') ||
        localStorage.getItem('bgern_admin_password') ||
        validPassword;
      if (savedPass) {
        sessionStorage.setItem('bgern_admin_password', savedPass);
        Api.adminLogin({
          username: authenticatedUser || validUsername,
          email: validEmail,
          password: savedPass,
        }).catch(() => undefined);
      }
    }
  }, [isAuthenticated, authenticatedUser, validUsername, validEmail, validPassword]);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
      sessionStorage.removeItem('bgern_admin_username');
      sessionStorage.removeItem('bgern_admin_password');
      localStorage.removeItem(ADMIN_AUTH_REMEMBER_KEY);
      localStorage.removeItem('bgern_admin_password');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPassword('');
    setError(null);
  };

  const handleNavigateHome = () => {
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      window.location.hash = '#/';
    }
  };

  // If NOT authenticated, render the dedicated secure Admin Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative selection:bg-blue-600 selection:text-white">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back to Home Button */}
        <button
          type="button"
          onClick={handleNavigateHome}
          className="absolute top-5 left-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-sm touch-tap"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Creator App | ወደ ዋና ገጽ
        </button>

        {/* Login Container Card */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
          {/* Header & Shield Icon */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Bgern Admin Portal
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              የአስተዳዳሪ መግቢያ | Enter your credentials to access operations
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Username (የተጠቃሚ ስም) *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="admin or shemse"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Email (ኢሜይል) *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="thebigel16@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Password (የይለፍ ቃል) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember on this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 touch-tap"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" /> Unlock Admin Dashboard | ግባ
                </>
              )}
            </button>
          </form>

          {/* Credentials Info Footer */}
          <div className="pt-2 border-t border-slate-800/60 text-center">
            <p className="text-[11px] text-slate-400">
              Authorized admin access only. All actions are logged and verified.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If AUTHENTICATED, render full Operations workspace with Top Header and Logout
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 px-4 py-3 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black">Bgern Admin</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Authenticated
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Logged in as {authenticatedUser}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition touch-tap"
              title="Lock Admin Dashboard"
            >
              <LogOut className="h-3.5 w-3.5" /> Lock / Sign Out
            </button>

            <button
              onClick={handleNavigateHome}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition touch-tap"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Creator app
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <ErrorBoundary fallbackTitle="Admin Dashboard Error">
          <AdminDashboard {...props} />
        </ErrorBoundary>
      </main>
    </div>
  );
};
