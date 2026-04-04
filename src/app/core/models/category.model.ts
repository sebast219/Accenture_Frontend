export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
  taskCount?: number;
}

export const DEFAULT_CATEGORY_COLORS: string[] = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#ef4444', // red
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
  '#a855f7', // purple
];

export const DEFAULT_CATEGORY_ICONS: string[] = [
  'briefcase-outline',
  'home-outline',
  'school-outline',
  'fitness-outline',
  'cart-outline',
  'heart-outline',
  'code-slash-outline',
  'book-outline',
  'musical-notes-outline',
  'airplane-outline',
  'restaurant-outline',
  'people-outline',
];
