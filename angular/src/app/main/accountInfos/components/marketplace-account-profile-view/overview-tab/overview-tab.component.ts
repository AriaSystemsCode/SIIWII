import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Reactions } from '@app/main/reactions/models/Reactions.enum';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileUploaderCustom } from '@shared/components/import-steps/models/FileUploaderCustom.model';
import { AccountDto, AccountsServiceProxy, AppEntitiesServiceProxy, AppEntityAttachmentDto, AppEntityUserReactionsCountDto, AppPostDto, AppPostsServiceProxy, CreateMessageInput, GetAppPostForViewDto, GetMessagesForViewDto, MesasgeObjectType, MessagePagedResultDto, MessageServiceProxy, OverAllRatingDto } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { finalize, forkJoin, map } from 'rxjs';

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
  constructor(        injector: Injector, private _postService: AppPostsServiceProxy,private messageServiceProxy:MessageServiceProxy,    private _AccountsServiceProxy: AccountsServiceProxy,       private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
  ) {
    super(injector);

}

ngOnInit() {

  // this.rating = 3.4
  this.getAllPosts()
  this.getAllReviws()
  this.getOverAllRatings()
  this.getAllMedia()

}


ngOnChanges(){


}
  getAllMedia(){
    // this.showMainSpinner()
    this._AccountsServiceProxy.getAllAccountMediaAttachment('Business-000000000014',undefined,9, 9).pipe(
      finalize(
          ()=>
            this.hideMainSpinner()
      )
  ).subscribe((res)=>{
  
      this.mediaItems = res.items
      // this.totalItems = res.totalCount; // Update total items for pagination
      // this.totalItems = this.mediaItems.length; // Update total items for pagination
    //   this.marketPlaceData = res
      console.log(' this.media :',  res );
  
  })
  }

// rating: number = 3.4; // Rating out of 5
getAllPosts() {
  // this.loading = true;
  const subs = this._postService
      .getAll(
         undefined,
         undefined,
        undefined,
          undefined,
          undefined,
          undefined,
          undefined,
         undefined,
          0,
          2486,
          2,
          "",
         0,
         5
      )
      .pipe(
          finalize(() => {
              // this.loading = false;
          })
      )
      .subscribe((result) => {
          // this.totalCount = result.totalCount;
      
      this.posts = result.items

      });
  this.subscriptions.push(subs);
}
goReviews() {
  this.reviewsSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
}

getAllReviws() {
  // this.loading = true;
  const subs = this.messageServiceProxy
      .getAllReviews(
         undefined,
          undefined,
          undefined,
          undefined,
          416177,
          // this.accountDataForView.entityId,
          undefined,
          undefined,
          "REVIEW",
          "",
         0,
          this.maxResultCount
      )
      .pipe(
          finalize(() => {
              // this.loading = false;
          })
      )
        .subscribe(
        (result) => {
          // Append new reviews to the existing list
          this.reviews = result.items;
          this.totalCount = result.totalCount; // Update total count of reviews
    
        // Iterate over the reviews and call the methods
        const observables = this.reviews.map((review) => {
          return forkJoin({
            likeCount: this._appEntitiesServiceProxy
              .getUsersReactionsCount(review?.messages?.entityId)
              .pipe(map((res) => res.likeCount || 0)),
              reactId: this._appEntitiesServiceProxy
              .getUsersReactionsCount(review?.messages?.entityId)
              .pipe(map((res) => res.id )),
            // isHelpful: this._appEntitiesServiceProxy
            //   .getCurrentUserReaction(review?.messages?.entityId)
            //   .pipe(map((res) => {
            //     res.reactionSelected ==1 || false
            //   } )),
          }).pipe(
            map((data) => ({
              entityId: review?.messages?.entityId,
              likeCount: data.likeCount,
              reactId: data.reactId,
              // isHelpful: data.isHelpful,
            }))
          );
        });
  
        // Update the reviews list with the new data
        forkJoin(observables).subscribe((results) => {
          results.forEach((data) => {
            const review = this.reviews.find((r) => r?.messages?.entityId === data.entityId);
            if (review) {
              review.likeCount = data.likeCount;
              review.reactId = data.reactId;
              // review.isHelpful = data.isHelpful;
            }
          });
        });
        },
       
      );
  this.subscriptions.push(subs);
}



loadMoreReviews(): void {
  if (this.reviews.length < this.totalCount ) {
    this.skipCount += this.maxResultCount; // Increment the offset
    this.getAllReviws(); // Fetch more reviews
  }
}



