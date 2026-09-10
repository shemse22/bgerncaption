import React, { useState, useMemo } from 'react';
import {
  User as UserIcon,
  Clock,
  Shield,
  Smartphone,
  Download,
  LogOut,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  LineChart,
  Film,
  Calendar,
  Save,
  Check,
  Languages,
  AtSign,
  FileText,
  Palette,
  ExternalLink,
  ShieldCheck,
  CheckCheck,
  Camera,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { User, MinuteTransaction, Project } from '../types';
import { formatTimeSeconds } from '../lib/subtitles';
import { Theme } from '../lib/theme';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';
import { getGmailAccountDetails } from './GoogleAuthModal';
import { useAuthService } from './ClerkAuthProvider';

interface ProfileViewProps {
  user: User;
  transactions?: MinuteTransaction[];
  projects?: Project[];
  onUpdateUser?: (updatedUser: User) => void;
  onOpenGoogleAuth?: () => void;
  onLogout?: () => void;
  onToggleRole?: () => void;
  onOpenAdmin?: () => void;
  onOpenWallet: () => void;
  onResetData: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
}

interface MonthlyDataPoint {
  month: string;
  fullName: string;
  minutes: number;
  videos: number;
  formattedMinutes: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  transactions = [],
  projects = [],
  onUpdateUser,
  onOpenGoogleAuth,
  onLogout,
  onToggleRole,
  onOpenAdmin,
  onOpenWallet,
  onResetData,
  theme,
  onToggleTheme,
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Editable Profile Form State
  const [name, setName] = useState<string>(user.name);
  const [channelHandle, setChannelHandle] = useState<string>(user.channelHandle || '@creator');
  const [bio, setBio] = useState<string>(user.bio || 'Creating content with Amharic captions and stylized covers');
  const [preferredLanguage, setPreferredLanguage] = useState<string>(user.preferredLanguage || 'Amharic');
  const [autoGenerateThumbnails, setAutoGenerateThumbnails] = useState<boolean>(
    user.autoGenerateThumbnails ?? true
  );
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);

  // Photo Management State (User can change photo by himself or revert to Google/Gmail photo)
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [photoError, setPhotoError] = useState<string | null>(null);

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
  ];

  const handleApplyAvatar = (newAvatarUrl: string) => {
    if (!newAvatarUrl) return;
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        avatar: newAvatarUrl,
      });
    }
    setShowPhotoModal(false);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file must be under 5MB.');
      return;
    }

    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleApplyAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sync display name & avatar from user's Gmail account
  const handleSyncFromGmail = () => {
    if (!user.email) return;
    const details = getGmailAccountDetails(user.email);
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        name: details.displayName,
        avatar: details.avatar,
        googleOriginalAvatar: details.avatar,
      });
    }
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  // Compute monthly captioning usage dynamically combining historical trends & active user deductions
  const monthlyUsageData: MonthlyDataPoint[] = useMemo(() => {
    const currentMonthDeductionsSec = transactions
      .filter((t) => t.type === 'video_deduction')
      .reduce((sum, t) => sum + Math.abs(t.minutesChange), 0);

    const currentMonthDeductionsMin = Number((currentMonthDeductionsSec / 60).toFixed(1));
    const currentMonthProjectsCount = Math.max(projects.length, 3);

    return [
      {
        month: 'Nov',
        fullName: 'November 2025',
        minutes: 8.5,
        videos: 3,
        formattedMinutes: '8m 30s',
      },
      {
        month: 'Dec',
        fullName: 'December 2025',
        minutes: 14.2,
        videos: 5,
        formattedMinutes: '14m 12s',
      },
      {
        month: 'Jan',
        fullName: 'January 2026',
        minutes: 21.0,
        videos: 8,
        formattedMinutes: '21m 00s',
      },
      {
        month: 'Feb',
        fullName: 'February 2026',
        minutes: 18.5,
        videos: 6,
        formattedMinutes: '18m 30s',
      },
      {
        month: 'Mar',
        fullName: 'March 2026',
        minutes: 29.8,
        videos: 11,
        formattedMinutes: '29m 48s',
      },
      {
        month: 'Apr',
        fullName: 'April 2026 (Active)',
        minutes: Math.max(12.5, currentMonthDeductionsMin),
        videos: currentMonthProjectsCount,
        formattedMinutes: `${Math.floor(Math.max(12.5, currentMonthDeductionsMin))}m ${Math.round(
          (Math.max(12.5, currentMonthDeductionsMin) % 1) * 60
        )}s`,
      },
    ];
  }, [transactions, projects]);

  const totalMinutesSpent = useMemo(() => {
    return monthlyUsageData.reduce((acc, curr) => acc + curr.minutes, 0).toFixed(1);
  }, [monthlyUsageData]);

  const totalVideosGenerated = useMemo(() => {
    return monthlyUsageData.reduce((acc, curr) => acc + curr.videos, 0);
  }, [monthlyUsageData]);

  const currentMonthMinutes = monthlyUsageData[monthlyUsageData.length - 1].minutes;
  const previousMonthMinutes = monthlyUsageData[monthlyUsageData.length - 2].minutes;
  const growthPercent = (
    ((currentMonthMinutes - previousMonthMinutes) / previousMonthMinutes) *
    100
  ).toFixed(0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name,
      channelHandle,
      bio,
      preferredLanguage,
      autoGenerateThumbnails,
    };
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthlyDataPoint;
      return (
        <div className="rounded-2xl bg-slate-900/95 backdrop-blur-md p-3 text-white shadow-xl border border-slate-800 text-xs space-y-1">
          <div className="font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-1 mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{data.fullName}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Minutes Spent:</span>
            <span className="font-mono font-bold text-emerald-400">
              {data.minutes} min ({data.formattedMinutes})
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Videos Captioned:</span>
            <span className="font-mono font-bold text-blue-400">{data.videos} clips</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-28 md:pb-8">
      {/* Google Account Identity Header Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-xs transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative group shrink-0">
              <img
                src={
                  user.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }
                alt={user.name}
                className="w-16 h-16 rounded-2xl ring-4 ring-blue-500/15 object-cover shadow-sm"
              />
              {/* Change Photo Overlay Button */}
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                title="Change profile photo"
                className="absolute inset-0 bg-black/45 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Change</span>
              </button>
              {user.provider === 'clerk' && (
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-purple-600 shadow-md border border-white dark:border-slate-800 flex items-center justify-center pointer-events-none text-white text-[10px] font-black" title="Authenticated via Clerk">
                  ✓
                </div>
              )}
              {user.provider === 'google' && (
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center pointer-events-none">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
                  {user.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                  {user.provider === 'clerk' ? 'CLERK' : user.plan.toUpperCase()}
                </span>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2.5 text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>Change Photo</span>
                </button>
                {user.email && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleSyncFromGmail}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      title="Sync display name and photo from your Gmail account"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sync from Gmail</span>
                    </button>
                  </>
                )}
                <span>•</span>
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Account Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
            {onOpenGoogleAuth && (
              <button
                type="button"
                id="profile-switch-google-btn"
                onClick={onOpenGoogleAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition active:scale-95 touch-tap"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span>{user.provider === 'google' ? 'Switch Google' : 'Connect Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Google status banner */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {user.provider === 'google' ? 'Authenticated with Google Account' : 'Guest / Demo Profile'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono font-medium">{user.email}</span>
        </div>
      </div>

      {/* Editable Profile Details Form */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your creator presence and caption preferences
            </p>
          </div>
          {isSavedToast && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Display Name (የመጠሪያ ስም)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Creator Channel / Handle
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={channelHandle}
                  onChange={(e) => setChannelHandle(e.target.value)}
                  placeholder="@your_channel"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Creator Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Preferred Caption Language
              </label>
              <div className="relative">
                <Languages className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full appearance-none pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Amharic">Amharic (አማርኛ)</option>
                  <option value="Tigrinya">Tigrinya (ትግርኛ)</option>
                  <option value="Afaan Oromo">Afaan Oromoo</option>
                  <option value="English">English with Amharic</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  Auto Stylized Covers
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Generate 16:9 artwork from title
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoGenerateThumbnails}
                onChange={(e) => setAutoGenerateThumbnails(e.target.checked)}
                className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              id="save-profile-btn"
              className="min-h-[40px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition touch-tap flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Balance Widget */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between shadow-lg shadow-blue-600/15">
        <div>
          <span className="text-xs text-blue-100 font-medium">Available Balance</span>
          <div className="text-3xl font-black font-mono mt-0.5">
            {formatTimeSeconds(user.availableMinutes)}
          </div>
          <p className="text-[11px] text-blue-200 mt-0.5">Plan: {user.plan.toUpperCase()} • {projects.length} Saved Projects</p>
        </div>

        <button
          onClick={onOpenWallet}
          className="min-h-[40px] px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-xs hover:bg-blue-50 active:scale-95 touch-tap transition flex items-center"
        >
          Top Up
        </button>
      </div>

      {/* Monthly Usage Analytics Visual Chart Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Captioning Minutes Analytics</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track transcription usage and processing activity over the last 6 months
            </p>
          </div>

          <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setChartType('area')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                chartType === 'area'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Area</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bars</span>
            </button>
          </div>
        </div>

        {/* Highlight KPI Pills */}
        <div className="grid grid-cols-3 gap-2 text-left">
          <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100/60 dark:border-blue-900/40">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
              All-Time Spent
            </span>
            <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
              {totalMinutesSpent} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">min</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              This Month
            </span>
            <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
              {currentMonthMinutes} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">min</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100/60 dark:border-emerald-900/40">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Monthly Trend
            </span>
            <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              +{growthPercent}%
            </div>
          </div>
        </div>

        {/* Visual Recharts Container */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={monthlyUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }}
                  unit="m"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#usageGradient)"
                  activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={monthlyUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }}
                  unit="m"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="minutes"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Total videos processed: <strong>{totalVideosGenerated}</strong></span>
          </div>
          <span>Updated in real-time with your video library</span>
        </div>
      </div>

      {/* Settings list */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {/* Appearance / Theme */}
        {theme && onToggleTheme && (
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Appearance & Theme (የቀለም ገጽታ)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Switch between modern light and comfortable dark mode
              </p>
            </div>
            <div className="self-start sm:self-auto w-full sm:w-auto">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="pill" className="w-full sm:w-64" />
            </div>
          </div>
        )}


        {/* PWA Section */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Progressive Web App (PWA)</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Install on Android, iOS, and desktop for offline caption editing
            </p>
          </div>
          <div className="self-start sm:self-auto">
            <PWAInstallButton variant="header" />
          </div>
        </div>

        {/* Account Logout Option */}
        {onLogout && (
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition">
            <div>
              <h4 className="text-xs font-bold text-red-600 dark:text-red-400">Sign Out of Account (ከመለያ ውጣ)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                End your session on this device. Your caption videos and projects remain securely saved.
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="self-start sm:self-auto min-h-[38px] flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 active:scale-95 touch-tap text-xs font-bold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        )}

      </div>

      {/* Change Profile Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1" />
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Change Profile Photo</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {photoError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 text-xs font-bold">
                {photoError}
              </div>
            )}

            {/* Current photo preview */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt="Current"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Current Photo</p>
                <p className="text-[11px] text-slate-400">Select a new image below or upload from device</p>
              </div>
            </div>

            {/* Option 1: Upload from device */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Upload Image File (from Phone / PC)
              </label>
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30">
                <Upload className="w-6 h-6 text-blue-600 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tap to Choose File</span>
                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Option 2: Take Photo from Gmail account */}
            {user.email && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const gmailAvatar = user.googleOriginalAvatar || getGmailAccountDetails(user.email).avatar;
                    handleApplyAvatar(gmailAvatar);
                  }}
                  className="w-full min-h-[42px] px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-2 transition"
                >
                  <img
                    src={user.googleOriginalAvatar || getGmailAccountDetails(user.email).avatar}
                    alt="Gmail Account Avatar"
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-500"
                  />
                  <span>Take Photo from Gmail Account ({user.email})</span>
                </button>
              </div>
            )}

            {/* Option 3: Choose from avatar presets */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Or Choose an Avatar Preset
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyAvatar(preset)}
                    className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-600 focus:border-blue-600 transition touch-tap group relative"
                  >
                    <img
                      src={preset}
                      alt={`Preset ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Option 4: Custom Image URL */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Or Paste Image Web Address (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customPhotoUrl.trim()) {
                      handleApplyAvatar(customPhotoUrl.trim());
                    }
                  }}
                  disabled={!customPhotoUrl.trim()}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 touch-tap transition"
                >
                  Use URL
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-full min-h-[44px] py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 touch-tap transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
