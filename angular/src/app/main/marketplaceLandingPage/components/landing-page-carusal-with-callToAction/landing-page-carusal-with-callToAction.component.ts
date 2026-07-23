import { Component, OnInit, Injector, Input } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { PageSettingDto, SycAttachmentCategoryDto, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";
import { AppConsts } from "@shared/AppConsts";
import { finalize } from 'rxjs';
@Component({
    selector: "app-carusal-with-callToAction",
    templateUrl: "./landing-page-carusal-with-callToAction.component.html",
    styleUrls: ["./landing-page-carusal-with-callToAction.component.scss"],
})
export class LandingPageCarusalWithCallToActionComponent extends AppComponentBase implements OnInit {
    @Input() sectionData: any;
    sycLangingPageSetting: PageSettingDto[];
    @Input() sectionId:number;
    numVisible: number = 4;
    // numScroll: number = 4;
    appBaseUrl: string=AppConsts.appBaseUrl;

    ctaResponsiveOptions = [
      { breakpoint: '1400px', numVisible: 4, numScroll: 1 },
      { breakpoint: '1200px', numVisible: 3, numScroll: 1 },
      { breakpoint: '992px',  numVisible: 2, numScroll: 1 },
      { breakpoint: '576px',  numVisible: 1, numScroll: 1 }
    ];

    loading = false;
    hasLoadError = false;
    constructor(injector: Injector,private SydObjectsServiceProxy:SydObjectsServiceProxy) {
        super(injector);

    }
    sycAttachmentCategoryCTASlider : SycAttachmentCategoryDto
    ngOnInit(){
        this.handleStorageData()
        this.getSycAttachmentCategoriesByCodes(['CTASLIDER'])
        .subscribe((res)=>{
            this.sycAttachmentCategoryCTASlider = res[0]
        })
        if(this.sectionId){
            this.getBlocksData()

        }
   
    }

   
    handleStorageData(){
    localStorage.setItem("fromSellerRoom",JSON.stringify(false));
    localStorage.setItem("fromMarketPlace",JSON.stringify(true));
    localStorage.removeItem("productFilters");
    sessionStorage.removeItem('SellerSSIN');
    localStorage.removeItem('BuyerSSIN');
    }


    getBlocksData(){
             this.loading = true;
  this.hasLoadError = false;
        this.SydObjectsServiceProxy
        .getAllSectionBlocks(
          this.sectionId, Intl.DateTimeFormat().resolvedOptions().timeZone       
        ).pipe(
              finalize(() => {
                this.loading = false;
              })
            ).subscribe({
      next: (res) => {
        this.sycLangingPageSetting = res ?? [];
      },
      error: () => {
        this.sycLangingPageSetting = [];
        this.hasLoadError = true;
      }
    });
        //     .subscribe((res) => {
        //     this.sycLangingPageSetting = res
      
        // });
    }
  
    private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
        const ao = Number.isFinite(a.order as any) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
        const bo = Number.isFinite(b.order as any) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
        return (ao - bo) || ((a.id ?? 0) - (b.id ?? 0));
      };
    
      get blocksSorted(): PageSettingDto[] {
        return (this.sycLangingPageSetting ?? []).slice().sort(this.compareByOrder);
      }
}
