import React from 'react';
import { Home, FolderClosed, Tag, Bell, User, Sparkles } from 'lucide-react';
import { Role } from '../types';

export type NavTab = 'home' | 'projects' | 'price' | 'wallet' | 'notifications' | 'profile' | 'admin';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  role: Role;
  unreadCount?: number;
  onUpgradeClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  role,
  unreadCount = 0,
  onUpgradeClick,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home, amharic: 'ዋና ገጽ' },
    { id: 'projects' as NavTab, label: 'Projects', icon: FolderClosed, amharic: 'ፕሮጀክቶች' },
    { id: 'price' as NavTab, label: 'Price', icon: Tag, amharic: 'ዋጋ' },
    { id: 'notifications' as NavTab, label: 'Notifications', icon: Bell, badge: unreadCount, amharic: 'ማሳወቂያ' },
    { id: 'profile' as NavTab, label: 'Profile', icon: User, amharic: 'መገለጫ' },
  ];

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile and hidden on home landing page) */}
      <aside className={`${activeTab === 'home' ? 'hidden' : 'hidden md:flex'} flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 p-4 shrink-0 justify-between transition-colors`}>
        <div className="space-y-6">
          {/* Section label */}
          <div className="px-3">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Navigation
            </p>
          </div>

          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`desktop-nav-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-purple-600' : 'bg-red-500 text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Upgrade / Pro CTA card in sidebar */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/60 dark:border-amber-900/40 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Get More Minutes</span>
          </div>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
            Need more video captioning? Get 15 or 50 minutes starting from 25 ETB.
          </p>
          <button
            id="sidebar-upgrade-btn"
            onClick={onUpgradeClick}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-xs hover:bg-amber-400 transition active:scale-95"
          >
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (fixed to bottom with safe-area padding) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/90 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-xl transition-colors">
        <div className="grid grid-cols-5 gap-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-nav-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all active:scale-90 touch-tap ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50/70 dark:bg-purple-950/60 font-bold'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 active:bg-slate-50 dark:active:bg-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-purple-600 dark:text-purple-400' : ''}`} />
                  {tab.badge ? (
                    <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] mt-0.5 leading-tight tracking-tight truncate max-w-full ${isActive ? 'font-black text-purple-700 dark:text-purple-300' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-3.5 h-0.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
