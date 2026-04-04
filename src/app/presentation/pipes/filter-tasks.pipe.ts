import { Pipe, PipeTransform } from '@angular/core';
import { Task, TaskFilter } from '../../core/models/task.model';

@Pipe({
  name: 'filterTasks',
  standalone: false,
  pure: true
})
export class FilterTasksPipe implements PipeTransform {
  transform(tasks: Task[], filter: TaskFilter): Task[] {
    if (!tasks) return [];
    if (!filter) return tasks;

    let filtered = [...tasks];

    if (filter.categoryId) {
      filtered = filtered.filter(t => t.categoryId === filter.categoryId);
    }

    if (filter.completed !== null && filter.completed !== undefined) {
      filtered = filtered.filter(t => t.completed === filter.completed);
    }

    if (filter.searchTerm && filter.searchTerm.trim()) {
      const term = filter.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }

    if (filter.priority) {
      filtered = filtered.filter(t => t.priority === filter.priority);
    }

    return filtered;
  }
}
