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
    <div className="flex flex-col gap-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#004ac6] dark:text-[#89b4ff] text-[18px]">
            push_pin
          </span>
          <h3 className="text-sm font-semibold text-[#131b2e] dark:text-[#eef0ff]">
            Ghim truy cập nhanh
          </h3>
        </div>
        <span className="text-xs text-[#434655] dark:text-[#b0b4c8]">
          Một chạm mở ngay
        </span>
      </div>

      {/* Horizontal scroll of pinned cards */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
        {pinnedTools.map(tool => (
          <div
            key={tool.id}
            onClick={() => onOpenTool(tool)}
            className="flex-shrink-0 w-36 p-3 rounded-xl bg-white dark:bg-[#1c2336] shadow-sm hover:shadow-md border border-black/[0.04] dark:border-white/[0.06] flex flex-col justify-between h-28 relative cursor-pointer active:scale-95 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#eaedff] dark:bg-[#242b40] flex items-center justify-center text-[#004ac6] dark:text-[#89b4ff]">
                <span className="material-symbols-outlined text-[19px]">
                  {tool.icon || 'link'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyUrl(tool.url);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#737686] hover:text-[#004ac6] dark:hover:text-[#89b4ff] hover:bg-[#f2f3ff] dark:hover:bg-[#181d2c] transition-colors cursor-pointer"
                title="Sao chép link"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
              </button>
            </div>

            <div>
              <h4 className="text-[13px] font-semibold text-[#131b2e] dark:text-[#eef0ff] truncate leading-tight">
                {tool.name}
              </h4>
              <div className="mt-1 flex items-center justify-between text-[#004ac6] dark:text-[#89b4ff] text-[11px] font-medium">
                <span>Mở ngay</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
