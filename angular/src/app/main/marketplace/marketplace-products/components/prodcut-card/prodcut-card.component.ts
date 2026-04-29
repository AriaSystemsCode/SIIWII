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
    @Input() acceptedAspectRatio;
    @Input() showMsrP:boolean
    @Output() prodcutId = new EventEmitter<number>();

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    params: any;
    languageSettingName:string  =AppConsts.languageSettingName;
    isAuthenticated = this.appSession?.user

    constructor(private router: Router ,  injector: Injector,  private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,) {
        super(injector);
    }
    ngOnInit(){
        this.product?.price % 1 ==0?this.product.price=Math.round(this.product?.price * 100 / 100).toFixed(2):null; 
    }

    get displayPrice(): number {
        const raw = this.product?.price;
    
        if (raw == null) {
          return 0;
        }

        if (typeof raw === 'number') {
          return raw;
        }
 
        if (typeof raw === 'string') {
          const n = Number(raw);
          return isNaN(n) ? 0 : n;
        }
    
        if (typeof raw === 'object' && 'value' in raw) {
          const n = Number((raw as any).value);
          return isNaN(n) ? 0 : n;
        }
    
        return 0;
      }
    

      get currencyCode(): string {
        if (!this.currency) {
          return 'USD';
        }

        if (typeof this.currency === 'string') {
          return this.currency;
        }

        if (typeof this.currency === 'object' && 'code' in this.currency) {
          return (this.currency as any).code || 'USD';
        }
    
        return 'USD';
      }
    
    viewProduct(id: number) {
        const productBodyRequestForView = {
            id: id,
            currencyCode: this.currencyCode,
            sellerSSIN: this.sellerSSIN,
            buyerSSIN : this.buyerSSIN
        };
        localStorage.setItem("productData", JSON.stringify(productBodyRequestForView))
        this.router.navigate(["/app/main/marketplace/products/view", id]);
        this.prodcutId.emit(id)
     
    }

}
