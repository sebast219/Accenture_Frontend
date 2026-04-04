import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryFilterComponent {
  @Input() categories: Category[] = [];
  @Input() selectedCategoryId: string | null = null;
  @Output() categorySelected = new EventEmitter<string | null>();

  selectCategory(categoryId: string | null): void {
    this.categorySelected.emit(categoryId);
  }

  trackByFn(index: number, category: Category): string {
    return category.id;
  }
}
