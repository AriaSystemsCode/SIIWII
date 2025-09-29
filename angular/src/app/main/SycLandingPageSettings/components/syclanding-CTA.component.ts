import { Component, OnInit, Injector } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { PageSettingDto, SycAttachmentCategoryDto } from "@shared/service-proxies/service-proxies";
import { AppConsts } from "@shared/AppConsts";
@Component({
    selector: "app-cta",
    templateUrl: "./syclanding-CTA.component.html",
    styleUrls: ["./syclanding-CTA.component.scss"],
})
export class CTAComponent extends AppComponentBase implements OnInit {
    sycLangingPageSetting: PageSettingDto[];
    numVisible: number = 4;
    numScroll: number = 4;
    appBaseUrl: string=AppConsts.appBaseUrl;
    brands:any
    constructor(injector: Injector) {
        super(injector);
        this.brands = [
            { name: 'Apple',        img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Samsung',      img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Nike',         img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Adidas',       img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Sony',         img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'LG',           img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Microsoft',    img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Huawei',       img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Xiaomi',       img: 'assets/brands/xiaomi.svg' },
            { name: 'Lenovo',       img: 'assets/brands/lenovo.svg' },
          ];
    }
    sycAttachmentCategoryCTASlider : SycAttachmentCategoryDto
    ngOnInit(){
        this.handleStorageData()
        this.getSycAttachmentCategoriesByCodes(['CTASLIDER'])
        .subscribe((res)=>{
            this.sycAttachmentCategoryCTASlider = res[0]
        })
    }

    ctaSeeMore(){}
    handleStorageData(){
    localStorage.setItem("fromSellerRoom",JSON.stringify(false));
    localStorage.setItem("fromMarketPlace",JSON.stringify(true));
    localStorage.removeItem("productFilters");
    sessionStorage.removeItem('SellerSSIN');
    localStorage.removeItem('BuyerSSIN');
    }

}
