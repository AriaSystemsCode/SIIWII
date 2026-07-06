import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { EntityBasicInfoField } from '../models/generic-entity.model';

@Component({
  selector: 'app-entity-basic-info',
  templateUrl: './entity-basic-info.component.html',
  styleUrls: ['./entity-basic-info.component.scss']
})
export class EntityBasicInfoComponent {
   @Input() entityData : any
  @Input() entity: any;
@Input() mode: 'create' | 'edit' | 'view' = 'view';
@Input() entityTypes: any[] = [];
@Input() statuses: any[] = [];

@Output() entityChange = new EventEmitter<any>();
@Output() imageChange = new EventEmitter<any>();
@Output() backgroundChange = new EventEmitter<any>();
 attachmentBaseUrl: string = AppConsts.attachmentBaseUrl



@Input() fields: EntityBasicInfoField[] = [];

getValue(path: string): any {
  return path.split('.').reduce((obj, key) => obj?.[key], this.entityData);
}

setValue(path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop();

  const target = keys.reduce((obj, key) => {
    obj[key] = obj[key] || {};
    return obj[key];
  }, this.entityData);

  target[lastKey] = value;
}
}
