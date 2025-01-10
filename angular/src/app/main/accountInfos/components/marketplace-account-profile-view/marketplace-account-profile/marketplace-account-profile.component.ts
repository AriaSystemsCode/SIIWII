import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
export class MarketplaceAccountProfileComponent  extends AppComponentBase   implements OnInit {

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  accountDataForView : AccountDto
  id:string
  accountId:any;
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
  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private _AccountsServiceProxy: AccountsServiceProxy,
    private sanitizer: DomSanitizer,
    private  _marketplaceAccountsServiceProxy : MarketplaceAccountsServiceProxy,
    
  
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
//  this.getAllMedia()
 this.createRelation()
this.mediaItems = this.mediaItems.map((item) => {
  if (item.type === 'video') {
    return {
      ...item,
      safeUrl: this.sanitizeUrl(item.url), // Add sanitized URL
    };
  }
  return item;
});


}
sanitizeUrl(url: string): SafeResourceUrl {
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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




  playVideo(videoUrl: string, event) {
      let videoPrams={
          value:event.target,
          url :videoUrl
      }
      // this.videoClicked.emit(videoPrams);
  }

  getAllMedia(){
    // this.showMainSpinner()
    this._AccountsServiceProxy.getAllAccountMediaAttachment('449928',undefined,5,  this.itemsPerPage).pipe(
      finalize(
          ()=>
            this.hideMainSpinner()
      )
  ).subscribe((res)=>{
  
      this.media = res.items
      // this.totalItems = res.totalCount; // Update total items for pagination
      this.totalItems = this.mediaItems.length; // Update total items for pagination
      // this.marketPlaceData = res
      console.log(' this.media :',  res );
  
  })
  }

  changePage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.getAllMedia(); // Fetch new page data
  }
  openModal(index: number): void {
    this.selectedIndex = index;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  prevMedia(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }
  
  nextMedia(): void {
    if (this.selectedIndex < this.mediaItems.length - 1) {
      this.selectedIndex++;
    }
  }
  


  createRelation() {
    this._AccountsServiceProxy
            .applyRelationOnProfile(this.accountId)
            .pipe(
                finalize(() => {;
                    this.hideMainSpinner();
                })
            )
            .subscribe((res) => {
             console.log(res)
            });
}
}
