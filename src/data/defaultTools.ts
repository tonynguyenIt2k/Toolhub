import { ToolItem } from '../types';

// Không cần dữ liệu mẫu theo yêu cầu người dùng
export const INITIAL_SAMPLE_TOOLS: ToolItem[] = [];

export const CATEGORY_NAMES: Record<string, string> = {
  all: 'Tất cả',
  warranty: 'Bảo hành',
  trade_in: 'Giá thu cũ',
  dev: 'Lập trình',
  design: 'Thiết kế',
  custom: 'Tùy chỉnh'
};
