import React, { useState, useEffect } from 'react';
import { ToolItem } from '../types';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (toolData: Omit<ToolItem, 'id' | 'clickCount'> & { id?: string }) => void;
  editingTool?: ToolItem | null;
}

const AVAILABLE_ICONS = [
  'link', 'shield', 'sell', 'smartphone', 'brush', 'code', 'menu_book', 'api', 'monitoring', 'folder'
];

export const AddToolModal: React.FC<AddToolModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTool
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('warranty');
  const [icon, setIcon] = useState('link');
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTool) {
      setName(editingTool.name);
      setUrl(editingTool.url);
      setLabel(editingTool.label || '');
      setCategory(editingTool.category || 'warranty');
      setIcon(editingTool.icon || 'link');
      setIsPinned(!!editingTool.isPinned);
    } else {
      setName('');
      setUrl('');
      setLabel('');
      setCategory('warranty');
      setIcon('link');
      setIsPinned(false);
    }
    setError('');
  }, [editingTool, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập Tên công cụ / Nút');
      return;
    }

    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Vui lòng nhập Địa chỉ URL');
      return;
    }

    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setError('Đường dẫn URL không hợp lệ');
      return;
    }

    onSave({
      id: editingTool?.id,
      name: name.trim(),
      url: cleanUrl,
      label: label.trim() || 'Công cụ',
      category: category || 'custom',
      icon: icon || 'link',
      isPinned
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#131b2e]/50 backdrop-blur-xs transition-opacity animate-fade-in p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-[#1c2336] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] dark:text-[#89b4ff] text-[22px]">
              {editingTool ? 'edit_note' : 'add_circle'}
            </span>
            <h3 className="font-bold text-base text-[#131b2e] dark:text-[#eef0ff]">
              {editingTool ? 'Chỉnh sửa liên kết' : 'Thêm công cụ mới'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#737686] hover:text-[#131b2e] dark:hover:text-white hover:bg-[#f2f3ff] dark:hover:bg-[#242b40] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Tên công cụ */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#434655] dark:text-[#b0b4c8]">
              Tên công cụ / Tên nút *
            </label>
            <input 
              className="h-10 px-3 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] text-[#131b2e] dark:text-[#eef0ff] text-sm focus:bg-white dark:focus:bg-[#181d2c] focus:ring-2 focus:ring-[#004ac6] focus:outline-none transition-all"
              placeholder="Ví dụ: Check bảo hành Xiaomi DGCare, Bảng giá CellphoneS..."
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Địa chỉ URL */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#434655] dark:text-[#b0b4c8]">
              Địa chỉ URL *
            </label>
            <input 
              className="h-10 px-3 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] text-[#131b2e] dark:text-[#eef0ff] text-sm font-mono focus:bg-white dark:focus:bg-[#181d2c] focus:ring-2 focus:ring-[#004ac6] focus:outline-none transition-all"
              placeholder="https://..."
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {/* Nhãn nút */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#434655] dark:text-[#b0b4c8]">
              Nhãn hiển thị (Badge ngắn gọn)
            </label>
            <input 
              className="h-10 px-3 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] text-[#131b2e] dark:text-[#eef0ff] text-sm focus:bg-white dark:focus:bg-[#181d2c] focus:ring-2 focus:ring-[#004ac6] focus:outline-none transition-all"
              placeholder="Ví dụ: Xiaomi VN, Giá thu, Samsung..."
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Nhóm phân loại */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#434655] dark:text-[#b0b4c8]">
              Nhóm phân loại
            </label>
            <select 
              className="h-10 px-3 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] text-[#131b2e] dark:text-[#eef0ff] text-sm focus:bg-white dark:focus:bg-[#181d2c] focus:ring-2 focus:ring-[#004ac6] focus:outline-none cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="warranty">Bảo hành (Xiaomi, Samsung, Apple...)</option>
              <option value="trade_in">Giá thu cũ (CellphoneS, TGDĐ, FPT...)</option>
              <option value="dev">Kỹ thuật / ROM (SamFw, MiFirm...)</option>
              <option value="design">Thiết kế & Giao diện</option>
              <option value="custom">Mục tùy chỉnh khác</option>
            </select>
          </div>

          {/* Chọn Icon */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655] dark:text-[#b0b4c8]">
              Biểu tượng đại diện:
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    icon === ic
                      ? 'bg-[#004ac6] text-white shadow-xs scale-105'
                      : 'bg-[#f2f3ff] dark:bg-[#242b40] text-[#434655] dark:text-[#b0b4c8] hover:bg-[#eaedff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[19px]">{ic}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ghim lên đầu */}
          <div className="flex items-center gap-2 pt-1">
            <input 
              id="pin-tool-check"
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
            />
            <label htmlFor="pin-tool-check" className="text-xs text-[#131b2e] dark:text-[#eef0ff] font-medium cursor-pointer select-none">
              Ghim công cụ này lên thanh truy cập nhanh trên cùng
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
            <button 
              className="h-10 px-4 rounded-xl text-[#131b2e] dark:text-[#eef0ff] text-xs font-semibold hover:bg-[#f2f3ff] dark:hover:bg-[#242b40] transition-colors cursor-pointer"
              type="button"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button 
              className="h-10 px-5 rounded-xl bg-[#004ac6] text-white text-xs font-semibold shadow-sm hover:bg-[#2563eb] active:scale-95 transition-all cursor-pointer"
              type="submit"
            >
              {editingTool ? 'Lưu thay đổi' : 'Lưu vào máy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