getOverAllRatings() {

  const subs = this.messageServiceProxy
      .getOverAllRatings(
        416177,
          // this.accountDataForView.entityId,
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

setRating(rating: number): void {
  this.selectedRating = rating;
  console.log(`User selected ${rating} stars`);
 
}





onImageSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedMedia.push({
        url: reader.result as string,
        type: 'image',
        file: file, // Keep the file reference for sending
      });
    };
    reader.readAsDataURL(file);
  }
}

onVideoSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedMedia.push({
        url: reader.result as string,
        type: 'video',
        file: file, // Keep the file reference for sending
      });
    };
    reader.readAsDataURL(file);
  }
}




removeMedia(index: number): void {
  this.selectedMedia.splice(index, 1);
}


resetForm(): void {
  this.reviewText = '';
  this.selectedRating = 0;
  this.selectedMedia = [];
}


onUploadAttachments() {
  const uploadUrl = "/Attachment/UploadFiles";
  this.attachmentsUploader = this.createCustomUploader(uploadUrl);

  // Extract files from `selectedMedia`
  const files = this.selectedMedia
      .filter(media => media.file instanceof File)
      .map(media => media.file as File);

  this.attachmentsUploader.addToQueue(files);

  this.attachmentsUploader.onBuildItemForm = (fileItem: any, form: any) => {
      if (!this.messages.entityAttachments) {
          this.messages.entityAttachments = [];
      }

      for (let i = 0; i < files.length; i++) {
          const guid = this.guid(); // Generate a unique GUID
          const file = files[i];
          const correspondingMedia = this.selectedMedia.find(media => media.file === file);
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");
          // Create a new AppEntityAttachmentDto object
          const att: AppEntityAttachmentDto = new AppEntityAttachmentDto();
          att.fileName = file.name;
          att.attachmentCategoryId = isImage ? 3 : 4; // Example category ID
          att.guid = guid;
        
         

          // Add the attachment to `entityAttachments`
          this.messages.entityAttachments.push(att);

          // Append GUID to the form
          form.append(`guid`, guid);
      }
  };

  this.attachmentsUploader.onErrorItem = (item, response, status) => {
      this.notify.error(this.l("UploadFailed"));
  };

  this.attachmentsUploader.uploadAllFiles();
}




    postReview() {

        this.showMainSpinner();
        if(this.selectedMedia?.length>0)
  
   
        this.onUploadAttachments()
      

        this.messages.to = null;
        // this.messages.senderId = 30719;
        this.messages.bodyFormat = this.reviewText;
        this.messages.body = this.reviewText;
        this.messages.mesasgeObjectType = MesasgeObjectType.Review
        this.messages.relatedEntityId = 416177


        // this.messages.relatedEntityId = this.accountDataForView?.entityId
        this.messages.subject = ''

        // this.messages.entityAttachments=this.prepareAttachments();
        // this.Messages.entityAttachments=this.attachments
  
        this.messageServiceProxy
            .createMessage(this.messages)
            .pipe(finalize(() => { this.hideMainSpinner()  ;  this.notify.info(this.l("SendSuccessfully"));
              this.getAllReviws()
              this.messages.entityAttachments = [];
           
              this.messages=new CreateMessageInput();
              this.selectedMedia=[] ;}))
            .subscribe(() => {
      console.log('Review posted:', this.messages);
      this.messageServiceProxy
      .createUserEntityRating(this.selectedRating ,416177)
  
      .subscribe(() => {
        this.selectedRating =0;this.reviewText ='';
        this.getAllReviws()
      });
            
            });
    }

 createReaction(entityId:number) {

  const subs = this._appEntitiesServiceProxy.createOrUpdateReaction(
    entityId,
    1,
)
  .pipe(
      finalize(() => {
        this.getAllRectsCount(entityId)
  // this.getuserreact(entityId)
      })
  )
    .subscribe(
    (result) => {
     console.log(result,'resultresultresult')
   

    },
   
  );
this.subscriptions.push(subs);
         
    }



    getAllRectsCount(entityId:number){
      this._appEntitiesServiceProxy.getUsersReactionsCount(entityId)
      .subscribe((result) => {
          
          // this.usersReactionsStats.likeCount = result.likeCount || 0

      })
    }


    // getuserreact(entityId:number){
    //   this._appEntitiesServiceProxy.getCurrentUserReaction(entityId)
    //   .subscribe((result) => {
    //     console.log(result,'kkkkkssssllll')
          
    //       this.isHelpful = result

    //   })
    // }


    deleteReaction(id:number,entityId:number){
      this._appEntitiesServiceProxy.deleteUserReaction(id)     .pipe(finalize(() => { 
        // this.getuserreact(entityId)
        this.getAllRectsCount(entityId)
      }))
      .subscribe((result) => {


      })
    }


ngOnDestroy() {
  this.unsubscribeToAllSubscriptions();
}
}
