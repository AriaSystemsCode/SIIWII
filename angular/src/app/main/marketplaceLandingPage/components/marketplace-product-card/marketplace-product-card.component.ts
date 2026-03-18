import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-marketplace-product-card',
  templateUrl: './marketplace-product-card.component.html',
  styleUrls: ['./marketplace-product-card.component.scss'],
})
export class MarketplaceProductCardComponent extends AppComponentBase {
  @Input() item: any;
  @Input() attachmentBaseUrl: string;
  @Input() languageSettingName: string;
  currencyCode: string; 

  @Output() view = new EventEmitter<any>();
  @Output() imgError = new EventEmitter<Event>();
  showMsrP:boolean


    constructor(
      injector: Injector,
         private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
           private cdr: ChangeDetectorRef

    ) { super(injector); }

  ngOnInit(){
    this.initCurrencyCode();  
    this.getSettingData()
  }

  onView() {
    this.view.emit(this.item?.getAppMarketItemForViewDto);
  }

  onImgErr(e: Event) {
    this.imgError.emit(e);
  }

  get marketDto() {
    return this.item?.getAppMarketItemForViewDto;
  }

  get appItem() {
    return this.marketDto?.appItem;
  }

  get imageSrc(): string {
    return this.appItem?.imageUrl
      ? `${this.attachmentBaseUrl}/${this.appItem.imageUrl}`
      : 'assets/placeholders/appitem-placeholder.png';
  }

  get msrpLabel(): string {
    return this.languageSettingName !== 'en-GB' ? 'MSRP' : 'RRP';
  }

  get ratingWidth(): string {
    const r = this.marketDto?.averageRating || 0;
    return ((r / 5) * 100).toFixed(0) + '%';
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
   this.cdr.markForCheck();
    });
  
  }
}