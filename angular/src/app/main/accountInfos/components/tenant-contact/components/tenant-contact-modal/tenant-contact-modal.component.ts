import { Component, ViewChild } from '@angular/core';
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

  @ViewChild('tenantContactComponent') tenantContactComponent: any;

  TenantContactMode = TenantContactMode;
  TenantContactType = TenantContactType;

  visible = false;
  mode: TenantContactMode;
  contactType: TenantContactType;
  accountId?: number;

  dialogStyle: any = {};

ngOnInit(): void {
  this.setDialogStyle();
  window.addEventListener('resize', () => this.setDialogStyle());
}

setDialogStyle(): void {
  const isMobile = window.innerWidth < 576;
  const isTab = window.innerWidth < 991;

  this.dialogStyle = isMobile
    ? {
      
        maxWidth: '95vw',
        marginTop : '115px'

      }
    : this.dialogStyle = isTab? {
      
        maxWidth: '670px',
        marginLeft: '80px',
        marginTop : '120px'
      }   : {
    
        maxWidth: '1350px',
        marginLeft: '80px'
      };
}

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



triggerSave(): void {
  this.tenantContactComponent?.submitForm();
}

deleteAccount(): void {
  console.log('delete account');
}
}