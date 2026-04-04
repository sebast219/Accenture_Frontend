import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, filter, debounceTime } from 'rxjs/operators';
import { Task, TaskFilter, TaskPriority } from '../../../core/models/task.model';
import { Category } from '../../../core/models/category.model';
import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { FirebaseService } from '../../../core/services/firebase.service';
import { TaskFormModalComponent, TaskFormData } from '../../components/task-form-modal/task-form-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit, OnDestroy {
  tasks$!: Observable<(Task & { categoryName?: string; categoryColor?: string })[]>;
  categories$!: Observable<Category[]>;
  filteredTasks$!: Observable<(Task & { categoryName?: string; categoryColor?: string })[]>;
  
  selectedCategoryId: string | null = null;
  searchTerm = '';
  showCompleted = true;
  
  featureFlags$ = this.firebaseService.featureFlags$;
  
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private firebaseService: FirebaseService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.tasks$ = this.taskService.getTasksWithCategories();
    this.categories$ = this.categoryService.getAllCategories();
    
    // Setup debounced search
    this.searchSubject$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
    });
    
    this.filteredTasks$ = combineLatest([
      this.tasks$,
      this.categoryService.getCategoriesWithTaskCount(),
      this.searchSubject$.pipe(debounceTime(300))
    ]).pipe(
      map(([tasks, categories, search]) => {
        let filtered = [...tasks];

        // Filter by category
        if (this.selectedCategoryId) {
          filtered = filtered.filter(t => t.categoryId === this.selectedCategoryId);
        }

        // Filter by completion status
        if (!this.showCompleted) {
          filtered = filtered.filter(t => !t.completed);
        }

        // Filter by search term
        if (search && search.trim()) {
          const term = search.toLowerCase().trim();
          filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(term) ||
            (t.description && t.description.toLowerCase().includes(term)) ||
            (t.categoryName && t.categoryName.toLowerCase().includes(term))
          );
        }

        return filtered;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async openTaskModal(task?: Task): Promise<void> {
    const categories = await this.categoryService.getAllCategories().toPromise();
    
    const modal = await this.modalController.create({
      component: TaskFormModalComponent,
      componentProps: {
        task,
        categories: categories || []
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      if (task) {
        // Update existing task
        this.taskService.updateTask(task.id, data).subscribe();
      } else {
        // Create new task
        this.taskService.createTask(
          data.title,
          data.description,
          data.categoryId,
          data.priority
        ).subscribe();
      }
    }
  }

  onToggleComplete(taskId: string): void {
    this.taskService.toggleTaskComplete(taskId).subscribe();
  }

  onDeleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId).subscribe();
  }

  onEditTask(task: Task): void {
    this.openTaskModal(task);
  }

  onCategorySelected(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
  }

  onSearchChange(event: any): void {
    const value = event.target?.value || '';
    this.searchSubject$.next(value);
  }

  toggleShowCompleted(): void {
    this.showCompleted = !this.showCompleted;
  }

  isFeatureEnabled(feature: string): boolean {
    return this.firebaseService.isFeatureEnabled(feature as any);
  }

  trackByTaskId(index: number, task: any): string {
    return task.id;
  }
}
