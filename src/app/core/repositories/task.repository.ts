import { Observable } from 'rxjs';
import { Task, TaskFilter } from '../models/task.model';

export abstract class TaskRepository {
  abstract getAll(): Observable<Task[]>;
  abstract getById(id: string): Observable<Task | undefined>;
  abstract create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task>;
  abstract update(id: string, changes: Partial<Task>): Observable<Task>;
  abstract delete(id: string): Observable<void>;
  abstract toggleComplete(id: string): Observable<Task>;
  abstract getFiltered(filter: TaskFilter): Observable<Task[]>;
  abstract deleteByCategory(categoryId: string): Observable<void>;
  abstract getStats(): Observable<{ total: number; completed: number; pending: number; completionRate: number }>;
}
