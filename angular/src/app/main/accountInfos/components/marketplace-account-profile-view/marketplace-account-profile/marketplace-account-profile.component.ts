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
  accountType: string = "";
  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  accountDataForView: AccountDto
  marketPlaceData: GetAccountForViewDto
  activeTabIndex: number = 0;
  loginAccoutType: string = "";
  paramsSubscription;

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private _AccountsServiceProxy: AccountsServiceProxy,
    private _marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.paramsSubscription = this.route.params.subscribe((params) => {
      this.accountId = params['id'];

      this.getData();
    });

  }


  getData() {
    this.getAccountDataForView();
    this.getLoginAccoutType();
  }
  getLoginAccoutType() {
    this._AccountsServiceProxy.getAccountForView(this.appSession.user.accountId, 5).subscribe((res) => {
      this.loginAccoutType = res.account.accountType;
    }

    )
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

    })
  }


  navigateToTab(event): void {
    this.activeTabIndex = event; // Set to the index of the "Posts" tab
  }


  createRelation() {
    this._AccountsServiceProxy
      .applyRelationOnProfile(this.accountId, undefined)
      .pipe(
        finalize(() => {
          ;
          this.hideMainSpinner();
        })
      )
      .subscribe((result: string) => {


        this.marketPlaceData.avaliableConnectionName = "";
        this.marketPlaceData.connectionName = this.l(result);

      });
  }

}