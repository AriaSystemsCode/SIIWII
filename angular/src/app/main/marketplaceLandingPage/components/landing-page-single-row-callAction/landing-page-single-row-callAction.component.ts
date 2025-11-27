import { Component, Injector, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PageSettingDto, SydObjectsServiceProxy, AppItemsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';

type MediaKind = 'image' | 'video' | 'pdf' | 'other';

@Component({
  selector: 'app-single-row-callAction',
  templateUrl: './landing-page-single-row-callAction.component.html',
  styleUrls: ['./landing-page-single-row-callAction.component.scss'],
})
export class LandingPageSinglrRowCallActionComponent extends AppComponentBase implements OnInit {
  @Input() sectionId!: number;
  items: PageSettingDto[] = [];

  attachmentBaseUrl = AppConsts.attachmentBaseUrl;

  attachmentSafeMap: Record<number, SafeResourceUrl | null> = {};

  private objectUrlById: Record<number, string> = {};

  constructor(
    injector: Injector,
    private syd: SydObjectsServiceProxy,
    private appItems: AppItemsServiceProxy,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { super(injector); }

  ngOnInit() {
    if (this.sectionId) this.getBlocksData();
  }

  ngOnDestroy() {
    Object.values(this.objectUrlById).forEach(url => { try { URL.revokeObjectURL(url); } catch {} });
    this.objectUrlById = {};
  }

  get blocksSorted(): PageSettingDto[] {
    const cmp = (a: PageSettingDto, b: PageSettingDto) => {
      const ao = Number.isFinite(a.order as any) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
      const bo = Number.isFinite(b.order as any) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
      return (ao - bo) || ((a.id ?? 0) - (b.id ?? 0));
    };
    return (this.items ?? []).slice().sort(cmp);
  }

  getBlocksData() {
    this.syd.getAllSectionBlocks(this.sectionId).subscribe(res => {
      this.items = res ?? [];
      console.log(res,'res')

      // Pre-prepare PDFs so iframes have src ready
      this.items
        .filter(b => b.blockType === 'Attachment' && this.isPdf(b?.image))
        // .forEach(b => this.ensurePdfSafeUrl(b));
    });
  }

  fullUrl(path?: string): string {
    const p = (path ?? '').trim();
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    if (p.startsWith('assets/')) return `/${p}`;
    return `${this.attachmentBaseUrl?.replace(/\/$/,'')}/${p.replace(/^\//,'')}`;
  }

  isPdf(path?: string)   { return !!path && /\.pdf($|\?)/i.test(path); }
  isImg(path?: string)   { return !!path && /\.(jpe?g|png|webp|gif|svg)($|\?)/i.test(path); }
  isVideo(path?: string) { return !!path && /\.(mp4|webm|ogg)($|\?)/i.test(path); }

  kindOfPath(path?: string): MediaKind {
    if (this.isImg(path)) return 'image';
    if (this.isPdf(path)) return 'pdf';
    if (this.isVideo(path)) return 'video';
    return 'other';
  }

  onImgErr(evt: Event) {
    (evt.target as HTMLImageElement).src = '/assets/placeholders/_logo-placeholder.png';
  }

  // ---------- PDF handling via Base64 API -> blob -> SafeResourceUrl ----------
  // private async ensurePdfSafeUrl(b: PageSettingDto) {
  //   if (!b?.id || !this.isPdf(b.image)) return;

  //   // already prepared
  //   if (this.attachmentSafeMap[b.id]) return;

  //   const url = this.fullUrl(b.image);

  //   try {
  //     // Ask your backend to fetch and return base64 string from URL (same API you already use)
  //     const base64 = await this.appItems.getFile64FromUrl(url).toPromise();

  //     // normalize possible "data:...;base64,..." format
  //     const raw = (base64 && base64.includes(',')) ? base64.split(',')[1] : base64;
  //     const bytes = atob(raw);
  //     const arr = new Uint8Array(bytes.length);
  //     for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);

  //     const blob = new Blob([arr], { type: 'application/pdf' });

  //     // revoke old URL if any
  //     const old = this.objectUrlById[b.id];
  //     if (old) { try { URL.revokeObjectURL(old); } catch {} }

  //     const objUrl = URL.createObjectURL(blob);
  //     this.objectUrlById[b.id] = objUrl;

  //     this.attachmentSafeMap[b.id] = this.sanitizer.bypassSecurityTrustResourceUrl(objUrl);
  //   } catch {
  //     // Final fallback: direct URL (requires server to allow frame-ancestors)
  //     this.attachmentSafeMap[b.id] = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  //   }
  // }

  // ---------- navigation ----------
  goToBrand(brand: { name: string; id: number | string }) {
    this.router.navigate(['/app/main/marketplace/products'], { queryParams: { brand: brand.name } });
  }
  goToCategory(cat: { name: string; id: number | string }) {
    this.router.navigate(['/app/main/marketplace/products'], { queryParams: { cat: cat.name } });
  }

  // ---------- optional download helper ----------
  downloadRaw(path?: string) {
    const href = this.fullUrl(path);
    const a = document.createElement('a');
    a.href = href; a.target = '_blank'; // let server decide inline vs download
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
  openNewTab(path?: string){
    window.open(this.fullUrl(path))
  }
  openTab(path?: string){
    window.open(path)
  }

}
