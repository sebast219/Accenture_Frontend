import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap, tap, take } from 'rxjs/operators';
import { TaskRepository } from '../../core/repositories/task.repository';
import { Task, TaskFilter, TaskStats } from '../../core/models/task.model';
import { StorageService } from '../../core/services/storage.service';
import { v4 as uuidv4 } from 'uuid';

const TASKS_STORAGE_KEY = 'todo_tasks';

@Injectable({
  providedIn: 'root'
})
export class TaskLocalRepository extends TaskRepository {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loaded = false;

  constructor(private storageService: StorageService) {
    super();
    this.loadTasks();
  }

  private async loadTasks(): Promise<void> {
    if (this.loaded) return;
    const tasks = await this.storageService.get<Task[]>(TASKS_STORAGE_KEY);
    this.tasksSubject.next(tasks || []);
    this.loaded = true;
  }

  private async saveTasks(tasks: Task[]): Promise<void> {
    await this.storageService.set(TASKS_STORAGE_KEY, tasks);
    this.tasksSubject.next(tasks);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  getAll(): Observable<Task[]> {
    return this.tasksSubject.asObservable().pipe(
      map(tasks => tasks.sort((a, b) => b.createdAt - a.createdAt))
    );
  }

  getById(id: string): Observable<Task | undefined> {
    return this.tasksSubject.asObservable().pipe(
      map(tasks => tasks.find(t => t.id === id))
    );
  }

  create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    const now = Date.now();
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return new Observable<Task>(observer => {
      const tasks = [...this.tasksSubject.value, newTask];
      this.saveTasks(tasks).then(() => {
        observer.next(newTask);
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  update(id: string, changes: Partial<Task>): Observable<Task> {
    return new Observable<Task>(observer => {
      const tasks = this.tasksSubject.value;
      const index = tasks.findIndex(t => t.id === id);

      if (index === -1) {
        observer.error(new Error(`Task with id ${id} not found`));
        return;
      }

      const updatedTask: Task = {
        ...tasks[index],
        ...changes,
        id: tasks[index].id,
        updatedAt: Date.now(),
      };

      const updatedTasks = [...tasks];
      updatedTasks[index] = updatedTask;

      this.saveTasks(updatedTasks).then(() => {
        observer.next(updatedTask);
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  delete(id: string): Observable<void> {
    return new Observable<void>(observer => {
      const tasks = this.tasksSubject.value.filter(t => t.id !== id);
      this.saveTasks(tasks).then(() => {
        observer.next();
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  toggleComplete(id: string): Observable<Task> {
    return new Observable<Task>(observer => {
      const tasks = this.tasksSubject.value;
      const index = tasks.findIndex(t => t.id === id);

      if (index === -1) {
        observer.error(new Error(`Task with id ${id} not found`));
        return;
      }

      const updatedTask: Task = {
        ...tasks[index],
        completed: !tasks[index].completed,
        updatedAt: Date.now(),
      };

      const updatedTasks = [...tasks];
      updatedTasks[index] = updatedTask;

      this.saveTasks(updatedTasks).then(() => {
        observer.next(updatedTask);
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  getFiltered(filter: TaskFilter): Observable<Task[]> {
    return this.tasksSubject.asObservable().pipe(
      map(tasks => {
        let filtered = [...tasks];

        if (filter.categoryId) {
          filtered = filtered.filter(t => t.categoryId === filter.categoryId);
        }

        if (filter.completed !== null && filter.completed !== undefined) {
          filtered = filtered.filter(t => t.completed === filter.completed);
        }

        if (filter.searchTerm && filter.searchTerm.trim()) {
          const term = filter.searchTerm.toLowerCase().trim();
          filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(term) ||
            (t.description && t.description.toLowerCase().includes(term))
          );
        }

        if (filter.priority) {
          filtered = filtered.filter(t => t.priority === filter.priority);
        }

        return filtered.sort((a, b) => b.createdAt - a.createdAt);
      })
    );
  }

  deleteByCategory(categoryId: string): Observable<void> {
    return new Observable<void>(observer => {
      const tasks = this.tasksSubject.value.map(t => {
        if (t.categoryId === categoryId) {
          return { ...t, categoryId: undefined, updatedAt: Date.now() };
        }
        return t;
      });
      this.saveTasks(tasks).then(() => {
        observer.next();
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  getStats(): Observable<TaskStats> {
    return this.tasksSubject.asObservable().pipe(
      map(tasks => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, pending, completionRate };
      })
    );
  }
}
