import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Task, CalendarDay, Category } from '../../models/task.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-home-screen',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements OnInit {
  @Output() taskClick = new EventEmitter<number>();
  @Output() newTask = new EventEmitter<void>();
  @Output() categoriesClick = new EventEmitter<void>();

  activeDay = 0;
  days: CalendarDay[] = [];
  tasks: Task[] = [];
  allTasks: Task[] = []; // Store all tasks for filtering
  isDatePickerVisible = false;
  selectedDate: Date = new Date();
  calendarDays: { day: string; date: number }[] = [];
  
  // Category filter
  categories: Category[] = [];
  selectedCategoryId: number | null = null;

  // Delete confirmation modal
  isDeleteModalVisible = false;
  taskToDelete: Task | null = null;

  constructor(private categoryService: CategoryService) {
    this.generateCurrentWeek();
    this.generateCalendarDays();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTasks();
  }

  loadCategories(): void {
    this.categories = this.categoryService.getCategories();
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    if (categoryId === null) {
      this.tasks = [...this.allTasks];
    } else {
      this.tasks = this.allTasks.filter(task => task.categoryId === categoryId);
    }
  }

  getCategoryById(categoryId?: number): Category | undefined {
    if (!categoryId) return undefined;
    return this.categories.find(c => c.id === categoryId);
  }

  generateCurrentWeek() {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    const currentDate = today.getDate();
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    this.days = dayNames.map((dayName, index) => {
      // Calculate the date for each day of the week
      const diff = index - currentDay;
      const date = currentDate + diff;
      
      return {
        day: dayName,
        date: date,
        active: index === currentDay // Mark today as active
      };
    });
    
    // Set activeDay to today's index
    this.activeDay = currentDay;
  }

  formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  }

  // Storage methods
  loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.allTasks = JSON.parse(storedTasks);
    } else {
      this.allTasks = [];
      this.saveTasks();
    }
    // Apply category filter if active
    if (this.selectedCategoryId !== null) {
      this.tasks = this.allTasks.filter(task => task.categoryId === this.selectedCategoryId);
    } else {
      this.tasks = [...this.allTasks];
    }
  }

  refreshTasks() {
    this.loadTasks();
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.allTasks));
  }

  addTask(task: Task) {
    task.id = Date.now(); // Simple ID generation
    task.completed = false;
    this.allTasks.unshift(task); // Add to beginning
    this.saveTasks();
    // Refresh filtered view
    this.loadTasks();
  }

  toggleTaskComplete(taskId: number) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      // If task has subtasks, toggle based on subtask completion
      if (task.subtasks && task.subtasks.length > 0) {
        // If all subtasks are completed, mark task as incomplete
        // If not all subtasks are completed, mark all as completed
        const allCompleted = task.subtasks.every(subtask => subtask.completed);
        task.subtasks.forEach(subtask => {
          subtask.completed = !allCompleted;
        });
        // Update task completion based on subtasks
        task.completed = task.subtasks.every(subtask => subtask.completed);
      } else {
        // Normal toggle for tasks without subtasks
        task.completed = !task.completed;
      }
      this.saveTasks();
    }
  }

  // Helper method to check if task should be marked as completed based on subtasks
  isTaskCompleted(task: Task): boolean {
    if (task.subtasks && task.subtasks.length > 0) {
      return task.subtasks.every(subtask => subtask.completed);
    }
    return task.completed;
  }

  showDeleteConfirmation(task: Task, event: Event): void {
    event.stopPropagation();
    this.taskToDelete = task;
    this.isDeleteModalVisible = true;
  }

  confirmDelete(): void {
    if (this.taskToDelete) {
      this.allTasks = this.allTasks.filter(t => t.id !== this.taskToDelete!.id);
      this.saveTasks();
      this.loadTasks();
    }
    this.closeDeleteModal();
  }

  cancelDelete(): void {
    this.closeDeleteModal();
  }

  private closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.taskToDelete = null;
  }

  deleteTask(taskId: number) {
    this.allTasks = this.allTasks.filter(t => t.id !== taskId);
    this.saveTasks();
    this.loadTasks(); // Refresh filtered view
  }

  getTaskById(taskId: number): Task | undefined {
    return this.tasks.find(task => task.id === taskId);
  }

  updateTask(updatedTask: Task): void {
    const index = this.allTasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      this.allTasks[index] = updatedTask;
      this.saveTasks();
      this.loadTasks(); // Refresh filtered view
    }
  }

  onTaskClickHandler(taskId: number): void {
    this.taskClick.emit(taskId);
  }

  onNewTaskHandler(): void {
    this.newTask.emit();
  }

  onCategoriesClickHandler(): void {
    this.categoriesClick.emit();
  }

  showDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
    this.selectedDate = new Date();
  }

  hideDatePicker(): void {
    this.isDatePickerVisible = false;
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.hideDatePicker();
    // Optionally: Update the calendar to reflect the selected date
    this.updateCalendarForDate(date);
  }

  private updateCalendarForDate(date: Date): void {
    // Update the calendar to show the selected date
    this.generateCurrentWeek();
    // Find the day that matches the selected date
    const selectedDayOfMonth = date.getDate();
    const matchingDay = this.days.findIndex(day => day.date === selectedDayOfMonth);
    if (matchingDay !== -1) {
      this.activeDay = matchingDay;
    }
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

  setActiveDay(index: number): void {
    this.activeDay = index;
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High':
        return 'bg-white/80 text-[#1a1a1a]';
      default:
        return 'bg-white/20 text-white';
    }
  }

  getTaskProgress(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  }

  getTextColorClass(priority: string): string {
    return priority === 'High' ? 'text-[#1a1a1a]' : 'text-white';
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }
}
