import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  standalone: false
})
export class EmptyStateComponent {
  @Input() icon: string = 'clipboard-outline';
  @Input() title: string = 'No hay elementos';
  @Input() message: string = 'Comienza agregando un nuevo elemento.';
  @Input() actionLabel?: string;
}
