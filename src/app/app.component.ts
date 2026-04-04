import { Component, ViewChild } from '@angular/core';
import { ScreenType, Task } from './models/task.model';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HomeScreenComponent } from './components/home-screen/home-screen.component';
import { NewTaskScreenComponent } from './components/new-task-screen/new-task-screen.component';
import { TaskDetailScreenComponent } from './components/task-detail-screen/task-detail-screen.component';
import { CategoriesScreenComponent } from './components/categories-screen/categories-screen.component';
import { FirebaseService } from './core/services/firebase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonicModule, HomeScreenComponent, NewTaskScreenComponent, TaskDetailScreenComponent, CategoriesScreenComponent],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  currentScreen: ScreenType = 'home';
  @ViewChild('homeScreen') homeScreenRef: HomeScreenComponent | null = null;
  selectedTask: Task | null = null;

  constructor(private firebaseService: FirebaseService) {
    // FirebaseService se inicializa automáticamente al inyectarse
    console.log('AppComponent initialized, FirebaseService injected');
  }

  onTaskClick(taskId: number): void {
    if (this.homeScreenRef) {
      this.selectedTask = this.homeScreenRef.getTaskById(taskId) || null;
    }
    this.currentScreen = 'task-detail';
  }

  onNewTask(): void {
    this.currentScreen = 'new-task';
  }

  onCategories(): void {
    this.currentScreen = 'categories';
  }

  onHome(): void {
    this.currentScreen = 'home';
    // Refresh tasks when returning to home screen
    if (this.homeScreenRef) {
      this.homeScreenRef.refreshTasks();
    }
  }

  onBack(): void {
    this.selectedTask = null;
    this.currentScreen = 'home';
    // Refresh tasks when returning to home screen
    if (this.homeScreenRef) {
      this.homeScreenRef.refreshTasks();
    }
  }

  onCancel(): void {
    this.currentScreen = 'home';
    // Refresh tasks when returning to home screen
    if (this.homeScreenRef) {
      this.homeScreenRef.refreshTasks();
    }
  }

  onDone(): void {
    this.currentScreen = 'home';
    // Refresh tasks when returning to home screen
    if (this.homeScreenRef) {
      this.homeScreenRef.refreshTasks();
    }
  }

  onTaskCreated(task: Task): void {
    console.log('Task created:', task);
    console.log('HomeScreen ref:', this.homeScreenRef);
    
    if (this.homeScreenRef) {
      this.homeScreenRef.addTask(task);
    } else {
      // Fallback: directly add to localStorage if ref is not available
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      task.id = Date.now();
      task.completed = false;
      existingTasks.unshift(task);
      localStorage.setItem('tasks', JSON.stringify(existingTasks));
    }
    
    this.currentScreen = 'home';
  }

  onTaskUpdated(updatedTask: Task): void {
    if (this.homeScreenRef) {
      this.homeScreenRef.updateTask(updatedTask);
    } else {
      // Fallback: directly update in localStorage if ref is not available
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const index = existingTasks.findIndex((t: Task) => t.id === updatedTask.id);
      if (index !== -1) {
        existingTasks[index] = updatedTask;
        localStorage.setItem('tasks', JSON.stringify(existingTasks));
      }
    }
    this.selectedTask = updatedTask;
    this.currentScreen = 'home';
  }
}
