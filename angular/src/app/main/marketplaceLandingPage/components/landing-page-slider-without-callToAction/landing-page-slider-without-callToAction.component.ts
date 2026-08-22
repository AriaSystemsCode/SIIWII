import { Component, Injector, Input, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { PageSettingDto, SycAttachmentCategoryDto, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";
import { finalize } from 'rxjs';

@Component({
    selector: "app-slider-without-callToAction",
    templateUrl: "./landing-page-slider-without-callToAction.component.html",
    styleUrls: ["./landing-page-slider-without-callToAction.component.scss"],
})
export class LandingPageSliderWithoutCallToActionComponent extends AppComponentBase implements OnInit {
     advSliderItems: any;
    interval: number = 10000;
    numVisible: number = 1;
    numScroll: number = 1;
    @Input() sectionId:number;

        loading = false;
hasLoadError = false;
    constructor(injector: Injector  ,private SydObjectsServiceProxy:SydObjectsServiceProxy) {
        super(injector);
    }
    sycAttachmentCategoryBanner:SycAttachmentCategoryDto
    ngOnInit(){
        this.getSycAttachmentCategoriesByCodes(['AUTOSLIDER']).subscribe((result)=>{
            result.forEach(item=>{
                this.sycAttachmentCategoryBanner = item
            })
        })
        if(this.sectionId){
            this.getBlocksData()
        }
    }

    getBlocksData() {
            this.loading = true;
  this.hasLoadError = false;
        this.SydObjectsServiceProxy.getAllSectionBlocks(this.sectionId,Intl.DateTimeFormat().resolvedOptions().timeZone).pipe(
                  finalize(() => {
                    this.loading = false;
                  })
                )
        .subscribe({
      next: (res) => {
        this.advSliderItems = res ?? [];
      },
      error: () => {
        this.advSliderItems = [];
        this.hasLoadError = true;
      }
    });
        // subscribe(res => {
        //   this.advSliderItems = res ?? [];
          
        // });
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
