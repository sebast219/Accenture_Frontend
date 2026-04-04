import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { TaskRepository } from '../repositories/task.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { Task, TaskPriority, TaskStats } from '../models/task.model';
import { Category } from '../models/category.model';
import { Observable, of, BehaviorSubject } from 'rxjs';

// Mock repositories
class MockTaskRepository extends TaskRepository {
  private tasksSubject = new BehaviorSubject<Task[]>([
    {
      id: '1',
      title: 'Test Task 1',
      completed: false,
      categoryId: 'cat1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority: TaskPriority.MEDIUM
    },
    {
      id: '2',
      title: 'Test Task 2',
      completed: true,
      categoryId: 'cat2',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority: TaskPriority.HIGH
    }
  ]);

  getAll(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  getById(id: string): Observable<Task | undefined> {
    return of(this.tasksSubject.value.find(t => t.id === id));
  }

  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    const newTask: Task = {
      ...task,
      id: '3',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const current = this.tasksSubject.value;
    this.tasksSubject.next([...current, newTask]);
    return of(newTask);
  }

  update(id: string, changes: Partial<Task>): Observable<Task> {
    const task = this.tasksSubject.value.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    const updated = { ...task, ...changes, updatedAt: Date.now() };
    const current = this.tasksSubject.value.map(t => t.id === id ? updated : t);
    this.tasksSubject.next(current);
    return of(updated);
  }

  delete(id: string): Observable<void> {
    const current = this.tasksSubject.value.filter(t => t.id !== id);
    this.tasksSubject.next(current);
    return of(void 0);
  }

  toggleComplete(id: string): Observable<Task> {
    const task = this.tasksSubject.value.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    return this.update(id, { completed: !task.completed });
  }

  getFiltered(): Observable<Task[]> {
    return this.getAll();
  }

  deleteByCategory(): Observable<void> {
    return of(void 0);
  }

  getStats(): Observable<TaskStats> {
    const tasks = this.tasksSubject.value;
    const completed = tasks.filter(t => t.completed).length;
    return of({
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
      completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
    });
  }
}

class MockCategoryRepository extends CategoryRepository {
  private categories: Category[] = [
    { id: 'cat1', name: 'Work', color: '#FF0000', createdAt: Date.now(), updatedAt: Date.now() },
    { id: 'cat2', name: 'Personal', color: '#00FF00', createdAt: Date.now(), updatedAt: Date.now() }
  ];

  getAll(): Observable<Category[]> {
    return of(this.categories);
  }

  getById(id: string): Observable<Category | undefined> {
    return of(this.categories.find(c => c.id === id));
  }

  create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Observable<Category> {
    const newCategory: Category = {
      ...category,
      id: 'cat3',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return of(newCategory);
  }

  update(id: string, changes: Partial<Category>): Observable<Category> {
    const category = this.categories.find(c => c.id === id);
    if (!category) throw new Error('Category not found');
    return of({ ...category, ...changes, updatedAt: Date.now() });
  }

  delete(): Observable<void> {
    return of(void 0);
  }
}

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: TaskRepository, useClass: MockTaskRepository },
        { provide: CategoryRepository, useClass: MockCategoryRepository }
      ]
    });
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all tasks', (done) => {
    service.getAllTasks().subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks[0].title).toBe('Test Task 1');
      done();
    });
  });

  it('should create a new task', (done) => {
    service.createTask('New Task', 'Description', 'cat1', TaskPriority.LOW).subscribe(task => {
      expect(task.title).toBe('New Task');
      expect(task.description).toBe('Description');
      expect(task.categoryId).toBe('cat1');
      expect(task.priority).toBe(TaskPriority.LOW);
      expect(task.completed).toBe(false);
      done();
    });
  });

  it('should update a task', (done) => {
    service.updateTask('1', { title: 'Updated Title' }).subscribe(task => {
      expect(task.title).toBe('Updated Title');
      expect(task.id).toBe('1');
      done();
    });
  });

  it('should delete a task', (done) => {
    service.deleteTask('1').subscribe(() => {
      service.getAllTasks().subscribe(tasks => {
        expect(tasks.length).toBe(1);
        expect(tasks.find(t => t.id === '1')).toBeUndefined();
        done();
      });
    });
  });

  it('should toggle task completion', (done) => {
    service.toggleTaskComplete('1').subscribe(task => {
      expect(task.completed).toBe(true);
      expect(task.id).toBe('1');
      done();
    });
  });

  it('should get task statistics', (done) => {
    service.getStats().subscribe(stats => {
      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.completionRate).toBe(50);
      done();
    });
  });

  it('should return tasks with category information', (done) => {
    service.getTasksWithCategories().subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks[0].categoryName).toBe('Work');
      expect(tasks[1].categoryName).toBe('Personal');
      done();
    });
  });
});
