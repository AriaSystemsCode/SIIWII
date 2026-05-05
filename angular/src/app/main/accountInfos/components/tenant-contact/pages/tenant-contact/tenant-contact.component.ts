import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  TenantContactMode,
  TenantContactType
} from '@app/main/accountInfos/models/Account-info-page-tabs.enum';
import {
  AccountDto,
  AccountsServiceProxy,
  GetAccountForViewDto
} from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';

@Component({
  selector: 'app-tenant-contact',
  templateUrl: './tenant-contact.component.html',
  styleUrls: ['./tenant-contact.component.scss']
})
export class TenantContactComponent implements OnInit {
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

  constructor(private _accountsServiceProxy: AccountsServiceProxy) { }

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
    this._accountsServiceProxy.getAccountForView(this.accountId, 5)
      .subscribe((res) => {
        this.accountData = res;
        this.companyLogo = this.accountData?.logoUrl
          ? `${this.attachmentBaseUrl}/${this.accountData.logoUrl}`
          : undefined;

        this.coverPhoto = this.accountData?.coverUrl
          ? `${this.attachmentBaseUrl}/${this.accountData.coverUrl}`
          : undefined;
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

  // ensure protocol
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);

    // keep only origin (domain)
    const cleanUrl = parsed.origin;

    window.open(cleanUrl, '_blank');
  } catch (e) {
    // fallback (in case invalid URL)
    window.open(url, '_blank');
  }
}

switchMode(type: 'view' | 'edit') {
  if (type === 'view') {
    this.mode = TenantContactMode.View;
  } else {
    this.mode = TenantContactMode.Edit;
  }
}
}