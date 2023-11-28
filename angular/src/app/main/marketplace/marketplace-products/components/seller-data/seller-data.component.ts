import { Component, Injector, Input } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppMarketplaceItemsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-seller-data',
  templateUrl: './seller-data.component.html',
  styleUrls: ['./seller-data.component.scss']
})
export class SellerDataComponent {

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;

    sellerData:any

    constructor(
        injector: Injector,

        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
    ) {}

    ngOnInit(): void {
    if (localStorage.getItem("SellerId")) {
        this._AppMarketplaceItemsServiceProxy
            .getAccountImages(Number(localStorage.getItem("SellerId")))
            .subscribe((res) => {
                console.log(">> sellerData", res);
                this.sellerData = res;
            });
    }}

}
