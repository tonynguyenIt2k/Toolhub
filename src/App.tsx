/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logoutUser, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { ToolItem } from './types';
import { INITIAL_SAMPLE_TOOLS, CATEGORY_NAMES } from './data/defaultTools';
import { HeaderBar } from './components/HeaderBar';
import { PinnedQuickBar } from './components/PinnedQuickBar';
import { ToolCardItem } from './components/ToolCardItem';
import { AddToolModal } from './components/AddToolModal';
import { BottomNavBar } from './components/BottomNavBar';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Tools state - loaded from Firebase Firestore or local cache
  const [tools, setTools] = useState<ToolItem[]>(() => {
    try {
      const saved = localStorage.getItem('toolhub_items_v2');
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
  const [sortBy, setSortBy] = useState<'recent' | 'clicks' | 'az'>('recent');

  // Modals & Sheets
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Custom user categories
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('toolhub_custom_categories_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['warranty', 'trade_in', 'tech'];
  });

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

  // Ctrl+K Shortcut to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Firebase Auth & Realtime Firestore sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        setIsSyncing(true);
        const toolsRef = collection(db, 'tools');
        const userQuery = query(toolsRef, where('userId', '==', user.uid));

        const unsubsSnapshot = onSnapshot(
          userQuery,
          (snapshot) => {
            const remoteTools: ToolItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              remoteTools.push({
                id: docSnap.id,
                userId: data.userId,
                name: data.name,
                label: data.label || 'Công cụ',
                url: data.url,
                category: data.category || 'custom',
                icon: data.icon || 'link',
                isPinned: !!data.isPinned,
                clickCount: Number(data.clickCount) || 0,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
              });
            });

            setTools(remoteTools);
            setIsSyncing(false);
          },
          (error) => {
            setIsSyncing(false);
            handleFirestoreError(error, OperationType.LIST, 'tools');
          }
        );

        return () => unsubsSnapshot();
      } else {
        setIsSyncing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save to local cache as fallback
  useEffect(() => {
    try {
      localStorage.setItem('toolhub_items_v2', JSON.stringify(tools));
    } catch {
      // ignore
    }
  }, [tools]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2400);
  };

  // Google Login
  const handleLogin = async () => {
    try {
      setIsSyncing(true);
      const res = await loginWithGoogle();
      showToast(`Đăng nhập thành công: ${res.user.displayName || res.user.email}`);
    } catch {
      setIsSyncing(false);
      showToast('Đăng nhập chưa hoàn tất hoặc bị hủy.');
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Đã đăng xuất tài khoản.');
    } catch {
      showToast('Lỗi khi đăng xuất.');
    }
  };

  // Open tool & increment click
  const handleOpenTool = async (tool: ToolItem) => {
    const nextCount = (tool.clickCount || 0) + 1;
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'tools', tool.id), { clickCount: nextCount });
      } catch {
        // Non-fatal, local update will show
      }
    }
    setTools(prev => prev.map(t => (t.id === tool.id ? { ...t, clickCount: nextCount } : t)));
  };

  // Toggle pin
  const handleTogglePin = async (id: string) => {
    const target = tools.find(t => t.id === id);
    if (!target) return;
    const nextState = !target.isPinned;

    if (currentUser) {
      try {
        setIsSyncing(true);
        await updateDoc(doc(db, 'tools', id), {
          isPinned: nextState,
          updatedAt: new Date().toISOString()
        });
        showToast(nextState ? 'Đã ghim công cụ lên đầu (Firebase)!' : 'Đã bỏ ghim công cụ');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `tools/${id}`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      setTools(prev => prev.map(t => (t.id === id ? { ...t, isPinned: nextState } : t)));
      showToast(nextState ? 'Đã ghim công cụ lên đầu!' : 'Đã bỏ ghim công cụ');
    }
  };

  // Save (Add or Edit)
  const handleSaveTool = async (toolData: Omit<ToolItem, 'id' | 'clickCount'> & { id?: string }) => {
    const now = new Date().toISOString();
    const toolId = toolData.id || `tool_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Auto-register new custom category if not existing
    if (toolData.category && !customCategories.includes(toolData.category)) {
      const updated = [...customCategories, toolData.category];
      setCustomCategories(updated);
      localStorage.setItem('toolhub_custom_categories_v1', JSON.stringify(updated));
    }

    if (currentUser) {
      try {
        setIsSyncing(true);
        const docRef = doc(db, 'tools', toolId);

        if (toolData.id) {
          await updateDoc(docRef, {
            name: toolData.name,
            url: toolData.url,
            label: toolData.label || 'Công cụ',
            category: toolData.category || 'custom',
            icon: toolData.icon || 'link',
            isPinned: !!toolData.isPinned,
            updatedAt: now
          });
          showToast('Đã lưu thay đổi vào Firebase!');
        } else {
          await setDoc(docRef, {
            userId: currentUser.uid,
            name: toolData.name,
            url: toolData.url,
            label: toolData.label || 'Công cụ',
            category: toolData.category || 'custom',
            icon: toolData.icon || 'link',
            isPinned: !!toolData.isPinned,
            clickCount: 1,
            createdAt: now,
            updatedAt: now
          });
          showToast('Đã lưu công cụ vào Firebase Firestore!');
        }
      } catch (err) {
        handleFirestoreError(err, toolData.id ? OperationType.UPDATE : OperationType.CREATE, `tools/${toolId}`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      if (toolData.id) {
        setTools(prev => prev.map(t => (t.id === toolData.id ? { ...t, ...toolData } : t)));
        showToast('Đã cập nhật công cụ!');
      } else {
        const newTool: ToolItem = {
          id: toolId,
          name: toolData.name,
          url: toolData.url,
          label: toolData.label,
          category: toolData.category,
          icon: toolData.icon || 'link',
          isPinned: toolData.isPinned,
          clickCount: 1,
          createdAt: now
        };
        setTools(prev => [newTool, ...prev]);
        showToast('Đã lưu công cụ! Đăng nhập để đồng bộ Firebase.');
      }
    }
  };

  // Delete
  const handleDeleteTool = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa công cụ này?')) return;

    if (currentUser) {
      try {
        setIsSyncing(true);
        await deleteDoc(doc(db, 'tools', id));
        showToast('Đã xóa công cụ khỏi Firebase!');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `tools/${id}`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      setTools(prev => prev.filter(t => t.id !== id));
      showToast('Đã xóa công cụ');
    }
  };

  // Copy link
  const handleCopyUrl = (url: string) => {
    navigator.clipboard?.writeText(url);
    showToast('Đã sao chép liên kết vào bộ nhớ tạm!');
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
    downloadAnchor.setAttribute('download', `ToolHub_Firebase_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã xuất file JSON sao lưu thành công!');
  };

  // Import JSON & push to Firebase
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (currentUser) {
            setIsSyncing(true);
            for (const item of parsed) {
              const docId = `tool_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              await setDoc(doc(db, 'tools', docId), {
                userId: currentUser.uid,
                name: item.name || 'Công cụ',
                url: item.url || '',
                label: item.label || 'Công cụ',
                category: item.category || 'custom',
                icon: item.icon || 'link',
                isPinned: !!item.isPinned,
                clickCount: Number(item.clickCount) || 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
            setIsSyncing(false);
            showToast(`Đã đồng bộ ${parsed.length} công cụ lên Firebase!`);
          } else {
            setTools(parsed);
            showToast(`Đã khôi phục ${parsed.length} công cụ!`);
          }
          setIsSettingsOpen(false);
        } else {
          showToast('Tệp JSON không đúng định dạng!');
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
    const list = tools.filter(tool => {
      // Tab filter
      if (bottomTab === 'pinned' && !tool.isPinned) return false;

      // Category filter
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = tool.name?.toLowerCase().includes(q);
        const matchLabel = tool.label?.toLowerCase().includes(q);
        const matchUrl = tool.url?.toLowerCase().includes(q);
        return matchName || matchLabel || matchUrl;
      }

      return true;
    });

    if (sortBy === 'az') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }
    if (sortBy === 'clicks') {
      return [...list].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
    }
    // recent
    return [...list].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [tools, bottomTab, selectedCategory, searchQuery, sortBy]);

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tools.length };
    customCategories.forEach(cat => {
      counts[cat] = 0;
    });
    tools.forEach(t => {
      if (t.category) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });
    return counts;
  }, [tools, customCategories]);

  const availableCategories = useMemo(() => {
    const keys = Object.keys(categoryCounts).filter(k => k !== 'all');
    return ['all', ...keys];
  }, [categoryCounts]);

  return (
    <div className="min-h-full font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-blue-100 selection:text-blue-900 bg-gradient-to-br from-[#f3f6fc] via-[#f7f9fd] to-[#eef3fb] dark:from-[#0f1422] dark:via-[#131929] dark:to-[#0c101c] relative min-h-screen flex flex-col transition-colors">
      {/* Ambient Radial Glows (Mesh Background for Liquid Glass Effect) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-300/25 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-28 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[350px] bg-sky-200/20 dark:bg-sky-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Offline Status Banner */}
      <OfflineIndicator />

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
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isSyncing={isSyncing}
        currentTab={bottomTab}
        onSelectTab={setBottomTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        pinnedCount={pinnedTools.length}
        onExportBackup={handleExportBackup}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-3 space-y-3.5 flex-1 w-full relative z-10 pb-28 md:pb-10">
        {/* Header Filter Bar (Super-compact Single Row Layout) */}
        <section className="glass-panel rounded-xl p-2.5 sm:px-3.5 sm:py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search Bar (Liquid Glass Micro) */}
          <div className="relative w-full md:w-80 shrink-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-[17px]">search</span>
            </div>
            <input
              ref={searchInputRef}
              className="block w-full rounded-lg border border-white/80 dark:border-white/10 bg-white/70 dark:bg-white/10 py-1.5 pl-8 pr-16 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 shadow-inner backdrop-blur-md focus:border-blue-500 focus:bg-white dark:focus:bg-[#1a2233] focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
              placeholder="Tìm công cụ, tên miền, nhãn..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex py-1 pr-1.5 items-center">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              ) : (
                <kbd className="inline-flex items-center rounded border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/10 px-1 py-0.2 font-mono text-[10px] text-slate-400 pointer-events-none">
                  Ctrl K
                </kbd>
              )}
            </div>
          </div>

          {/* Category Filter Pills (Ultra-dense) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {availableCategories.map(cat => {
              const label = CATEGORY_NAMES[cat] || cat;
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'glass-chip text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200'
                  }`}
                  type="button"
                >
                  <span>{label}</span>
                  <span className={`text-[10px] ml-1 font-normal ${isSelected ? 'opacity-85' : 'text-slate-400 dark:text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Thêm nhóm button */}
            <button
              onClick={() => {
                setNewCategoryName('');
                setIsAddCategoryModalOpen(true);
              }}
              className="px-2 py-1 text-xs font-medium rounded-lg border border-dashed border-blue-300 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 flex items-center gap-0.5 transition whitespace-nowrap cursor-pointer active:scale-95"
              type="button"
              title="Thêm nhóm phân loại mới"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Thêm nhóm</span>
            </button>
          </div>

          {/* Firestore Mini Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 border-l border-slate-200/60 dark:border-white/10 pl-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>
              {currentUser ? 'Firestore: ' : 'Bộ nhớ: '}
              <strong className="text-slate-800 dark:text-white font-semibold">{tools.length} công cụ</strong>
            </span>
          </div>
        </section>

        {/* Quick Access Section (Ghim truy cập nhanh) */}
        {!searchQuery && selectedCategory === 'all' && bottomTab !== 'pinned' && pinnedTools.length > 0 && (
          <PinnedQuickBar
            pinnedTools={pinnedTools}
            onOpenTool={handleOpenTool}
            onCopyUrl={handleCopyUrl}
          />
        )}

        {/* All Links Directory Section */}
        <section className="space-y-2" data-purpose="link-directory">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {bottomTab === 'pinned' ? 'Các liên kết đã ghim' : 'Tất cả liên kết'}
              </h2>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-white/80 dark:bg-white/10 border border-white/90 dark:border-white/10 text-slate-600 dark:text-slate-300">
                {filteredTools.length} mục
              </span>
            </div>

            {/* View Sorting Controls */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-white/80 dark:border-white/10 bg-white/60 dark:bg-white/10 rounded-md py-0.5 pl-2 pr-6 text-[11px] font-medium text-slate-700 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value="recent">Mới cập nhật</option>
                <option value="clicks">Lượt truy cập</option>
                <option value="az">Tên A-Z</option>
              </select>
            </div>
          </div>

          {/* Links Grid: High-Density 3-Column PC Layout */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
            /* Modern Friendly Empty State */
            <div className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3 my-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <span className="material-symbols-outlined text-[28px]">
                  {searchQuery ? 'search_off' : 'add_link'}
                </span>
              </div>
              <div className="max-w-sm">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có công cụ nào trong mục này'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {searchQuery
                    ? `Thử tìm kiếm với từ khóa khác hoặc tạo mới liên kết.`
                    : 'Bắt đầu thêm các đường link công cụ yêu thích. Dữ liệu sẽ tự động lưu và đồng bộ Firebase.'}
                </p>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingTool(null);
                    setIsAddModalOpen(true);
                  }}
                  className="liquid-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer active:scale-95 transition"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Tạo liên kết mới ngay</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Simple Footer (Ultra-thin Liquid Style) */}
      <footer className="border-t border-white/60 dark:border-white/10 bg-white/50 dark:bg-[#101524]/60 backdrop-blur-md py-2.5 text-center text-[11px] text-slate-500 dark:text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>ToolHub • Đồng bộ Firestore đám mây thời gian thực</span>
          </div>
          <p>© 2025 ToolHub Workspace. Thiết kế tối giản, kính lỏng &amp; tốc độ cao.</p>
        </div>
      </footer>

      {/* Floating Glassmorphic Bottom Navigation Bar (Mobile Only) */}
      <BottomNavBar
        currentTab={bottomTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setBottomTab(tab);
          }
        }}
        onOpenAddModal={() => {
          setEditingTool(null);
          setIsAddModalOpen(true);
        }}
        onExportBackup={handleExportBackup}
        pinnedCount={pinnedTools.length}
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
        availableCategories={availableCategories.map(cat => ({
          id: cat,
          name: CATEGORY_NAMES[cat] || cat
        }))}
        defaultCategory={selectedCategory}
      />

      {/* Modal Tạo nhóm phân loại mới */}
      {isAddCategoryModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/50 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setIsAddCategoryModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#1c2336] rounded-2xl p-5 shadow-2xl flex flex-col gap-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">create_new_folder</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tạo nhóm phân loại mới</h4>
              </div>
              <button 
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#737686] hover:bg-slate-100 dark:hover:bg-white/10"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tạo nhóm phân loại tùy chỉnh để sắp xếp các công cụ (ví dụ: Sim ghép, Tra IMEI, Phần cứng, Bảng giá...).
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = newCategoryName.trim();
                if (!trimmed) return;
                if (!customCategories.includes(trimmed)) {
                  const updated = [...customCategories, trimmed];
                  setCustomCategories(updated);
                  localStorage.setItem('toolhub_custom_categories_v1', JSON.stringify(updated));
                }
                setSelectedCategory(trimmed);
                setIsAddCategoryModalOpen(false);
                setNewCategoryName('');
                showToast(`Đã thêm nhóm: "${trimmed}"`);
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                autoFocus
                placeholder="Nhập tên nhóm mới..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-white/10 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#1a2233] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="h-9 px-3.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="h-9 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-all"
                >
                  Tạo nhóm ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal (Cài đặt & Dữ liệu) */}
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
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">tune</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Cài đặt &amp; Dữ liệu</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#737686] hover:bg-slate-100 dark:hover:bg-white/10"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Auth status block inside Settings */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600/15 flex items-center justify-center text-blue-600 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser ? (currentUser.displayName || 'Tài khoản Google') : 'Chưa đăng nhập'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser ? currentUser.email : 'Đăng nhập để đồng bộ Firebase'}
                  </div>
                </div>
              </div>

              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 text-xs font-semibold text-red-600 dark:text-red-400 border border-black/[0.04] dark:border-white/10 shadow-2xs hover:bg-red-50 cursor-pointer"
                  type="button"
                >
                  Đăng xuất
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 cursor-pointer"
                  type="button"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {/* PWA Install Button */}
              <PWAInstallButton variant="settings" />

              {/* Export */}
              <button
                onClick={handleExportBackup}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-between hover:bg-slate-200/70 text-left transition-colors cursor-pointer"
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">download</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Xuất file JSON sao lưu</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Lưu toàn bộ {tools.length} liên kết về máy</div>
                  </div>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Tải về</span>
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
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-between hover:bg-slate-200/70 text-left transition-colors cursor-pointer"
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">upload_file</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Nhập từ file JSON</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Khôi phục dữ liệu hoặc tải lên Firebase</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-600 font-semibold">Chọn file</span>
              </button>

              {/* Clear */}
              <button
                onClick={async () => {
                  if (confirm('Xóa sạch toàn bộ các liên kết?')) {
                    if (currentUser) {
                      try {
                        setIsSyncing(true);
                        for (const tool of tools) {
                          await deleteDoc(doc(db, 'tools', tool.id));
                        }
                        showToast('Đã xóa sạch công cụ trên Firebase!');
                      } catch (err) {
                        handleFirestoreError(err, OperationType.DELETE, 'tools');
                      } finally {
                        setIsSyncing(false);
                      }
                    } else {
                      setTools([]);
                      showToast('Đã xóa toàn bộ công cụ!');
                    }
                    setIsSettingsOpen(false);
                  }
                }}
                className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-950/50 text-left transition-colors cursor-pointer"
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-red-600">delete_sweep</span>
                  <div>
                    <div className="text-xs font-bold text-red-600">Xóa sạch toàn bộ</div>
                    <div className="text-[11px] text-slate-500">Làm trống danh sách để bắt đầu lại</div>
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
        className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold shadow-lg flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
