import { Component, ElementRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileUploaderCustom } from '@shared/components/import-steps/models/FileUploaderCustom.model';
import { AppEntityAttachmentDto, CreateMessageInput, MesasgeObjectType, MessageServiceProxy } from '@shared/service-proxies/service-proxies';
import { UpdateLogoService } from '@shared/utils/update-logo.service';


@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})


export class QuestionsComponent extends AppComponentBase implements OnInit {
  @Input() entityID : number

  @ViewChild('reviewsSection') reviewsSection!: ElementRef;

  questions: any[] = []
  totalCount: number = 0;
  skipCount: number = 0;
  maxResultCount: number = 3;
  questionText: string = '';
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
  onlyMsg:boolean = false
  isAuthenticated = this.appSession?.user
  currentLang:string
  isArabic:boolean
  profilePicture
  constructor(injector: Injector, private messageServiceProxy: MessageServiceProxy, private updateLogoService: UpdateLogoService,

  ) {
    super(injector);

  }

  ngOnInit() {
     this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
          if(this.isAuthenticated){
      this.getProfilePicture()
    }
    this.getAllQuestions()
  }

  stop(){
    event.stopPropagation()
    this.onlyMsg = true
  }
  
  toggleEmojiPicker() {
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }

  // Add emoji to input text
  addEmoji(emoji: string) {
    this.questionText += emoji;
    this.isEmojiPickerOpen = false; // Close picker after selecting an emoji
  }



  getAllQuestions() {
 
    this.showMainSpinner();
    const subs = this.messageServiceProxy
      .getAllQuestions (
        undefined,
        undefined,
        undefined,
        undefined,
        this.entityID,
        undefined,
        undefined,
        "QUESTION",
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
          this.questions = newReviews;
        } else {
          // Append new reviews to the existing list
          this.questions = [...this.questions, ...newReviews];
        }

        this.totalCount = result.totalCount; // Update the total count of reviews
      });

    this.subscriptions.push(subs);
 
 
  }


  loadMoreReviews(): void {
    if (this.questions.length < this.totalCount) {
      this.skipCount += this.maxResultCount; // Increment the offset
      this.getAllQuestions(); // Fetch more reviews
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

  // handleImageUploaded(event: { file: File; base64: string }) {
  //   this.selectedMedia.push({
  //     url: event.base64,
  //     type: 'image',
  //     file: event.file
  //   });
  // }
  
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
    this.onlyMsg = false
    this.selectedMedia.splice(index, 1);
  }



  resetForm(): void {
    this.questionText = '';
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
  


  postQuestion() {

    this.showMainSpinner();
    if (this.selectedMedia?.length > 0)
      this.onUploadAttachments()
    this.messages.to = null;
    this.messages.bodyFormat = this.questionText;
    this.messages.body = this.questionText;
    this.messages.mesasgeObjectType = MesasgeObjectType.Question
    this.messages.relatedEntityId = this.entityID
    this.messages.subject = ''
    setTimeout(() => {
    this.messageServiceProxy
      .createMessage(this.messages)
      .pipe(finalize(() => {
        this.hideMainSpinner();
        this.notify.info(this.l("SendSuccessfully"));
        this.getAllQuestions()
        this.messages.entityAttachments = [];

        this.messages = new CreateMessageInput();
        this.resetForm()
        this.onlyMsg = false
      }))
      .subscribe(() => {


      });
    }, 1000); // ⏱ 2-second delay (2000 milliseconds)

  }

        getProfilePicture(): void {
        this.updateLogoService.profilePictureUpdated$.subscribe((res) => {
            this.profilePicture = res;
        });

    }

}
