import {
    Component,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    Output,
    SimpleChanges
  } from '@angular/core';
  import { AppComponentBase } from '@shared/common/app-component-base';
  import { SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
  import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
  
  export interface ImageUploadComponentOutput {
    image: string;  // for pdf this can be null/undefined
    file: File;
  }
  
  @Component({
    selector: 'app-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss']
  })
  export class ImageUploadComponent extends AppComponentBase implements OnChanges {
    @Output() imageBrowseDone: EventEmitter<ImageUploadComponentOutput> =
      new EventEmitter<ImageUploadComponentOutput>();
    @Output() removeImage: EventEmitter<any> = new EventEmitter<any>();
  
    @Input() sycAttachmentCategory: SycAttachmentCategoryDto;
    @Input() staticWidth: number;
    @Input() staticHeight: number;
    @Input() showGuidelines: boolean = false;
    @Input() image: string;
    @Input() fromReview: string;
    @Input() isDisabled: boolean = false;
  
    inputID: string;
    mbToByteConversionFactor = 1e6;
    acceptedExtensions: string = '';
    acceptedExtensionsArr: string[] = [];
    imgFile: File;
  
    acceptedAspectRatio: number;
  
    // 🔹 New: PDF handling
    isPdf: boolean = false;
    pdfSafeUrl: SafeResourceUrl | null = null;
    private pdfObjectUrl: string | null = null;
  
    constructor(
      injector: Injector,
      private sanitizer: DomSanitizer // 🔹 inject sanitizer
    ) {
      super(injector);
      this.inputID = this.guid();
    }
  
    ngOnChanges(changes: SimpleChanges): void {
      if (this.sycAttachmentCategory) {
        if (this.sycAttachmentCategory.aspectRatio) {
          const [width, height] = this.sycAttachmentCategory.aspectRatio.split(':');
          this.acceptedAspectRatio = Number(width) / Number(height);
        }
        this.detectSupportedExtensions();
        if (this.staticWidth && this.acceptedAspectRatio) {
          this.staticHeight = this.staticWidth / this.acceptedAspectRatio;
        } else if (this.staticHeight && this.acceptedAspectRatio) {
          this.staticWidth = this.staticHeight * this.acceptedAspectRatio;
        }
      }
    }
  
    async fileChange($event: { target: { files: FileList; value: any } }) {
      const file = $event.target.files[0];
      const resetInput = () => ($event.target.value = null);
  
      if (!file) {
        resetInput();
        return;
      }
  
      // validate extension
      const isValidExtension = this.hasValidExtension(
        file.name,
        this.acceptedExtensionsArr
      );
      if (!isValidExtension) {
        this.message.warn(this.l('UnsupportedExtension'));
        resetInput();
        return;
      }
  
      // validate size
      if (this.checkImageSize(file.size)) {
        this.message.error(this.l('MaxFileSizeExceeded'));
        resetInput();
        return;
      }
  
      // 🔹 Detect PDF
      const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');
  
      if (isPdf) {
        // 🔹 PDF branch: no aspect ratio / cropping, just preview
        this.clearPdfUrl();
        this.isPdf = true;
        this.image = undefined;
  
        this.pdfObjectUrl = URL.createObjectURL(file);
        this.pdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.pdfObjectUrl
        );
  
        this.imgFile = file;
        this.imageBrowseDone.emit({ file: this.imgFile, image: null });
  
        resetInput();
        return;
      }
  
      // 🔹 IMAGE branch (old behaviour)
      this.isPdf = false;
      this.clearPdfUrl();
  
      const renderedImage = await this.renderImageAndGetDimensions(file);
      const currentAspectRatio = renderedImage.width / renderedImage.height;
      const buffer = 0.2;
  
      if (
        !this.acceptedAspectRatio ||
        (this.acceptedAspectRatio - buffer < currentAspectRatio &&
          this.acceptedAspectRatio + buffer > currentAspectRatio)
      ) {
        // image is accepted
        this.image = renderedImage.src;
        this.imgFile = file;
        this.imageBrowseDone.emit({ file: this.imgFile, image: this.image });
      } else {
        // image needs to be cropped
        const { onCropDone, data } = this.openImageCropper(
          $event,
          this.acceptedAspectRatio
        );
        const subs = onCropDone.subscribe(() => {
          if (data.isCropDone) {
            this.image = data.croppedImageAsBase64 as string;
            this.imgFile = new File([data.croppedImage], file.name, {
              type: file.type || 'image/png'
            });
  
            this.imageBrowseDone.emit({
              file: this.imgFile,
              image: this.image
            });
          }
          subs.unsubscribe();
        });
      }
  
      resetInput();
    }
  
    prevetFileBrowse($event) {
      $event.stopPropagation();
      const labelElement = $event.target.parentElement;
      labelElement.onclick = (e) => e.preventDefault();
      setTimeout(() => (labelElement.onclick = () => {}), 0);
    }
  
    emitRemoveImage($event) {
      this.prevetFileBrowse($event);
      this.image = undefined;
      this.isPdf = false;
      this.clearPdfUrl();
      this.removeImage.emit();
    }
  
    private clearPdfUrl(): void {
      if (this.pdfObjectUrl) {
        URL.revokeObjectURL(this.pdfObjectUrl);
        this.pdfObjectUrl = null;
      }
      this.pdfSafeUrl = null;
    }
  
    checkImageSize(imgSize: number) {
      const maxFileSize =
        this.sycAttachmentCategory.maxFileSize * this.mbToByteConversionFactor;
      return imgSize > maxFileSize;
    }
  
    async renderImageAndGetDimensions(file: File): Promise<HTMLImageElement> {
      return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = function () {
          const img = new Image();
          img.onload = function () {
            resolve(img);
          };
          img.src = fr.result as string;
        };
        fr.readAsDataURL(file);
      });
    }
  
    detectSupportedExtensions() {
      this.acceptedExtensionsArr = [];
      this.acceptedExtensions = '';
      this.sycAttachmentCategory.sycAttachmentTypeDto.forEach((item, index) => {
        const notFirst = index > 0;
        const itemsCount = this.sycAttachmentCategory.sycAttachmentTypeDto.length;
        if (notFirst && itemsCount > 1) this.acceptedExtensions += ',';
        this.acceptedExtensions += `.${item.extension}`;
        this.acceptedExtensionsArr.push(`.${item.extension}`);
      });
    }
  
    hasValidExtension(fileName: string, exts: string[]) {
      return new RegExp(
        '(' + exts.join('|').replace(/\./g, '\\.') + ')$'
      ).test(fileName);
    }
  }
  