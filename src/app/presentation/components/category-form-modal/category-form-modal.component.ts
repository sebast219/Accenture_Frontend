import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Category } from '../../../core/models/category.model';
import { DEFAULT_CATEGORY_COLORS, DEFAULT_CATEGORY_ICONS } from '../../../core/models/category.model';

export interface CategoryFormData {
  name: string;
  color: string;
  icon?: string;
}

@Component({
  selector: 'app-category-form-modal',
  templateUrl: './category-form-modal.component.html',
  styleUrls: ['./category-form-modal.component.scss'],
  standalone: false
})
export class CategoryFormModalComponent {
  @Input() category?: Category;
  @Output() categorySaved = new EventEmitter<CategoryFormData>();
  @Output() categoryCancelled = new EventEmitter<void>();

  formData: CategoryFormData = {
    name: '',
    color: DEFAULT_CATEGORY_COLORS[0],
    icon: DEFAULT_CATEGORY_ICONS[0]
  };

  isEditMode = false;
  availableColors = DEFAULT_CATEGORY_COLORS;
  availableIcons = DEFAULT_CATEGORY_ICONS;

  constructor(private modalController: ModalController) {}

  ngOnInit(): void {
    if (this.category) {
      this.isEditMode = true;
      this.formData = {
        name: this.category.name,
        color: this.category.color,
        icon: this.category.icon || DEFAULT_CATEGORY_ICONS[0]
      };
    }
  }

  onSave(): void {
    if (!this.formData.name.trim()) return;
    
    this.categorySaved.emit(this.formData);
    this.dismiss();
  }

  onCancel(): void {
    this.categoryCancelled.emit();
    this.dismiss();
  }

  dismiss(): void {
    this.modalController.dismiss();
  }

  selectColor(color: string): void {
    this.formData.color = color;
  }

  selectIcon(icon: string): void {
    this.formData.icon = icon;
  }
}
