import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

export abstract class CategoryRepository {
  abstract getAll(): Observable<Category[]>;
  abstract getById(id: string): Observable<Category | undefined>;
  abstract create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Observable<Category>;
  abstract update(id: string, changes: Partial<Category>): Observable<Category>;
  abstract delete(id: string): Observable<void>;
}
