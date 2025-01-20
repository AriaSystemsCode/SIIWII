import { ActivatedRoute } from '@angular/router';
import { AccountMainFilterEnum } from '@app/main/accounts/account-shared/models/accounts-main-filter.enum';
import { SelectItem } from 'primeng/api';
import { AfterViewInit, Component, EventEmitter, Injector, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@node_modules/@angular/platform-browser';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountInfoAppService_oldServiceProxy, AccountsServiceProxy, AppMarketplaceItemsServiceProxy, CreateOrEditAccountInfoDto, MarketplaceAccountsServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-marketplace-account-profile',
  templateUrl: './marketplace-account-profile.component.html',
  styleUrls: ['./marketplace-account-profile.component.scss'],
  providers:[MarketplaceAccountsServiceProxy,AppMarketplaceItemsServiceProxy]
})
export class MarketplaceAccountProfileComponent  extends AppComponentBase   implements OnInit , AfterViewInit, OnChanges  {
  accountId:number;
  accountType:string = "";
  defaultMainFilter : AccountMainFilterEnum= AccountMainFilterEnum.AllAccounts
  pageMainFilters : SelectItem [] = [{ label:'AllAccounts', value:AccountMainFilterEnum.AllAccounts }]
  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  accountDataForView : AccountDto
  id:string
  companyLogo: any;
  coverPhoto: any;
  marketPlaceData:any
  activeTabIndex: number = 0; 
  mediaItems = [
    { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    { "type": "video", "thumbnail": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg", "url": "https://app.testing.siiwii.net:4001/ATTACHMENTS/2491/750f337c-5970-6d19-8282-4ee7682abd47.mp4" },
    { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    { "type": "video", "thumbnail": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg", "url": "https://app.testing.siiwii.net:4001/ATTACHMENTS/2491/750f337c-5970-6d19-8282-4ee7682abd47.mp4" },
    { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },

  ];
media:any
itemsPerPage: number = 10; // Number of items per page
currentPage: number = 1; // Current page
totalItems: number = 0; // Total items (retrieved from API)
isModalOpen = false; // Controls modal visibility
selectedIndex = 0; // Index of the currently selected image
loginAccoutType:string="";

  constructor(private activatedRoute:ActivatedRoute,
     injector: Injector,
    private route: ActivatedRoute,
    private _AccountsServiceProxy: AccountsServiceProxy,
    private sanitizer: DomSanitizer,
    private  _marketplaceAccountsServiceProxy : MarketplaceAccountsServiceProxy,
) {
  super(injector);
}

paramsSubscription;
ngOnInit(): void {}

ngAfterViewInit(): void {
  this.paramsSubscription = this.route.params.subscribe(async (params) => {
    this.accountId = params['id'];
    
    await this.getData();
  });

}

ngOnChanges(changes: SimpleChanges) {
  // this.paramsSubscription = this.route.params.subscribe(async (params) => {
  //   this.accountId = params['id'];
  //   await this.getData();
  // });
}


  async getData(): Promise<void> {
    await this.getAccountDataForView();
    this.updateMediaItems();
    this.getLoginAccoutType();
  }
  getLoginAccoutType(){
  this._AccountsServiceProxy.getAccountForView(this.appSession.user.accountId,5).subscribe((res)=>{
   this.loginAccoutType=res.account.accountType;
  }
 
  )
}


  private updateMediaItems(): void {
    this.mediaItems = this.mediaItems.map((item) =>
      item.type === 'video'
        ? { ...item, safeUrl: this.sanitizeUrl(item.url) }
        : item
    );
  }


sanitizeUrl(url: string): SafeResourceUrl {
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

ngOnDestroy(): void {
  // Clean up the subscription to avoid memory leaks
  if (this.paramsSubscription) {
    this.paramsSubscription.unsubscribe();
  }
}


   async getAccountDataForView(): Promise<void> {
    this.showMainSpinner();
  await this._marketplaceAccountsServiceProxy.getAccountForView(this.accountId,undefined).pipe(
    finalize(
        ()=>this.hideMainSpinner()
    )
).subscribe((res)=>{
    this.accountDataForView = res.account
    this.marketPlaceData = res
    // this.isRecordOwner = this.accountDataForView?.partnerId == this.appSession.user?.accountId
    // if(this.accountDataForView?.logoUrl) this.companyLogo = `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}`;
    // if(this.accountDataForView?.coverUrl) this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}`;
})
  }
  

  navigateToTab(event): void {
    // console.log(event,'klkloiklk')
    this.activeTabIndex = event; // Set to the index of the "Posts" tab
  }


   createRelation() {
        this._AccountsServiceProxy
                .applyRelationOnProfile(this.accountId,undefined)
                .pipe(
                    finalize(() => {;
                        this.hideMainSpinner();
                    })
                )
                .subscribe((result:string) => {
                  
                  
                        this.marketPlaceData.avaliableConnectionName="";
                        this.marketPlaceData.connectionName=this.l(result);
                    
                });
    }

}