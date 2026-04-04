import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoryRepository } from '../../core/repositories/category.repository';
import { Category } from '../../core/models/category.model';
import { StorageService } from '../../core/services/storage.service';

const CATEGORIES_STORAGE_KEY = 'todo_categories';

@Injectable({
  providedIn: 'root'
})
export class CategoryLocalRepository extends CategoryRepository {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private loaded = false;

  constructor(private storageService: StorageService) {
    super();
    this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    if (this.loaded) return;
    const categories = await this.storageService.get<Category[]>(CATEGORIES_STORAGE_KEY);
    this.categoriesSubject.next(categories || []);
    this.loaded = true;
  }

  private async saveCategories(categories: Category[]): Promise<void> {
    await this.storageService.set(CATEGORIES_STORAGE_KEY, categories);
    this.categoriesSubject.next(categories);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  getAll(): Observable<Category[]> {
    return this.categoriesSubject.asObservable().pipe(
      map(categories => categories.sort((a, b) => a.name.localeCompare(b.name)))
    );
  }

  getById(id: string): Observable<Category | undefined> {
    return this.categoriesSubject.asObservable().pipe(
      map(categories => categories.find(c => c.id === id))
    );
  }

  create(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Observable<Category> {
    const now = Date.now();
    const newCategory: Category = {
      ...categoryData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return new Observable<Category>(observer => {
      const categories = [...this.categoriesSubject.value, newCategory];
      this.saveCategories(categories).then(() => {
        observer.next(newCategory);
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  update(id: string, changes: Partial<Category>): Observable<Category> {
    return new Observable<Category>(observer => {
      const categories = this.categoriesSubject.value;
      const index = categories.findIndex(c => c.id === id);

      if (index === -1) {
        observer.error(new Error(`Category with id ${id} not found`));
        return;
      }

      const updatedCategory: Category = {
        ...categories[index],
        ...changes,
        id: categories[index].id,
        updatedAt: Date.now(),
      };

      const updatedCategories = [...categories];
      updatedCategories[index] = updatedCategory;

      this.saveCategories(updatedCategories).then(() => {
        observer.next(updatedCategory);
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  delete(id: string): Observable<void> {
    return new Observable<void>(observer => {
      const categories = this.categoriesSubject.value.filter(c => c.id !== id);
      this.saveCategories(categories).then(() => {
        observer.next();
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }
}
