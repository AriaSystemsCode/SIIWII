import { HttpParams } from "@angular/common/http";
import { Component, EventEmitter, Injector, Input,OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppEntitiesServiceProxy } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-prodcut-card",
    templateUrl: "./prodcut-card.component.html",
    styleUrls: ["./prodcut-card.component.scss"],
})
export class ProdcutCardComponent   extends AppComponentBase  {
    @Input() product;
    @Input() productCard;
    @Input() currency: string;
    @Input() buyerSSIN: string;
    @Input() sellerSSIN: string;
    @Input()  isSellerIdExists:boolean =false
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    params: any;
    languageSettingName:string  =AppConsts.languageSettingName;
    isAuthenticated = this.appSession?.user
    @Input() acceptedAspectRatio;

      @Output() prodcutId = new EventEmitter<number>();
      showMsrP:boolean
    constructor(private router: Router ,  injector: Injector,  private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,) {
        super(injector);
    }
    ngOnInit(){
        this.getSettingData()
        this.product?.price % 1 ==0?this.product.price=Math.round(this.product.price * 100 / 100).toFixed(2):null; 
    }

    get displayPrice(): number {
        const raw = this.product?.price;
    
        if (raw == null) {
          return 0;
        }
    
        // Already a number
        if (typeof raw === 'number') {
          return raw;
        }
    
        // String that can be parsed
        if (typeof raw === 'string') {
          const n = Number(raw);
          return isNaN(n) ? 0 : n;
        }
    
        // Object { value: 532, symbol: '£', ... }
        if (typeof raw === 'object' && 'value' in raw) {
          const n = Number((raw as any).value);
          return isNaN(n) ? 0 : n;
        }
    
        return 0;
      }
    
      /**
       * Always return a 3-letter currency code like 'GBP'
       */
      get currencyCode(): string {
        if (!this.currency) {
          return 'USD';
        }
    
        // String already (e.g. 'GBP')
        if (typeof this.currency === 'string') {
          return this.currency;
        }
    
        // Object { code: 'GBP', ... }
        if (typeof this.currency === 'object' && 'code' in this.currency) {
          return (this.currency as any).code || 'USD';
        }
    
        return 'USD';
      }
    
    viewProduct(id: number) {
        const productBodyRequestForView = {
            id: id,
            currencyCode: this.currency,
            sellerSSIN: this.sellerSSIN,
            buyerSSIN : this.buyerSSIN
        };
        localStorage.setItem("productData", JSON.stringify(productBodyRequestForView))
        this.router.navigate(["/app/main/marketplace/products/view", id]);
        this.prodcutId.emit(id)
        // this.router.navigateByUrl(`/view/${id}`)
    }

    getSettingData(){
        this._AppEntitiesServiceProxy.getHostSettingValue(1214, null)
        .subscribe((result) => {
          this.showMsrP = result?.toString().toLowerCase() =='true' ? true : false;
      
        });
    
    }
}
