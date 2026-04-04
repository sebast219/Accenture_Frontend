import { NgModule } from '@angular/core';
import { FilterTasksPipe } from './filter-tasks.pipe';

@NgModule({
  declarations: [FilterTasksPipe],
  exports: [FilterTasksPipe]
})
export class PipesModule {}
