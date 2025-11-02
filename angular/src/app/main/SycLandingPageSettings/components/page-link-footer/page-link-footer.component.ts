import { Component, Input } from "@angular/core";
import { PageSettingDto, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";



@Component({
    selector: "app-page-link-footer",
    templateUrl: "./page-link-footer.component.html",
    styleUrls: ["./page-link-footer.component.scss"],
})
export class PageLinkFooterComponent {
    @Input()  sectionData: any;
    @Input() sectionId:number;
   pageLiksData:any[]


   constructor(private SydObjectsServiceProxy:SydObjectsServiceProxy) {
   

    }
  
    ngOnInit(){
    
        if(this.sectionId){
            this.getBlocksData()

        }

        // this.pageLiksData = [
        //     { name: 'Apple',        img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Samsung',      img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Nike',         img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Adidas',       img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Sony',         img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'LG',           img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Microsoft',    img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Huawei',       img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Xiaomi',       img: 'assets/brands/xiaomi.svg' },
        //     { name: 'Lenovo',       img: 'assets/brands/lenovo.svg' },
        //   ];
      
    }

        getBlocksData(){
            this.SydObjectsServiceProxy
            .getAllSectionBlocks(
              this.sectionId,        
            )
            .subscribe((res) => {
                this.pageLiksData = res
             console.log(res,'page link')
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
  }