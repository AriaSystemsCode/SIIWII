import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';
import { AppEntityAttachmentDto, AppItemsServiceProxy } from '@shared/service-proxies/service-proxies';

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



  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private _appItemsServiceProxy: AppItemsServiceProxy,) {}

  ngOnInit() {
    this.currentIndex = 0;
    this.preparePdfIfNeeded(this.currentIndex);
  }

  ngOnDestroy(): void {
    this.revokeAllObjectUrls();
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
  /** Cache: safe blob URLs by original path */
private pdfSafeByPath: Record<string, SafeResourceUrl> = {};
/** Track object URLs by original path to revoke them later */
private objectUrlByPath: Record<string, string> = {};

  private async preparePdfIfNeeded(index: number) {
    const item = this.productImages[index];
    this.loadingError = false;
  
    if (!item || this.kindOf(item) !== 'pdf') {
      this.pdfSafeMap[index] = null;
      return;
    }
  
    const path = (item.url ?? '').trim();
    const fullUrl = this.getUrl(item);                 // absolute URL to the file
    const cacheHit = this.pdfSafeByPath[path];
    if (cacheHit) {
      this.pdfSafeMap[index] = cacheHit;
      return;
    }
  
    try {
      // ---- Route A: ask your API to fetch + return Base64 (same-origin) ----
      // NOTE: change the service name & method to yours
      const res = await this._appItemsServiceProxy.getFile64FromUrl(fullUrl).toPromise();
  
      // normalize "data:...;base64,..." vs raw base64
      const base64 = (res && typeof res === 'string' && res.includes(',')) ? res.split(',')[1] : res;
  
      // base64 -> Blob (PDF)
      const byteChars = atob(base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
  
      // manage objectURL lifecycle (revoke old if existed)
      this.revokeObjectUrlByPath(path);
      const objUrl = URL.createObjectURL(blob);
      this.objectUrlByPath[path] = objUrl;
  
      // sanitize for iframe [src]
      const safe = this.sanitizer.bypassSecurityTrustResourceUrl(objUrl);
      this.pdfSafeByPath[path] = safe;
      this.pdfSafeMap[index] = safe;
      this.loadingError = false;
      return;
    } catch {
      // ---- Route B: fallback try direct GET as Blob (requires CORS with creds) ----
      try {
        const blob = await this.http.get(fullUrl, {
          responseType: 'blob' as const,
          withCredentials: true,
        }).toPromise();
  
        const asPdf = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
  
        this.revokeObjectUrlByPath(path);
        const objUrl = URL.createObjectURL(asPdf);
        this.objectUrlByPath[path] = objUrl;
  
        const safe = this.sanitizer.bypassSecurityTrustResourceUrl(objUrl);
        this.pdfSafeByPath[path] = safe;
        this.pdfSafeMap[index] = safe;
        this.loadingError = false;
        return;
      } catch {
        // ---- Route C: final fallback (direct URL) — needs frame-ancestors allowed ----
        try {
          const safe = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
          this.pdfSafeByPath[path] = safe;
          this.pdfSafeMap[index] = safe;
          this.loadingError = false;
        } catch {
          this.loadingError = true;
          this.pdfSafeMap[index] = null;
        }
      }
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
}
