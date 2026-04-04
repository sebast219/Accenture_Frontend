import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { Category } from '../models/category.model';
import { CategoryRepository } from '../repositories/category.repository';
import { TaskRepository } from '../repositories/task.repository';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  readonly categories$: Observable<Category[]>;

  constructor(
    private categoryRepository: CategoryRepository,
    private taskRepository: TaskRepository
  ) {
    this.categories$ = this.categoryRepository.getAll().pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getAllCategories(): Observable<Category[]> {
    return this.categories$;
  }

  getCategoryById(id: string): Observable<Category | undefined> {
    return this.categoryRepository.getById(id);
  }

  createCategory(name: string, color: string, icon?: string): Observable<Category> {
    return this.categoryRepository.create({
      name: name.trim(),
      color,
      icon,
    });
  }

  updateCategory(id: string, changes: Partial<Category>): Observable<Category> {
    return this.categoryRepository.update(id, changes);
  }

  deleteCategory(id: string): Observable<void> {
    return this.categoryRepository.delete(id);
  }

  // Categories enriched with task count
  getCategoriesWithTaskCount(): Observable<Category[]> {
    return combineLatest([
      this.categories$,
      this.taskRepository.getAll()
    ]).pipe(
      map(([categories, tasks]) => {
        return categories.map(category => ({
          ...category,
          taskCount: tasks.filter(t => t.categoryId === category.id).length,
        }));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
