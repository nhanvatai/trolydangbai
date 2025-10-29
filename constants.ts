import type { ColorPalette, TemplateId } from './types';

export const TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: 'classic', name: 'Cổ điển' },
  { id: 'modern', name: 'Hiện đại' },
  { id: 'bold', name: 'Nổi bật' },
  { id: 'minimalist', name: 'Tối giản' },
];

export const COLOR_PALETTES: ColorPalette[] = [
  { name: 'Xanh Chuyên nghiệp', bg: 'bg-white', primary: 'text-blue-600', secondary: 'text-slate-500', text: 'text-slate-800' },
  { name: 'Vàng Cổ điển', bg: 'bg-amber-50', primary: 'text-amber-700', secondary: 'text-gray-600', text: 'text-gray-900' },
  { name: 'Xanh Than chì', bg: 'bg-gray-800', primary: 'text-teal-300', secondary: 'text-gray-300', text: 'text-white' },
  { name: 'Hồng Tinh tế', bg: 'bg-rose-50', primary: 'text-rose-600', secondary: 'text-slate-500', text: 'text-slate-800' },
];

export const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,application/pdf';