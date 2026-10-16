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

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Tools state - starts empty by default, loaded from Firebase or local storage
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

            // Sort: pinned first, then by click count / creation
            remoteTools.sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return (b.clickCount || 0) - (a.clickCount || 0);
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
    } catch (err: any) {
      setIsSyncing(false);
      showToast('Đăng nhập chưa hoàn tất hoặc bị hủy.');
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Đã đăng xuất tài khoản.');
    } catch (err: any) {
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
        showToast(nextState ? 'Đã ghim công cụ lên Firebase!' : 'Đã bỏ ghim công cụ');
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

    if (currentUser) {
      try {
        setIsSyncing(true);
        const docRef = doc(db, 'tools', toolId);

        if (toolData.id) {
          // Update existing
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
          // Create new
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
      // Local fallback for guest
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
    downloadAnchor.setAttribute('download', `ToolHub_Firebase_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã xuất file JSON sao lưu thành công!');
  };

  // Import JSON & push to Firebase if logged in
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
        const matchName = tool.name?.toLowerCase().includes(q);
        const matchLabel = tool.label?.toLowerCase().includes(q);
        const matchUrl = tool.url?.toLowerCase().includes(q);
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
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isSyncing={isSyncing}
      />

      {/* Main Content Viewport */}
      <main className="flex flex-col relative w-full pt-16 pb-36 sm:pb-32 px-4 max-w-2xl sm:max-w-4xl mx-auto flex-1 gap-y-4 sm:gap-y-5">
        {/* Header Banner & Status */}
        <div className="relative overflow-hidden rounded-2xl bg-[#f2f3ff] dark:bg-[#181d2c] p-4 sm:p-5 shadow-xs border border-black/[0.04] dark:border-white/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
            <div className="flex flex-col gap-y-1.5 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaedff] dark:bg-[#242b40] text-[#004ac6] dark:text-[#89b4ff] w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold whitespace-nowrap">
                  {currentUser 
                    ? `Đã kết nối Firebase • ${currentUser.displayName || currentUser.email}`
                    : 'Firebase Cloud sẵn sàng • Bấm đăng nhập để đồng bộ'}
                </span>
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
                {currentUser 
                  ? 'Liên kết của bạn được lưu an toàn trên đám mây Firebase Firestore, đồng bộ tức thì trên mọi thiết bị.'
                  : 'Lưu trên thiết bị và đồng bộ trực tiếp lên Firebase Firestore an toàn tuyệt đối.'}
              </p>

              {/* Login CTA banner if not logged in */}
              {!currentUser && !authLoading && (
                <div className="mt-1 pt-1 flex items-center gap-2">
                  <button
                    onClick={handleLogin}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white dark:bg-[#242b40] text-[#131b2e] dark:text-[#eef0ff] text-xs font-semibold shadow-xs border border-black/[0.06] hover:bg-[#eaedff] transition-all cursor-pointer"
                    type="button"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Đăng nhập Google để đồng bộ Cloud</span>
                  </button>
                </div>
              )}
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
              <span className="material-symbols-outlined text-[16px] text-[#006058] dark:text-[#6bd8cb]">cloud_done</span>
              <span>
                {currentUser ? 'Firebase Firestore: ' : 'Bộ nhớ: '}
                <strong className="text-[#131b2e] dark:text-[#eef0ff] font-semibold">{tools.length} công cụ</strong>
              </span>
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
          {availableCategories.length > 1 && (
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
          )}
        </div>

        {/* Pinned Quick Access (if any) */}
        {!searchQuery && selectedCategory === 'all' && bottomTab !== 'pinned' && pinnedTools.length > 0 && (
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
            /* Modern Friendly Empty State */
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl bg-white dark:bg-[#1c2336] shadow-sm border border-black/[0.04] dark:border-white/[0.06] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#eaedff] dark:bg-[#242b40] flex items-center justify-center text-[#004ac6] dark:text-[#89b4ff] shadow-xs">
                <span className="material-symbols-outlined text-[32px]">
                  {searchQuery ? 'search_off' : 'add_link'}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 max-w-sm">
                <h4 className="font-bold text-base text-[#131b2e] dark:text-[#eef0ff]">
                  {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có công cụ nào'}
                </h4>
                <p className="text-xs text-[#434655] dark:text-[#b0b4c8] leading-relaxed">
                  {searchQuery 
                    ? `Không tìm thấy công cụ nào với từ khóa "${searchQuery}". Thử từ khóa khác hoặc tạo mới.`
                    : 'Bắt đầu thêm các đường link công cụ cần thiết của bạn. Mọi dữ liệu sẽ được lưu an toàn trực tiếp vào Firebase.'}
                </p>
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setEditingTool(null);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#004ac6] text-white text-xs font-semibold shadow-xs hover:bg-[#2563eb] active:scale-95 transition-all cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Tạo liên kết mới</span>
                </button>

                {!currentUser && (
                  <button
                    onClick={handleLogin}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] text-[#131b2e] dark:text-[#eef0ff] text-xs font-semibold hover:bg-[#eaedff] active:scale-95 transition-all cursor-pointer"
                    type="button"
                  >
                    <span>Đăng nhập Google</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Firebase Security & Cloud Sync Badge */}
        <div className="rounded-2xl bg-[#f2f3ff] dark:bg-[#181d2c] p-4 flex items-center gap-3 border border-black/[0.03] dark:border-white/[0.04]">
          <div className="w-9 h-9 rounded-xl bg-[#007b71] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#131b2e] dark:text-[#eef0ff]">
              Đồng bộ Firebase Cloud Firestore
            </span>
            <p className="text-[11px] text-[#434655] dark:text-[#b0b4c8] truncate">
              {currentUser 
                ? `Tài khoản ${currentUser.email} • Bảo mật riêng tư và tự động cập nhật`
                : 'Đăng nhập để đồng bộ dữ liệu của bạn trên điện thoại, máy tính và máy tính bảng.'}
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

      {/* Settings Modal (Cài đặt & Đồng bộ Firebase) */}
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

            {/* Auth status block inside Settings */}
            <div className="p-3.5 rounded-2xl bg-[#f2f3ff] dark:bg-[#242b40] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#004ac6]/15 flex items-center justify-center text-[#004ac6] shrink-0">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#131b2e] dark:text-[#eef0ff] truncate">
                    {currentUser ? (currentUser.displayName || 'Tài khoản Google') : 'Chưa đăng nhập'}
                  </div>
                  <div className="text-[11px] text-[#737686] dark:text-[#898d9e] truncate">
                    {currentUser ? currentUser.email : 'Đăng nhập để đồng bộ Cloud'}
                  </div>
                </div>
              </div>

              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a2030] text-xs font-semibold text-red-600 dark:text-red-400 border border-black/[0.04] shadow-2xs hover:bg-red-50 cursor-pointer"
                  type="button"
                >
                  Đăng xuất
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-3 py-1.5 rounded-xl bg-[#004ac6] text-xs font-semibold text-white shadow-2xs hover:bg-[#2563eb] cursor-pointer"
                  type="button"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
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
                    <div className="text-xs font-bold text-[#131b2e] dark:text-[#eef0ff]">Nhập từ file JSON</div>
                    <div className="text-[11px] text-[#737686]">Khôi phục dữ liệu hoặc tải lên Firebase</div>
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
                className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-between hover:bg-red-100 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-red-600">delete_sweep</span>
                  <div>
                    <div className="text-xs font-bold text-red-600">Xóa sạch toàn bộ</div>
                    <div className="text-[11px] text-[#737686]">Làm trống danh sách để bắt đầu lại</div>
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
