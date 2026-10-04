/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ToolItem } from './types';
import { INITIAL_SAMPLE_TOOLS, CATEGORY_NAMES } from './data/defaultTools';
import { HeaderBar } from './components/HeaderBar';
import { PinnedQuickBar } from './components/PinnedQuickBar';
import { ToolCardItem } from './components/ToolCardItem';
import { AddToolModal } from './components/AddToolModal';
import { BottomNavBar } from './components/BottomNavBar';

export default function App() {
  const [tools, setTools] = useState<ToolItem[]>(() => {
    try {
      const saved = localStorage.getItem('toolhub_items_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SAMPLE_TOOLS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bottomTab, setBottomTab] = useState<'tools' | 'pinned' | 'categories' | 'settings'>('tools');

  // Modals & Sheets
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Theme: Mặc định luôn là GIAO DIỆN SÁNG (Light Mode)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('toolhub_theme_light_first');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('toolhub_theme_light_first', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('toolhub_theme_light_first', 'light');
    }
  }, [isDark]);

  // Persist tools
  useEffect(() => {
    try {
      localStorage.setItem('toolhub_items_v1', JSON.stringify(tools));
    } catch {
      // ignore
    }
  }, [tools]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2400);
  };

  // Open tool & increment click
  const handleOpenTool = (tool: ToolItem) => {
    setTools(prev => prev.map(t => {
      if (t.id === tool.id) {
        return { ...t, clickCount: (t.clickCount || 0) + 1 };
      }
      return t;
    }));
  };

  // Toggle pin
  const handleTogglePin = (id: string) => {
    setTools(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.isPinned;
        showToast(nextState ? 'Đã ghim công cụ lên đầu!' : 'Đã bỏ ghim công cụ');
        return { ...t, isPinned: nextState };
      }
      return t;
    }));
  };

  // Save (Add or Edit)
  const handleSaveTool = (toolData: Omit<ToolItem, 'id' | 'clickCount'> & { id?: string }) => {
    if (toolData.id) {
      setTools(prev => prev.map(t => {
        if (t.id === toolData.id) {
          return { ...t, ...toolData, id: toolData.id as string };
        }
        return t;
      }));
      showToast('Đã cập nhật công cụ thành công!');
    } else {
      const newTool: ToolItem = {
        id: 'tool-' + Date.now(),
        name: toolData.name,
        url: toolData.url,
        label: toolData.label,
        category: toolData.category,
        icon: toolData.icon || 'link',
        isPinned: toolData.isPinned,
        clickCount: 1,
        createdAt: new Date().toISOString()
      };
      setTools(prev => [newTool, ...prev]);
      showToast('Đã lưu công cụ vào Local Storage!');
    }
  };

  // Delete
  const handleDeleteTool = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa công cụ này?')) {
      setTools(prev => prev.filter(t => t.id !== id));
      showToast('Đã xóa công cụ');
    }
  };

  // Copy link
  const handleCopyUrl = (url: string) => {
    navigator.clipboard?.writeText(url);
    showToast('Đã chép link vào bộ nhớ tạm!');
  };

  // Share
  const handleShare = (tool: ToolItem) => {
    if (navigator.share) {
      navigator.share({ title: tool.name, url: tool.url }).catch(() => {});
    } else {
      handleCopyUrl(tool.url);
    }
  };

  // Export JSON
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tools, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ToolHub_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã xuất file JSON sao lưu thành công!');
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTools(parsed);
          showToast(`Đã khôi phục thành công ${parsed.length} công cụ!`);
          setIsSettingsOpen(false);
        } else {
          showToast('Tệp không đúng định dạng!');
        }
      } catch {
        showToast('Không thể đọc tệp sao lưu.');
      }
    };
    reader.readAsText(file);
  };

  // Filtered tools
  const pinnedTools = useMemo(() => {
    return tools.filter(t => t.isPinned);
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Tab filter
      if (bottomTab === 'pinned' && !tool.isPinned) return false;

      // Category filter
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = tool.name.toLowerCase().includes(q);
        const matchLabel = tool.label.toLowerCase().includes(q);
        const matchUrl = tool.url.toLowerCase().includes(q);
        return matchName || matchLabel || matchUrl;
      }

      return true;
    });
  }, [tools, bottomTab, selectedCategory, searchQuery]);

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tools.length };
    tools.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [tools]);

  const availableCategories = useMemo(() => {
    const keys = Object.keys(categoryCounts).filter(k => k !== 'all');
    return ['all', ...keys];
  }, [categoryCounts]);

  return (
    <div className="bg-[#faf8ff] dark:bg-[#121622] text-[#131b2e] dark:text-[#eef0ff] min-h-screen flex flex-col font-['Inter',sans-serif] selection:bg-[#004ac6] selection:text-white transition-colors">
      {/* Top Header Bar */}
      <HeaderBar
        onOpenAddModal={() => {
          setEditingTool(null);
          setIsAddModalOpen(true);
        }}
        onFocusSearch={() => {
          searchInputRef.current?.focus();
        }}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Content Viewport */}
      <main className="flex flex-col relative w-full pt-16 pb-36 sm:pb-32 px-4 max-w-2xl sm:max-w-4xl mx-auto flex-1 gap-y-4 sm:gap-y-5">
        {/* Header Banner & Status */}
        <div className="relative overflow-hidden rounded-2xl bg-[#f2f3ff] dark:bg-[#181d2c] p-4 sm:p-5 shadow-xs border border-black/[0.04] dark:border-white/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 relative z-10">
            <div className="flex flex-col gap-y-1.5 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaedff] dark:bg-[#242b40] text-[#004ac6] dark:text-[#89b4ff] w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] dark:bg-[#89b4ff] animate-pulse" />
                <span className="text-[11px] font-semibold whitespace-nowrap">Mở là dùng ngay • Không cần tài khoản</span>
              </div>
              
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#131b2e] dark:text-[#eef0ff] tracking-tight whitespace-nowrap">
                  Không gian công cụ
                </h2>

                {/* Mobile 'Thêm link' button */}
                <button
                  onClick={() => {
                    setEditingTool(null);
                    setIsAddModalOpen(true);
                  }}
                  className="sm:hidden flex-shrink-0 flex items-center justify-center gap-1 h-8 px-3 rounded-xl bg-[#004ac6] text-white text-xs font-semibold shadow-xs hover:bg-[#2563eb] active:scale-95 transition-all cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">add_link</span>
                  <span>Thêm link</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#434655] dark:text-[#b0b4c8] leading-relaxed">
                Lưu trên thiết bị (Local Storage), tức thì và an toàn tuyệt đối.
              </p>
            </div>

            {/* Desktop 'Thêm link' button */}
            <button
              onClick={() => {
                setEditingTool(null);
                setIsAddModalOpen(true);
              }}
              className="hidden sm:flex flex-shrink-0 items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#004ac6] text-white text-xs font-semibold shadow-xs hover:bg-[#2563eb] active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_link</span>
              <span>Thêm link</span>
            </button>
          </div>

          {/* Ribbon Stats */}
          <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[#434655] dark:text-[#b0b4c8] text-xs relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#006058] dark:text-[#6bd8cb]">database</span>
              <span>Bộ nhớ cục bộ: <strong className="text-[#131b2e] dark:text-[#eef0ff] font-semibold">{tools.length} công cụ</strong></span>
            </div>
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1 text-[#004ac6] dark:text-[#89b4ff] font-semibold hover:underline cursor-pointer active:opacity-70 transition-opacity"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">file_download</span>
              <span>Sao lưu JSON</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Area */}
        <div className="flex flex-col gap-y-2.5">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#737686] text-[20px]">
              search
            </span>
            <input
              ref={searchInputRef}
              className="w-full h-10 pl-10 pr-10 rounded-xl bg-white dark:bg-[#1c2336] text-[#131b2e] dark:text-[#eef0ff] text-sm placeholder:text-[#737686] shadow-sm border border-black/[0.04] dark:border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#004ac6] transition-all"
              placeholder="Tìm công cụ, tên miền, hoặc nhãn..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#737686] hover:text-[#131b2e] dark:hover:text-white"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {availableCategories.map(cat => {
              const label = CATEGORY_NAMES[cat] || cat;
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#004ac6] text-white'
                      : 'bg-white dark:bg-[#1c2336] text-[#434655] dark:text-[#b0b4c8] border border-black/[0.04] dark:border-white/[0.06] hover:bg-[#f2f3ff]'
                  }`}
                  type="button"
                >
                  <span>{label}</span>
                  <span className="opacity-75 text-[11px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pinned Quick Access (if any) */}
        {!searchQuery && selectedCategory === 'all' && bottomTab !== 'pinned' && (
          <PinnedQuickBar
            pinnedTools={pinnedTools}
            onOpenTool={handleOpenTool}
            onCopyUrl={handleCopyUrl}
          />
        )}

        {/* Main Tools Section */}
        <div className="flex flex-col gap-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#131b2e] dark:text-[#eef0ff]">
              {bottomTab === 'pinned' ? 'Các liên kết đã ghim' : 'Tất cả liên kết'} ({filteredTools.length})
            </h3>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#004ac6] dark:text-[#89b4ff] hover:underline"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTools.map(tool => (
                <ToolCardItem
                  key={tool.id}
                  tool={tool}
                  onOpenTool={handleOpenTool}
                  onTogglePin={handleTogglePin}
                  onEdit={(t) => {
                    setEditingTool(t);
                    setIsAddModalOpen(true);
                  }}
                  onDelete={handleDeleteTool}
                  onCopyUrl={handleCopyUrl}
                  onShare={handleShare}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-white dark:bg-[#1c2336] shadow-sm border border-black/[0.04] dark:border-white/[0.06] space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#eaedff] dark:bg-[#242b40] flex items-center justify-center text-[#004ac6] dark:text-[#89b4ff]">
                <span className="material-symbols-outlined text-[28px]">search_off</span>
              </div>
              <h4 className="font-bold text-sm text-[#131b2e] dark:text-[#eef0ff]">
                Không tìm thấy công cụ phù hợp
              </h4>
              <p className="text-xs text-[#434655] dark:text-[#b0b4c8] max-w-xs">
                {searchQuery ? `Không có kết quả cho "${searchQuery}"` : 'Danh mục này chưa có công cụ nào.'}
              </p>
              <button
                onClick={() => {
                  setEditingTool(null);
                  setIsAddModalOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004ac6] text-white text-xs font-semibold shadow-xs hover:bg-[#2563eb]"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Thêm công cụ mới</span>
              </button>
            </div>
          )}
        </div>

        {/* Privacy Badge */}
        <div className="rounded-2xl bg-[#f2f3ff] dark:bg-[#181d2c] p-4 flex items-center gap-3 border border-black/[0.03] dark:border-white/[0.04]">
          <div className="w-9 h-9 rounded-xl bg-[#007b71] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#131b2e] dark:text-[#eef0ff]">
              Bảo mật dữ liệu tuyệt đối
            </span>
            <p className="text-[11px] text-[#434655] dark:text-[#b0b4c8] truncate">
              Không gửi dữ liệu lên server. Mọi liên kết ở lại trên máy bạn.
            </p>
          </div>
        </div>
      </main>

      {/* Floating Glassmorphic Bottom Navigation Bar */}
      <BottomNavBar
        currentTab={bottomTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setBottomTab(tab);
            if (tab === 'categories') {
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }
          }
        }}
        onOpenAddModal={() => {
          setEditingTool(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Add / Edit Tool Modal */}
      <AddToolModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTool(null);
        }}
        onSave={handleSaveTool}
        editingTool={editingTool}
      />

      {/* Settings Modal (Cài đặt & Sao lưu) */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#131b2e]/50 backdrop-blur-xs transition-opacity p-0 sm:p-4"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div 
            className="w-full sm:max-w-md bg-white dark:bg-[#1c2336] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] dark:text-[#89b4ff] text-[22px]">tune</span>
                <h3 className="font-bold text-base text-[#131b2e] dark:text-[#eef0ff]">Cài đặt & Dữ liệu</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#737686] hover:bg-[#f2f3ff] dark:hover:bg-[#242b40]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Export */}
              <button
                onClick={handleExportBackup}
                className="w-full p-3 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] flex items-center justify-between hover:bg-[#eaedff] text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#004ac6] dark:text-[#89b4ff]">file_download</span>
                  <div>
                    <div className="text-xs font-bold text-[#131b2e] dark:text-[#eef0ff]">Xuất file JSON sao lưu</div>
                    <div className="text-[11px] text-[#737686]">Lưu toàn bộ {tools.length} liên kết về máy</div>
                  </div>
                </div>
                <span className="text-xs text-[#004ac6] font-semibold">Tải về</span>
              </button>

              {/* Import */}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".json" 
                className="hidden" 
                onChange={handleImportFile} 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] flex items-center justify-between hover:bg-[#eaedff] text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">upload_file</span>
                  <div>
                    <div className="text-xs font-bold text-[#131b2e] dark:text-[#eef0ff]">Khôi phục từ file JSON</div>
                    <div className="text-[11px] text-[#737686]">Nhập dữ liệu từ thiết bị khác</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-600 font-semibold">Chọn file</span>
              </button>

              {/* Clear */}
              <button
                onClick={() => {
                  if (confirm('Xóa toàn bộ các liên kết để tự tạo mới từ đầu?')) {
                    setTools([]);
                    showToast('Đã xóa toàn bộ công cụ!');
                    setIsSettingsOpen(false);
                  }
                }}
                className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-between hover:bg-red-100 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-red-600">delete_sweep</span>
                  <div>
                    <div className="text-xs font-bold text-red-600">Xóa sạch toàn bộ</div>
                    <div className="text-[11px] text-[#737686]">Làm trống danh sách để bắt đầu mới</div>
                  </div>
                </div>
                <span className="text-xs text-red-600 font-semibold">Xóa hết</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div 
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#283044] text-[#eef0ff] text-xs font-semibold shadow-lg flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <span className="material-symbols-outlined text-[18px] text-[#89f5e7]">check_circle</span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
