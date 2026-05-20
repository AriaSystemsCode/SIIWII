import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import {
  TenantContactMode,
  TenantContactType
} from '@app/main/accountInfos/models/Account-info-page-tabs.enum';
interface MinimizedTenantContactItem {
  mode: TenantContactMode;
  contactType: TenantContactType;
  accountId?: number;
  title: string;
}
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
  minimizedItems: MinimizedTenantContactItem[] = [];

  ngOnInit(): void {
    this.setDialogStyle();
    window.addEventListener('resize', () => this.setDialogStyle());
  }

  // setDialogStyle(): void {
  //   const isMobile = window.innerWidth < 576;
  //   const isTab = window.innerWidth < 991;

  //   this.dialogStyle = isMobile
  //     ? {

  //       maxWidth: '95vw',
  //       marginTop: '115px'

  //     }
  //     : this.dialogStyle = isTab ? {

  //       maxWidth: '670px',
  //       marginLeft: '80px',
  //       marginTop: '120px'
  //     } : {

  //       maxWidth: '1350px',
  //       marginLeft: '80px'
  //     };
  // }

  setDialogStyle(): void {

  const width = window.innerWidth;

  // MOBILE
  if (width < 576) {

    this.dialogStyle = {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      margin: '0',
      top: '0'
    };

    return;
  }

  // TABLET
  if (width < 991) {

    this.dialogStyle = {
      width: '92vw',
      maxWidth: '92vw',
      height: '92vh'
    };

    return;
  }

  // DESKTOP
  this.dialogStyle = {
    width: '1350px',
    maxWidth: '1350px',
    height: '92vh'
  };
}
  // open(config: {
  //   mode: TenantContactMode;
  //   accountType?: TenantContactType;
  //   contactType?: TenantContactType;
  //   accountId?: number;
  // }): void {
  //   this.mode = config.mode;
  //   this.lastMode = config.mode;

  //   this.contactType = config.contactType ?? config.accountType;
  //   this.accountId = config.accountId;
  //   this.visible = true;
  // }
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

  setTimeout(() => {
    this.tenantContactComponent?.resetToProfileTab?.();
  });
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

//   minimize(): void {
//   if (this.minimizedItems.length >= 5) {
//     abp.message.warn('You can minimize maximum 5 accounts');
//     return;
//   }

//   const title =
//     this.tenantContactComponent?.accountData?.account?.name ||
//     (this.contactType === TenantContactType.Manual ? 'Manual Account' : 'Connected Account');

//   const alreadyExists = this.minimizedItems.some(x =>
//     x.accountId === this.accountId &&
//     x.contactType === this.contactType
//   );

//   if (!alreadyExists) {
//     this.minimizedItems.push({
//       mode: this.mode,
//       contactType: this.contactType,
//       accountId: this.accountId,
//       title
//     });
//   }

//   this.visible = false;
// }

minimize(): void {
  this.addCurrentToTray();
  this.visible = false;
}

restoreMinimized(index: number): void {
  const item = this.minimizedItems[index];

  // before opening new one, minimize current opened dialog
  if (this.visible) {
    this.addCurrentToTray();
  }

  // remove clicked item from tray because it will be opened
  this.minimizedItems.splice(index, 1);

  this.open({
    mode: item.mode,
    contactType: item.contactType,
    accountId: item.accountId
  });
}

private addCurrentToTray(): void {
  const alreadyExists = this.minimizedItems.some(x =>
    x.accountId === this.accountId &&
    x.contactType === this.contactType
  );

  if (alreadyExists) return;

  if (this.minimizedItems.length >= 5) {
    abp.message.warn('You can minimize maximum 5 accounts');
    return;
  }

  const title =
    this.tenantContactComponent?.accountData?.account?.name ||
    (this.contactType === TenantContactType.Manual ? 'Manual Account' : 'Connected Account');

  this.minimizedItems.push({
    mode: this.mode,
    contactType: this.contactType,
    accountId: this.accountId,
    title
  });
}

closeMinimized(index: number, event: MouseEvent): void {
  event.stopPropagation();
  this.minimizedItems.splice(index, 1);
}
}