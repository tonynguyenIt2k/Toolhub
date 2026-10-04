import React from 'react';

interface HeaderBarProps {
  onOpenAddModal: () => void;
  onFocusSearch: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenAddModal,
  onFocusSearch,
  isDark,
  onToggleTheme
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#faf8ff]/80 dark:bg-[#121622]/80 backdrop-blur-xl pt-safe border-b border-black/[0.04] dark:border-white/[0.06] transition-colors">
      <div className="h-16 px-4 max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#004ac6] flex items-center justify-center shadow-[0_2px_8px_rgba(0,74,198,0.28)]">
            <span className="material-symbols-outlined text-white text-[20px]">hub</span>
          </div>
          <span className="text-[17px] font-bold tracking-tight text-[#131b2e] dark:text-[#eef0ff]">
            ToolHub
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onFocusSearch}
            aria-label="Tìm kiếm công cụ"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#434655] dark:text-[#b0b4c8] hover:text-[#131b2e] dark:hover:text-white hover:bg-[#f2f3ff] dark:hover:bg-[#181d2c] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>

          <button
            onClick={onToggleTheme}
            aria-label="Đổi giao diện sáng tối"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#434655] dark:text-[#b0b4c8] hover:text-[#131b2e] dark:hover:text-white hover:bg-[#f2f3ff] dark:hover:bg-[#181d2c] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            onClick={onOpenAddModal}
            aria-label="Thêm công cụ mới"
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-[#004ac6] text-white shadow-[0_2px_8px_rgba(0,74,198,0.32)] hover:bg-[#2563eb] active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
