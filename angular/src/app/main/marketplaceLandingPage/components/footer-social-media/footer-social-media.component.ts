import { Component, Injector, Input } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { PageSettingDto, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";



@Component({
    selector: "app-footer-social-media",
    templateUrl: "./footer-social-media.component.html",
    styleUrls: ["./footer-social-media.component.scss"],
})
export class FooterSocialMediaComponent extends AppComponentBase   {
    links: any[] = [];
    @Input() sectionId:number;

    @Input() sectionData: any;



    ngOnInit(){
        // this.links = [
        //     { name: 'facebook',  url: 'https://www.facebook.com/siiwii.network/',  iconSrc: 'assets/landingPage/Footer_FB_Btn.svg' },
        //     { name: 'instagram', url: 'https://www.instagram.com/siiwii.network/', iconSrc: 'assets/landingPage/Footer_Instagram_Btn.svg' },
        //     { name: 'twitter',   url: 'https://twitter.com/siiwii_net',            iconSrc: 'assets/landingPage/Footer_Twitter_Btn.svg' },
        //     { name: 'linkedin',  url: 'https://www.linkedin.com/company/siiwii/',   iconSrc: 'assets/landingPage/Footer_Linkedin_Btn.svg' },
        //     { name: 'youtube',   url: 'https://www.youtube.com/channel/UCv_4Ao0myNHsjfxyg4lbLbg', iconSrc: 'assets/landingPage/Footer_Youtube_Btn.jpg' },
        //   ];

          if(this.sectionId){
            this.getBlocksData()

        }
    }

    
       constructor(private SydObjectsServiceProxy:SydObjectsServiceProxy,injector: Injector,) {
        super(injector);
    
        }
      
        getBlocksData(){
                this.SydObjectsServiceProxy
                .getAllSectionBlocks(
                  this.sectionId,        
                )
                .subscribe((res) => {
                    this.links = res
                 console.log(res,'SOCIALLL')
                });
            }
          
            private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
                const ao = Number.isFinite(a.order as any) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
                const bo = Number.isFinite(b.order as any) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
                return (ao - bo) || ((a.id ?? 0) - (b.id ?? 0));
              };
            
              get blocksSorted(): PageSettingDto[] {
                return (this.links ?? []).slice().sort(this.compareByOrder);
              }
  }
