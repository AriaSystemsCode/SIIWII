import { Component, Input, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { PageSettingDto, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";
import { AppConsts } from "@shared/AppConsts";



@Component({
    selector: "app-footer-page-link",
    templateUrl: "./footer-page-link.component.html",
    styleUrls: ["./footer-page-link.component.scss"],
})
export class FooterPageLinkComponent {
    @Input()  sectionData: any;
    @Input() sectionId:number;
   pageLiksData:any[]
   @ViewChild('contactUsModal', { static: false })
   contactUsModal: ModalDirective;

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
   constructor(private SydObjectsServiceProxy:SydObjectsServiceProxy) {
   

    }
  
    ngOnInit(){
    
        if(this.sectionId){
            this.getBlocksData()

        }

  
      
    }

        getBlocksData(){
            this.SydObjectsServiceProxy
            .getAllSectionBlocks(
              this.sectionId,     Intl.DateTimeFormat().resolvedOptions().timeZone   
            )
            .subscribe((res) => {
                this.pageLiksData = res
           
            });
        }
      
        private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
            const ao = Number.isFinite(a.order as any) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
            const bo = Number.isFinite(b.order as any) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
            return (ao - bo) || ((a.id ?? 0) - (b.id ?? 0));
          };
        
          get blocksSorted(): PageSettingDto[] {
            return (this.pageLiksData ?? []).slice().sort(this.compareByOrder);
          }


          onMenuClick(event: MouseEvent, s: any): void {
            if (s?.name === 'Contact Us') {
              event.preventDefault();   // don't follow link
              this.contactUsModal.show();
            }else {
              s?.image ? window.open(this.attachmentBaseUrl + '/' +s?.image) :  window.open(s?.link)
            }

          }
          
  }