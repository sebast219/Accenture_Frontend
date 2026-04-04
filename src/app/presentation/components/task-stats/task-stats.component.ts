import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskStats } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-stats',
  templateUrl: './task-stats.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskStatsComponent implements OnInit {
  stats$!: Observable<TaskStats>;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.stats$ = this.taskService.getStats();
  }
}
