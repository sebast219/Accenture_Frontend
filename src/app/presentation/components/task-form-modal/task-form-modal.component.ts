import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Task, TaskPriority } from '../../../core/models/task.model';
import { Category } from '../../../core/models/category.model';

export interface TaskFormData {
  title: string;
  description?: string;
  categoryId?: string;
  priority: TaskPriority;
}

@Component({
  selector: 'app-task-form-modal',
  templateUrl: './task-form-modal.component.html',
  styleUrls: ['./task-form-modal.component.scss'],
  standalone: false
})
export class TaskFormModalComponent {
  @Input() task?: Task;
  @Input() categories: Category[] = [];
  @Output() taskSaved = new EventEmitter<TaskFormData>();
  @Output() taskCancelled = new EventEmitter<void>();

  formData: TaskFormData = {
    title: '',
    description: '',
    categoryId: undefined,
    priority: TaskPriority.MEDIUM
  };

  isEditMode = false;

  constructor(private modalController: ModalController) {}

  ngOnInit(): void {
    if (this.task) {
      this.isEditMode = true;
      this.formData = {
        title: this.task.title,
        description: this.task.description,
        categoryId: this.task.categoryId,
        priority: this.task.priority || TaskPriority.MEDIUM
      };
    }
  }

  onSave(): void {
    if (!this.formData.title.trim()) return;
    
    this.taskSaved.emit(this.formData);
    this.dismiss();
  }

  onCancel(): void {
    this.taskCancelled.emit();
    this.dismiss();
  }

  dismiss(): void {
    this.modalController.dismiss();
  }

  getPriorityLabel(priority: TaskPriority): string {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
  }

  getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  }
}
