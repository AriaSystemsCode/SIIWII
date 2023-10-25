import { Component, Injector, Input, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { SycAttachmentCategoryDto } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-syclanding-adv",
    templateUrl: "./syclanding-adv.component.html",
    styleUrls: ["./syclanding-adv.component.scss"],
})
export class SyclandingADVComponent extends AppComponentBase implements OnInit {
    @Input() advSliderItems: string[];
    interval: number = 10000;
    numVisible: number = 1;
    numScroll: number = 1;
    constructor(injector: Injector) {
        super(injector);
    }
    sycAttachmentCategoryBanner:SycAttachmentCategoryDto
    ngOnInit(){
        this.getSycAttachmentCategoriesByCodes(['BANNER']).subscribe((result)=>{
            result.forEach(item=>{
                this.sycAttachmentCategoryBanner = item
            })
        })
    }
}
