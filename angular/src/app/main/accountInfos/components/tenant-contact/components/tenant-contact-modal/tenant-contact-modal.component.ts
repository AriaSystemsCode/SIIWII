import { Component } from '@angular/core';
import {
  TenantContactMode,
  TenantContactType
} from '@app/main/accountInfos/models/Account-info-page-tabs.enum';

@Component({
  selector: 'app-tenant-contact-modal',
  templateUrl: './tenant-contact-modal.component.html',
  styleUrls: ['./tenant-contact-modal.component.scss']
})
export class TenantContactModalComponent {
  TenantContactMode = TenantContactMode;
  TenantContactType = TenantContactType;

  visible = false;
  mode: TenantContactMode;
  contactType: TenantContactType;
  accountId?: number;

  open(config: {
    mode: TenantContactMode;
    accountType?: TenantContactType;
    contactType?: TenantContactType;
    accountId?: number;
  }): void {
    this.mode = config.mode;
    this.contactType = config.contactType ?? config.accountType;
    this.accountId = config.accountId;
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  onSaved(): void {
    this.close();
  }

  openEdit(accountId?: number): void {
    this.mode = TenantContactMode.Edit;
    this.accountId = accountId ?? this.accountId;
  }
}