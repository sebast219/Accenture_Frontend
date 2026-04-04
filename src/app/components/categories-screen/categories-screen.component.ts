import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Category } from '../../models/task.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-categories-screen',
  templateUrl: './categories-screen.component.html',
  styleUrls: ['./categories-screen.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CategoriesScreenComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  
  categories: Category[] = [];
  isEditing = false;
  editingCategory: Category | null = null;
  isFormExpanded = false;

  // Delete confirmation modal
  isDeleteModalVisible = false;
  categoryToDelete: Category | null = null;
  
  // Form data
  categoryName = '';
  categoryColor = '#3b82f6';
  categoryIcon = '📁';
  
  // Available icons
  availableIcons = ['📁', '💼', '🏠', '🛒', '❤️', '🎯', '📚', '🎨', '💻', '🏃', '🍔', '✈️'];
  availableColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categories = this.categoryService.getCategories();
  }

  // CREATE: Add new category
  addCategory() {
    if (this.categoryName.trim()) {
      this.categoryService.addCategory({
        name: this.categoryName,
        color: this.categoryColor,
        icon: this.categoryIcon
      });
      
      this.resetForm();
      this.loadCategories();
    }
  }

  // UPDATE: Edit existing category
  editCategory(category: Category) {
    this.isEditing = true;
    this.editingCategory = category;
    this.categoryName = category.name;
    this.categoryColor = category.color;
    this.categoryIcon = category.icon || '📁';
  }

  updateCategory() {
    if (this.editingCategory && this.categoryName.trim()) {
      this.categoryService.updateCategory(this.editingCategory.id, {
        name: this.categoryName,
        color: this.categoryColor,
        icon: this.categoryIcon
      });
      
      this.cancelEdit();
      this.loadCategories();
    }
  }

  // DELETE: Remove category
  deleteCategory(category: Category) {
    this.categoryToDelete = category;
    this.isDeleteModalVisible = true;
  }

  confirmDelete(): void {
    if (this.categoryToDelete) {
      this.categoryService.deleteCategory(this.categoryToDelete.id);
      this.loadCategories();
    }
    this.closeDeleteModal();
  }

  cancelDelete(): void {
    this.closeDeleteModal();
  }

  private closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.categoryToDelete = null;
  }

  // Form actions
  startAddNew(): void {
    this.isEditing = false;
    this.editingCategory = null;
    this.resetForm();
    this.isFormExpanded = true;
  }

  toggleForm() {
    this.isFormExpanded = !this.isFormExpanded;
    if (!this.isFormExpanded) {
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingCategory = null;
    this.resetForm();
  }

  resetForm() {
    this.categoryName = '';
    this.categoryColor = '#3b82f6';
    this.categoryIcon = '📁';
  }

  onSubmit() {
    if (this.isEditing) {
      this.updateCategory();
    } else {
      this.addCategory();
    }
  }

  onBack() {
    this.back.emit();
  }
}
