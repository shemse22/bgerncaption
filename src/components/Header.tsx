import React, { useState } from 'react';
import { Clock, Bell, Sun, Moon, Menu, X, ArrowRight, FolderClosed, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { formatTimeSeconds } from '../lib/subtitles';
import { Theme } from '../lib/theme';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuthService } from './ClerkAuthProvider';

interface HeaderProps {
  user: User;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onToggleRole?: () => void;
  onOpenAdmin?: () => void;
  activeTab?: string;
  onNewVideo: () => void;
  onOpenGoogleAuth?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenWallet,
  onOpenNotifications,
  unreadCount,
  onToggleRole,
  onOpenAdmin,
  activeTab = 'home',
  onNewVideo,
  onOpenGoogleAuth,
  onOpenProfile,
  onLogout,
  theme = 'dark',
  onToggleTheme,
  onNavigateTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const authService = useAuthService();

  const isAuthenticated = authService.isSignedIn || user.provider === 'clerk' || user.provider === 'google';

  const handleNavClick = (sectionId: string, tabFallback: string = 'home') => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    if (sectionId === 'pricing') {
      onOpenWallet();
      return;
    }

    if (activeTab !== 'home') {
      if (onNavigateTab) {
        onNavigateTab(tabFallback);
      }
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleLoginClick = () => {
    if (authService.isClerkConfigured) {
      authService.openSignIn();
    } else if (onOpenGoogleAuth) {
      onOpenGoogleAuth();
    } else {
      authService.openKeyModal();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2 sm:py-3 transition-colors text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand identity: Bgern */}
        <div
          onClick={() => {
            if (onNavigateTab) onNavigateTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
        >
          {/* BG Square Logo */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform duration-200 font-black text-xs sm:text-sm tracking-tighter">
            BG
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white">
                Bgern
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none hidden sm:block">
              Your Video. In Amharic.
            </p>
          </div>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => handleNavClick('top', 'home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'home'
                ? 'text-white bg-purple-600/20 text-purple-300 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('features', 'home')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick('pricing', 'price')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'price'
                ? 'text-white bg-purple-600/20 text-purple-300 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavClick('examples', 'home')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          >
            Examples
          </button>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                activeTab === 'projects'
                  ? 'text-white bg-purple-600/20 text-purple-300 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FolderClosed className="w-3.5 h-3.5" />
              <span>Projects</span>
            </button>
          )}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Light / Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 active:scale-95 transition touch-tap"
              title="Toggle Theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
              )}
            </button>
          )}

          {/* Balance chip (when user is active or logged in) */}
          <button
            id="price-minutes-chip"
            onClick={onOpenWallet}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition active:scale-95 text-xs font-bold shrink-0 touch-tap ${
              user.availableMinutes <= 0
                ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 hover:bg-rose-900/60 shadow-sm shadow-rose-900/40'
                : 'bg-purple-950/40 border-purple-800/50 text-purple-300 hover:bg-purple-900/50'
            }`}
            title={
              user.availableMinutes <= 0
                ? 'Package Expired: Click to upgrade or renew package'
                : 'Available Transcription Minutes (Click to top up)'
            }
          >
            <Clock className={`w-3.5 h-3.5 ${user.availableMinutes <= 0 ? 'text-rose-400' : 'text-purple-400'}`} />
            <span className="font-mono">{formatTimeSeconds(user.availableMinutes)}</span>
            <span
              className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-black hidden md:inline ${
                user.availableMinutes <= 0
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-purple-800/70 text-purple-200'
              }`}
            >
              {user.availableMinutes <= 0 ? 'Expired' : user.plan}
            </span>
          </button>

          {/* Notification Bell */}
          <button
            id="notification-bell-btn"
            onClick={onOpenNotifications}
            className="relative p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 active:scale-95 transition touch-tap"
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* PWA Install */}
          <PWAInstallButton variant="header" />

          {/* Real Login or User Profile Avatar */}
          {!isAuthenticated ? (
            <button
              id="header-login-btn"
              onClick={handleLoginClick}
              className="hidden xs:inline-block text-xs font-semibold text-slate-300 hover:text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg hover:bg-slate-800/60 transition touch-tap"
            >
              Login
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="relative flex items-center pl-0.5 group focus:outline-hidden"
                title="User Account Menu"
              >
                <img
                  src={user.avatar || 'https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff&size=120'}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-purple-500/40 group-hover:ring-purple-400 object-cover transition"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0B0F19]" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#131B2E] border border-slate-700 shadow-2xl p-2.5 text-white z-50 space-y-2 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email || 'Authenticated Creator'}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {authService.isClerkConfigured ? 'CLERK AUTH' : user.provider?.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {formatTimeSeconds(user.availableMinutes)} left
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={onOpenProfile}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={onOpenWallet}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Pricing & Minutes</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          await authService.signOut();
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Get Started Free CTA Button */}
          <button
            id="header-cta-btn"
            onClick={() => {
              if (!isAuthenticated && authService.isClerkConfigured) {
                authService.openSignUp();
              } else {
                onNewVideo();
              }
            }}
            className="px-2.5 xs:px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-md sm:shadow-lg shadow-purple-600/30 active:scale-95 transition-all duration-150 touch-tap flex items-center gap-1 sm:gap-1.5 shrink-0"
          >
            <span className="hidden xs:inline">{isAuthenticated ? 'Upload Video' : 'Get Started Free'}</span>
            <span className="xs:hidden">{isAuthenticated ? 'Upload' : 'Start Free'}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 active:scale-95 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 pb-2 animate-in slide-in-from-top-2 duration-150">
          {!isAuthenticated && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLoginClick();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 flex items-center justify-between transition"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-4 h-4 text-purple-300" />
            </button>
          )}
          <button
            onClick={() => handleNavClick('top', 'home')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('features', 'home')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick('pricing', 'price')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavClick('examples', 'home')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            Examples
          </button>
          {onNavigateTab && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateTab('projects');
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FolderClosed className="w-4 h-4 text-purple-400" />
                <span>Projects</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          )}
          {isAuthenticated && (
            <>
              {onOpenProfile && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-purple-400" />
                  <span>My Profile</span>
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenNotifications();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    await authService.signOut();
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-red-400 hover:bg-red-950/40 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
