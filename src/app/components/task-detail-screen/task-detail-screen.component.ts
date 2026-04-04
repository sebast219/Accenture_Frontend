import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subtask, Task, Member, Priority, Category } from '../../models/task.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-task-detail-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './task-detail-screen.component.html',
  styleUrls: ['./task-detail-screen.component.scss']
})
export class TaskDetailScreenComponent implements OnInit {
  private _task: Task | null = null;
  
  @Input() set task(value: Task | null) {
    this._task = value;
    this.loadTaskSubtasks();
  }
  
  get task(): Task | null {
    return this._task;
  }
  
  @Output() back = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();

  activeTab: 'overview' | 'activity' = 'overview';
  showAllDescription = false;
  isEditing = false;
  editedTask: Task | null = null;
  isDatePickerVisible = false;
  selectedDate: Date = new Date();
  calendarDays: { day: string; date: number }[] = [];

  // Properties for editing (same as NewTaskScreen)
  selectedMembers: Member[] = [];
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  isCategoriesExpanded = false;

  // Time picker properties
  isTimePickerVisible = false;
  selectedHours = 0;
  selectedMinutes = 0;
  hoursList: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutesList: number[] = Array.from({ length: 61 }, (_, i) => i);
  
  get priorities(): Priority[] {
    return ['Low', 'Medium', 'High'];
  }

