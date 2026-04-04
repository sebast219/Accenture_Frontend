import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from '../repositories/category.repository';
import { TaskRepository } from '../repositories/task.repository';
import { Category } from '../models/category.model';
import { Task, TaskPriority } from '../models/task.model';
import { Observable, of, BehaviorSubject } from 'rxjs';

// Mock repositories
class MockCategoryRepository extends CategoryRepository {
  private categoriesSubject = new BehaviorSubject<Category[]>([
    { id: 'cat1', name: 'Work', color: '#FF0000', icon: 'briefcase', createdAt: Date.now(), updatedAt: Date.now() },
    { id: 'cat2', name: 'Personal', color: '#00FF00', icon: 'home', createdAt: Date.now(), updatedAt: Date.now() }
  ]);

  getAll(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  getById(id: string): Observable<Category | undefined> {
    return of(this.categoriesSubject.value.find(c => c.id === id));
  }

  create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Observable<Category> {
    const newCategory: Category = {
      ...category,
      id: 'cat3',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const current = this.categoriesSubject.value;
    this.categoriesSubject.next([...current, newCategory]);
    return of(newCategory);
  }

  update(id: string, changes: Partial<Category>): Observable<Category> {
    const category = this.categoriesSubject.value.find(c => c.id === id);
    if (!category) throw new Error('Category not found');
    const updated = { ...category, ...changes, updatedAt: Date.now() };
    const current = this.categoriesSubject.value.map(c => c.id === id ? updated : c);
    this.categoriesSubject.next(current);
    return of(updated);
  }

  delete(id: string): Observable<void> {
    const current = this.categoriesSubject.value.filter(c => c.id !== id);
    this.categoriesSubject.next(current);
    return of(void 0);
  }
}

class MockTaskRepository extends TaskRepository {
  private tasksSubject = new BehaviorSubject<Task[]>([
    { id: '1', title: 'Task 1', completed: false, categoryId: 'cat1', createdAt: Date.now(), updatedAt: Date.now(), priority: TaskPriority.MEDIUM },
    { id: '2', title: 'Task 2', completed: true, categoryId: 'cat1', createdAt: Date.now(), updatedAt: Date.now(), priority: TaskPriority.HIGH },
    { id: '3', title: 'Task 3', completed: false, categoryId: 'cat2', createdAt: Date.now(), updatedAt: Date.now(), priority: TaskPriority.LOW }
  ]);

  getAll(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  getById(): Observable<Task | undefined> { return of(undefined); }
  create(): Observable<Task> { return of({} as Task); }
  update(): Observable<Task> { return of({} as Task); }
  delete(): Observable<void> { return of(void 0); }
  toggleComplete(): Observable<Task> { return of({} as Task); }
  getFiltered(): Observable<Task[]> { return this.getAll(); }
  deleteByCategory(): Observable<void> { return of(void 0); }
  getStats() { return of({ total: 0, completed: 0, pending: 0, completionRate: 0 }); }
}

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryRepository, useClass: MockCategoryRepository },
        { provide: TaskRepository, useClass: MockTaskRepository }
      ]
    });
    service = TestBed.inject(CategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all categories', (done) => {
    service.getAllCategories().subscribe(categories => {
      expect(categories.length).toBe(2);
      expect(categories[0].name).toBe('Work');
      expect(categories[1].name).toBe('Personal');
      done();
    });
  });

  it('should create a new category', (done) => {
    service.createCategory('Shopping', '#0000FF', 'cart').subscribe(category => {
      expect(category.name).toBe('Shopping');
      expect(category.color).toBe('#0000FF');
      expect(category.icon).toBe('cart');
      done();
    });
  });

  it('should update a category', (done) => {
    service.updateCategory('cat1', { name: 'Updated Work' }).subscribe(category => {
      expect(category.name).toBe('Updated Work');
      expect(category.id).toBe('cat1');
      done();
    });
  });

  it('should delete a category', (done) => {
    service.deleteCategory('cat1').subscribe(() => {
      service.getAllCategories().subscribe(categories => {
        expect(categories.length).toBe(1);
        expect(categories.find(c => c.id === 'cat1')).toBeUndefined();
        done();
      });
    });
  });

  it('should get category by id', (done) => {
    service.getCategoryById('cat1').subscribe(category => {
      expect(category).toBeTruthy();
      expect(category?.name).toBe('Work');
      done();
    });
  });

  it('should return categories with task count', (done) => {
    service.getCategoriesWithTaskCount().subscribe(categories => {
      expect(categories.length).toBe(2);
      
      const workCategory = categories.find(c => c.id === 'cat1');
      const personalCategory = categories.find(c => c.id === 'cat2');
      
      expect(workCategory?.taskCount).toBe(2); // cat1 has 2 tasks
      expect(personalCategory?.taskCount).toBe(1); // cat2 has 1 task
      done();
    });
  });
});
