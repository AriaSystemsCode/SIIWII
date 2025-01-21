import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Reactions } from '@app/main/reactions/models/Reactions.enum';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileUploaderCustom } from '@shared/components/import-steps/models/FileUploaderCustom.model';
import { AccountDto, AccountsServiceProxy, AppEntitiesServiceProxy, AppEntityAttachmentDto, AppEntityUserReactionsCountDto, AppPostDto, AppPostsServiceProxy, CreateMessageInput, GetAppPostForViewDto, GetMessagesForViewDto, MesasgeObjectType, MessagePagedResultDto, MessageServiceProxy, OverAllRatingDto } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['./overview-tab.component.scss'],
})
export class OverviewTabComponent extends AppComponentBase implements OnInit,OnDestroy  {
  
   baseUrl = "https://localhost:44301/";


posts: GetAppPostForViewDto[] = [];
reviews : any [] =[]
@Input('accountDataForView') accountDataForView :AccountDto;
@Output("activeTabIndexBtn") activeTabIndexBtn: EventEmitter<number> = new EventEmitter<number>()
@ViewChild('reviewsSection') reviewsSection!: ElementRef;
totalCount: number = 0; // Total number of reviews
skipCount: number = 0; // Current offset
maxResultCount: number = 3; // Number of reviews per request
reviewRating : number
selectedRating: number = 0; // Initialize with no rating
value: number;
overRating : OverAllRatingDto
    usersReactionsStats: AppEntityUserReactionsCountDto = new AppEntityUserReactionsCountDto()

mediaItems : AppEntityAttachmentDto[]
totalmediaItems :number = 0

reviewText: string = '';
isHelpful:any
  selectedMedia: { url: string; type: string; file?: File }[] = [];
  showEmojiPicker: boolean = false;
      messages: CreateMessageInput = new CreateMessageInput();
   attachmentsUploader: FileUploaderCustom;
   loginAccoutType:string="";
   isExpanded = false;
   isUserReviewdBefore : boolean = false
   SuccessMsg :boolean = false
   lastImageIndex: number = 0;
   currentPage: number = 1; // Current page
   totalItems: number = 0; // Total items (retrieved from API)
   isModalOpen = false; // Controls modal visibility
   selectedIndex = 0; // Index of the currently selected image

   constructor(        injector: Injector, private _postService: AppPostsServiceProxy,private messageServiceProxy:MessageServiceProxy,    private _AccountsServiceProxy: AccountsServiceProxy,       private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    
  ) {
    super(injector);

}

ngOnInit() {


  this.getLoginAccoutType()
  // this.getAllPosts()
  // this.getAllReviws()
  this.getOverAllRatings()
  this.getAllMedia()
  this.lastImageIndex = Math.min(this.mediaItems?.length - 1, 8);

}


ngOnChanges(){


}

  getAllMedia(){
    this.showMainSpinner()
 
    this._AccountsServiceProxy.getAllAccountMediaAttachment(this.accountDataForView?.ssin,undefined,5,  9).pipe(
      finalize(
          ()=>
            this.hideMainSpinner()
      )
  ).subscribe((res)=>{
  
      this.mediaItems = res?.items
      // this.totalItems = res.totalCount; // Update total items for pagination
      this.totalmediaItems = this.mediaItems?.length; // Update total items for pagination
    //   this.marketPlaceData = res
      console.log(' this.media :',  res );
  
  })
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
  

goReviews() {
  this.reviewsSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
}





getOverAllRatings() {

  const subs = this.messageServiceProxy
      .getOverAllRatings(
        // 416177,
          this.accountDataForView.entityId,
      )
      .pipe(
          finalize(() => {
          
          })
      )
        .subscribe(
        (result) => {
         console.log(result,'resultresultresult')
          this.overRating =result

        },
       
      );
  this.subscriptions.push(subs);
}





    getLoginAccoutType(){
      this._AccountsServiceProxy.getAccountForView(this.appSession.user.accountId,5).subscribe((res)=>{
       this.loginAccoutType=res.account.accountType;
      }
     
      )
    }
    

ngOnDestroy() {
  this.unsubscribeToAllSubscriptions();
}
}
