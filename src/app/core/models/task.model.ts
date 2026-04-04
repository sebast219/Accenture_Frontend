export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId?: string;
  createdAt: number;
  updatedAt: number;
  priority?: TaskPriority;
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface TaskFilter {
  categoryId?: string | null;
  completed?: boolean | null;
  searchTerm?: string;
  priority?: TaskPriority | null;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}
