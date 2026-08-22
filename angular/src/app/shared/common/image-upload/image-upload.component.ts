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

  constructor(injector: Injector) {
    super(injector);
    this.inputID = this.guid();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // when the sycAttachmentCategory is passed directly from parent
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
  
  
  

  async fileChange($event: { target: { files: FileList; value: any } }) {
    const inputEl = $event.target as HTMLInputElement;
    const imgFile = inputEl.files && inputEl.files[0];
    const resetInput = () => (inputEl.value = null);
  
    if (!imgFile) {
      return;
    }
  
    // 👇 Detect PDF
    const isPdfFile =
      imgFile.type === 'application/pdf' ||
      imgFile.name.toLowerCase().endsWith('.pdf');
  
    // 🔒 Validate extension ONLY for non-PDF files
    if (!isPdfFile && this.acceptedExtensionsArr?.length) {
      const isValidExtension = this.hasValidExtension(
        imgFile.name,
        this.acceptedExtensionsArr
      );
      if (!isValidExtension) {
        this.message.warn(this.l('UnsupportedExtension'));
        resetInput();
        return;
      }
    }
  
    //  Max file size (applies to both images & PDFs)
    if (this.checkImageSize(imgFile.size)) {
      this.message.error(this.l('MaxFileSizeExceeded'));
      resetInput();
      return;
    }
  
    // 📄 PDF branch
    if (isPdfFile) {
      // cleanup previous PDF url if any
      if (this.rawPdfUrl) {
        URL.revokeObjectURL(this.rawPdfUrl);
      }
  
      this.isPdf = true;
      this.image = undefined;
      this.imgFile = imgFile;
  
      // create object URL for opening in new tab
      this.rawPdfUrl = URL.createObjectURL(imgFile);
      this.pdfObjectUrl = this.rawPdfUrl;
  
      // emit with file, image = null
      this.imageBrowseDone.emit({ file: this.imgFile, image: null });
  
      resetInput();
      return;
    }
  
    // 🖼 IMAGE branch
    this.isPdf = false;
    this.pdfObjectUrl = null;
  
    const renderedImage = await this.renderImageAndGetDimensions(imgFile);
    const currentAspectRatio = renderedImage.width / renderedImage.height;
    const buffer = 0.2;
  
    if (
      this.acceptedAspectRatio - buffer < currentAspectRatio &&
      this.acceptedAspectRatio + buffer > currentAspectRatio
    ) {
      //  Aspect ratio is within tolerance
      this.image = (renderedImage as any).src;
      this.imgFile = imgFile;
      this.imageBrowseDone.emit({ file: this.imgFile, image: this.image });
    } else {

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
   
    event.preventDefault();
    event.stopPropagation();

    if (this.pdfObjectUrl) {
      window.open(this.pdfObjectUrl, '_blank');
    }
  }

  emitRemoveImage($event: MouseEvent) {
 
    $event.preventDefault();
    $event.stopPropagation();


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
  

    if (this.customExtentionsImgs) {
      this.acceptedExtensionsArr = ['.png', '.jpg', '.jpeg'];
      this.acceptedExtensions = 'PNG, JPG, JPEG';
      return;
    }
  
   
    if (this.sycAttachmentCategory?.sycAttachmentTypeDto?.length) {
      this.sycAttachmentCategory.sycAttachmentTypeDto.forEach((item, index) => {
        const ext = `.${String(item.extension).toLowerCase()}`;
        this.acceptedExtensionsArr.push(ext);
        this.acceptedExtensions += (index ? ',' : '') + ext;
      });
    }
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
  debugger
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
  
 
  
}
