import React from 'react';

interface BottomNavBarProps {
  currentTab: 'tools' | 'pinned' | 'categories' | 'settings';
  onSelectTab: (tab: 'tools' | 'pinned' | 'categories' | 'settings') => void;
  onOpenAddModal: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pointer-events-none flex justify-center items-end pb-[max(env(safe-area-inset-bottom),12px)] px-3 sm:px-4">
      {/* Floating Glassmorphic Pill */}
      <div className="pointer-events-auto w-full max-w-[420px] rounded-[32px] p-1.5 sm:p-2 bg-white/95 dark:bg-[#1a2030]/95 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-between gap-0.5 sm:gap-1 transition-all">
        {/* Tab 1: Công cụ */}
        <button
          onClick={() => onSelectTab('tools')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer min-w-0 ${
            currentTab === 'tools'
              ? 'text-[#004ac6] dark:text-[#89b4ff]'
              : 'text-[#5a5e72] dark:text-[#9da2ba] hover:text-[#131b2e] dark:hover:text-white'
          }`}
          type="button"
        >
          <div className={`px-2.5 py-0.5 rounded-full transition-all flex items-center justify-center ${
            currentTab === 'tools' ? 'bg-[#004ac6]/10 dark:bg-[#89b4ff]/15' : 'bg-transparent'
          }`}>
            <span className={`material-symbols-outlined text-[21px] ${currentTab === 'tools' ? 'fill' : ''}`}>
              grid_view
            </span>
          </div>
          <span className="text-[10.5px] sm:text-[11px] font-semibold mt-0.5 whitespace-nowrap tracking-tight">
            Công cụ
          </span>
        </button>

        {/* Tab 2: Danh mục */}
        <button
          onClick={() => onSelectTab('categories')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer min-w-0 ${
            currentTab === 'categories'
              ? 'text-[#004ac6] dark:text-[#89b4ff]'
              : 'text-[#5a5e72] dark:text-[#9da2ba] hover:text-[#131b2e] dark:hover:text-white'
          }`}
          type="button"
        >
          <div className={`px-2.5 py-0.5 rounded-full transition-all flex items-center justify-center ${
            currentTab === 'categories' ? 'bg-[#004ac6]/10 dark:bg-[#89b4ff]/15' : 'bg-transparent'
          }`}>
            <span className={`material-symbols-outlined text-[21px] ${currentTab === 'categories' ? 'fill' : ''}`}>
              category
            </span>
          </div>
          <span className="text-[10.5px] sm:text-[11px] font-semibold mt-0.5 whitespace-nowrap tracking-tight">
            Danh mục
          </span>
        </button>

        {/* Center Floating Action Button (+) */}
        <div className="flex items-center justify-center px-1 shrink-0">
          <button
            onClick={onOpenAddModal}
            aria-label="Thao tác thêm nhanh"
            className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-[#004ac6] via-[#1a64e8] to-[#2563eb] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(0,74,198,0.42),inset_0_1px_1px_rgba(255,255,255,0.4)] active:scale-90 transition-transform cursor-pointer border-2 border-white dark:border-[#1a2030]"
            type="button"
          >
            <span className="material-symbols-outlined text-[26px]">add</span>
          </button>
        </div>

        {/* Tab 3: Yêu thích */}
        <button
          onClick={() => onSelectTab('pinned')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer min-w-0 ${
            currentTab === 'pinned'
              ? 'text-[#004ac6] dark:text-[#89b4ff]'
              : 'text-[#5a5e72] dark:text-[#9da2ba] hover:text-[#131b2e] dark:hover:text-white'
          }`}
          type="button"
        >
          <div className={`px-2.5 py-0.5 rounded-full transition-all flex items-center justify-center ${
            currentTab === 'pinned' ? 'bg-[#004ac6]/10 dark:bg-[#89b4ff]/15' : 'bg-transparent'
          }`}>
            <span className={`material-symbols-outlined text-[21px] ${currentTab === 'pinned' ? 'fill' : ''}`}>
              bookmark
            </span>
          </div>
          <span className="text-[10.5px] sm:text-[11px] font-semibold mt-0.5 whitespace-nowrap tracking-tight">
            Yêu thích
          </span>
        </button>

        {/* Tab 4: Cài đặt */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer min-w-0 ${
            currentTab === 'settings'
              ? 'text-[#004ac6] dark:text-[#89b4ff]'
              : 'text-[#5a5e72] dark:text-[#9da2ba] hover:text-[#131b2e] dark:hover:text-white'
          }`}
          type="button"
        >
          <div className={`px-2.5 py-0.5 rounded-full transition-all flex items-center justify-center ${
            currentTab === 'settings' ? 'bg-[#004ac6]/10 dark:bg-[#89b4ff]/15' : 'bg-transparent'
          }`}>
            <span className={`material-symbols-outlined text-[21px] ${currentTab === 'settings' ? 'fill' : ''}`}>
              tune
            </span>
          </div>
          <span className="text-[10.5px] sm:text-[11px] font-semibold mt-0.5 whitespace-nowrap tracking-tight">
            Cài đặt
          </span>
        </button>
      </div>
    </nav>
  );
};
