import { Component, Injector, Input } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppMarketplaceItemsServiceProxy, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-seller-data',
  templateUrl: './seller-data.component.html',
  styleUrls: ['./seller-data.component.scss']
})
export class SellerDataComponent  extends AppComponentBase {

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;

    sellerData:any

    sycAttachmentCategoryBanner :SycAttachmentCategoryDto
    bannerImg:string="";
    constructor(
        injector: Injector,
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
    ) {
        super(injector)
    }

    ngOnInit(): void {
    if (localStorage.getItem("SellerId")) {
        this._AppMarketplaceItemsServiceProxy
            //.getAccountImages(Number(localStorage.getItem("SellerId")))
            .getAccountImages(localStorage.getItem("SellerSSIN"))
            .subscribe((res) => {
                console.log(">> sellerData", res);
                this.sellerData = res;
                this.bannerImg=this.attachmentBaseUrl + '/' + this.sellerData?.bannerImage;
            });
    }

this.getAllForAccountInfo();
}


    getAllForAccountInfo() {
        this.getSycAttachmentCategoriesByCodes(['LOGO',"BANNER","IMAGE"]).subscribe((result)=>{
            result.forEach(item=>{
                 if(item.code == "BANNER") this.sycAttachmentCategoryBanner = item
            });
        })

    }

}
