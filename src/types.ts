export interface ToolItem {
  id: string;
  name: string;        // Tên công cụ (VD: Check bảo hành Xiaomi DGCare)
  label: string;       // Nhãn nút (VD: Xiaomi VN, Giá thu cũ, 6060)
  url: string;         // Đường dẫn URL (VD: https://www.mi.com/vn/support)
  category: string;    // Nhóm phân loại
  icon?: string;       // Tên icon Material Symbols Outlined
  isPinned?: boolean;  // Đã ghim lên đầu
  clickCount: number;  // Số lượt bấm
  createdAt?: string;
}

export type CategoryFilter = 'all' | 'pinned' | string;
