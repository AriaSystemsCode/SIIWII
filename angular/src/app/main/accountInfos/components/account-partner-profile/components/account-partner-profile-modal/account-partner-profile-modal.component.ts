import { Component } from '@angular/core';
import { AccountPartnerMode, AccountPartnerType } from '@app/main/accountInfos/models/Account-info-page-tabs.enum';


@Component({
  selector: 'app-account-partner-profile-modal',
  templateUrl: './account-partner-profile-modal.component.html',
  styleUrls: ['./account-partner-profile-modal.component.scss']
})
export class AccountPartnerProfileModalComponent {
  AccountPartnerMode = AccountPartnerMode;
  AccountPartnerType = AccountPartnerType;

  visible = false;

  mode: AccountPartnerMode;
  partnerType: AccountPartnerType;
  accountId?: number;

  open(config: {
    mode: AccountPartnerMode;
    partnerType?: AccountPartnerType;
    accountType?: AccountPartnerType;
    accountId?: number;
  }) {
    this.mode = config.mode;
    this.partnerType = config.partnerType ?? config.accountType;
    this.accountId = config.accountId;
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

  onSaved() {
    this.close();
  }

  openEdit(event: { accountId: number; partnerType: AccountPartnerType }) {
    this.mode = AccountPartnerMode.Edit;
    this.accountId = event.accountId;
    this.partnerType = event.partnerType;
  }

  onDisconnected() {
    this.close();
  }
}