import { Component, ElementRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileUploaderCustom } from '@shared/components/import-steps/models/FileUploaderCustom.model';
import { AccountDto, AppEntityAttachmentDto, CreateMessageInput, MesasgeObjectType, MessageServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html',
  styleUrls: ['./reviews-list.component.scss']
})


export class ReviewsListComponent extends AppComponentBase implements OnInit {
  @Input() accountDataForView: AccountDto;
  @Input() fromOverviewTab: boolean = false

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
    this.showMainSpinner()
    const subs = this.messageServiceProxy
      .isUserReviewedEntityBefore(
        this.accountDataForView?.entityId

      )
      .pipe(
        finalize(() => {
          this.hideMainSpinner()
        })
      )
      .subscribe((result) => {
        if (result) {
          this.SuccessMsg = true

        } else {
          this.postReview()
        }
      });

    this.subscriptions.push(subs);
  }



  getAllReviws() {
    this.showMainSpinner();
    const subs = this.messageServiceProxy
      .getAllReviews(
        undefined,
        undefined,
        undefined,
        undefined,
        this.accountDataForView?.entityId,
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
    if (this.selectedMedia?.length > 0)
      this.onUploadAttachments()
    this.messages.to = null;
    this.messages.bodyFormat = this.reviewText;
    this.messages.body = this.reviewText;
    this.messages.mesasgeObjectType = MesasgeObjectType.Review
    this.messages.relatedEntityId = this.accountDataForView?.entityId
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
          .createUserEntityRating(this.selectedRating, this.accountDataForView?.entityId)

          .subscribe(() => {

          });

      });
  }
}
