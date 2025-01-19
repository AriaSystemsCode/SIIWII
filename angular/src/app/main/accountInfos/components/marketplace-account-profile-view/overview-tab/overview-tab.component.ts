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
  constructor(        injector: Injector, private _postService: AppPostsServiceProxy,private messageServiceProxy:MessageServiceProxy,    private _AccountsServiceProxy: AccountsServiceProxy,       private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    
  ) {
    super(injector);

}

ngOnInit() {


  this.getLoginAccoutType()
  // this.getAllPosts()
  // this.getAllReviws()
  this.getOverAllRatings()
  // this.getAllMedia()

}


ngOnChanges(){


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
