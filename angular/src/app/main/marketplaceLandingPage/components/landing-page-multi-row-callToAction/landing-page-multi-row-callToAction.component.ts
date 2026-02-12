import { Component, Injector, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {  SafeResourceUrl } from '@angular/platform-browser';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, PageSettingDto, SydObjectsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
type MediaKind = 'image' | 'video' | 'pdf' | 'other';
@Component({
  selector: 'app-multi-row-callAction',
  templateUrl: './landing-page-multi-row-callToAction.component.html',
  styleUrls: ['./landing-page-multi-row-callToAction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageMultiRowCallToActionComponent extends AppComponentBase implements OnInit {
  @Input() sectionId!: number;

  sliderItems: PageSettingDto[] = [];
  pageGroups: PageSettingDto[][] = [];
  attachmentSafeMap: Record<number, SafeResourceUrl | null> = {};

  private objectUrlById: Record<number, string> = {};
  acceptedAspectRatio;

  currencyCode: string; 
  languageSettingName:string  =AppConsts.languageSettingName
  showMsrP:boolean

  itemEv 
  constructor(
    injector: Injector,
    private sydObjectsService: SydObjectsServiceProxy,
    private router: Router,
    private cdr: ChangeDetectorRef,
      private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
  ) { super(injector); }

  ngOnInit(): void {
    this.itemEv ={
      "appEvent": {
          "entityId": 501760,
          "userName": "Lindsey Lohan",
          "userId": 30719,
          "isOnLine": true,
          "isPublished": true,
          "logoURL": "attachments/2486/400e9a92-76f2-5a45-d599-ce247adc507f.jpg",
          "banarURL": "attachments/2486/365c5c65-cef4-d23c-e5ef-891f7c159df4.jpg",
          "status": "Started",
          "guestsCount": 0,
          "address1": null,
          "address2": null,
          "city": null,
          "state": null,
          "postal": null,
          "country": null,
          "fromDate": "2026-02-11T18:03:53",
          "utcFromDateTime": "2026-02-12T03:03:00",
          "utcToDateTime": "2026-02-12T03:03:00",
          "toDate": "2026-12-12T18:03:53",
          "fromTime": "2026-02-11T18:03:00",
          "toTime": "2026-02-11T18:03:00",
          "privacy": false,
          "guestCanInviteFriends": false,
          "name": "event good to goooo",
          "code": "Event2486Wed,Feb-11,2026-18:03 PM",
          "description": "font-weight-normal mt-5 p-5 text-center w-100 ng-tns-c442-14 ng-star-inserted",
          "timeZone": "Alaskan Standard Time",
          "registrationLink": "https://app-testing.siiwii.net/",
          "attachments": null,
          "address": null,
          "profilePictureId": "c912cde9-30c1-4fcd-cde9-3a128bcbef83",
          "id": 10481
      },
      "currentUserResponce": 0,
      "currentFromDateTime": "0001-01-01T00:00:00",
      "currentToDateTime": "0001-01-01T00:00:00"
  }
    this.initCurrencyCode();  
    this.getSettingData()

    if (this.sectionId) {
      this.getBlocksData();
    }
  }

  private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
    const ao = Number.isFinite((a as any)?.order) ? (a as any).order as number : Number.MAX_SAFE_INTEGER;
    const bo = Number.isFinite((b as any)?.order) ? (b as any).order as number : Number.MAX_SAFE_INTEGER;
    return (ao - bo) || (((a as any)?.id ?? 0) - ((b as any)?.id ?? 0));
  };

  private getBlocksData(): void {
    this.sydObjectsService.getAllSectionBlocks(this.sectionId).subscribe({
      next: (res) =>{ this.applyData(res ?? []);},
      error: () => this.applyData([])
    });
    
  }

  private applyData(blocks: PageSettingDto[]): void {
    this.sliderItems = blocks.slice().sort(this.compareByOrder);
    // this.sliderItems.filter(b => b.blockType === 'Attachment' && this.isPdf(b?.image)).forEach(b => this.ensurePdfSafeUrl(b));

    this.pageGroups = this.chunk(this.sliderItems, 12); // 3x3 per slide
  
    this.cdr.markForCheck();
  }
  private prepareGroupPdfs(i: number) {
    const group = this.pageGroups[i] ?? [];
    group
      .filter(b => b.blockType === 'Attachment' && this.isPdf(b?.image))
      // .forEach(b => this.ensurePdfSafeUrl(b));
  }
  
  onCarouselPage(e: { page: number }) {
    this.prepareGroupPdfs(e.page);
    this.cdr.markForCheck();
  }
  

  private chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  goToProduct(ssin?: string) {
    if (ssin) this.router.navigate(['/app/main/app-items/view', ssin]);
  }
  goToBrand(brand) {
   
    this.router.navigate(
        ['/app/main/marketplace/products'],
        { queryParams: { brand: brand?.getAppEntityForViewDto?.appEntity?.id } } 
    );
}
goToCategory(cat: { name: string; id: number | string }) {
   
  this.router.navigate(
      ['/app/main/marketplace/products'],
      { queryParams: { cat: cat.id } }  
  );
}

getAspectatio(): void {
  this.getSycAttachmentCategoriesByCodes(['LOGO', 'BANNER', 'IMAGE'])
    .subscribe(result => {

      const imgCat = result.find(x => x.code === 'IMAGE');

      if (imgCat?.aspectRatio) {
      
        const [w, h] = imgCat.aspectRatio.split(':').map(Number);

        if (w && h) {
          this.acceptedAspectRatio = h / w; 
        }
      }
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
  // private async ensurePdfSafeUrl(b: PageSettingDto): Promise<void> {
  //   try {
  //     if (!b?.id || !this.isPdf(b.image)) return;
  
  //     // already prepared for this id
  //     if (this.attachmentSafeMap[b.id]) return;
  
  //     const url = this.fullUrl(b.image);
  
  //     // ---- Route A: backend returns Base64; convert to Blob -> objectURL ----
  //     try {
  //       const base64 = await this.appItems.getFile64FromUrl(url).toPromise();
  
  //       // normalize possible "data:...;base64,..." format
  //       const raw = (base64 && base64.includes(',')) ? base64.split(',')[1] : base64;
  
  //       const bytes = atob(raw);
  //       const arr = new Uint8Array(bytes.length);
  //       for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  
  //       const blob = new Blob([arr], { type: 'application/pdf' });
  
  //       // revoke any previous object URL for this id
  //       const old = this.objectUrlById[b.id];
  //       if (old) { try { URL.revokeObjectURL(old); } catch {} }
  
  //       const objUrl = URL.createObjectURL(blob);
  //       this.objectUrlById[b.id] = objUrl;
  
  //       const safe = this.sanitizer.bypassSecurityTrustResourceUrl(objUrl);
  
  //       // ✅ OnPush-friendly: replace the whole map (new reference)
  //       this.attachmentSafeMap = { ...this.attachmentSafeMap, [b.id]: safe };
  //       this.cdr.markForCheck();
  //       return;
  //     } catch {
  //       // fall through to Route B
  //     }
  
  //     // ---- Route B: final fallback — direct URL (requires server allows frame-ancestors) ----
  //     const safe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  //     this.attachmentSafeMap = { ...this.attachmentSafeMap, [b.id]: safe };
  //     this.cdr.markForCheck();
  //   } catch {
  //     // if anything above exploded, set null to avoid re-trying in a tight loop
  //     if (b?.id) {
  //       this.attachmentSafeMap = { ...this.attachmentSafeMap, [b.id]: null };
  //       this.cdr.markForCheck();
  //     }
  //   }
  // }
  


 

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

  viewProduct(prod: any) {
    const productBodyRequestForView = {
        id: prod?.appItem?.id,
        // currencyCode: this.currency,
        sellerSSIN: prod?.sellerSSIN,
        // buyerSSIN : this.buyerSSIN
    };
    localStorage.setItem("productData", JSON.stringify(productBodyRequestForView))
    this.router.navigate(["/app/main/marketplace/products/view", prod?.appItem?.id]);
 
    // this.router.navigateByUrl(`/view/${id}`)
}

getAttachmentImage(b: PageSettingDto): string | null {
  if (!b) return null;

  // 1) block.image itself is an image path
  if (this.isImg(b.image)) {
    return this.fullUrl(b.image);
  }

  // 2) try entityAttachments: find first image attachment
  const imgAtt = b.entityAttachments?.find(att =>
    this.isImg(att?.url || att?.fileName)
  );

  if (imgAtt) {
    return this.fullUrl(imgAtt.url || imgAtt.fileName);
  }

  return null;
}


hasPdfAttachment(b: PageSettingDto): boolean {
  if (!b?.entityAttachments) return false;
  return b.entityAttachments.some(att =>
    this.isPdf(att?.url || att?.fileName)
  );
}


getAttachmentPdfUrl(b: PageSettingDto): string | null {
  if (!b?.entityAttachments) return null;

  const pdfAtt = b.entityAttachments.find(att =>
    this.isPdf(att?.url || att?.fileName)
  );
  if (!pdfAtt) return null;

  return this.fullUrl(pdfAtt.url || pdfAtt.fileName);
}


getAttachmentClickUrl(b: PageSettingDto): string | null {
  if (!b) return null;

 
  const pdfUrl = this.getAttachmentPdfUrl(b);
  if (pdfUrl) {
    return pdfUrl;
  }

  if ((b as any).link)        return (b as any).link;
  if (b.externalUrl)          return b.externalUrl;
  if (b.linkPageUrl)          return b.linkPageUrl;


  if (b.image) return this.fullUrl(b.image);

  return null;
}


onAttachmentClick(b: PageSettingDto): void {
  const url = this.getAttachmentClickUrl(b);
  if (!url) { return; }

  const finalUrl = /^https?:\/\//i.test(url) ? url : this.fullUrl(url);
  window.open(finalUrl, '_blank');
}

private initCurrencyCode(): void {
  // 1) try localStorage("currencyCode")
  const stored = localStorage.getItem('currencyCode');

  if (stored && stored !== 'undefined' && stored !== 'null') {
    try {
      const parsed = JSON.parse(stored);

      // stored as "GBP"
      if (typeof parsed === 'string' && parsed.trim()) {
        this.currencyCode = parsed.trim();
        return;
      }

      // stored as { code: "GBP", ... }
      if (parsed && typeof parsed === 'object' && parsed.code) {
        this.currencyCode = parsed.code;
        return;
      }
    } catch {
      // not JSON, maybe raw 'GBP'
      if (stored.trim()) {
        this.currencyCode = stored.trim();
        return;
      }
    }
  }

  // 2) fallback to tenant default currency from AppComponentBase
  if ((this as any).tenantDefaultCurrency?.code) {
    this.currencyCode = (this as any).tenantDefaultCurrency.code;
    return;
  }

  // 3) last fallback
  this.currencyCode = 'USD';
}
getSettingData(){
  this._AppEntitiesServiceProxy.getHostSettingValue(1214, null)
  .subscribe((result) => {
    this.showMsrP = result?.toString().toLowerCase() =='yes' ? true : false;

  });

}
ngOnDestroy() {
  Object.values(this.objectUrlById).forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
  this.objectUrlById = {};
}
}
