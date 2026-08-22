import { Component, Injector, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountsServiceProxy, AppEntitiesServiceProxy, PageSettingDto, SydObjectsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-multi-row-callAction',
  templateUrl: './landing-page-multi-row-callToAction.component.html',
  styleUrls: ['./landing-page-multi-row-callToAction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageMultiRowCallToActionComponent extends AppComponentBase implements OnInit {
  @Input() sectionId!: number;
  @Input() blockTypeIsSingleOrMixed: string
  @Input() loginTenaneSsin: string

  @ViewChild("viewEventModal", { static: true }) viewEventModal: ViewEventComponent;

  sliderItems: PageSettingDto[] = [];
  pageGroups: PageSettingDto[][] = [];
  attachmentSafeMap: Record<number, SafeResourceUrl | null> = {};

  private objectUrlById: Record<number, string> = {};
  acceptedAspectRatio;


  languageSettingName: string = AppConsts.languageSettingName
  showMsrP: boolean
    currentLang:string
    isArabic:boolean 
    isSmallScreen = false;

        loading = false;
hasLoadError = false;
  constructor(
    injector: Injector,
    private sydObjectsService: SydObjectsServiceProxy,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private _accountsServiceProxy: AccountsServiceProxy,

  ) { super(injector); }

  ngOnInit(): void {
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
    if (this.sectionId) {
      this.getBlocksData();
    }
        this.checkScreenSize();
  window.addEventListener('resize', this.checkScreenSize.bind(this));

    }
    checkScreenSize(): void {
  this.isSmallScreen = window.innerWidth <= 1023;
}
  private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
    const ao = Number.isFinite((a as any)?.order) ? (a as any).order as number : Number.MAX_SAFE_INTEGER;
    const bo = Number.isFinite((b as any)?.order) ? (b as any).order as number : Number.MAX_SAFE_INTEGER;
    return (ao - bo) || (((a as any)?.id ?? 0) - ((b as any)?.id ?? 0));
  };

  private getBlocksData(): void {
     this.loading = true;
  this.hasLoadError = false;
    this.sydObjectsService.getAllSectionBlocks(this.sectionId, Intl.DateTimeFormat().resolvedOptions().timeZone).pipe(
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({
      next: (res) => { this.applyData(res ?? []); },
      error: () => {this.applyData([]),   this.hasLoadError = true;}
    });

  }

  private applyData(blocks: PageSettingDto[]): void {
    this.sliderItems = blocks.slice().sort(this.compareByOrder);
    this.pageGroups = this.chunk(this.sliderItems, 12); // 3x3 per slide
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
  goToCategory(id) {

    this.router.navigate(
      ['/app/main/marketplace/products'],
      { queryParams: { cat: id } }
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
    return `${this.attachmentBaseUrl?.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
  }

  isPdf(path?: string) { return !!path && /\.pdf($|\?)/i.test(path); }
  isImg(path?: string) { return !!path && /\.(jpe?g|png|webp|gif|svg)($|\?)/i.test(path); }
  isVideo(path?: string) { return !!path && /\.(mp4|webm|ogg)($|\?)/i.test(path); }


  onImgErr(evt: Event) {
    (evt.target as HTMLImageElement).src = '/assets/placeholders/_logo-placeholder.png';
  }

  openNewTab(path?: string) {
    window.open(this.fullUrl(path))
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

    if ((b as any).link) return (b as any).link;
    if (b.externalUrl) return b.externalUrl;
    if (b.linkPageUrl) return b.linkPageUrl;


    if (b.image) return this.fullUrl(b.image);

    return null;
  }


  onAttachmentClick(b: PageSettingDto): void {
    const url = this.getAttachmentClickUrl(b);
    if (!url) { return; }

    const finalUrl = /^https?:\/\//i.test(url) ? url : this.fullUrl(url);
    window.open(finalUrl, '_blank');
  }


  openEventDetails(id: any) {
   
    this.viewEventModal.show(id, 0);

  }

  createRelation(account, option) {

    this.showMainSpinner();

    this._accountsServiceProxy
      .applyRelationOnProfile(
        account?.account?.id,
        undefined,
        (option?.relation?.defaultVisibility || '').toLowerCase() === 'public',
        option?.relation?.connectionEntityId
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
      .disconnect(id,undefined)
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

getBlockTypeLabel(block) {
  let t  = (block.blockType).toUpperCase();

  switch (t) {
    case 'EVENT':
     if(block?.getAppEventForViewDto?.appEvent?.isOnLine){
      return this.l('OnlineEvent') 
      }else{
         return this.l('InPersonEvent' ) 
        
      }
    case 'CONTACT':
        if(block?.getAccountForViewDto?.account?.accountType == 'BUSINESS'){
        return this.l('BUSINESSAccount')
      } else  if(block?.getAccountForViewDto?.account?.accountType == 'PERSONAL'){
           return this.l('PERSONALAccount')

      }else {
    return this.l('GROUPAccount')

      }
   
    case 'PRODUCT':
      return this.l('Product') ;
    case 'ATTACHMENT':
      return  this.l('Link') 
    case 'BRAND':
      return this.l('Brand') ;
    case 'CATEGORY':
      return this.l('Category') ;
    default:
      return this.l('Block') ;
  }
}

getBlockTypeIcon(block) {
  const t = (block.blockType).toUpperCase();

  switch (t) {
    case 'EVENT':
      if(block?.getAppEventForViewDto?.appEvent?.isOnLine == true){
      return 'fas fa-video' 
      }else{
      return 'fas fa-map-marker-alt';
        
      }
    case 'CONTACT':
      if(block?.getAccountForViewDto?.account?.accountType == 'BUSINESS'){
        return 'fas fa-building'
      } else  if(block?.getAccountForViewDto?.account?.accountType == 'PERSONAL'){
      return 'fas fa-user';

      }else {
      return 'fas fa-users';

      }
    case 'PRODUCT':
      return 'fas fa-shopping-bag';
    case 'ATTACHMENT':
      return 'fas fa-paperclip';
    case 'BRAND':
      return 'fas fa-tag';
    case 'CATEGORY':
      return 'fas fa-th-large';
    default:
      return 'fas fa-square';
  }
}
  ngOnDestroy() {
    Object.values(this.objectUrlById).forEach(u => { try { URL.revokeObjectURL(u); } catch { } });
    this.objectUrlById = {};
  }
}
