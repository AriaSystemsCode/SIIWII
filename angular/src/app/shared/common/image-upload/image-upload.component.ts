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
  sycAttachmentCategoryLogo :SycAttachmentCategoryDto
  sycAttachmentCategoryBanner :SycAttachmentCategoryDto
  sycAttachmentCategoryImage :SycAttachmentCategoryDto
  @Input() attachmentTypeCode: 'LOGO' | 'BANNER' | 'IMAGE' = 'IMAGE';
  @Input() customExtentionsImgs : boolean;
   @Input() selectedOrientation: 'Portrait' | 'Landscape' = 'Portrait';


   @Input() allowExcel: boolean = true;

isExcel = false;
excelFileName: string | null = null;

private excelObjectUrl: string | null = null;


  constructor(injector: Injector) {
    super(injector);
    this.inputID = this.guid();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // when the sycAttachmentCategory is passed directly from parent
      if (changes['allowExcel']) {
    this.detectSupportedExtensions();
  }

    if (
      changes['sycAttachmentCategory'] &&
      this.sycAttachmentCategory &&
      this.sycAttachmentCategory.aspectRatio
    ) {
      this.applyAspectFromCategory(this.sycAttachmentCategory);
    }
  
    // when user changes Logo/Banner/Image in parent
    if (changes['attachmentTypeCode'] && this.attachmentTypeCode) {
      this.getAttachRatio();   // will set sycAttachmentCategory & ratio accordingly
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
  if (
    (isExcelFile && !this.allowExcel) ||
    (!isPdfFile && !isExcelFile && !isImageFile)
  ) {
    this.message.warn(this.l('UnsupportedExtension'));
    resetInput();
    return;
  }

  // Validate configured extensions for images.
  // Excel and PDF are allowed separately.
  if (
    isImageFile &&
    this.acceptedExtensionsArr?.length &&
    !this.hasValidExtension(
      selectedFile.name,
      this.acceptedExtensionsArr
    )
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

  // Clear previous object URLs
  if (this.rawPdfUrl) {
    URL.revokeObjectURL(this.rawPdfUrl);
    this.rawPdfUrl = null;
  }

  if (this.excelObjectUrl) {
    URL.revokeObjectURL(this.excelObjectUrl);
    this.excelObjectUrl = null;
  }

  this.isPdf = false;
  this.isExcel = false;
  this.pdfObjectUrl = null;
  this.excelFileName = null;

  // EXCEL
  if (isExcelFile) {
    this.isExcel = true;
    this.image = undefined;
    this.imgFile = selectedFile;
    this.excelFileName = selectedFile.name;

    this.excelObjectUrl = URL.createObjectURL(selectedFile);

    this.imageBrowseDone.emit({
      file: selectedFile,
      image: null
    });

    resetInput();
    return;
  }

  // PDF
  if (isPdfFile) {
    this.isPdf = true;
    this.image = undefined;
    this.imgFile = selectedFile;

    this.rawPdfUrl = URL.createObjectURL(selectedFile);
    this.pdfObjectUrl = this.rawPdfUrl;

    this.imageBrowseDone.emit({
      file: selectedFile,
      image: null
    });

    resetInput();
    return;
  }

  // IMAGE
  const renderedImage =
    await this.renderImageAndGetDimensions(selectedFile);

  const currentAspectRatio =
    renderedImage.width / renderedImage.height;

  const buffer = 0.2;

  if (
    !this.acceptedAspectRatio ||
    (
      this.acceptedAspectRatio - buffer < currentAspectRatio &&
      this.acceptedAspectRatio + buffer > currentAspectRatio
    )
  ) {
    this.image = renderedImage.src;
    this.imgFile = selectedFile;

    this.imageBrowseDone.emit({
      file: this.imgFile,
      image: this.image
    });
  } else {
    const { onCropDone, data } = this.openImageCropper(
      $event as any,
      this.acceptedAspectRatio
    );

    const subs = onCropDone.subscribe(() => {
      if (data.isCropDone) {
        this.image = data.croppedImageAsBase64 as string;

        this.imgFile = new File(
          [data.croppedImage],
          selectedFile.name,
          {
            type: selectedFile.type || 'image/png'
          }
        );

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

  onPdfThumbClick(event: MouseEvent): void {
   
    event.preventDefault();
    event.stopPropagation();

    if (this.pdfObjectUrl) {
      window.open(this.pdfObjectUrl, '_blank');
    }
  }

  // emitRemoveImage($event: MouseEvent) {
 
  //   $event.preventDefault();
  //   $event.stopPropagation();


  //   if (this.rawPdfUrl) {
  //     URL.revokeObjectURL(this.rawPdfUrl);
  //     this.rawPdfUrl = null;
  //   }

  //   this.isPdf = false;
  //   this.pdfObjectUrl = null;
  //   this.image = undefined;
  //   this.imgFile = undefined;

  //   this.removeImage.emit();
  // }

emitRemoveImage($event: MouseEvent) {
  $event.preventDefault();
  $event.stopPropagation();

  if (this.rawPdfUrl) {
    URL.revokeObjectURL(this.rawPdfUrl);
    this.rawPdfUrl = null;
  }

  if (this.excelObjectUrl) {
    URL.revokeObjectURL(this.excelObjectUrl);
    this.excelObjectUrl = null;
  }

  this.isPdf = false;
  this.isExcel = false;

  this.pdfObjectUrl = null;
  this.excelFileName = null;

  this.image = undefined;
  this.imgFile = undefined;

  this.removeImage.emit();
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

  // detectSupportedExtensions() {
  //   this.acceptedExtensionsArr = [];
  //   this.acceptedExtensions = '';
  

  //   if (this.customExtentionsImgs) {
  //     this.acceptedExtensionsArr = ['.png', '.jpg', '.jpeg'];
  //     this.acceptedExtensions = 'PNG, JPG, JPEG';
  //     return;
  //   }
  
   
  //   if (this.sycAttachmentCategory?.sycAttachmentTypeDto?.length) {
  //     this.sycAttachmentCategory.sycAttachmentTypeDto.forEach((item, index) => {
  //       const ext = `.${String(item.extension).toLowerCase()}`;
  //       this.acceptedExtensionsArr.push(ext);
  //       this.acceptedExtensions += (index ? ',' : '') + ext;
  //     });
  //   }
  // }


detectSupportedExtensions() {
  this.acceptedExtensionsArr = [];
  this.acceptedExtensions = '';

  if (this.customExtentionsImgs) {
    this.acceptedExtensionsArr = [
      '.png',
      '.jpg',
      '.jpeg'
    ];
  } else if (
    this.sycAttachmentCategory?.sycAttachmentTypeDto?.length
  ) {
    this.sycAttachmentCategory.sycAttachmentTypeDto.forEach(
      item => {
        const ext = `.${String(item.extension)
          .replace(/^\./, '')
          .toLowerCase()}`;

        this.acceptedExtensionsArr.push(ext);
      }
    );
  }

  // Add Excel support
  if (this.allowExcel) {
    this.acceptedExtensionsArr.push('.xlsx', '.xls');
  }

  // Keep existing PDF support
  this.acceptedExtensionsArr.push('.pdf');

  this.acceptedExtensionsArr = [
    ...new Set(this.acceptedExtensionsArr)
  ];

  this.acceptedExtensions =
    this.acceptedExtensionsArr.join(',');
}

  

  hasValidExtension(fileName: string, exts: string[]) {
    const lower = fileName.toLowerCase();
    return exts.some(ext => lower.endsWith(ext));
  }
 private applyAspectFromCategory(cat: SycAttachmentCategoryDto): void {
  if (!cat || !cat.aspectRatio) {
    return;
  }

  const aspect = String(cat.aspectRatio);
  const [w, h] = aspect.split(':');

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

  // update crop size if needed
  if (this.staticWidth) {
    this.staticHeight = this.staticWidth / this.acceptedAspectRatio;
  } else if (this.staticHeight) {
    this.staticWidth = this.staticHeight * this.acceptedAspectRatio;
  }
}
  
  getAttachRatio() {
    this.getSycAttachmentCategoriesByCodes(['LOGO', 'BANNER', 'IMAGE'])
      .subscribe((result) => {
        result.forEach((item) => {
          if (item.code === 'LOGO') {
            this.sycAttachmentCategoryLogo = item;
          } else if (item.code === 'BANNER') {
            this.sycAttachmentCategoryBanner = item;
          }
           else if (item.code === 'IMAGE') {
            this.sycAttachmentCategoryImage = item;
          }
        });
  
        // choose based on selected radio
        let selectedCat: SycAttachmentCategoryDto;
  
        switch (this.attachmentTypeCode) {
          case 'LOGO':
            selectedCat = this.sycAttachmentCategoryLogo;
            break;
          case 'BANNER':
            selectedCat = this.sycAttachmentCategoryBanner;
            break;
          default:
            selectedCat = this.sycAttachmentCategoryImage;
            break;
        }
  
        if (selectedCat) {
          this.sycAttachmentCategory = selectedCat;
          this.applyAspectFromCategory(selectedCat);
        }
      });
  }
  
    prevetFileBrowse($event){
        $event.stopPropagation();
        let labelElement = $event.target.parentElement
        labelElement.onclick = (e)=> e.preventDefault()
        setTimeout( ()=> labelElement.onclick = ()=>{} ,0)
    }
  
    checkImageSize(imgSize:number){
        const maxFileSize = this.sycAttachmentCategory.maxFileSize * this.mbToByteConversionFactor
        return imgSize > maxFileSize
    }
  
 
    isExcelFile(file: File): boolean {
  return /\.(xlsx|xls)$/i.test(file.name);
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
  
}
