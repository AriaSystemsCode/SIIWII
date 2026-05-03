import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/common/app-component-base';
import {
  AccountDto,
  AccountsServiceProxy,
  GetAccountForViewDto,
  MarketplaceAccountsServiceProxy
} from '@shared/service-proxies/service-proxies';
import { AccountPartnerType } from '@app/main/accountInfos/models/Account-info-page-tabs.enum';


enum PartnerViewTab {
  Profile = 'profile',
  Branches = 'branches',
  Contacts = 'contacts'
}

@Component({
  selector: 'app-account-partner-view',
  templateUrl: './account-partner-view.component.html',
  styleUrls: ['./account-partner-view.component.scss'],
  providers: [MarketplaceAccountsServiceProxy]
})
export class AccountPartnerViewComponent extends AppComponentBase implements OnInit {
  @Input() accountId: number;
  @Input() partnerType: AccountPartnerType = AccountPartnerType.Manual;
  @Input() fromMarketplace = false;

  @Output() edit = new EventEmitter<{ accountId: number; partnerType: AccountPartnerType }>();
  @Output() disconnected = new EventEmitter<void>();

  AccountPartnerType = AccountPartnerType;
  PartnerViewTab = PartnerViewTab;

  currentTab: PartnerViewTab = PartnerViewTab.Profile;

  accData?: GetAccountForViewDto;
  accountDataForView?: AccountDto;
  accountContactForView?: any;

  companyLogo?: string;
  coverPhoto?: string;

  isPublished = false;
  isSync = false;
  connectionCount = 0;
  loading = false;

  constructor(
    injector: Injector,
    private _accountsServiceProxy: AccountsServiceProxy,
    private _marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
   
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getAccountDataForView();
  }

  get isManual(): boolean {
    return this.partnerType === AccountPartnerType.Manual;
  }

  get isConnected(): boolean {
    return this.partnerType === AccountPartnerType.Connected;
  }

  get title(): string {
    return this.isConnected ? this.l('ConnectedAccount') : this.l('ManualAccount');
  }

  changeTab(tab: PartnerViewTab): void {
    this.currentTab = tab;
  }

  getAccountDataForView(): void {
    if (!this.accountId) return;

    this.loading = true;
    this.showMainSpinner();

    const request = this.fromMarketplace
      ? this._marketplaceAccountsServiceProxy.getAccountForView(this.accountId, undefined, 5)
      : this._accountsServiceProxy.getAccountForView(this.accountId, 5);

    request
      .pipe(finalize(() => {
        this.loading = false;
        this.hideMainSpinner();
      }))
      .subscribe((result: GetAccountForViewDto) => {
        this.accData = JSON.parse(JSON.stringify(result));
        this.isPublished = !!result?.isPublished;
        this.isSync = !!result?.isSync;
        this.connectionCount = result?.connectionCount || 0;

        this.accountDataForView = result?.account;
        this.accountContactForView = result?.contact;

        if (this.accountDataForView?.logoUrl) {
          this.companyLogo = `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}`;
        }

        if (this.accountDataForView?.coverUrl) {
          this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}`;
        }
      });
  }

  editAccount(): void {
    this.edit.emit({
      accountId: this.accountId,
      partnerType: this.partnerType
    });
  }

  disConnect(): void {
    if (!this.accountDataForView?.id) return;

    this.showMainSpinner();

    this._accountsServiceProxy
      .disconnect(this.accountDataForView.id)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe(() => {
        this.notify.success(this.l('SuccessfullyDisconnected'));
        this.disconnected.emit();
        this.getAccountDataForView();
      });
  }

  getFormattedConnectionName(): string {
    return this.accData?.disConnectLabel || this.l('Disconnect');
  }
}