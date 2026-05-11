import { Component, EventEmitter, Injector, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
  TenantContactMode,
  TenantContactType
} from '@app/main/accountInfos/models/Account-info-page-tabs.enum';
import {

  AccountsServiceProxy,
  GetAccountForViewDto
} from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { ImageObject } from '@app/main/accounts/account-shared/models/imageobject';
import { TenantContactCreateEditComponent } from '../../components/tenant-contact-create-edit/tenant-contact-create-edit.component';

@Component({
  selector: 'app-tenant-contact',
  templateUrl: './tenant-contact.component.html',
  styleUrls: ['./tenant-contact.component.scss']
})
export class TenantContactComponent extends AppComponentBase implements OnInit {
  @ViewChild('tenantContactCreateEdit') tenantContactCreateEdit: TenantContactCreateEditComponent;

  @Input() mode: TenantContactMode;
  @Input() contactType: TenantContactType;
  @Input() accountId?: number;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();
  @Output() edit = new EventEmitter<number>();

  TenantContactMode = TenantContactMode;
  TenantContactType = TenantContactType;

  accountData?: GetAccountForViewDto;
  companyLogo?: string;
  coverPhoto?: string;

  attachmentBaseUrl = AppConsts.attachmentBaseUrl;
  currentLang: string
  isArabic: boolean
  activeTabIndex = 0;
  imageObject: ImageObject[] = [];
  constructor(injector: Injector, private _accountsServiceProxy: AccountsServiceProxy) {
    super(injector);

  }

  ngOnInit(): void {
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName');
    this.isArabic = this.currentLang === 'ar' || this.currentLang === 'ar-EG';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['accountId'] ||
      changes['mode']
    ) {
      if (this.accountId && this.mode === TenantContactMode.View) {
        this.loadAccountViewData();
      }
    }
  }
  get sidebarData(): any {

  // CREATE / EDIT
  if (
    this.mode === TenantContactMode.Create ||
    this.mode === TenantContactMode.Edit
  ) {
    return this.tenantContactCreateEdit?.accountInfoData;
  }

  // VIEW
  return this.accountData?.account;
}

  get isCreateMode(): boolean {
    return this.mode === TenantContactMode.Create;
  }

  get isEditMode(): boolean {
    return this.mode === TenantContactMode.Edit;
  }

  get isViewMode(): boolean {
    return this.mode === TenantContactMode.View;
  }

  loadAccountViewData(): void {
    this.showMainSpinner();

    this.imageObject = [];

    this._accountsServiceProxy
      .getAccountForView(this.accountId, 5)
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
        })
      )
      .subscribe((res) => {

        this.accountData = res;

        this.companyLogo = this.accountData?.account?.logoUrl
          ? `${this.attachmentBaseUrl}/${this.accountData?.account?.logoUrl}`
          : undefined;

        this.coverPhoto = this.accountData?.account?.coverUrl
          ? `${this.attachmentBaseUrl}/${this.accountData?.account?.coverUrl}`
          : undefined;

        /* images slider */
        if (this.accountData?.account?.imagesUrls?.length) {

          this.accountData.account.imagesUrls.forEach((img) => {

            this.imageObject.push({
              image: `${this.attachmentBaseUrl}/${img}`,
              thumbImage: `${this.attachmentBaseUrl}/${img}`,
              title: ''
            });

          });

        }

      });
  }
  handleSaved(event: any): void {
    this.saved.emit(event);
  }

  openEdit(): void {
    this.mode = TenantContactMode.Edit;
    this.edit.emit(this.accountId);
  }

  openEmail(email: string): void {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  }

  openWebsite(url: string): void {
    if (!url) return;

    window.open(url);
  }

  switchMode(type: 'view' | 'edit') {
    if (type === 'view') {
      this.mode = TenantContactMode.View;
    } else {
      this.mode = TenantContactMode.Edit;
    }
  }

  reloadViewData(): void {
    if (this.accountId) {
      this.loadAccountViewData();
    }
  }

  submitForm(): void {
    if (this.mode === TenantContactMode.Create || this.mode === TenantContactMode.Edit) {
      this.tenantContactCreateEdit?.save();
    }
  }

}