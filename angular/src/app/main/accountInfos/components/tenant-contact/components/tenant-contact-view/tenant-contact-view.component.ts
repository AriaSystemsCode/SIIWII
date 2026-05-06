import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  AccountDto,

} from '@shared/service-proxies/service-proxies';
import {
  TenantContactType
} from '@app/main/accountInfos/models/Account-info-page-tabs.enum';
import { AppConsts } from '@shared/AppConsts';
import { NgImageSliderComponent } from 'ng-image-slider';

@Component({
  selector: 'app-tenant-contact-view',
  templateUrl: './tenant-contact-view.component.html',
  styleUrls: ['./tenant-contact-view.component.scss']
})
export class TenantContactViewComponent implements OnInit {
  @ViewChild('nav') slider: NgImageSliderComponent;
  @Input() accountData?: AccountDto;
  @Input() imageObject?: AccountDto;

  @Input() contactType: TenantContactType;

  @Output() edit = new EventEmitter<void>();

  loading = false;
  attachmentBaseUrl = AppConsts.attachmentBaseUrl;
  imagesLoaded = false;
  constructor() { }

  ngOnInit(): void {
    console.log(this.imageObject, 'imgsss')
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageObject']) {
      this.imagesLoaded = !!this.imageObject?.length;
      console.log(this.imageObject, 'imgsss after input update');
    }
  }
  get marketplaceRolesList(): string[] {
    const roleItem = this.accountData?.entityExtraData?.find(
      x => x.attributeId === 610
    );

    return roleItem?.attributeValue
      ? roleItem.attributeValue.split('-').filter(Boolean)
      : [];
  }
}