import React from 'react';
import { User } from 'firebase/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderBarProps {
  onOpenAddModal: () => void;
  onFocusSearch: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isSyncing?: boolean;
  currentTab: 'tools' | 'pinned' | 'categories' | 'settings';
  onSelectTab: (tab: 'tools' | 'pinned' | 'categories' | 'settings') => void;
  onOpenSettings: () => void;
  pinnedCount?: number;
  onExportBackup?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenAddModal,
  isDark,
  onToggleTheme,
  currentUser,
  onLogin,
  onLogout,
  isSyncing,
  currentTab,
  onSelectTab,
  onOpenSettings,
  pinnedCount = 0,
  onExportBackup
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/60 dark:border-white/10 bg-white/70 dark:bg-[#121622]/80 backdrop-blur-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-13 py-1.5 gap-2 sm:gap-3">
          {/* Left: Logo & Navigation Tabs */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => onSelectTab('tools')}
              className="flex items-center gap-2 group shrink-0 cursor-pointer text-left"
              type="button"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
                <span className="material-symbols-outlined text-[19px]">hub</span>
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Tool<span className="text-blue-600 dark:text-blue-400">Hub</span>
              </span>
            </button>

            {/* Mini Firebase status in header */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSyncing ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="truncate max-w-[150px]">
                {currentUser ? `Firebase • ${currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]}` : 'Firebase Cloud'}
              </span>
            </div>

            {/* Navigation Pills (Desktop Compact) */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onSelectTab('tools')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  currentTab === 'tools'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
                <span>Tất cả công cụ</span>
              </button>

              <button
                onClick={() => onSelectTab('pinned')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  currentTab === 'pinned'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">bookmark</span>
                <span>Yêu thích</span>
                {pinnedCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-semibold rounded-full bg-slate-200/80 dark:bg-white/20 text-slate-700 dark:text-white">
                    {pinnedCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Cài đặt & Dữ liệu</span>
              </button>
            </nav>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Compact JSON Backup (Desktop) */}
            {onExportBackup && (
              <button
                onClick={onExportBackup}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 border border-white/80 dark:border-white/10 transition cursor-pointer"
                title="Sao lưu toàn bộ liên kết ra file JSON"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-blue-400">download</span>
                <span>Sao lưu</span>
              </button>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white/70 dark:hover:bg-white/10 rounded-lg transition cursor-pointer"
              title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* User Profile Chip */}
            {currentUser ? (
              <div 
                onClick={onLogout}
                className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full border border-white/80 dark:border-white/10 bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 shadow-xs cursor-pointer transition"
                title={`Đăng xuất (${currentUser.email})`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Avatar'}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/20"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[18px] text-blue-600">account_circle</span>
                )}
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 max-w-[80px] truncate">
                  {currentUser.displayName?.split(' ')[0] || 'Tài khoản'}
                </span>
                <span className="material-symbols-outlined text-[13px] text-slate-400 hover:text-red-500">logout</span>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-white/90 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 shadow-xs transition cursor-pointer"
                type="button"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}

            {/* Primary Add Link CTA */}
            <button
              onClick={onOpenAddModal}
              className="liquid-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition active:scale-[0.98] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="whitespace-nowrap">Thêm liên kết</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