  getPriorityButtonClass(priority: Priority): string {
    return this.editedTask?.priority === priority ? 'priority-btn active' : 'priority-btn';
  }

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories = this.categoryService.getCategories();
  }

  loadTaskSubtasks(): void {
    // Load subtasks from the task, or empty array if no subtasks
    if (this._task?.subtasks) {
      this.subtasks = [...this._task.subtasks];
    } else {
      this.subtasks = [];
    }
  }

  setCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    if (this.editedTask) {
      this.editedTask.categoryId = categoryId;
    }
  }

  toggleCategoriesExpand(): void {
    this.isCategoriesExpanded = !this.isCategoriesExpanded;
  }

  getCategoryButtonClass(categoryId: number): string {
    const isSelected = this.selectedCategoryId === categoryId || this.editedTask?.categoryId === categoryId;
    const baseClass = 'category-btn px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex flex-col items-center gap-2';
    
    if (isSelected) {
      return `${baseClass} text-white ring-2 ring-white/50`;
    }
    return `${baseClass} bg-gray-800 text-gray-400 hover:bg-gray-700`;
  }

  getCategoryStyle(categoryId: number): { [key: string]: string } {
    const isSelected = this.selectedCategoryId === categoryId || this.editedTask?.categoryId === categoryId;
    const category = this.categories.find(c => c.id === categoryId);
    
    if (isSelected && category) {
      return { 'background-color': category.color };
    }
    return {};
  }

  setPriority(priority: Priority): void {
    if (this.editedTask) {
      this.editedTask.priority = priority;
      this.editedTask.color = this.getPriorityColor(priority);
    }
  }

  private getPriorityColor(priority: Priority): string {
    switch (priority) {
      case 'High':
        return '#a8d5ff';
      case 'Medium':
        return '#3a3a3a';
      case 'Low':
        return '#ffeb3b';
      default:
        return '#3a3a3a';
    }
  }

  removeMember(memberId: number): void {
    this.selectedMembers = this.selectedMembers.filter(m => m.id !== memberId);
  }

  getCategoryById(categoryId?: number): Category | undefined {
    if (!categoryId) return undefined;
    return this.categories.find(c => c.id === categoryId);
  }

  // Date picker methods
  showDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
    this.selectedDate = new Date();
    this.generateCalendarDays();
  }

  previousMonth(): void {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() - 1, 1);
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 1);
    this.generateCalendarDays();
  }

  hideDatePicker(): void {
    this.isDatePickerVisible = false;
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    if (this.isEditing && this.editedTask) {
      this.editedTask.dueDate = this.formatDate(date);
    }
    this.hideDatePicker();
  }

  // Time picker methods
  showTimePicker(): void {
    this.isTimePickerVisible = true;
    this.selectedHours = 0;
    this.selectedMinutes = 0;
    // Parse existing estimate if any (format: "MM" or "MM min")
    const estimate = this.editedTask?.estimate;
    if (estimate) {
      const numericValue = parseInt(estimate.replace(/\D/g, ''), 10);
      if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 60) {
        this.selectedMinutes = numericValue;
      }
    }
  }

  hideTimePicker(): void {
    this.isTimePickerVisible = false;
  }

  selectHour(hour: number): void {
    this.selectedHours = hour;
  }

  selectMinute(minute: number): void {
    this.selectedMinutes = minute;
  }

  onTimeSelected(): void {
    const hours = this.selectedHours.toString().padStart(2, '0');
    const minutes = this.selectedMinutes.toString().padStart(2, '0');
    if (this.editedTask) {
      this.editedTask.estimate = `${hours}:${minutes}`;
    }
    this.hideTimePicker();
  }

  formatTime(hour: number, minute: number): string {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  generateCalendarDays(): void {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    this.calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push({ day: '', date: 0 });
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push({ day: i.toString(), date: i });
    }
  }

  selectCalendarDate(date: { day: string; date: number }): void {
    if (date.date > 0) {
      this.selectedDate = new Date(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth(),
        date.date
      );
    }
  }

  isDateSelected(date: { day: string; date: number }): boolean {
    return date.date === this.selectedDate.getDate() && date.date > 0;
  }

  formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  }

  get description(): string {
    return this.task?.description || 'No description available';
  }

  get shouldShowReadMore(): boolean {
    return !this.showAllDescription && !!this.task?.description && this.task.description.length > 150;
  }

  get shouldShowShowLess(): boolean {
    return this.showAllDescription && !!this.task?.description && this.task.description.length > 150;
  }

  // Default subtasks for demonstration
  subtasks: Subtask[] = [
    { id: 1, title: 'Research design trends', completed: true },
    { id: 2, title: 'Create initial sketches', completed: true },
    { id: 3, title: 'Develop color palette', completed: false },
    { id: 4, title: 'Finalize typography', completed: false },
  ];

  // Default attachments for demonstration
  attachments: string[] = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&h=150&fit=crop',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=150&h=150&fit=crop'
  ];

  onBack(): void {
    this.back.emit();
  }

  onEdit(): void {
    if (this.task) {
      this.isEditing = true;
      this.editedTask = { ...this.task };
      // Initialize selectedCategoryId from task's categoryId
      this.selectedCategoryId = this.task.categoryId || null;
      // Subtasks are already loaded via loadTaskSubtasks when task was set
    }
  }

  onCancelEdit(): void {
    this.isEditing = false;
    this.editedTask = null;
    // Reset subtasks to task's original subtasks using the setter
    this.loadTaskSubtasks();
  }

  onSaveEdit(): void {
    if (this.editedTask) {
      // Include subtasks and category in the updated task
      this.editedTask.subtasks = this.subtasks;
      this.editedTask.categoryId = this.selectedCategoryId ?? undefined;
      this.taskUpdated.emit(this.editedTask);
      this.isEditing = false;
      this.editedTask = null;
    }
  }

  updateEditedTask(field: keyof Task, value: string | number | boolean | undefined | Subtask[]): void {
    if (this.editedTask) {
      (this.editedTask as any)[field] = value;
    }
  }

  toggleSubtask(id: number): void {
    const subtask = this.subtasks.find(st => st.id === id);
    if (subtask) {
      subtask.completed = !subtask.completed;
    }
  }

  toggleTaskComplete(): void {
    if (this.task) {
      this.task.completed = !this.task.completed;
      this.taskUpdated.emit(this.task);
    }
  }

  addSubtask(): void {
    const newSubtask: Subtask = {
      id: Date.now(),
      title: 'New subtask',
      completed: false
    };
    this.subtasks.push(newSubtask);
  }

  removeSubtask(id: number): void {
    this.subtasks = this.subtasks.filter(st => st.id !== id);
  }

  toggleDescription(): void {
    this.showAllDescription = !this.showAllDescription;
  }

  setActiveTab(tab: 'overview' | 'activity'): void {
    this.activeTab = tab;
  }

  get completedSubtasks(): number {
    return this.subtasks.filter(st => st.completed).length;
  }

  get progress(): number {
    return (this.completedSubtasks / this.subtasks.length) * 100;
  }

  getTaskProgress(): number {
    // If there are subtasks, calculate based on completed subtasks
    if (this.subtasks && this.subtasks.length > 0) {
      const completed = this.subtasks.filter(st => st.completed).length;
      return Math.round((completed / this.subtasks.length) * 100);
    }
    // If no subtasks, check if task itself is completed
    if (this.task?.completed) {
      return 100;
    }
    return 0;
  }
}
