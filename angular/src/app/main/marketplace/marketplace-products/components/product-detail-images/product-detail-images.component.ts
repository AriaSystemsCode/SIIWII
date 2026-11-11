import { Component, EventEmitter, Input, Output, OnDestroy, SimpleChanges } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { AppConsts } from '@shared/AppConsts';
import { AppEntityAttachmentDto, AppItemsServiceProxy } from '@shared/service-proxies/service-proxies';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

type MediaKind = 'image' | 'video' | 'pdf' | 'other';

@Component({
  selector: 'app-product-detail-images',
  templateUrl: './product-detail-images.component.html',
  styleUrls: ['./product-detail-images.component.scss'],
})
export class ProductDetailImagesComponent implements OnDestroy {
  @Input()  productImages: AppEntityAttachmentDto[] = [];
  @Input()  colorAttachmentForMainIamge: string;
  @Input()  colorView = false;
  @Output() setColorView = new EventEmitter<boolean>();

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  currentIndex = 0;
  translateY = 0;

  loadingError = false;
  showbar = false;

  pdfSafeMap: Record<number, SafeResourceUrl | null> = {};

  pdfThumbMap: Record<number, string | null> = {};
  private pdfThumbByPath: Record<string, string> = {};
  pdfThumbLoading = false;
  pdfThumbLoadingMap: Record<number, boolean> = {};


  constructor( private _appItemsServiceProxy: AppItemsServiceProxy,) {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc =
    '/assets/pdfjs/pdf.worker.min.js';

  }

  ngOnInit() {
    this.currentIndex = 0;

    this.preparePdfIfNeeded(this.currentIndex);
    const maxThumbs = Math.min(this.productImages.length, 7);
  for (let i = 0; i < maxThumbs; i++) {
    if (this.kindOf(this.productImages[i]) === 'pdf') {
      this.preparePdfIfNeeded(i);
    }
  }
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productImages'] && this.productImages?.length) {
    
      this.preloadVisiblePdfThumbs();
    }
  }
  ngOnDestroy(): void {
    this.revokeAllObjectUrls();
  }

  private preloadVisiblePdfThumbs() {
    const visibleCount = this.productImages.length <= 7 ? this.productImages.length : 7;

    for (let i = 0; i < visibleCount; i++) {
      if (this.kindOf(this.productImages[i]) === 'pdf') {
        this.preparePdfIfNeeded(i);
      }
    }
  }
  private async buildPdfThumbFromBlob(blob: Blob, targetWidth = 420): Promise<string> {
    const ab = await blob.arrayBuffer();
  
    const loadingTask = (pdfjsLib as any).getDocument({ data: new Uint8Array(ab) });
    const pdf = await loadingTask.promise;
  
    const page1 = await pdf.getPage(1);
  
    const viewport1 = page1.getViewport({ scale: 1 });
    const scale = targetWidth / viewport1.width;
    const viewport = page1.getViewport({ scale });
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
  
    await page1.render({ canvasContext: ctx, viewport }).promise;
  
    //  cleanup
    page1.cleanup?.();
    pdf.destroy?.();
  
    return canvas.toDataURL('image/png');
  }
  
  // --------- helpers ----------
  getUrl(a: any): string {
    const url = (a?.url ?? '').trim();
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('assets/')) return `/${url}`;
    return `${this.attachmentBaseUrl?.replace(/\/$/,'')}/${url.replace(/^\//,'')}`;
  }

  kindOf(a: any): MediaKind {
    const mime = a?.mimeType?.toLowerCase?.() ?? '';
    const url = (a?.url ?? '').toLowerCase();
    if (mime.startsWith('image/')) return 'image';
    if (mime === 'application/pdf') return 'pdf';
    if (mime.startsWith('video/')) return 'video';
    if (/\.(jpe?g|png|webp|gif|svg)$/.test(url)) return 'image';
    if (/\.pdf$/.test(url)) return 'pdf';
    if (/\.(mp4|webm|ogg)$/.test(url)) return 'video';
    return 'other';
  }

  get mediaLen(): number { return this.productImages?.length ?? 0; }

  setMainImage(index: number) {
    this.currentIndex = index;
  
    const isPdf = this.kindOf(this.productImages?.[index]) === 'pdf';

    if (!isPdf) {
      this.setColorView.emit(false);
      this.colorView = false;
    }
  
    this.preparePdfIfNeeded(index);
  }
  

  slideToNextImage(): void {
    if (!this.mediaLen) return;
    this.setColorView.emit(false);
    this.colorView = false;
    this.currentIndex = (this.currentIndex + 1) % this.mediaLen;
    this.translateY = -this.currentIndex * 50;
    this.preparePdfIfNeeded(this.currentIndex);
  }

  slideToPreviousImage(): void {
    if (!this.mediaLen) return;
    this.setColorView.emit(false);
    this.colorView = false;
    this.currentIndex = (this.currentIndex - 1 + this.mediaLen) % this.mediaLen;
    this.translateY = -this.currentIndex * 50;
    this.preparePdfIfNeeded(this.currentIndex);
  }

  // ---------- PDF pipeline (Blob -> objectURL) with safe fallback ----------

/** Track object URLs by original path to revoke them later */
private objectUrlByPath: Record<string, string> = {};

  pdfThumbLoadingIndex: number | null = null;

  private async preparePdfIfNeeded(index: number) {
    const item = this.productImages?.[index];
    this.loadingError = false;
  
    if (!item || this.kindOf(item) !== 'pdf') {
      this.pdfThumbMap[index] = null;
      this.pdfThumbLoadingMap[index] = false;
      return;
    }
  
    this.pdfThumbLoadingMap[index] = true;
  
    const path = (item.url ?? '').trim();
    const fullUrl = this.getUrl(item);
  
    if (this.pdfThumbByPath[path]) {
      this.pdfThumbMap[index] = this.pdfThumbByPath[path];
      this.pdfThumbLoadingMap[index] = false;
      return;
    }
  
    try {
      const res = await this._appItemsServiceProxy.getFile64FromUrl(fullUrl).toPromise();
      const base64 = res.includes(',') ? res.split(',')[1] : res;
  
      const byteChars = atob(base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
  
      const thumb = await this.buildPdfThumbFromBlob(blob, 420);
  
      this.pdfThumbByPath[path] = thumb;
      this.pdfThumbMap[index] = thumb;
    } catch {
      this.loadingError = true;
      this.pdfThumbMap[index] = null;
    } finally {
      this.pdfThumbLoadingMap[index] = false;
    }
  }
  
  
  

  private revokeObjectUrlByPath(path: string) {
    const existing = this.objectUrlByPath[path];
    if (existing) {
      try { URL.revokeObjectURL(existing); } catch {}
      delete this.objectUrlByPath[path];
    }
  }
  
  private revokeAllObjectUrls() {
    Object.keys(this.objectUrlByPath).forEach(p => this.revokeObjectUrlByPath(p));
  }
  

  downloadFile(item: any) {
    const url = this.getUrl(item);
    const fname = (item?.fileName?.trim?.()) ||
      url.split('?')[0].split('#')[0].split('/').pop() || 'file.pdf';
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', fname);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  openNewTab(url:any){
    window.open(this.getUrl(url))

  }
  showImagePreview = false;
previewImageUrl: string = '';

openImagePreview(url: string) {
  if (!url) return;
  this.previewImageUrl = url;
  this.showImagePreview = true;
}

}
