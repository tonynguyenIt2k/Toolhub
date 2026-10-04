import React, { useState } from 'react';
import { ToolItem } from '../types';

interface ToolCardItemProps {
  tool: ToolItem;
  onOpenTool: (tool: ToolItem) => void;
  onTogglePin: (id: string) => void;
  onEdit: (tool: ToolItem) => void;
  onDelete: (id: string) => void;
  onCopyUrl: (url: string) => void;
  onShare: (tool: ToolItem) => void;
}

export const ToolCardItem: React.FC<ToolCardItemProps> = ({
  tool,
  onOpenTool,
  onTogglePin,
  onEdit,
  onDelete,
  onCopyUrl,
  onShare
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  let hostname = '';
  try {
    hostname = new URL(tool.url).hostname.replace('www.', '');
  } catch {
    hostname = tool.url;
  }

  const handleCardClick = () => {
    onOpenTool(tool);
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={handleCardClick}
      className="p-4 rounded-xl bg-white dark:bg-[#1c2336] shadow-sm hover:shadow-md border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-3 transition-all duration-150 active:scale-[0.99] cursor-pointer relative"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] flex items-center justify-center flex-shrink-0 text-[#004ac6] dark:text-[#89b4ff]">
            <span className="material-symbols-outlined text-[22px]">
              {tool.icon || 'link'}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-[14px] font-semibold text-[#131b2e] dark:text-[#eef0ff] truncate leading-tight">
                {tool.name}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-[#eaedff] dark:bg-[#242b40] text-[11px] font-semibold text-[#004ac6] dark:text-[#89b4ff] flex-shrink-0">
                {tool.label}
              </span>
            </div>
            <p className="text-[12px] text-[#737686] dark:text-[#898d9e] truncate mt-0.5 font-mono">
              {hostname}
            </p>
          </div>
        </div>

        {/* Action Menu button */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="Thao tác khác"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#737686] hover:text-[#131b2e] dark:hover:text-[#eef0ff] hover:bg-[#f2f3ff] dark:hover:bg-[#242b40] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setShowDropdown(false)} 
              />
              <div className="absolute right-0 top-9 z-30 w-36 bg-white dark:bg-[#242b40] rounded-xl shadow-lg border border-black/[0.06] dark:border-white/[0.08] p-1.5 flex flex-col gap-1 text-xs">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onEdit(tool);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-[#f2f3ff] dark:hover:bg-[#181d2c] text-[#131b2e] dark:text-[#eef0ff] cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#004ac6]">edit</span>
                  <span>Sửa liên kết</span>
                </button>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onTogglePin(tool.id);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-[#f2f3ff] dark:hover:bg-[#181d2c] text-[#131b2e] dark:text-[#eef0ff] cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-500">
                    {tool.isPinned ? 'bookmark_remove' : 'push_pin'}
                  </span>
                  <span>{tool.isPinned ? 'Bỏ ghim' : 'Ghim đầu trang'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onDelete(tool.id);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Xóa</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-1 border-t border-black/[0.03] dark:border-white/[0.04]">
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onCopyUrl(tool.url)}
            className="h-8 px-2.5 rounded-lg bg-[#f2f3ff] dark:bg-[#242b40] text-[#434655] dark:text-[#b0b4c8] text-xs font-medium flex items-center gap-1 hover:text-[#004ac6] active:bg-[#eaedff] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">content_copy</span>
            <span>Sao chép</span>
          </button>

          <button
            onClick={() => onShare(tool)}
            aria-label="Chia sẻ"
            className="h-8 w-8 rounded-lg bg-[#f2f3ff] dark:bg-[#242b40] text-[#434655] dark:text-[#b0b4c8] flex items-center justify-center hover:text-[#004ac6] active:bg-[#eaedff] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
          </button>
        </div>

        <a
          onClick={(e) => {
            e.stopPropagation();
            onOpenTool(tool);
          }}
          className="h-8 px-3 rounded-lg bg-[#004ac6] text-white text-xs font-semibold flex items-center gap-1 shadow-sm hover:bg-[#2563eb] active:scale-95 transition-all cursor-pointer"
          href={tool.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span>Mở liên kết</span>
          <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
        </a>
      </div>
    </div>
  );
};
