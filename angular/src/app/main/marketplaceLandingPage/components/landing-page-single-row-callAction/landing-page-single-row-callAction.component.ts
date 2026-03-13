import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {  SafeResourceUrl } from '@angular/platform-browser';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountsServiceProxy, PageSettingDto, SydObjectsServiceProxy} from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import {  finalize } from 'rxjs';
import { EventsBrowseComponentActionsMenuFlags } from '@app/main/AppEventsBrowse/models/EventsBrowseComponentActionsMenuFlags';
import { EventsBrowseComponentStatusesFlags } from '@app/main/AppEventsBrowse/models/EventsBrowseComponentStatusesFlags';
import { EventsBrowseActionsEvents } from '@app/main/AppEventsBrowse/models/Events-browse-inputs';

type MediaKind = 'image' | 'video' | 'pdf' | 'other';

@Component({
  selector: 'app-single-row-callAction',
  templateUrl: './landing-page-single-row-callAction.component.html',
  styleUrls: ['./landing-page-single-row-callAction.component.scss'],
})
export class LandingPageSinglrRowCallActionComponent extends AppComponentBase implements OnInit {
  @Input() sectionId!: number;
   @Input()  blockTypeIsSingleOrMixed :string
  @ViewChild("viewEventModal", { static: true }) viewEventModal: ViewEventComponent;

  items: PageSettingDto[] = [];

  attachmentBaseUrl = AppConsts.attachmentBaseUrl;

  attachmentSafeMap: Record<number, SafeResourceUrl | null> = {};
  numVisible: number = 4;
  numVisibleSingle: number = 6;
  
      actionsMenuFlags :   EventsBrowseComponentActionsMenuFlags
      statusesFlags :  EventsBrowseComponentStatusesFlags
  private objectUrlById: Record<number, string> = {};
  acceptedAspectRatio;
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 4
    },
    {
      breakpoint: '1199px',
      numVisible: 4,
      numScroll: 4
    },
    {
      breakpoint: '991px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '767px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1
    }
  ];

    responsiveOptionsSingle = [
    {
      breakpoint: '1400px',
      numVisible: 6,
      numScroll: 6
    },
    {
      breakpoint: '1199px',
      numVisible: 6,
      numScroll: 6
    },
    {
      breakpoint: '991px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '767px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  languageSettingName:string  =AppConsts.languageSettingName;

  constructor(
    injector: Injector,
    private syd: SydObjectsServiceProxy,
    private router: Router,
    private _accountsServiceProxy: AccountsServiceProxy,
  ) { super(injector); }

  ngOnInit() {

 

    if (this.sectionId) {
      this.getBlocksData();
    }
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
    this.syd.getAllSectionBlocks(this.sectionId,Intl.DateTimeFormat().resolvedOptions().timeZone).subscribe(res => {
      this.items = res ?? [];


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

/** Returns true if there is a PDF attachment on this block. */
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

  // Case 2: image + PDF
  const pdfUrl = this.getAttachmentPdfUrl(b);
  if (pdfUrl) {
    return pdfUrl;
  }

  // Case 1: image + external link
  if (b.link) return b.link;
  if (b.externalUrl) return b.externalUrl;
  if (b.linkPageUrl) return b.linkPageUrl;

  // Fallback to the main image/url
  if (b.image) return this.fullUrl(b.image);

  return null;
}


onAttachmentClick(b: PageSettingDto): void {
  const url = this.getAttachmentClickUrl(b);
  if (!url) { return; }

  // if it's relative to attachments, normalize to fullUrl
  const finalUrl = /^https?:\/\//i.test(url) ? url : this.fullUrl(url);
  window.open(finalUrl, '_blank');
}


  eventHandler(event:EventsBrowseActionsEvents,id:number){
        if(event == EventsBrowseActionsEvents.View) this.openViewEvent(id)
        // else if(event == EventsBrowseActionsEvents.Edit) this.openCreateOrEditEventModal(id)
        // else if(event == EventsBrowseActionsEvents.Publish) this.publishEvent(id)
        // else if(event == EventsBrowseActionsEvents.UnPublish) this.unPublishEvent(id)
        // else if(event == EventsBrowseActionsEvents.Delete) this.deleteEvent(id)
    }

    openViewEvent($event: number) {
        this.viewEventModal.show($event, 0);
    }

createRelation(account,option: { connectLabel: string; connectionEntityId: number; defaultVisibility: string }) {
  if (!option?.connectionEntityId) return;

  this.showMainSpinner();

  this._accountsServiceProxy
    .applyRelationOnProfile(
      account?.account?.id,
      undefined,
      (option.defaultVisibility || '').toLowerCase() === 'public',
      option.connectionEntityId
    )
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe((result: any) => {

      const raw = (typeof result === 'string' ? result : result?.result) || '';
      const parsed = this.parseRelationResult(raw);

      account.availableConnections = [];
      account.avaliableConnectionName = '';
     account.connectionName = parsed.connectionName;  
      account.disConnectLabel = parsed.disconnectLabel;    
    });
}

disconnect(account): void {
  const id = account?.account?.id;
  if (!id) return;

  this.showMainSpinner();

  this._accountsServiceProxy
    .disconnect(id)
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe((res: any[]) => {
      this.notify.success(this.l('SuccessfullyDisconnected'));


      const options = Array.isArray(res) ? res : [];
      account.connectionName = '';
      account.disConnectLabel = '';
      account.availableConnections = options;
      account.avaliableConnectionName = options?.[0]?.connectLabel || '';
    });
}
private parseRelationResult(raw: string): { connectionName: string; disconnectLabel: string } {
  const text = (raw || '').trim();

  const idx = text.indexOf('-');
  const connectionName = idx > -1 ? text.slice(0, idx).trim() : text;
  const disconnectLabel = idx > -1 ? text.slice(idx + 1).trim() : 'MPActionDisconnect';

  return { connectionName, disconnectLabel };
}

}
