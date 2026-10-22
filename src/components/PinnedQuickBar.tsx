import React from 'react';
import { ToolItem } from '../types';

interface PinnedQuickBarProps {
  pinnedTools: ToolItem[];
  onOpenTool: (tool: ToolItem) => void;
  onCopyUrl: (url: string) => void;
}

export const PinnedQuickBar: React.FC<PinnedQuickBarProps> = ({
  pinnedTools,
  onOpenTool,
  onCopyUrl
}) => {
  if (pinnedTools.length === 0) return null;

  return (
    <section className="space-y-1.5" data-purpose="quick-access">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[16px]">
            bookmark
          </span>
          <h2 className="text-2xs sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Ghim truy cập nhanh
          </h2>
        </div>
        <span className="text-2xs text-slate-400 dark:text-slate-500 font-medium">
          Chạm là mở
        </span>
      </div>

      {/* Horizontal scroll on mobile, responsive grid on desktop */}
      <div className="-mx-3.5 sm:mx-0 px-3.5 sm:px-0 overflow-x-auto no-scrollbar flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-2 pb-0.5">
        {pinnedTools.map(tool => (
          <a
            key={tool.id}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onOpenTool(tool)}
            className="w-32 md:w-auto shrink-0 liquid-glass p-2.5 rounded-xl flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-500/40 transition-all active:scale-[0.98] group no-underline cursor-pointer"
            title={`Chạm để mở ${tool.name}`}
          >
            {/* Top row: Icon + Copy button + Outward Arrow */}
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center ring-1 ring-blue-500/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[14px]">
                  {tool.icon || 'link'}
                </span>
              </span>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCopyUrl(tool.url);
                  }}
                  aria-label="Sao chép"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition cursor-pointer"
                  title="Sao chép liên kết"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[13px]">content_copy</span>
                </button>
                <span className="material-symbols-outlined text-[13px] text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
                  arrow_outward
                </span>
              </div>
            </div>

            {/* Title */}
            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tool.name}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
};
