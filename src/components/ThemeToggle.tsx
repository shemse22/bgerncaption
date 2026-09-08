import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Theme } from '../lib/theme';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  variant?: 'header' | 'button' | 'pill';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  variant = 'header',
  className = '',
}) => {
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        id="theme-toggle-pill-btn"
        onClick={onToggle}
        className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border transition-all active:scale-[0.98] touch-tap ${
          isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        } ${className}`}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
              isDark ? 'bg-amber-400/20 text-amber-300' : 'bg-blue-50 text-blue-600'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <span className="text-xs font-bold block leading-none">
              {isDark ? 'Dark Mode (የጨለማ ሁነታ)' : 'Light Mode (የብርሃን ሁነታ)'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {isDark ? 'Comfortable for low light' : 'Bright and high contrast'}
            </span>
          </div>
        </div>

        {/* Pill switch indicator */}
        <div
          className={`w-9 h-5 rounded-full p-0.5 transition-colors relative ${
            isDark ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
              isDark ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>
      </button>
    );
  }

  // Header / Icon variant
  return (
    <button
      type="button"
      id="global-theme-toggle-btn"
      onClick={onToggle}
      className={`relative p-2 sm:p-2 rounded-xl border transition-all active:scale-90 touch-tap flex items-center justify-center ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 hover:text-amber-200 shadow-xs'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode (የብርሃን ሁነታ)' : 'Switch to Dark Mode (የጨለማ ሁነታ)'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};
