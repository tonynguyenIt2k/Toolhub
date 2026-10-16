import React from 'react';
import { User } from 'firebase/auth';

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
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenAddModal,
  onFocusSearch,
  isDark,
  onToggleTheme,
  currentUser,
  onLogin,
  onLogout,
  isSyncing,
  currentTab,
  onSelectTab,
  onOpenSettings,
  pinnedCount = 0
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#faf8ff]/90 dark:bg-[#121622]/90 backdrop-blur-xl pt-safe border-b border-black/[0.04] dark:border-white/[0.06] transition-colors">
      <div className="h-16 px-3 sm:px-5 max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#004ac6] flex items-center justify-center shadow-[0_2px_8px_rgba(0,74,198,0.28)] shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]">hub</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[17px] font-bold tracking-tight text-[#131b2e] dark:text-[#eef0ff]">
              ToolHub
            </span>
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[12px]">cloud_sync</span>
              <span>Firebase</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.05] p-1 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
          <button
            onClick={() => onSelectTab('tools')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'tools'
                ? 'bg-white dark:bg-[#1f2638] text-[#004ac6] dark:text-[#89b4ff] shadow-xs'
                : 'text-[#5a5e72] dark:text-[#9da2ba] hover:text-[#131b2e] dark:hover:text-white'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">grid_view</span>
            <span>Tất cả công cụ</span>
          </button>

          <button
            onClick={() => onSelectTab('pinned')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'pinned'
                ? 'bg-white dark:bg-[#1f2638] text-[#004ac6] dark:text-[#89b4ff] shadow-xs'
                : 'text-[#5a5e72] dark:text-[#9da2ba] hover:text-[#131b2e] dark:hover:text-white'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">bookmark</span>
            <span>Yêu thích</span>
            {pinnedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#004ac6]/10 dark:bg-[#89b4ff]/20 text-[10px] font-bold">
                {pinnedCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#5a5e72] dark:text-[#9da2ba] hover:text-[#131b2e] dark:hover:text-white transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">tune</span>
            <span>Cài đặt & Dữ liệu</span>
          </button>
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Cloud Sync Pulse Indicator */}
          {isSyncing && (
            <span 
              title="Đang đồng bộ Firebase..." 
              className="flex h-2 w-2 relative mr-1"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}

          {/* Search Button */}
          <button
            onClick={onFocusSearch}
            aria-label="Tìm kiếm công cụ"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#434655] dark:text-[#b0b4c8] hover:text-[#131b2e] dark:hover:text-white hover:bg-[#f2f3ff] dark:hover:bg-[#181d2c] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[21px]">search</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Đổi giao diện sáng tối"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#434655] dark:text-[#b0b4c8] hover:text-[#131b2e] dark:hover:text-white hover:bg-[#f2f3ff] dark:hover:bg-[#181d2c] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Auth Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onLogout}
                title={`Đăng xuất (${currentUser.email || currentUser.displayName})`}
                className="flex items-center gap-1.5 h-9 px-2 sm:px-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#1e2436] hover:bg-red-50 dark:hover:bg-red-950/40 text-xs text-[#131b2e] dark:text-[#eef0ff] transition-all cursor-pointer border border-black/[0.04] dark:border-white/[0.06]"
                type="button"
              >
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'User'} 
                    className="w-5 h-5 rounded-full object-cover" 
                  />
                ) : (
                  <span className="material-symbols-outlined text-[18px] text-[#004ac6]">account_circle</span>
                )}
                <span className="hidden sm:inline font-medium max-w-[90px] truncate text-[11px]">
                  {currentUser.displayName?.split(' ')[0] || 'Tài khoản'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#737686]">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl bg-white dark:bg-[#1e2436] hover:bg-[#f2f3ff] dark:hover:bg-[#252d42] text-xs font-semibold text-[#131b2e] dark:text-[#eef0ff] border border-black/[0.08] dark:border-white/[0.08] shadow-xs active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="hidden xs:inline">Đăng nhập</span>
            </button>
          )}

          {/* Add tool button */}
          <button
            onClick={onOpenAddModal}
            aria-label="Thêm công cụ mới"
            className="flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-[#004ac6] text-white shadow-[0_2px_8px_rgba(0,74,198,0.32)] hover:bg-[#2563eb] active:scale-95 transition-all cursor-pointer font-semibold text-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">add</span>
            <span className="hidden sm:inline">Thêm liên kết</span>
          </button>
        </div>
      </div>
    </header>
  );
};
