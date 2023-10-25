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
    constructor(injector: Injector) {
        super(injector);
    }
    sycAttachmentCategoryCTASlider : SycAttachmentCategoryDto
    ngOnInit(){
        this.getSycAttachmentCategoriesByCodes(['CTASLIDER'])
        .subscribe((res)=>{
            this.sycAttachmentCategoryCTASlider = res[0]
        })
    }

    ctaSeeMore(){}
}
