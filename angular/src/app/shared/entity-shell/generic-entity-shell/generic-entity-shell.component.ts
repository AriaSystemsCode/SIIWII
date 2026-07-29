import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-generic-entity-shell',
  templateUrl:
    './generic-entity-shell.component.html',
  styleUrls: [
    './generic-entity-shell.component.scss'
  ]
})
export class GenericEntityShellComponent {

  @Input() entity: any = {};
  @Input() entityData: any;

  @Input() entityType = '';
  @Input() title = '';

  @Input()
  breadcrumbItems: any[] = [];

  @Input()
  mode:
    'create' |
    'edit' |
    'view' = 'view';

  @Input()
  entityTypes: any[] = [];

  @Input()
  statuses: any[] = [];

  @Input()
  basicInfoFields: any[] = [];

  @Input()
  logoPath =
    'account.logoUrl';

  @Input()
  coverPath =
    'account.coverUrl';

  @Input()
  imagesPath =
    'account.imagesUrls';

  @Input()
  attachmentsPath =
    'account.entityAttachments';

  @Input() saving = false;
  @Input() uploading = false;

  @Output()
  entityChange =
    new EventEmitter<any>();

  @Output()
  logoChange =
    new EventEmitter<any>();

  @Output()
  backgroundChange =
    new EventEmitter<any>();

  @Output()
  imageChange =
    new EventEmitter<any>();

  @Output()
  attachmentRemove =
    new EventEmitter<any>();

  @Output()
  save =
    new EventEmitter<void>();

  @Output()
  cancel =
    new EventEmitter<void>();

  @Output()
  close =
    new EventEmitter<void>();

  @Output()
  minimize =
    new EventEmitter<void>();

  @Output()
  maximize =
    new EventEmitter<void>();

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
          {
            id: 10,
            label: 'Sarah Johnson',
            icon: 'fa fa-user',
            type: 'contact'
          },
          {
            id: 11,
            label: 'Mark Green',
            icon: 'fa fa-user',
            type: 'contact'
          }
        ]
      },
  ]
}]

  @Input()
logoAttachmentCategory:
  SycAttachmentCategoryDto;

@Input()
bannerAttachmentCategory:
  SycAttachmentCategoryDto;

@Input()
imageAttachmentCategory:
  SycAttachmentCategoryDto;

@Output()
edit =
  new EventEmitter<void>();
}