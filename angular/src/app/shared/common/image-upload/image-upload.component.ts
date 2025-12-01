import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

export interface ImageUploadComponentOutput {
  image: string | null; // صورة فقط، PDF = null
  file: File;
}

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent extends AppComponentBase implements OnChanges {
  @Output() imageBrowseDone = new EventEmitter<ImageUploadComponentOutput>();
  @Output() removeImage = new EventEmitter<any>();

  @Input() sycAttachmentCategory: SycAttachmentCategoryDto;
  @Input() staticWidth: number;
  @Input() staticHeight: number;
  @Input() showGuidelines = false;
  @Input() image: string; // base64 أو url للصورة
  @Input() fromReview: string;
  @Input() isDisabled = false;

  inputID: string;
  mbToByteConversionFactor = 1e6;
  acceptedExtensions = '';
  acceptedExtensionsArr: string[] = [];
  imgFile: File;

  acceptedAspectRatio: number;

  // PDF state
  isPdf = false;
  pdfObjectUrl: string | null = null;  // blob: url
  private rawPdfUrl: string | null = null;

  constructor(injector: Injector) {
    super(injector);
    this.inputID = this.guid();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.sycAttachmentCategory) {
      const [width, height] = this.sycAttachmentCategory.aspectRatio.split(':');
      this.acceptedAspectRatio = Number(width) / Number(height);
      this.detectSupportedExtensions();

      if (this.staticWidth) {
        this.staticHeight = this.staticWidth / this.acceptedAspectRatio;
      } else if (this.staticHeight) {
        this.staticWidth = this.staticHeight * this.acceptedAspectRatio;
      }
    }
  }

  async fileChange($event: { target: { files: FileList; value: any } }) {
    const imgFile = $event.target.files[0];
    const resetInput = () => ($event.target.value = null);

    if (!imgFile) {
      return;
    }

    const isPdfFile =
      imgFile.type === 'application/pdf' ||
      imgFile.name.toLowerCase().endsWith('.pdf');

    // ✅ validate extension
    const isValidExtension = this.hasValidExtension(
      imgFile.name,
      this.acceptedExtensionsArr
    );
    if (!isValidExtension) {
      this.message.warn(this.l('UnsupportedExtension'));
      resetInput();
      return;
    }

    // ✅ validate size
    if (this.checkImageSize(imgFile.size)) {
      this.message.error(this.l('MaxFileSizeExceeded'));
      resetInput();
      return;
    }

    // 📄 لو PDF
    if (isPdfFile) {
      // نظف blob URL قديم
      if (this.rawPdfUrl) {
        URL.revokeObjectURL(this.rawPdfUrl);
      }

      this.isPdf = true;
      this.image = undefined;
      this.imgFile = imgFile;

      this.rawPdfUrl = URL.createObjectURL(imgFile);
      this.pdfObjectUrl = this.rawPdfUrl;

      // parent يعرف إن ده PDF عن طريق image = null
      this.imageBrowseDone.emit({ file: this.imgFile, image: null });

      resetInput();
      return;
    }

    // 🖼 لو صورة
    this.isPdf = false;
    this.pdfObjectUrl = null;

    const renderedImage = await this.renderImageAndGetDimensions(imgFile);
    const currentAspectRatio = renderedImage.width / renderedImage.height;
    const buffer = 0.2;

    if (
      this.acceptedAspectRatio - buffer < currentAspectRatio &&
      this.acceptedAspectRatio + buffer > currentAspectRatio
    ) {
      // مقبولة بدون crop
      this.image = (renderedImage as any).src;
      this.imgFile = imgFile;
      this.imageBrowseDone.emit({ file: this.imgFile, image: this.image });
    } else {
      // محتاجة crop
      const { onCropDone, data } = this.openImageCropper(
        $event as any,
        this.acceptedAspectRatio
      );
      const subs = onCropDone.subscribe(() => {
        if (data.isCropDone) {
          this.image = data.croppedImageAsBase64 as string;
          this.imgFile = new File([data.croppedImage], imgFile.name, {
            type: imgFile.type || 'image/png',
          });

          this.imageBrowseDone.emit({ file: this.imgFile, image: this.image });
        }
        subs.unsubscribe();
      });
    }

    resetInput();
  }

  onPdfThumbClick(event: MouseEvent): void {
    // مهم عشان ما يفتحش الـ file picker تاني
    event.preventDefault();
    event.stopPropagation();

    if (this.pdfObjectUrl) {
      window.open(this.pdfObjectUrl, '_blank');
    }
  }

  emitRemoveImage($event: MouseEvent) {
    // برضو امنعي فتح الـ file picker
    $event.preventDefault();
    $event.stopPropagation();

    // نظف الـ blob لو PDF
    if (this.rawPdfUrl) {
      URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }

    this.isPdf = false;
    this.pdfObjectUrl = null;
    this.image = undefined;
    this.imgFile = undefined;

    this.removeImage.emit();
  }

  checkImageSize(imgSize: number) {
    const maxFileSize =
      this.sycAttachmentCategory.maxFileSize * this.mbToByteConversionFactor;
    return imgSize > maxFileSize;
  }

  async renderImageAndGetDimensions(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
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
      if (notFirst && itemsCount > 1) {
        this.acceptedExtensions += ',';
      }
      this.acceptedExtensions += `.${item.extension}`;
      this.acceptedExtensionsArr.push(`.${item.extension}`);
    });
  }

  hasValidExtension(fileName: string, exts: string[]) {
    return new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$').test(
      fileName
    );
  }
}
