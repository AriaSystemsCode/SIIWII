import { ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppMarketplaceItemsServiceProxy, AppTransactionServiceProxy, GetAccountForViewDto, MarketplaceAccountsServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs';
import { forkJoin } from 'rxjs';

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
loginTenaneSsin:string
  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private _AccountsServiceProxy: AccountsServiceProxy,
    private _marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
    private AppTransactionServiceProxy:AppTransactionServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.isAuthenticated = !!this.appSession?.user;
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
    this.getLoginAccountDataForView()
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


createRelation(relation: any): void {
  if (!relation?.connectionEntityId || !this.accountId) return;

  this.showMainSpinner();

  forkJoin({
    recipientRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(
      this.accountDataForView?.ssin // or recipient account ssin
    ),
    loggedTenantRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(
      this.loginTenaneSsin
    )
  })
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe(({ recipientRoles, loggedTenantRoles }: any) => {
      const recipientHasRoles = this.hasMarketplaceRoles(recipientRoles);
      const loggedTenantHasRoles = this.hasMarketplaceRoles(loggedTenantRoles);

      if (!recipientHasRoles || !loggedTenantHasRoles) {
        this.message.info(
         this.l('Cannot connect, you need to update the marketplace role of your account / the recipient account marketplace role in order to build relationship together')  ,
          ''
        );
        return;
      }

      this.applyRelation(relation);
    });
}
private hasMarketplaceRoles(response: any): boolean {
  const roles = response?.result ?? response;
  return Array.isArray(roles) && roles.length > 0;
}

private applyRelation(relation: any): void {
  this.showMainSpinner();

  this._AccountsServiceProxy
    .applyRelationOnProfile(
      this.accountId,
      undefined,
      relation.defaultVisibility === 'Public',
      relation.connectionEntityId
    )
    .pipe(
      finalize(() => {
        this.hideMainSpinner();
        this.getAccountDataForView();
      })
    )
    .subscribe();
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
  
showConnectionsDialog = false;

openConnectionsDialog(): void {
  this.showConnectionsDialog = true;
}
  onMainAvailableClick(event: Event): void {
  const list = this.marketPlaceData?.availableConnections || [];

  if (list.length === 1) {
    this.createRelation(list[0]);
  }
}


    getLoginAccountDataForView() {
        let id = this.appSession.user.accountId
        if (!id) return

      this._AccountsServiceProxy.getAccountForView(id, 5).pipe(
  
    ).subscribe((res) => {
      this.loginTenaneSsin = res?.account?.ssin
    })

    }

}