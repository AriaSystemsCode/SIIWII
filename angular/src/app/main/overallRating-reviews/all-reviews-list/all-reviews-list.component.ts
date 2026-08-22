import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileUploaderCustom } from '@shared/components/import-steps/models/FileUploaderCustom.model';
import { AppEntityAttachmentDto, CreateMessageInput, MesasgeObjectType, MessageServiceProxy, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { UpdateLogoService } from '@shared/utils/update-logo.service';

@Component({
  selector: 'app-all-reviews-list',
  templateUrl: './all-reviews-list.component.html',
  styleUrls: ['./all-reviews-list.component.scss']
})


export class AllReviewsListComponent extends AppComponentBase implements OnInit {
  @Input() entityID : number
  @Input() isPublished : boolean
  @Input() fromOverview : boolean
  @Input() alreadyReviewdMsg : string = 'You’ve already reviewed this product'
  
  @Output() refreshRating : EventEmitter<boolean> = new EventEmitter<boolean>()
  
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
  onlyMsg = false
  sycAttachmentCategoryImage: SycAttachmentCategoryDto;
  isAuthenticated = this.appSession?.user
  currentLang:string
  isArabic:boolean = true

  profilePicture:string
  constructor(injector: Injector, private messageServiceProxy: MessageServiceProxy,  private updateLogoService: UpdateLogoService,

  ) {
    super(injector);

  }

  stop(){
    event.stopPropagation()
    this.onlyMsg = true
  }
  ngOnInit() {
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
    if(this.isAuthenticated){
      this.getProfilePicture()
    }
    this.getAllReviws()
  
        if (!this.sycAttachmentCategoryImage) {
          this.sycAttachmentCategoryImage = {
            id: 1,
            code: 'IMAGE',
            name: 'Mock Image Category',
            description: 'Fake for testing',
            entityObjectTypeCode: 'MOCK',
            isStatic: false,
            maxFileSize: 1048576, // 1 MB
            acceptMultipleAttachments: true,
            isSystem: false,
            displayName: 'Test Category',
            icon: '',
            iconPath: '',
            tenantId: 1
          } as unknown as SycAttachmentCategoryDto;
        }
  }
  testImage: string = '';


  
  onImageRemoved(attr: any) {
    this.testImage = '';
    this.selectedMedia = this.selectedMedia.filter(m => !(m.type === 'image' && m.url === this.testImage));
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
        this.entityID

      )
      .pipe(
        finalize(() => {
          this.resetForm()
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
          isExpanded: false, 
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
    this.onlyMsg = false
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



  sanitizeAttachmentUrl(url: string): string {
    if (!url) return '';
    return (this.attachmentBaseUrl + '/' + url).replace(/\\/g, '/');
  }
  

  postReview() {
    this.showMainSpinner();
  
    if (this.selectedMedia?.length > 0)
      this.onUploadAttachments();
  
    this.messages.to = null;
    this.messages.bodyFormat = this.reviewText;
    this.messages.body = this.reviewText;
    this.messages.mesasgeObjectType = MesasgeObjectType.Review;
    this.messages.relatedEntityId = this.entityID;
    this.messages.subject = '';
  
    const ratingValue = this.selectedRating; 
  
    setTimeout(() => {
      this.messageServiceProxy
        .createMessage(this.messages)
        .pipe(finalize(() => {
          this.hideMainSpinner();
          this.notify.info(this.l("SendSuccessfully"));
          this.getAllReviws();
          this.messages.entityAttachments = [];
          this.messages = new CreateMessageInput();
          this.resetForm();            
          this.onlyMsg = false;
        }))
        .subscribe(() => {
  
          this.messageServiceProxy
            .createUserEntityRating(ratingValue, this.entityID)
            .pipe(finalize(() => this.refreshRating.emit(true)))
            .subscribe(() => {});
        });
  
    }, 1000);
  }

      getProfilePicture(): void {
        this.updateLogoService.profilePictureUpdated$.subscribe((res) => {
            this.profilePicture = res;
        });

    }

  
}
