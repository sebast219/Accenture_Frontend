import { Injectable } from '@angular/core';
import { Category } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly STORAGE_KEY = 'categories';

  constructor() {
    this.initializeDefaultCategories();
  }

  // CRUD Operations for Categories

  // CREATE: Add new category
  addCategory(category: Omit<Category, 'id' | 'createdAt'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      ...category,
      id: Date.now(),
      createdAt: new Date()
    };
    
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  // READ: Get all categories
  getCategories(): Category[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  // READ: Get category by ID
  getCategoryById(id: number): Category | undefined {
    const categories = this.getCategories();
    return categories.find(cat => cat.id === id);
  }

  // UPDATE: Edit existing category
  updateCategory(id: number, updates: Partial<Pick<Category, 'name' | 'color' | 'icon'>>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      this.saveCategories(categories);
      return categories[index];
    }
    
    return null;
  }

  // DELETE: Remove category
  deleteCategory(id: number): boolean {
    const categories = this.getCategories();
    const filteredCategories = categories.filter(cat => cat.id !== id);
    
    if (filteredCategories.length < categories.length) {
      this.saveCategories(filteredCategories);
      return true;
    }
    
    return false;
  }

  // Helper methods
  private saveCategories(categories: Category[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
  }

  private initializeDefaultCategories(): void {
    const existing = this.getCategories();
    if (existing.length === 0) {
      const defaultCategories: Category[] = [
        {
          id: 1,
          name: 'Work',
          color: '#3b82f6',
          icon: '💼',
          createdAt: new Date()
        },
        {
          id: 2,
          name: 'Personal',
          color: '#10b981',
          icon: '🏠',
          createdAt: new Date()
        },
        {
          id: 3,
          name: 'Shopping',
          color: '#f59e0b',
          icon: '🛒',
          createdAt: new Date()
        },
        {
          id: 4,
          name: 'Health',
          color: '#ef4444',
          icon: '❤️',
          createdAt: new Date()
        }
      ];
      
      this.saveCategories(defaultCategories);
    }
  }

  // Get category color for task
  getCategoryColor(categoryId?: number): string {
    if (!categoryId) return '#3a3a3a';
    
    const category = this.getCategoryById(categoryId);
    return category?.color || '#3a3a3a';
  }

  // Get category name for display
  getCategoryName(categoryId?: number): string {
    if (!categoryId) return 'No Category';
    
    const category = this.getCategoryById(categoryId);
    return category?.name || 'Unknown';
  }
}
