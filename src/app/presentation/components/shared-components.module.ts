import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { EmptyStateComponent } from './empty-state/empty-state.component';
import { TaskStatsComponent } from './task-stats/task-stats.component';
import { CategoryFilterComponent } from './category-filter/category-filter.component';
import { TaskItemComponent } from './task-item/task-item.component';
import { TaskFormModalComponent } from './task-form-modal/task-form-modal.component';
import { CategoryFormModalComponent } from './category-form-modal/category-form-modal.component';

@NgModule({
  declarations: [
    EmptyStateComponent,
    TaskStatsComponent,
    CategoryFilterComponent,
    TaskItemComponent,
    TaskFormModalComponent,
    CategoryFormModalComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports: [
    EmptyStateComponent,
    TaskStatsComponent,
    CategoryFilterComponent,
    TaskItemComponent,
    TaskFormModalComponent,
    CategoryFormModalComponent,
  ]
})
export class SharedComponentsModule {}
