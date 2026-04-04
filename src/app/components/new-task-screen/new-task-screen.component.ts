import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Task, Priority, Member, Subtask, Category } from '../../models/task.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-new-task-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './new-task-screen.component.html',
  styleUrls: ['./new-task-screen.component.scss']
})
export class NewTaskScreenComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() done = new EventEmitter<void>();
  @Output() taskCreated = new EventEmitter<Task>();

  title = '';
  description = '';
  dueDate = '';
  estimate = '';
  priority: Priority = 'Medium';
  selectedCategoryId: number | null = null;
  categories: Category[] = [];
  isCategoriesExpanded = false;
  members: Member[] = [
    { id: 1, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Bob Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
  ];
  selectedMembers: Member[] = [];
  subtasks: Subtask[] = [];

  // Date picker properties
  isDatePickerVisible = false;
  selectedDate: Date = new Date();
  calendarDays: { day: string; date: number }[] = [];

  // Time picker properties
  isTimePickerVisible = false;
  selectedHours = 0;
  selectedMinutes = 0;
  hoursList: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutesList: number[] = Array.from({ length: 61 }, (_, i) => i);

  constructor(private categoryService: CategoryService) {
    // Initialize with one default subtask
    this.addSubtask();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories = this.categoryService.getCategories();
  }

  setCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
  }

  toggleCategoriesExpand(): void {
    this.isCategoriesExpanded = !this.isCategoriesExpanded;
  }

  getCategoryButtonClass(categoryId: number): string {
    const isSelected = this.selectedCategoryId === categoryId;
    const category = this.categories.find(c => c.id === categoryId);
    const baseClass = 'category-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2';
    
    if (isSelected) {
      return `${baseClass} text-white ring-2 ring-white/50`;
    }
    return `${baseClass} bg-gray-800 text-gray-400 hover:bg-gray-700`;
  }

  getCategoryStyle(categoryId: number): { [key: string]: string } {
    const isSelected = this.selectedCategoryId === categoryId;
    const category = this.categories.find(c => c.id === categoryId);
    
    if (isSelected && category) {
      return { 'background-color': category.color };
    }
    return {};
  }

  onCancelHandler(): void {
    this.cancel.emit();
  }

  onDoneHandler(): void {
    if (this.title.trim()) {
      const newTask: Task = {
        id: 0, // Will be set by parent
        title: this.title,
        date: this.formatDate(new Date()),
        priority: this.priority,
        comments: 0,
        attachments: 0,
        assignee: this.selectedMembers.length > 0 ? this.selectedMembers[0].avatar : 'https://i.pravatar.cc/150?img=11',
        color: this.getPriorityColor(this.priority),
        completed: false,
        description: this.description,
        dueDate: this.dueDate,
        estimate: this.estimate,
        categoryId: this.selectedCategoryId ?? undefined,
        subtasks: this.subtasks,
      };

      this.taskCreated.emit(newTask);
      this.resetForm();
    }
  }

  setPriority(priority: Priority): void {
    this.priority = priority;
  }

  toggleMember(member: Member): void {
    const index = this.selectedMembers.findIndex(m => m.id === member.id);
    if (index > -1) {
      this.selectedMembers.splice(index, 1);
    } else {
      this.selectedMembers.push(member);
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

  private resetForm(): void {
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.estimate = '';
    this.priority = 'Medium';
    this.selectedMembers = [];
  }

  // Helper methods for template
  get priorities(): Priority[] {
    return ['Low', 'Medium', 'High'];
  }

  getPriorityButtonClass(priority: Priority): string {
    return this.priority === priority ? 'priority-btn active' : 'priority-btn';
  }

  removeMember(memberId: number): void {
    this.selectedMembers = this.selectedMembers.filter(m => m.id !== memberId);
  }

  addSubtask(): void {
    const newSubtask: Subtask = {
      id: Date.now(),
      title: 'New subtask',
      completed: false
    };
    this.subtasks.push(newSubtask);
  }

  toggleSubtask(id: number): void {
    const subtask = this.subtasks.find(st => st.id === id);
    if (subtask) {
      subtask.completed = !subtask.completed;
    }
  }

  removeSubtask(id: number): void {
    this.subtasks = this.subtasks.filter(st => st.id !== id);
  }

  // Date picker methods
  showDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
    this.selectedDate = new Date();
    this.generateCalendarDays();
  }

  hideDatePicker(): void {
    this.isDatePickerVisible = false;
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.dueDate = this.formatDate(date);
    this.hideDatePicker();
  }

  // Time picker methods
  showTimePicker(): void {
    this.isTimePickerVisible = true;
    this.selectedHours = 0;
    this.selectedMinutes = 0;
    // Parse existing estimate if any
    if (this.estimate) {
      const parts = this.estimate.split(':');
      if (parts.length === 2) {
        this.selectedHours = parseInt(parts[0], 10) || 0;
        this.selectedMinutes = parseInt(parts[1], 10) || 0;
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
    this.estimate = `${hours}:${minutes}`;
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
}
