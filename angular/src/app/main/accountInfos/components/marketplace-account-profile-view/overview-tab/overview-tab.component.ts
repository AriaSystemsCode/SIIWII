import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileUploaderCustom } from '@shared/components/import-steps/models/FileUploaderCustom.model';
import { AccountDto, AppEntityAttachmentDto, AppPostDto, AppPostsServiceProxy, CreateMessageInput, GetAppPostForViewDto, GetMessagesForViewDto, MesasgeObjectType, MessagePagedResultDto, MessageServiceProxy, OverAllRatingDto } from '@shared/service-proxies/service-proxies';
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




reviewText: string = '';
  
  selectedMedia: { url: string; type: string; file?: File }[] = [];
  showEmojiPicker: boolean = false;
      messages: CreateMessageInput = new CreateMessageInput();
   attachmentsUploader: FileUploaderCustom;
  constructor(        injector: Injector, private _postService: AppPostsServiceProxy,private messageServiceProxy:MessageServiceProxy) {
    super(injector);

}

ngOnInit() {

  // this.rating = 3.4

}


ngOnChanges(){

  this.getAllPosts()
  this.getAllReviws()
  this.getOverAllRatings()
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
          449928,
          // this.accountDataForView.entityId,
          undefined,
          undefined,
          "REVIEW",
          "",
          this.skipCount,
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
          this.reviews = [...this.reviews, ...result.items];
          this.totalCount = result.totalCount; // Update total count of reviews
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
          449928,
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

// Function to map selected media to the required format
// prepareAttachments(): AppEntityAttachmentDto[] {
//   return this.selectedMedia.map((media, index) => {
//     const fileName = media.file?.name || 'default-name';
//     return {
//       attachmentCategoryId: media.type === 'image' ? 4 : 2, // Use appropriate category IDs
//       attachmentCategoryEnum: 0,
//       fileName: fileName,
//       displayName: fileName,
//       url: media.url, // Use media.url here
//       guid: null,
//       attributes: null,
//       index: index,
//       isDefault: index === 0, // Optional logic to mark the first as default
//       id: 0,

//       // Methods required by AppEntityAttachmentDto
//       init: function (data: Partial<AppEntityAttachmentDto>) {
//         Object.assign(this, data);
//       },
//       toJSON: function () {
//         return {
//           attachmentCategoryId: this.attachmentCategoryId,
//           attachmentCategoryEnum: this.attachmentCategoryEnum,
//           fileName: this.fileName,
//           displayName: this.displayName,
//           url: this.url,
//           guid: this.guid,
//           attributes: this.attributes,
//           index: this.index,
//           isDefault: this.isDefault,
//           id: this.id,
//         };
//       },
//     };
//   });
// }


// Example function to send the data
// sendAttachments(): void {
//   const attachments = this.prepareAttachments();

//   // Send the attachments array to the server (e.g., via HTTP POST)
//   console.log('Sending attachments:', attachments);

//   // Example API call (replace with your service logic)
//   // this.http.post('/api/attachments', { entityAttachments: attachments }).subscribe((response) => {
//   //   console.log('Attachments uploaded successfully', response);
//   // });
// }



toggleEmojiPicker(): void {
  this.showEmojiPicker = !this.showEmojiPicker;
}

addEmoji(event: any): void {
  this.reviewText += event.emoji.native; // Assuming emoji-mart emits an emoji object
}

removeMedia(index: number): void {
  this.selectedMedia.splice(index, 1);
}

// postReview(): void {
//   const reviewData = {
//     text: this.reviewText,
//     rating: this.selectedRating,
//     media: this.selectedMedia,
//   };
//   console.log('Review posted:', reviewData);
//   // Add logic to send the review data to a server or API
//   this.resetForm();
// }

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

          // Create a new AppEntityAttachmentDto object
          const att: AppEntityAttachmentDto = new AppEntityAttachmentDto();
          att.fileName = file.name;
          att.attachmentCategoryId = 4; // Example category ID
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

      // const reviewData = {
      //   text: this.reviewText,
      //   rating: this.selectedRating,
      //   media: this.selectedMedia,
      // };
      // console.log('Review posted:', reviewData);
      //   this.showMainSpinner();
        if(this.selectedMedia?.length>0)
          // this.onUploadAttachmets();
 


   
        this.onUploadAttachments()
      

        this.messages.to = null;
        // this.messages.senderId = 30719;
        this.messages.bodyFormat = this.reviewText;
        this.messages.body = this.reviewText;
        this.messages.mesasgeObjectType = MesasgeObjectType.Review
        this.messages.relatedEntityId = 449928

        // this.messages.relatedEntityId = this.accountDataForView?.entityId
        this.messages.subject = ''

        // this.messages.entityAttachments=this.prepareAttachments();
        // this.Messages.entityAttachments=this.attachments
  
        this.messageServiceProxy
            .createMessage(this.messages)
            .pipe(finalize(() => { this.hideMainSpinner()  ;  this.notify.info(this.l("SendSuccessfully"));
  
              this.messages.entityAttachments = [];
           
              this.messages=new CreateMessageInput();
              this.selectedMedia=[] ;this.selectedRating =0;this.reviewText ='';this.getAllReviws()}))
            .subscribe(() => {
      console.log('Review posted:', this.messages);
      this.messageServiceProxy
      .createUserEntityRating(this.selectedRating ,449928)
  
      .subscribe(() => {

      });
            
            });
    }



ngOnDestroy() {
  this.unsubscribeToAllSubscriptions();
}
}
