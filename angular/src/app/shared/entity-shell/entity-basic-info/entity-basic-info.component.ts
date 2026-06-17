import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-entity-basic-info',
  templateUrl: './entity-basic-info.component.html',
  styleUrls: ['./entity-basic-info.component.scss']
})
export class EntityBasicInfoComponent {

  @Input() entity: any;
@Input() mode: 'create' | 'edit' | 'view' = 'view';
@Input() entityTypes: any[] = [];
@Input() statuses: any[] = [];

@Output() entityChange = new EventEmitter<any>();
@Output() imageChange = new EventEmitter<any>();
@Output() backgroundChange = new EventEmitter<any>();

}
