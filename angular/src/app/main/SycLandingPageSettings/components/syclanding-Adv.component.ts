import { Component, Injector, Input, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { PageSettingDto, SycAttachmentCategoryDto, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-syclanding-adv",
    templateUrl: "./syclanding-adv.component.html",
    styleUrls: ["./syclanding-adv.component.scss"],
})
export class SyclandingADVComponent extends AppComponentBase implements OnInit {
     advSliderItems: any;
    interval: number = 10000;
    numVisible: number = 1;
    numScroll: number = 1;
    @Input() sectionId:number;
    constructor(injector: Injector  ,private SydObjectsServiceProxy:SydObjectsServiceProxy) {
        super(injector);
    }
    sycAttachmentCategoryBanner:SycAttachmentCategoryDto
    ngOnInit(){
        this.getSycAttachmentCategoriesByCodes(['BANNER']).subscribe((result)=>{
            result.forEach(item=>{
                this.sycAttachmentCategoryBanner = item
            })
        })
        if(this.sectionId){
            this.getBlocksData()
        }
    }

    getBlocksData() {
        this.SydObjectsServiceProxy.getAllSectionBlocks(this.sectionId).subscribe(res => {
          this.advSliderItems = res ?? [];
          
        });
      }
      
          
       

            private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
              const ao = Number.isFinite(a.order as any) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
              const bo = Number.isFinite(b.order as any) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
              return (ao - bo) || ((a.id ?? 0) - (b.id ?? 0));
            };
            
            get blocksSorted(): PageSettingDto[] {
              return (this.advSliderItems ?? []).slice().sort(this.compareByOrder);
            }
            
}
