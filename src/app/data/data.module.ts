import { NgModule } from '@angular/core';
import { TaskRepository } from '../core/repositories/task.repository';
import { CategoryRepository } from '../core/repositories/category.repository';
import { TaskLocalRepository } from './repositories/task-local.repository';
import { CategoryLocalRepository } from './repositories/category-local.repository';

@NgModule({
  providers: [
    { provide: TaskRepository, useClass: TaskLocalRepository },
    { provide: CategoryRepository, useClass: CategoryLocalRepository },
  ]
})
export class DataModule {}
