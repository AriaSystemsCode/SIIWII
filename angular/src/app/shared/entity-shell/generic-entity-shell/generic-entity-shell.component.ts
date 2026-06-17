import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-generic-entity-shell',
  templateUrl: './generic-entity-shell.component.html',
  styleUrls: ['./generic-entity-shell.component.scss']
})
export class GenericEntityShellComponent {
  @Input() entity: any = {};
  @Input() mode: any = 'view';

  @Input() entityTypes: any[] = [];
  @Input() statuses: any[] = [];

  @Output() entityChange = new EventEmitter<any>();
}
