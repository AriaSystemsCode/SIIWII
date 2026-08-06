import {
  EventEmitter
} from '@angular/core';
import { GenericEntityMode, GenericEntityNode } from './models/generic-entity.model';



export interface GenericEntityComponent {
  node: GenericEntityNode;

  mode: GenericEntityMode;

  entityData: any;

  title?: string;

  loading?: boolean;

  saving?: boolean;

  entityChanged?:
    EventEmitter<any>;

  saved?:
    EventEmitter<any>;

  cancelled?:
    EventEmitter<void>;

  loadEntity?(): void;

  enterEditMode?(): void;

  saveEntity?(): void;

  cancelEdit?(): void;
}