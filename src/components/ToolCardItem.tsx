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

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onOpenTool(tool)}
      className="liquid-glass rounded-xl p-2.5 hover:border-blue-300 dark:hover:border-blue-500/40 transition-all shadow-xs relative group block no-underline cursor-pointer active:scale-[0.99]"
      title={`Mở ${tool.name}`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left Clickable Area (Icon, Name, Label, Domain) */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 ring-1 ring-blue-500/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[17px]">
              {tool.icon || 'link'}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 leading-tight flex-wrap">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h3>
              {tool.label && (
                <span className="px-1.5 py-0.2 text-[9.5px] font-medium rounded-full bg-blue-50/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 shrink-0">
                  {tool.label}
                </span>
              )}
            </div>
            <p className="text-2xs text-slate-400 dark:text-slate-500 font-mono truncate mt-0.5">
              {hostname}
            </p>
          </div>
        </div>

        {/* Right Actions: Copy, Share, Menu & Subtle Arrow Indicator (No 'Mở' button) */}
        <div 
          className="flex items-center gap-0.5 sm:gap-1 shrink-0" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Copy Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCopyUrl(tool.url);
            }}
            aria-label="Sao chép liên kết"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-white/10 active:scale-95 transition cursor-pointer"
            title="Sao chép liên kết"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">content_copy</span>
          </button>

          {/* Share Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShare(tool);
            }}
            aria-label="Chia sẻ"
            className="hidden xs:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-white/10 active:scale-95 transition cursor-pointer"
            title="Chia sẻ"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">share</span>
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              aria-label="Thao tác khác"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-white/10 transition cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">more_vert</span>
            </button>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(false);
                  }} 
                />
                <div 
                  className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-[#1f2638] rounded-xl shadow-lg border border-black/[0.06] dark:border-white/[0.08] p-1 flex flex-col gap-0.5 text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onEdit(tool);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px] text-blue-600">edit</span>
                    <span>Sửa liên kết</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onTogglePin(tool.id);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px] text-amber-500">
                      {tool.isPinned ? 'bookmark_remove' : 'push_pin'}
                    </span>
                    <span>{tool.isPinned ? 'Bỏ ghim' : 'Ghim nhanh'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onShare(tool);
                    }}
                    className="xs:hidden flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px] text-teal-600">share</span>
                    <span>Chia sẻ</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onDelete(tool.id);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Xóa</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Subtle Arrow indicator on the right edge */}
          <span className="material-symbols-outlined text-[15px] text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all ml-0.5 pointer-events-none">
            arrow_outward
          </span>
        </div>
      </div>
    </a>
  );
};
