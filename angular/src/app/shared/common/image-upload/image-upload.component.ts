import {
  Component,
  EventEmitter,
  HostBinding,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

export interface ImageUploadComponentOutput {
  image: string | null;
  file: File;
}

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent extends AppComponentBase implements OnChanges {
  @HostBinding('style.width')
  get hostWidth(): string | null {
    return this.staticWidth ? `${this.staticWidth}px` : null;
  }

  @HostBinding('style.height')
  get hostHeight(): string | null {
    return this.staticHeight ? `${this.staticHeight}px` : null;
  }

  @Output() imageBrowseDone = new EventEmitter<ImageUploadComponentOutput>();
  @Output() removeImage = new EventEmitter<any>();

  @Input() sycAttachmentCategory: SycAttachmentCategoryDto;
  @Input() staticWidth: number;
  @Input() staticHeight: number;
  @Input() showGuidelines = false;
  @Input() image: string;
  @Input() fromReview: string;
  @Input() isDisabled = false;
  @Input() attachmentTypeCode: 'LOGO' | 'BANNER' | 'IMAGE' = 'IMAGE';
  @Input() customExtentionsImgs: boolean;
  @Input() selectedOrientation: 'Portrait' | 'Landscape' = 'Portrait';
  @Input() allowExcel: boolean = true;

  inputID: string;
  mbToByteConversionFactor = 1e6;
  acceptedExtensions = '';
  acceptedExtensionsArr: string[] = [];
  acceptedAspectRatio: number;
  imgFile: File;

  // PDF state
  isPdf = false;
  pdfObjectUrl: string | null = null; // blob: url

  // Excel state
  isExcel = false;
  excelFileName: string | null = null;
  private excelObjectUrl: string | null = null;

  constructor(injector: Injector) {
    super(injector);
    this.inputID = this.guid();
  }

  /** True when the slot currently shows an image, a PDF or an Excel file. */
  get hasContent(): boolean {
    return !!(this.image || this.isPdf || this.isExcel);
  }

  /** Aspect ratio hint, flipped when the orientation is Landscape. */
  get aspectRatioLabel(): string {
    const ratio = this.sycAttachmentCategory?.aspectRatio;
    if (!ratio) {
      return '';
    }
    const [w, h] = ratio.split(':');
    return this.l('AspectRatio?', this.selectedOrientation === 'Landscape' ? `${h}:${w}` : ratio);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allowExcel']) {
      this.detectSupportedExtensions();
    }

    // category passed directly from the parent
    if (
      changes['sycAttachmentCategory'] &&
      this.sycAttachmentCategory &&
      this.sycAttachmentCategory.aspectRatio
    ) {
      this.applyAspectFromCategory(this.sycAttachmentCategory);
    }

    // parent switched Logo / Banner / Image
    if (changes['attachmentTypeCode'] && this.attachmentTypeCode) {
      this.getAttachRatio();
    }

    if (changes['selectedOrientation'] && this.sycAttachmentCategory) {
      this.applyAspectFromCategory(this.sycAttachmentCategory);
    }
  }

  async fileChange($event: any) {
    const inputEl = $event.target as HTMLInputElement;
    const selectedFile = inputEl.files?.[0];

    const resetInput = () => {
      if (inputEl) {
        inputEl.value = '';
      }
    };

    if (!selectedFile) {
      return;
    }

    const isPdfFile =
      selectedFile.type === 'application/pdf' ||
      selectedFile.name.toLowerCase().endsWith('.pdf');
    const isExcelFile = this.isExcelFile(selectedFile);
    const isImageFile =
      selectedFile.type.startsWith('image/') ||
      /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(selectedFile.name);

    // Validate file type
    if ((isExcelFile && !this.allowExcel) || (!isPdfFile && !isExcelFile && !isImageFile)) {
      this.message.warn(this.l('UnsupportedExtension'));
      resetInput();
      return;
    }

    // Validate configured extensions (images only; PDF and Excel are allowed separately)
    if (
      isImageFile &&
      this.acceptedExtensionsArr?.length &&
      !this.hasValidExtension(selectedFile.name, this.acceptedExtensionsArr)
    ) {
      this.message.warn(this.l('UnsupportedExtension'));
      resetInput();
      return;
    }

    // Validate file size
    if (this.checkImageSize(selectedFile.size)) {
      this.message.error(this.l('MaxFileSizeExceeded'));
      resetInput();
      return;
    }

    this.clearFileState();

    // EXCEL / PDF
    if (isExcelFile || isPdfFile) {
      this.image = undefined;
      this.imgFile = selectedFile;

      if (isExcelFile) {
        this.isExcel = true;
        this.excelFileName = selectedFile.name;
        this.excelObjectUrl = URL.createObjectURL(selectedFile);
      } else {
        this.isPdf = true;
        this.pdfObjectUrl = URL.createObjectURL(selectedFile);
      }

      this.imageBrowseDone.emit({ file: selectedFile, image: null });
      resetInput();
      return;
    }

    // IMAGE
    const renderedImage = await this.renderImageAndGetDimensions(selectedFile);
    const currentAspectRatio = renderedImage.width / renderedImage.height;
    const buffer = 0.2;

    if (
      !this.acceptedAspectRatio ||
      (this.acceptedAspectRatio - buffer < currentAspectRatio &&
        this.acceptedAspectRatio + buffer > currentAspectRatio)
    ) {
      this.image = renderedImage.src;
      this.imgFile = selectedFile;

      this.imageBrowseDone.emit({ file: this.imgFile, image: this.image });
    } else {
      const { onCropDone, data } = this.openImageCropper($event as any, this.acceptedAspectRatio);

      const subs = onCropDone.subscribe(() => {
        if (data.isCropDone) {
          this.image = data.croppedImageAsBase64 as string;
          this.imgFile = new File([data.croppedImage], selectedFile.name, {
            type: selectedFile.type || 'image/png',
          });

          this.imageBrowseDone.emit({ file: this.imgFile, image: this.image });
        }

        subs.unsubscribe();
      });
    }

    resetInput();
  }

  onPdfThumbClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.pdfObjectUrl) {
      window.open(this.pdfObjectUrl, '_blank');
    }
  }

  emitRemoveImage($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();

    this.clearFileState();
    this.image = undefined;
    this.imgFile = undefined;

    this.removeImage.emit();
  }

  downloadExcel(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.excelObjectUrl || !this.excelFileName) {
      return;
    }

    const link = document.createElement('a');
    link.href = this.excelObjectUrl;
    link.download = this.excelFileName;
    link.click();
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
    const extensions: string[] = [];

    if (this.customExtentionsImgs) {
      extensions.push('.png', '.jpg', '.jpeg');
    } else if (this.sycAttachmentCategory?.sycAttachmentTypeDto?.length) {
      this.sycAttachmentCategory.sycAttachmentTypeDto.forEach((item) => {
        extensions.push(`.${String(item.extension).replace(/^\./, '').toLowerCase()}`);
      });
    }

    if (this.allowExcel) {
      extensions.push('.xlsx', '.xls');
    }

    // PDF is always supported
    extensions.push('.pdf');

    this.acceptedExtensionsArr = [...new Set(extensions)];
    this.acceptedExtensions = this.acceptedExtensionsArr.join(',');
  }

  hasValidExtension(fileName: string, exts: string[]) {
    const lower = fileName.toLowerCase();
    return exts.some((ext) => lower.endsWith(ext));
  }

  isExcelFile(file: File): boolean {
    return /\.(xlsx|xls)$/i.test(file.name);
  }

  checkImageSize(imgSize: number) {
    const maxFileSize = this.sycAttachmentCategory.maxFileSize * this.mbToByteConversionFactor;
    return imgSize > maxFileSize;
  }

  getAttachRatio() {
    this.getSycAttachmentCategoriesByCodes(['LOGO', 'BANNER', 'IMAGE']).subscribe((result) => {
      // LOGO and BANNER are explicit; anything else falls back to IMAGE
      const code =
        this.attachmentTypeCode === 'LOGO' || this.attachmentTypeCode === 'BANNER'
          ? this.attachmentTypeCode
          : 'IMAGE';

      const selectedCat = result.find((item) => item.code === code);

      if (selectedCat) {
        this.sycAttachmentCategory = selectedCat;
        this.applyAspectFromCategory(selectedCat);
      }
    });
  }

  private applyAspectFromCategory(cat: SycAttachmentCategoryDto): void {
    if (!cat || !cat.aspectRatio) {
      return;
    }

    const [w, h] = String(cat.aspectRatio).split(':');

    if (!w || !h || isNaN(+w) || isNaN(+h)) {
      return;
    }

    let width = Number(w);
    let height = Number(h);

    if (this.selectedOrientation === 'Landscape') {
      [width, height] = [height, width];
    }

    this.acceptedAspectRatio = width / height;

    this.detectSupportedExtensions();

    // keep the host size in sync with the ratio
    if (this.staticWidth) {
      this.staticHeight = this.staticWidth / this.acceptedAspectRatio;
    } else if (this.staticHeight) {
      this.staticWidth = this.staticHeight * this.acceptedAspectRatio;
    }
  }

  /** Revokes any blob URLs and resets the PDF / Excel state. */
  private clearFileState(): void {
    if (this.pdfObjectUrl) {
      URL.revokeObjectURL(this.pdfObjectUrl);
    }
    if (this.excelObjectUrl) {
      URL.revokeObjectURL(this.excelObjectUrl);
    }

    this.isPdf = false;
    this.isExcel = false;
    this.pdfObjectUrl = null;
    this.excelObjectUrl = null;
    this.excelFileName = null;
  }
}