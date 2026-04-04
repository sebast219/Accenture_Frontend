import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Task, TaskFilter, TaskPriority, TaskStats } from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Cache observables using shareReplay for performance optimization
  readonly tasks$: Observable<Task[]>;
  readonly stats$: Observable<TaskStats>;

  constructor(
    private taskRepository: TaskRepository,
    private categoryRepository: CategoryRepository
  ) {
    this.tasks$ = this.taskRepository.getAll().pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.stats$ = this.taskRepository.getStats().pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getAllTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  getTaskById(id: string): Observable<Task | undefined> {
    return this.taskRepository.getById(id);
  }

  createTask(title: string, description?: string, categoryId?: string, priority?: TaskPriority): Observable<Task> {
    return this.taskRepository.create({
      title: title.trim(),
      description: description?.trim(),
      completed: false,
      categoryId,
      priority: priority || TaskPriority.MEDIUM,
    });
  }

  updateTask(id: string, changes: Partial<Task>): Observable<Task> {
    return this.taskRepository.update(id, changes);
  }

  deleteTask(id: string): Observable<void> {
    return this.taskRepository.delete(id);
  }

  toggleTaskComplete(id: string): Observable<Task> {
    return this.taskRepository.toggleComplete(id);
  }

  getFilteredTasks(filter: TaskFilter): Observable<Task[]> {
    return this.taskRepository.getFiltered(filter);
  }

  removeCategoryFromTasks(categoryId: string): Observable<void> {
    return this.taskRepository.deleteByCategory(categoryId);
  }

  getStats(): Observable<TaskStats> {
    return this.stats$;
  }

  // Enriched tasks with category information
  getTasksWithCategories(): Observable<(Task & { categoryName?: string; categoryColor?: string })[]> {
    return combineLatest([
      this.tasks$,
      this.categoryRepository.getAll()
    ]).pipe(
      map(([tasks, categories]) => {
        return tasks.map(task => {
          const category = categories.find(c => c.id === task.categoryId);
          return {
            ...task,
            categoryName: category?.name,
            categoryColor: category?.color,
          };
        });
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
