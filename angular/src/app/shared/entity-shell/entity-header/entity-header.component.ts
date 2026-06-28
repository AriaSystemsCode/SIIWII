import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-entity-header',
  templateUrl: './entity-header.component.html',
  styleUrls: ['./entity-header.component.scss']
})
export class EntityHeaderComponent {
  @Input() title = '';
  @Input() breadcrumbItems: any[] = [];
  @Input() mode: 'create' | 'edit' | 'view' = 'view';

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();
  @Output() maximize = new EventEmitter<void>();
}