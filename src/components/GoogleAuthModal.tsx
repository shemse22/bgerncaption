import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, CheckCircle2, ArrowRight, User as UserIcon, Mail } from 'lucide-react';
import { User } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  actionReason?: string;
  defaultEmail?: string;
}

export const getGmailAccountDetails = (emailStr: string) => {
  const cleanEmail = (emailStr || '').toLowerCase().trim();
  if (cleanEmail === 'thebigel16@gmail.com') {
    return {
      displayName: 'Shemsedin Abate',
      avatar: 'https://unavatar.io/thebigel16@gmail.com?fallback=https://ui-avatars.com/api/?name=Shemsedin+Abate&background=1a73e8&color=fff&size=256&bold=true&font-size=0.45',
    };
  }
  const prefix = cleanEmail.split('@')[0] || 'Google User';
  const words = prefix.replace(/[._-]+/g, ' ').split(' ').filter(Boolean);
  const formatted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const displayName = formatted || 'Google Creator';
  return {
    displayName,
    avatar: `https://unavatar.io/${cleanEmail}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1a73e8&color=fff&size=256&bold=true&font-size=0.45`,
  };
};

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionReason = 'start generating captions',
  defaultEmail = 'demo@gmail.com',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState<string>(defaultEmail);
  const [name, setName] = useState<string>(() => getGmailAccountDetails(defaultEmail).displayName);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleAuth = (customEmail?: string, customName?: string) => {
    setIsLoading(true);

    setTimeout(() => {
      const selectedEmail = (customEmail || email || defaultEmail).trim();
      const accountDetails = getGmailAccountDetails(selectedEmail);
      const finalDisplayName = (customName && customName.trim() && customName !== 'Google User' && customName !== 'Creator')
        ? customName.trim()
        : accountDetails.displayName;

      const finalAvatar = (customName && customName !== accountDetails.displayName)
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(finalDisplayName)}&background=1a73e8&color=fff&size=256&bold=true&font-size=0.45`
        : accountDetails.avatar;

      const authenticatedUser: User = {
        id: `usr-google-${Date.now()}`,
        name: finalDisplayName,
        email: selectedEmail,
        avatar: finalAvatar,
        googleOriginalAvatar: finalAvatar,
        role: 'user',
        availableMinutes: 180, // 3 free minutes
        plan: 'free',
        status: 'active',
        createdAt: new Date().toISOString(),
        provider: 'google',
        googleId: `goog-${Math.random().toString(36).substring(2, 11)}`,
        bio: 'Video creator making Amharic captioned content with Bgern',
        channelHandle: `@${finalDisplayName.toLowerCase().replace(/\s+/g, '')}`,
        preferredLanguage: 'Amharic',
        autoGenerateThumbnails: true,
      };

      setIsLoading(false);
      onSuccess(authenticatedUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 touch-tap z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-7 text-center border-b border-slate-100 dark:border-slate-800">
          {/* Google "G" Logo */}
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {mode === 'signup' ? 'Create Account with Google' : 'Sign In with Google'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            You must connect your Google account before you can <span className="font-bold text-blue-600 dark:text-blue-400">{actionReason}</span>.
          </p>

          {/* Mode Switch Pills */}
          <div className="flex items-center justify-center gap-1 mt-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                mode === 'signin'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {!isCustomMode ? (
            <div className="space-y-3">
              {/* Primary Google One-Click Button */}
              <button
                type="button"
                id="google-primary-auth-btn"
                onClick={() => handleGoogleAuth(defaultEmail)}
                disabled={isLoading}
                className="w-full min-h-[56px] p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-xs transition active:scale-[0.98] touch-tap group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={getGmailAccountDetails(defaultEmail).avatar}
                      alt="Gmail Account Avatar"
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left min-w-0 truncate">
                    <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      <span>{mode === 'signup' ? 'Sign up as' : 'Continue as'}</span>
                      <span className="text-blue-600 dark:text-blue-400">{getGmailAccountDetails(defaultEmail).displayName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                      <span>{defaultEmail}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• Gmail Account</span>
                    </div>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Or switch to custom Google email */}
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(true);
                  setName(getGmailAccountDetails(email).displayName);
                }}
                className="w-full text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 transition"
              >
                Use another Google Account...
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Google Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmail = e.target.value;
                      setEmail(newEmail);
                      setName(getGmailAccountDetails(newEmail).displayName);
                    }}
                    placeholder="you@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Gmail Display Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full display name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Live Preview of Gmail profile info */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 text-xs">
                <img
                  src={getGmailAccountDetails(email).avatar}
                  alt="Avatar preview"
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-blue-500/30"
                />
                <div className="min-w-0 truncate">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{name || getGmailAccountDetails(email).displayName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{email || 'your-email@gmail.com'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleGoogleAuth(email, name)}
                  disabled={isLoading || !email}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{mode === 'signup' ? 'Complete Google Sign Up' : 'Sign in with Google'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Perks checklist */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Includes 3 free minutes of high-accuracy Amharic speech-to-text</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Full video project management & instant video deletion</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Export burned-in video, SRT & VTT subtitle files</span>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Local demo sign-in for testing • No password stored, no real account created</span>
          </div>
        </div>
      </div>
    </div>
  );
};
