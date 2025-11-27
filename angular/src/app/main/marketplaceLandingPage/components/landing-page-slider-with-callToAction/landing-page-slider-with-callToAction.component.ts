import { Component, Injector, Input, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { PageSettingDto, SycAttachmentCategoryDto, SycAttachmentTypeDto, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-slider-with-callToAction",
    templateUrl: "./landing-page-slider-with-callToAction.component.html",
    styleUrls: ["./landing-page-slider-with-callToAction.component.scss"],
})
export class LandingPageSliderWithCallToActionComponent extends AppComponentBase implements OnInit {
     sliderItems: any;
    @Input() sectionId: number;
    interval: number = 10000;
    numVisible: number = 1;
    numScroll: number = 1;
    constructor(injector: Injector ,private SydObjectsServiceProxy:SydObjectsServiceProxy) {
        super(injector);
    }
    sycAttachmentCategoryAutoSlider	: SycAttachmentCategoryDto
    ngOnInit(){
     
        this.getSycAttachmentCategoriesByCodes(['AUTOSLIDER'])
        .subscribe((res)=>{
            this.sycAttachmentCategoryAutoSlider = res[0]
        })
        if(this.sectionId){
            this.getBlocksData()

        }
    }

 
    private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
      const ao = Number.isFinite(a.order as any) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
      const bo = Number.isFinite(b.order as any) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
      return (ao - bo) || ((a.id ?? 0) - (b.id ?? 0));
    };
    
    get blocksSorted(): PageSettingDto[] {
      return (this.sliderItems ?? []).slice().sort(this.compareByOrder);
    }
    
    getBlocksData() {
      this.SydObjectsServiceProxy.getAllSectionBlocks(this.sectionId).subscribe(res => {
        this.sliderItems = res ?? [];
      });
    }

    onMenuClick( s: any): void {
      window.open(s)
    }
}
