import React from 'react';

interface BottomNavBarProps {
  currentTab: 'tools' | 'pinned' | 'categories' | 'settings';
  onSelectTab: (tab: 'tools' | 'pinned' | 'categories' | 'settings') => void;
  onOpenAddModal: () => void;
  onExportBackup?: () => void;
  pinnedCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onExportBackup,
  pinnedCount = 0
}) => {
  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 pointer-events-none px-4 flex justify-center safe-bottom-bar md:hidden">
      <nav 
        className="w-full max-w-sm pointer-events-auto liquid-glass rounded-2xl shadow-liquid border border-white/80 dark:border-white/10 px-2 py-1.5 backdrop-blur-2xl transition-all"
        data-purpose="mobile-bottom-navigation"
      >
        <div className="flex items-center justify-between relative px-1">
          {/* Tab 1: Tất cả công cụ */}
          <button
            onClick={() => onSelectTab('tools')}
            className={`flex flex-col items-center justify-center w-12 transition-colors cursor-pointer ${
              currentTab === 'tools'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
            }`}
            type="button"
          >
            <span className={`material-symbols-outlined text-[20px] ${currentTab === 'tools' ? 'fill' : ''}`}>
              grid_view
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight">Tất cả</span>
          </button>

          {/* Tab 2: Yêu thích */}
          <button
            onClick={() => onSelectTab('pinned')}
            className={`flex flex-col items-center justify-center w-12 transition-colors relative cursor-pointer ${
              currentTab === 'pinned'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
            }`}
            type="button"
          >
            <span className={`material-symbols-outlined text-[20px] ${currentTab === 'pinned' ? 'fill' : ''}`}>
              bookmark
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight">Yêu thích</span>
            {pinnedCount > 0 && (
              <span className="absolute -top-1 right-1 px-1 py-0.1 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 text-[9px] font-bold rounded-full border border-white/80 dark:border-white/20 leading-none">
                {pinnedCount}
              </span>
            )}
          </button>

          {/* Center Floating Liquid Drop (+) Button */}
          <div className="flex items-center justify-center -mt-5">
            <button
              onClick={onOpenAddModal}
              aria-label="Thêm liên kết mới"
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-liquid-glow ring-2 ring-white/90 dark:ring-[#131929] active:scale-90 hover:brightness-105 transition-all focus:outline-none cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">add</span>
            </button>
          </div>

          {/* Tab 3: Sao lưu JSON */}
          <button
            onClick={onExportBackup}
            className="flex flex-col items-center justify-center w-12 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              download
            </span>
            <span className="text-[10px] font-medium mt-0.5 tracking-tight">Sao lưu</span>
          </button>

          {/* Tab 4: Cài đặt */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center justify-center w-12 transition-colors cursor-pointer ${
              currentTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
            }`}
            type="button"
          >
            <span className={`material-symbols-outlined text-[20px] ${currentTab === 'settings' ? 'fill' : ''}`}>
              tune
            </span>
            <span className="text-[10px] font-medium mt-0.5 tracking-tight">Cài đặt</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
