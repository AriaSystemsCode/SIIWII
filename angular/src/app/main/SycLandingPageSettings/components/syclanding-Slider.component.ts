import { Component, Injector, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { SycAttachmentCategoryDto, SycAttachmentTypeDto } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-slider",
    templateUrl: "./syclanding-Slider.component.html",
    styleUrls: ["./syclanding-Slider.component.scss"],
})
export class SliderComponent extends AppComponentBase implements OnInit {
    sliderItems: string[];
    interval: number = 10000;
    numVisible: number = 1;
    numScroll: number = 1;
    constructor(injector: Injector) {
        super(injector);
    }
    sycAttachmentCategoryAutoSlider	: SycAttachmentCategoryDto
    ngOnInit(){
        this.getSycAttachmentCategoriesByCodes(['AUTOSLIDER'])
        .subscribe((res)=>{
            this.sycAttachmentCategoryAutoSlider = res[0]
        })
    }
}
