import { Component, Injector, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PageSettingDto, SydObjectsServiceProxy, AppItemsServiceProxy, AppEntitiesServiceProxy, AccountDto, AccountsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import {  finalize, } from 'rxjs';

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
  numVisible: number = 5;
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
  currencyCode: string; 
  languageSettingName:string  =AppConsts.languageSettingName;
  showMsrP:boolean

  itemEv
  account
  constructor(
    injector: Injector,
    private syd: SydObjectsServiceProxy,
    private router: Router,
       private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
           private _accountsServiceProxy: AccountsServiceProxy,
  ) { super(injector); }

  ngOnInit() {
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

  this.account= {
    "account": {
        "name": "aminaBussiness",
        "showSync": false,
        "tenantId": 2548,
        "description": null,
        "connections": 0,
        "website": null,
        "eMailAddress": null,
        "city": "Alexandria",
        "state": "po",
        "zipCode": "65",
        "addressLine1": "add1",
        "addressLine2": null,
        "countryId": 0,
        "countryName": "Åland Islands",
        "priceLevel": "",
        "ssin": "Business-000000005753",
        "accountTypeId": 19,
        "accountType": "BUSINESS",
        "accountTypeString": "BUSINESS",
        "status": true,
        "classfications": [
            " 3rd Party Logistics Provider",
            " Marketplace Platform",
            " General Service Provider",
            "Apparel Distributor ",
            "Apparel Importer"
        ],
        "categories": [
            "Accessories",
            "Apparel",
            "Bags",
            "Costumes & Accessories",
            "Fabrics"
        ],
        "logoUrl": "attachments/-1/bb359bdd-3435-e270-ede6-bd58a4fb71ac.jpg",
        "coverUrl": null,
        "imagesUrls": null,
        "phone1Number": null,
        "isManual": false,
        "isConnected": false,
        "branches": null,
        "partnerId": null,
        "entityId": null,
        "classificationsTotalCount": null,
        "categoriesTotalCount": null,
        "shipViaName": null,
        "paymentTermsName": null,
        "shipViaId": null,
        "paymentTermsId": null,
        "code": null,
        "currencyId": null,
        "currencyCode": null,
        "currencyName": null,
        "id": 482303
    },
    "appEntityName": null,
    "isPublished": false,
    "allowedAction": null,
    "avaliableConnectionName": "Follow",
    "connectionName": "MPActionConnected",
    "disConnectLabel": "MPActionDisconnect",
    "availableConnections": []
}
    this.initCurrencyCode();  
  

    if (this.sectionId) {
      this.getBlocksData();
    }
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

connect(account: AccountDto): void {
  this.showMainSpinner();
  this._accountsServiceProxy
      .connectContactsProfiles(account.id,null,null)
      .pipe(
          finalize(() => {
              this.hideMainSpinner();
          })
      )
      .subscribe(() => {
          this.notify.success(this.l("SuccessfullyConnected"));
          account.status = true;
      });
}



  createRelation(account, status: boolean = false) {
        this.showMainSpinner();
        this._accountsServiceProxy
          .applyRelationOnProfile(
            account.account.account.id,
            undefined,
            account.relation.defaultVisibility === 'Public',
            account.relation.connectionEntityId
          )
          .pipe(finalize(() => this.hideMainSpinner()))
          .subscribe((result: any) => {
          
            const raw = typeof result === 'string' ? result : result?.result ?? '';
            // const { connectionName, disConnectLabel } = this.splitLabels(raw);
      
            // const i = this.accounts.findIndex(x => x.account.id === account.account.account.id);
            // if (i >= 0) {
              
            //   this.accounts[i] = account.account;
      
            //   this.accounts[i].availableConnections = [];
            //   this.accounts[i].avaliableConnectionName = '';
      
            //   this.accounts[i].connectionName   = this.l(connectionName);
            //   this.accounts[i].disConnectLabel  = this.l(disConnectLabel);
            // }
          });
      }

      disconnect(account: AccountDto): void {

        this.showMainSpinner();
        this._accountsServiceProxy
            .disconnect(account.account.id)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((res) => {
                this.notify.success(this.l("SuccessfullyDisconnected"));
                account.status = false;
                account.connectionName = "";
                account.avaliableConnectionName = res[0].connectLabel
                account.availableConnections = res
            });
    }
}
