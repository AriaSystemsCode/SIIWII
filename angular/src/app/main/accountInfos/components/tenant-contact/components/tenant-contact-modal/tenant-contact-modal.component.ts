import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
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

      @Output("refreshAccounts") refreshAccounts: EventEmitter<boolean> = new EventEmitter<boolean>()
  
  TenantContactMode = TenantContactMode;
  TenantContactType = TenantContactType;

  visible = false;
  mode: TenantContactMode;
  contactType: TenantContactType;
  accountId?: number;

  dialogStyle: any = {};
  lastMode: TenantContactMode;
  

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
        marginTop: '115px'

      }
      : this.dialogStyle = isTab ? {

        maxWidth: '670px',
        marginLeft: '80px',
        marginTop: '120px'
      } : {

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
    this.lastMode = config.mode;

    this.contactType = config.contactType ?? config.accountType;
    this.accountId = config.accountId;
    this.visible = true;
  }

handleCancel(): void {

  // CREATE
  if (this.mode === TenantContactMode.Create) {

    this.tenantContactComponent?.tenantContactCreateEdit?.resetFormData?.();

    this.close();

    return;
  }

  // EDIT
  if (this.mode === TenantContactMode.Edit) {

    this.tenantContactComponent?.tenantContactCreateEdit?.resetFormData?.();

    this.mode = TenantContactMode.View;

    setTimeout(() => {
      this.tenantContactComponent?.reloadViewData?.();
    });

    return;
  }

  this.close();
}


  close(): void {
    this.visible = false;
  }

  onSaved(result?: any): void {
    const newAccountId =
      result?.accountInfo?.id ||
      result?.account?.id ||
      result?.id ||
      this.accountId;

    if (newAccountId) {
      this.accountId = newAccountId;
    }

    this.mode = TenantContactMode.View;

    setTimeout(() => {
      this.tenantContactComponent?.reloadViewData?.();
      this.refreshAccounts.emit(true)

    });
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