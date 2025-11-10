import { Component, EventEmitter, Input, Output, ElementRef, ViewChild, OnDestroy } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { AppConsts } from "@shared/AppConsts";
import { AppEntityAttachmentDto } from "@shared/service-proxies/service-proxies";

type MediaKind = 'image' | 'video' | 'pdf' | 'other';

@Component({
  selector: "app-product-detail-images",
  templateUrl: "./product-detail-images.component.html",
  styleUrls: ["./product-detail-images.component.scss"],
})
export class ProductDetailImagesComponent implements OnDestroy {
  @Input()  productImages: AppEntityAttachmentDto[] = [];
  @Input()  colorAttachmentForMainIamge: string;
  @Input()  colorView = false;
  @Output() setColorView = new EventEmitter<boolean>();

  @ViewChild('pdfViewer') pdfViewerRef: ElementRef<HTMLIFrameElement>;

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  currentIndex = 0;
  translateY = 0;

  loadingError = false;
  showbar = false;

  private currentBlobUrl?: string;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.currentIndex = 0;
    this.loadPdfForCurrentIfNeeded();
  }

  ngOnDestroy(): void {
    this.revokeBlobUrl();
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
    this.setColorView.emit(false);
    this.colorView = false;
    this.currentIndex = index;
    this.loadPdfForCurrentIfNeeded();
  }

  slideToNextImage(): void {
    if (!this.mediaLen) return;
    this.setColorView.emit(false);
    this.colorView = false;
    this.currentIndex = (this.currentIndex + 1) % this.mediaLen;
    this.translateY = -this.currentIndex * 50;
    this.loadPdfForCurrentIfNeeded();
  }

  slideToPreviousImage(): void {
    if (!this.mediaLen) return;
    this.setColorView.emit(false);
    this.colorView = false;
    this.currentIndex = (this.currentIndex - 1 + this.mediaLen) % this.mediaLen;
    this.translateY = -this.currentIndex * 50;
    this.loadPdfForCurrentIfNeeded();
  }

  // ---------- PDF like OrderPreview ----------
  private async loadPdfForCurrentIfNeeded() {
    const curr = this.productImages[this.currentIndex];
    if (!curr || this.kindOf(curr) !== 'pdf') {
      this.clearIframe();
      this.revokeBlobUrl();
      this.loadingError = false;
      this.showbar = false;
      return;
    }

    this.showbar = true;
    this.loadingError = false;

    try {
      // Case A: BE returns a public/authorized URL to the PDF (your current array)
      const url = this.getUrl(curr);
      const blob = await this.http.get(url, {
        responseType: 'blob' as const,
        withCredentials: true // keep true if you rely on cookies/session
      }).toPromise();

      // normalize mime
      const pdfBlob = blob.type === 'application/pdf'
        ? blob
        : new Blob([blob], { type: 'application/pdf' });

      this.revokeBlobUrl();
      this.currentBlobUrl = URL.createObjectURL(pdfBlob);
      this.setIframeSrc(this.currentBlobUrl);
      this.loadingError = false;
    } catch (e) {
      // Case B fallback: if CORS/headers block fetch, try direct URL (may be X-Frame blocked)
      try {
        const direct = this.getUrl(curr);
        this.revokeBlobUrl();
        this.setIframeSrc(direct);
        // If server sends X-Frame-Options or CSP, it will still fail. Then show error UI.
      } catch {
        this.loadingError = true;
        this.clearIframe();
      }
    } finally {
      this.showbar = false;
    }
  }

  private setIframeSrc(src: string) {
    const iframe = this.pdfViewerRef?.nativeElement;
    if (iframe) iframe.src = src;
  }

  private clearIframe() {
    const iframe = this.pdfViewerRef?.nativeElement;
    if (iframe) iframe.src = 'about:blank';
  }

  private revokeBlobUrl() {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = undefined;
    }
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
}
