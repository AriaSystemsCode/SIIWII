import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-generic-entity-shell',
  templateUrl: './generic-entity-shell.component.html',
  styleUrls: ['./generic-entity-shell.component.scss']
})
export class GenericEntityShellComponent {
  accountTypes: any;

  @Input() entity: any = {};
  @Input() entityType = '';
  @Input() title = '';
  @Input() breadcrumbItems: any[] = [];
  @Input() mode: 'create' | 'edit' | 'view' = 'view';
   @Input() entityData : any
  @Input() entityTypes: any[] = [];
  @Input() statuses: any[] = [];

  @Output() entityChange = new EventEmitter<any>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();
  @Output() maximize = new EventEmitter<void>();
  
leftPanelCollapsed = false;
leftPanelSections = [
  {
    key: 'branches',
    title: 'Branches',
    canAdd: true,
    items: [
      {
        id: 1,
        label: 'Main Branch',
        icon: 'fa fa-building',
        children: [
          { id: 2, label: 'Sub Branch 1', icon: 'fa fa-building' }
        ]
      }
    ]
  },
  {
    key: 'contacts',
    title: 'Contacts',
    canAdd: true,
    items: [
      { id: 10, label: 'Sarah Johnson', icon: 'fa fa-user' },
      { id: 11, label: 'Mark Green', icon: 'fa fa-user' }
    ]
  }
];
basicInfoFields = [
  {
    key: 'status',
    label: 'Status',
    type: 'dropdown',
    valuePath: 'account.status',
    options: this.statuses
  },
  {
    key: 'accountType',
    label: 'Account Type',
    type: 'dropdown',
    valuePath: 'account.accountTypeId',
    options: {}
  },
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    valuePath: 'account.name'
  },
  {
    key: 'ssin',
    label: 'SSIN',
    type: 'text',
    valuePath: 'account.ssin',
    readonly: true
  }
];
ngOnInit(){
  console.log(this.entityData,'entityData')
}
}