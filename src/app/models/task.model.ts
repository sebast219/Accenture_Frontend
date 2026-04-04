export interface Task {
  id: number;
  title: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  comments: number;
  attachments: number;
  assignee: string;
  color: string;
  completed: boolean;
  categoryId?: number; // Reference to category
  description?: string;
  dueDate?: string;
  estimate?: string;
  subtasks?: Subtask[];
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Member {
  id: number;
  name: string;
  avatar: string;
}

export interface CalendarDay {
  day: string;
  date: number;
  active?: boolean;
}

export type Priority = 'Low' | 'Medium' | 'High';
export type ScreenType = 'home' | 'task-detail' | 'new-task' | 'categories';
