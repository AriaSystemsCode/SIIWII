import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  AccountDto,
  
} from '@shared/service-proxies/service-proxies';
import {
  TenantContactType
} from '@app/main/accountInfos/models/Account-info-page-tabs.enum';
import { AppConsts } from '@shared/AppConsts';

@Component({
  selector: 'app-tenant-contact-view',
  templateUrl: './tenant-contact-view.component.html',
  styleUrls: ['./tenant-contact-view.component.scss']
})
export class TenantContactViewComponent implements OnInit {
   @Input() accountData?: AccountDto;

  @Input() contactType: TenantContactType;

  @Output() edit = new EventEmitter<void>();

  loading = false;
attachmentBaseUrl = AppConsts.attachmentBaseUrl;
  constructor() {}

  ngOnInit(): void {
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