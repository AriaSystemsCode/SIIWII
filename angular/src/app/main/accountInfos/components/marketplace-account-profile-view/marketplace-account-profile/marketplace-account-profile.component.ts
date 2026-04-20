import { ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppMarketplaceItemsServiceProxy, GetAccountForViewDto, MarketplaceAccountsServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-marketplace-account-profile',
  templateUrl: './marketplace-account-profile.component.html',
  styleUrls: ['./marketplace-account-profile.component.scss'],
  providers: [MarketplaceAccountsServiceProxy, AppMarketplaceItemsServiceProxy]
})
export class MarketplaceAccountProfileComponent extends AppComponentBase implements OnInit, AfterViewInit {
  accountId: number;
  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  accountDataForView: AccountDto
  marketPlaceData: GetAccountForViewDto
  activeTabIndex: number = 0;
  paramsSubscription;

  currentLang:string
  isArabic:boolean 
  isAuthenticated: boolean = false;

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private _AccountsServiceProxy: AccountsServiceProxy,
    private _marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.isAuthenticated = !!this.appSession?.user;
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
   }

  ngAfterViewInit(): void {
    this.paramsSubscription = this.route.params.subscribe((params) => {
      this.accountId = params['id'];

      this.getAccountDataForView();
    });

  }






  ngOnDestroy(): void {
    // Clean up the subscription to avoid memory leaks
    if (this.paramsSubscription) {
      this.paramsSubscription.unsubscribe();
    }
  }


  getAccountDataForView() {
    this.showMainSpinner();
    const navigation = this.__router.getCurrentNavigation();
    let accountssin;
    if (navigation?.extras?.state)
      accountssin = navigation.extras.state['ssin'];

    this._marketplaceAccountsServiceProxy.getAccountForView(accountssin ? undefined : this.accountId, accountssin ? accountssin : undefined, undefined).pipe(
      finalize(
        () => this.hideMainSpinner()
      )
    ).subscribe((res) => {
      this.accountDataForView = res.account
      this.marketPlaceData = res
      this.activeTabIndex = 0;
      this.onActiveIndexChange(0);
    })
  }


  navigateToTab(event): void {
    this.activeTabIndex = event; // Set to the index of the "Posts" tab
  }


  createRelation(relation, status: boolean = false) {
    this.showMainSpinner()
    this._AccountsServiceProxy
      .applyRelationOnProfile(this.accountId, undefined, relation.defaultVisibility == 'Public' ? true : false, relation.connectionEntityId)
      .pipe(
        finalize(() => {
        
          this.hideMainSpinner();
          this.getAccountDataForView();
        })
      )
      .subscribe((result:any) => {
        // const raw = typeof result === 'string' ? result : result?.result ?? '';
        // const { connectionName, disConnectLabel } = this.splitLabels(raw);

        
        // this.marketPlaceData.availableConnections = [];
        // this.marketPlaceData.avaliableConnectionName = '';

        // this.marketPlaceData.connectionName   = this.l(connectionName);
        // this.marketPlaceData.disConnectLabel  = this.l(disConnectLabel);

      });
  }



getFormattedConnectionName(label: string): string {
  if (!label) return '';

  if (label === 'Follow' || label === 'Connect' || label === 'Join' || label === 'Employ') {
    return label;
  }

  if (label.startsWith('MPAction')) {
    const clean = label.replace('MPAction', '');
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }

  return label;
}
  disconnect(relation): void {

    this.showMainSpinner();
    this._AccountsServiceProxy
      .disconnect(this.marketPlaceData.account.id,relation.relationEntityId)
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
          this.getAccountDataForView();
        })
      )
      .subscribe((res) => {
        this.notify.success(this.l("SuccessfullyDisconnected"));
        // this.marketPlaceData.status = false;
        // this.marketPlaceData.connectionName = "";
        // this.marketPlaceData.avaliableConnectionName = res[0].connectionName
        // this.marketPlaceData.availableConnections = res
      });
  }
  private readonly ICONS: Record<string, string> = {
    FOLLOW: 'assets/accounts/FOLLOW.png',
    CONNECT: 'assets/accounts/CONNECT.png',
    EMPLOY: 'assets/accounts/CONNECT.png',
    EMPLOYEE: 'assets/accounts/EMPLOYEE.png',
    JOIN: 'assets/accounts/JOIN.png',
  };
  getConnectionIcon(label?: string): string {
    const t = (label || '').toUpperCase();
    for (const key of Object.keys(this.ICONS)) {
      if (t.includes(key)) return this.ICONS[key];
    }
    return 'assets/accounts/CONNECT.png'; // fallback
  }

  // private splitLabels(raw: string) {
  //   // split at the first '-' that precedes the second "MPAction..."
  //   const m = /^(.*?)-(MPAction.+)$/.exec(raw || '');
  //   return m
  //     ? { connectionName: m[1], disConnectLabel: m[2] }
  //     : { connectionName: raw || '', disConnectLabel: '' };
  // }

  

  onActiveIndexChange(index: number) {
    this.activeTabIndex = index;

    if (index === 1 && this.accountDataForView?.accountType === 'BUSINESS') {
      this.goSvR();
    }
    if (index === 0) {
      this.goSvR();
    }
  }

  goSvR() {
    sessionStorage.setItem(
      'SellerSSIN',
      JSON.stringify(this.accountDataForView?.ssin)
    );
  }
  

  
}