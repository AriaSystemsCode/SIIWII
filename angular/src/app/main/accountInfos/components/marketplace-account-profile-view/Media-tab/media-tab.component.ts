import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@node_modules/@angular/platform-browser';
import { finalize } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppEntityAttachmentDto, MarketplaceAccountsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';


@Component({
  selector: 'app-media-tab',
  templateUrl: './media-tab.component.html',
  styleUrls: ['./media-tab.component.scss'],

})
export class MediaTabComponent    extends AppComponentBase implements OnInit  {

@Input('accountDataForView') accountDataForView :AccountDto;

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;

      mediaItems:AppEntityAttachmentDto[]
    //    = [
    //     { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    //     { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    //     { "type": "video", "thumbnail": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg", "url": "https://app.testing.siiwii.net:4001/ATTACHMENTS/2491/750f337c-5970-6d19-8282-4ee7682abd47.mp4" },
    //     { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    //     { "type": "video", "thumbnail": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg", "url": "https://app.testing.siiwii.net:4001/ATTACHMENTS/2491/750f337c-5970-6d19-8282-4ee7682abd47.mp4" },
    //     { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    //     { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    //     { "type": "image", "url": "https://images.pexels.com/photos/29632548/pexels-photo-29632548/free-photo-of-artistic-portrait-with-mirror-reflection.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.jpeg" },
    
    //   ];
    // media:any
    itemsPerPage: number = 10; // Number of items per page
    currentPage: number = 1; // Current page
    totalItems: number = 0; // Total items (retrieved from API)
    isModalOpen = false; // Controls modal visibility
    selectedIndex = 0; // Index of the currently selected image
    lastImageIndex: number = 0;
@Input('fromOverviewTab') fromOverviewTab :boolean = false
isLoading: boolean = false; // Prevent duplicate API calls
  constructor(
    injector: Injector,

    private _AccountsServiceProxy: AccountsServiceProxy,
    private sanitizer: DomSanitizer,
    private  _marketplaceAccountsServiceProxy : MarketplaceAccountsServiceProxy,
    
  
) {
  super(injector);
  }
  ngOnInit(): void { }
    ngOnChanges(): void {
   
      
        this.getAllMedia()
 
        this.mediaItems = this.mediaItems.map((item) => {
            if (item.attachmentCategoryId !== 3) {
              // Explicitly create a new AppEntityAttachmentDto object
              return {
                ...item, // Spread existing properties
                safeUrl: this.sanitizeUrl(item.url), // Add sanitized URL
                init: item.init, // Ensure init method exists
                toJSON: item.toJSON // Ensure toJSON method exists
              } as AppEntityAttachmentDto;
            }
            return item;
          });
          
          this.lastImageIndex = Math.min(this.mediaItems.length - 1, 8);
    }


    // playVideo(videoUrl: string, event) {
    //     let videoPrams={
    //         value:event.target,
    //         url :videoUrl
    //     }
    //     // this.videoClicked.emit(videoPrams);
    // }
  

sanitizeUrl(url: string): SafeResourceUrl {
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}



  getAllMedia(){
    this.showMainSpinner()
    let itemsforpage ;
    // this.fromOverviewTab ? itemsforpage = 9 : itemsforpage = this.itemsPerPage
    this._AccountsServiceProxy.getAllAccountMediaAttachment(this.accountDataForView?.ssin,undefined,5,  this.itemsPerPage).pipe(
      finalize(
          ()=>
            this.hideMainSpinner()
      )
  ).subscribe((res)=>{
  
      this.mediaItems = res.items
      // this.totalItems = res.totalCount; // Update total items for pagination
      this.totalItems = this.mediaItems.length; // Update total items for pagination
    //   this.marketPlaceData = res
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
  


}