import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { TaskService } from '../../../core/services/task.service';
import { CategoryFormModalComponent, CategoryFormData } from '../../components/category-form-modal/category-form-modal.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: false
})
export class CategoriesPage implements OnInit {
  categories$!: Observable<Category[]>;

  constructor(
    private categoryService: CategoryService,
    private taskService: TaskService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategoriesWithTaskCount();
  }

  async openCategoryModal(category?: Category): Promise<void> {
    const modal = await this.modalController.create({
      component: CategoryFormModalComponent,
      componentProps: {
        category
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      if (category) {
        // Update existing category
        this.categoryService.updateCategory(category.id, data).subscribe();
      } else {
        // Create new category
        this.categoryService.createCategory(
          data.name,
          data.color,
          data.icon
        ).subscribe();
      }
    }
  }

  async deleteCategory(category: Category): Promise<void> {
    if (!category.taskCount || category.taskCount === 0) {
      // Delete directly if no tasks
      this.categoryService.deleteCategory(category.id).subscribe();
      return;
    }

    // Show confirmation alert if category has tasks
    const alert = await this.alertController.create({
      header: 'Eliminar Categoría',
      message: `Esta categoría contiene ${category.taskCount} tarea(s). ¿Qué desea hacer?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar solo categoría',
          handler: () => {
            this.categoryService.deleteCategory(category.id).subscribe();
            this.taskService.removeCategoryFromTasks(category.id).subscribe();
          }
        },
        {
          text: 'Eliminar categoría y tareas',
          role: 'destructive',
          handler: () => {
            this.categoryService.deleteCategory(category.id).subscribe();
            // Note: Tasks with this category will lose their category reference
          }
        }
      ]
    });

    await alert.present();
  }

  editCategory(category: Category): void {
    this.openCategoryModal(category);
  }

  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }
}
