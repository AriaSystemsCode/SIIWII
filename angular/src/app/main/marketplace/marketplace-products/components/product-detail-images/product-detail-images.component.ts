import { Component, EventEmitter, Input, Output, ElementRef, ViewChild, OnDestroy } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";   // ⬅ add this
import { AppConsts } from "@shared/AppConsts";
import { AppEntityAttachmentDto } from "@shared/service-proxies/service-proxies";

type MediaKind = 'image' | 'video' | 'pdf' | 'other';

@Component({
  selector: "app-product-detail-images",
  templateUrl: "./product-detail-images.component.html",
  styleUrls: ["./product-detail-images.component.scss"],
})
export class ProductDetailImagesComponent implements OnDestroy {
  @Input()   productImages: AppEntityAttachmentDto[] = [];
  @Input() colorAttachmentForMainIamge: string;
  @Input() colorView: boolean = false;
  @Output() setColorView = new EventEmitter<boolean>();

  @ViewChild('pdfViewer') pdfViewerRef: ElementRef<HTMLIFrameElement>;

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  currentIndex = 0;
  translateY = 0;
  // productImagess: any[] = [];

  // UI flags like in order preview
  loadingError = false;
  showbar = false;

  private currentBlobUrl?: string; // keep to revoke()

  constructor(private sanitizer: DomSanitizer, private http: HttpClient) {}

  ngOnInit(): void {
    // demo data
    // this.productImages = [
    //   { url: 'assets/placeholders/pdff.pdf', mimeType: 'application/pdf' } as any,
    //   { url: 'assets/placeholders/v1.mp4',   mimeType: 'video/mp4' } as any,
    //   { url: 'assets/placeholders/noAdv.png', mimeType: 'image/png' } as any,
    // ];
    this.currentIndex = 0;
    this.tryLoadPdfForCurrent(); // load if first item is PDF
  }

  ngOnDestroy(): void {
    this.revokeBlobUrl();
  }

  // ===== gallery helpers (mostly your existing code) =====
  getUrl(a: any): string {
    const url = (a?.url ?? '').trim();
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('assets/')) return `/${url}`;
    return `${this.attachmentBaseUrl?.replace(/\/$/,'')}/${url.replace(/^\//,'')}`;
  }

  toSafeUrl(a: any): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.getUrl(a));
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
    this.tryLoadPdfForCurrent(); // ⬅ load/reload PDF when selecting a thumb
  }

  slideToNextImage(): void {
    if (!this.mediaLen) return;
    this.setColorView.emit(false);
    this.colorView = false;
    this.currentIndex = (this.currentIndex + 1) % this.mediaLen;
    this.translateY = -this.currentIndex * 50;
    this.tryLoadPdfForCurrent();
  }

  slideToPreviousImage(): void {
    if (!this.mediaLen) return;
    this.setColorView.emit(false);
    this.colorView = false;
    this.currentIndex = (this.currentIndex - 1 + this.mediaLen) % this.mediaLen;
    this.translateY = -this.currentIndex * 50;
    this.tryLoadPdfForCurrent();
  }

  // ===== PDF loader (OrderPreview-like) =====
  private tryLoadPdfForCurrent(): void {
    // If current is not PDF, clear iframe + blob and stop
    if (this.kindOf(this.productImages[this.currentIndex]) !== 'pdf') {
      this.clearIframeSrc();
      this.revokeBlobUrl();
      this.loadingError = false;
      this.showbar = false;
      return;
    }

    const url = this.getUrl(this.productImages[this.currentIndex]);
    this.showbar = true;
    this.loadingError = false;

    // Try to fetch as Blob (needs CORS if cross-origin)
    this.http.get(url, { responseType: 'blob' as const }).subscribe({
      next: (blob) => {
        // Some servers mislabel; enforce the type so the viewer opens
        const pdfBlob = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });

        // cleanup previous
        this.revokeBlobUrl();

        // create new blob url and set iframe src
        this.currentBlobUrl = URL.createObjectURL(pdfBlob);
        const iframe = this.pdfViewerRef?.nativeElement;
        if (iframe) iframe.src = this.currentBlobUrl;

        // leave spinner until (load) fires
      },
      error: () => {
        // If CORS blocks fetch, fall back to direct URL in iframe
        // (no fetch; just let browser load it)
        this.revokeBlobUrl();
        const iframe = this.pdfViewerRef?.nativeElement;
        if (iframe) iframe.src = url; // may still be blocked by X-Frame-Options
        // keep spinner; onPdfLoaded() will hide it if it succeeds
      }
    });
  }

  onPdfLoaded(): void {
    this.showbar = false;
    this.loadingError = false;
  }

  private clearIframeSrc(): void {
    const iframe = this.pdfViewerRef?.nativeElement;
    if (iframe) iframe.src = 'about:blank';
  }

  private revokeBlobUrl(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = undefined;
    }
  }

  downloadFile(item: any) {
    const url = this.getUrl(item);
    const fname = (item?.fileName?.trim?.()) ||
                  url.split('?')[0].split('#')[0].split('/').pop() ||
                  'file.pdf';
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', fname);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
