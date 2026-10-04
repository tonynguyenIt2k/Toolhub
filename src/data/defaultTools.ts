import { ToolItem } from '../types';

export const INITIAL_SAMPLE_TOOLS: ToolItem[] = [
  {
    id: 'tool-1',
    name: 'Check bảo hành Xiaomi (DGCare)',
    label: 'Xiaomi VN',
    url: 'https://www.mi.com/vn/support',
    category: 'warranty',
    icon: 'shield',
    isPinned: true,
    clickCount: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tool-2',
    name: 'Samsung Smart Care (6060)',
    label: 'Samsung',
    url: 'https://www.samsung.com/vn/support/your-service/warranty-check/',
    category: 'warranty',
    icon: 'smartphone',
    isPinned: true,
    clickCount: 22,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tool-3',
    name: 'Bảng giá thu cũ CellphoneS',
    label: 'Giá thu cũ',
    url: 'https://cellphones.com.vn/thu-cu-doi-moi',
    category: 'trade_in',
    icon: 'sell',
    isPinned: true,
    clickCount: 31,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tool-4',
    name: 'Apple Check Coverage',
    label: 'AppleCare',
    url: 'https://checkcoverage.apple.com/',
    category: 'warranty',
    icon: 'verified_user',
    isPinned: true,
    clickCount: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tool-5',
    name: 'Bảng giá thu cũ Thế Giới Di Động',
    label: 'TGDĐ Thu Cũ',
    url: 'https://www.thegioididong.com/thu-cu-doi-moi',
    category: 'trade_in',
    icon: 'currency_exchange',
    isPinned: false,
    clickCount: 12,
    createdAt: new Date().toISOString()
  }
];

export const CATEGORY_NAMES: Record<string, string> = {
  all: 'Tất cả',
  warranty: 'Bảo hành',
  trade_in: 'Giá thu cũ',
  dev: 'Lập trình',
  design: 'Thiết kế',
  custom: 'Tùy chỉnh'
};
