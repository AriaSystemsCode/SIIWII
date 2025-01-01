import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppMarketplaceItemsServiceProxy, CreateOrEditAccountInfoDto, MarketplaceAccountsServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-marketplace-account-profile',
  templateUrl: './marketplace-account-profile.component.html',
  styleUrls: ['./marketplace-account-profile.component.scss'],
  providers:[MarketplaceAccountsServiceProxy,AppMarketplaceItemsServiceProxy]
})
export class MarketplaceAccountProfileComponent  extends AppComponentBase   implements OnInit {

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  accountDataForView : AccountDto
  id:string
  accountId:any;
  companyLogo: any;
  coverPhoto: any;
  marketPlaceData:any
  activeTabIndex: number = 0; 


  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private _AccountsServiceProxy: AccountsServiceProxy,
    // private _router:Router,
    private  _marketplaceAccountsServiceProxy : MarketplaceAccountsServiceProxy
) {
  super(injector);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.accountId = params['id'];
      console.log('accountId:', this.accountId);

  });
    // this.route.paramMap.subscribe((params) => {
    //   this.id = params.get('id');
    //   console.log('ID:', this.id);
    // });
    // this.isHost = !this._abpSessionService.tenantId;
 this.getAccountDataForView()
}


   getAccountDataForView() {

    this.showMainSpinner();

  

  this._marketplaceAccountsServiceProxy.getAccountForView(this.accountId,5).pipe(
    finalize(
        ()=>this.hideMainSpinner()
    )
).subscribe((res)=>{

    this.accountDataForView = res.account
    this.marketPlaceData = res
    console.log(' this.accountDataForView :',  res );

    // this.isRecordOwner = this.accountDataForView?.partnerId == this.appSession.user?.accountId
    // if(this.accountDataForView?.logoUrl) this.companyLogo = `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}`;
    // if(this.accountDataForView?.coverUrl) this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}`;
})
  }
  

  navigateToTab(event): void {
    // console.log(event,'klkloiklk')
    this.activeTabIndex = event; // Set to the index of the "Posts" tab
  }

}
