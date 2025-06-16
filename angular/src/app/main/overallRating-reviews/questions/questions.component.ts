import { Component, ElementRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileUploaderCustom } from '@shared/components/import-steps/models/FileUploaderCustom.model';
import { AppEntityAttachmentDto, CreateMessageInput, MesasgeObjectType, MessageServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})


export class QuestionsComponent extends AppComponentBase implements OnInit {
  @Input() entityID : number

  @ViewChild('reviewsSection') reviewsSection!: ElementRef;

  reviews: any[] = []
  totalCount: number = 0;
  skipCount: number = 0;
  maxResultCount: number = 3;
  selectedRating: number = 0;
  reviewText: string = '';
  selectedMedia: { url: string; type: string; file?: File }[] = [];
  messages: CreateMessageInput = new CreateMessageInput();
  attachmentsUploader: FileUploaderCustom;
  isExpanded: boolean = false;
  isUserReviewdBefore: boolean = false
  SuccessMsg: boolean = false
  isEmojiPickerOpen: boolean = false; // Toggle emoji picker visibility
  emojis: string[] = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '😉', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜',
    '🤪', '😝', '🤑', '🤗', '🤔', '🤨', '😐', '😑', '😶', '😏',
    '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '😴', '😷', '🤒',
    '🤕', '🤢', '🤮', '🥴', '🥵', '🥶', '😵', '🤯', '🤠', '🥳',
    '😎', '🤓', '🧐', '😕', '🙃', '😲', '😭', '😤', '😡', '🤬',
    '❤️', '💔', '❣️', '💖', '💘', '💞', '💕', '💓', '💗', '💙',
    '👍', '👎', '👏', '🙌', '🙏', '🤝', '💪', '👀', '👋', '🤙'
  ];


  constructor(injector: Injector, private messageServiceProxy: MessageServiceProxy

  ) {
    super(injector);

  }

  ngOnInit() {
    this.getAllReviws()
  }

  toggleEmojiPicker() {
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }

  // Add emoji to input text
  addEmoji(emoji: string) {
    this.reviewText += emoji;
    this.isEmojiPickerOpen = false; // Close picker after selecting an emoji
  }


  setRating(rating: number): void {
    this.selectedRating = rating;

  }

  isUserReviewedEntityBefore() {
    // this.showMainSpinner()
    // const subs = this.messageServiceProxy
    //   .isUserReviewedEntityBefore(
    //     this.accountDataForView?.entityId

    //   )
    //   .pipe(
    //     finalize(() => {
    //       this.hideMainSpinner()
    //     })
    //   )
    //   .subscribe((result) => {
    //     if (result) {
    //       this.SuccessMsg = true

    //     } else {
          this.postReview()
    //     }
    //   });

    // this.subscriptions.push(subs);
  }



  getAllReviws() {
    // this.reviews = [
    //     {
    //         "messages": {
    //             "parentFKList": [],
    //             "hasChildren": false,
    //             "tenantId": null,
    //             "senderId": 30725,
    //             "entityObjectTypeCode": "REVIEW",
    //             "to": null,
    //             "cc": null,
    //             "bcc": null,
    //             "subject": "",
    //             "body": "new end",
    //             "bodyFormat": "new end",
    //             "sendDate": "2025-01-24T00:06:48.1344467",
    //             "receiveDate": "2025-01-24T00:06:48.1344467",
    //             "entityId": 455465,
    //             "entityCode": null,
    //             "parentId": null,
    //             "parentCode": null,
    //             "threadId": 159,
    //             "userId": null,
    //             "senderName": "John Willson",
    //             "toName": null,
    //             "isFavorite": false,
    //             "entityObjectStatusCode": null,
    //             "entityAttachments": [
    //                 {
    //                     "attachmentCategoryId": 4,
    //                     "attachmentCategoryEnum": 0,
    //                     "fileName": "a3273754-4a7d-f0a3-4d88-6c19f74fd01b.mp4",
    //                     "displayName": "750f337c-5970-6d19-8282-4ee7682abd47.mp4",
    //                     "url": "attachments\\-1\\a3273754-4a7d-f0a3-4d88-6c19f74fd01b.mp4",
    //                     "guid": null,
    //                     "attributes": null,
    //                     "index": 0,
    //                     "isDefault": false,
    //                     "id": 234263
    //                 }
    //             ],
    //             "recipientsName": null,
    //             "mesasgeObjectType": 0,
    //             "relatedEntityId": 454309,
    //             "relatedEntityObjectTypeCode": null,
    //             "relatedEntityObjectTypeDescription": null,
    //             "relatedEntityCreatorName": null,
    //             "profilePictureId": "00000000-0000-0000-0000-000000000000",
    //             "userImage": null,
    //             "profilePictureUrl": null,
    //             "senderCompanyName": "Avatar",
    //             "id": 159
    //         },
    //         "rating": 5,
    //         "isUserVerifiedPurchaser": false,
    //         "isProfileOwner": false,
    //         "isAccountAdmin": true
    //     }
    // ]
    this.showMainSpinner();
    const subs = this.messageServiceProxy
      .getAllReviews(
        undefined,
        undefined,
        undefined,
        undefined,
        this.entityID,
        undefined,
        undefined,
        "REVIEW",
        "",
        this.skipCount,
        this.maxResultCount
      )
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
        })
      )
      .subscribe((result) => {
        // Handle reviews properly
        const newReviews = result.items.map((review) => ({
          ...review,
          isExpanded: false, // Add `isExpanded` property for tracking
        }));

        if (this.skipCount === 0) {
          // Initial load or refresh
          this.reviews = newReviews;
        } else {
          // Append new reviews to the existing list
          this.reviews = [...this.reviews, ...newReviews];
        }

        this.totalCount = result.totalCount; // Update the total count of reviews
      });

    this.subscriptions.push(subs);
 
 
  }


  loadMoreReviews(): void {
    if (this.reviews.length < this.totalCount) {
      this.skipCount += this.maxResultCount; // Increment the offset
      this.getAllReviws(); // Fetch more reviews
    }
  }


  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset the height to auto to recalculate
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to the scrollHeight
  }

  toggleExpand(review: any): void {
    review.isExpanded = !review.isExpanded; // Toggle the `isExpanded` property for the specific review
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
        const isImage = file.type.startsWith("image/");
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
    if (this.selectedMedia?.length > 0)
      this.onUploadAttachments()
    this.messages.to = null;
    this.messages.bodyFormat = this.reviewText;
    this.messages.body = this.reviewText;
    // this.messages.mesasgeObjectType = MesasgeObjectType.Review
    this.messages.relatedEntityId = this.entityID
    this.messages.subject = ''
    this.messageServiceProxy
      .createMessage(this.messages)
      .pipe(finalize(() => {
        this.hideMainSpinner();
        this.notify.info(this.l("SendSuccessfully"));
        this.getAllReviws()
        this.messages.entityAttachments = [];

        this.messages = new CreateMessageInput();
        this.resetForm()
      }))
      .subscribe(() => {
        this.messageServiceProxy
          .createUserEntityRating(this.selectedRating, this.entityID)

          .subscribe(() => {

          });

      });
  }
}
