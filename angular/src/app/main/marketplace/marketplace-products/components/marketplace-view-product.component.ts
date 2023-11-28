import { Component, Injector, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AppItemViewInput } from "@app/main/app-items/app-item-view/models/app-item-view-input";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppItemForViewDto,
    AppItemsServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";

@Component({
    selector: "app-marketplace-view-product",
    templateUrl: "./marketplace-view-product.component.html",
    styleUrls: ["./marketplace-view-product.component.scss"],
})
export class MarketplaceViewProductComponent
    extends AppComponentBase
    implements OnInit, OnDestroy
{
    // productId: number;
    // skipCount: number = 0;
    // maxResultCount: number = 10;
    // appItemViewInput: AppItemViewInput;
    // _appItemViewInput: AppItemViewInput = {
    //     header: this.l("MarcketplaceProductDetailView"),
    //     marketPlace: true,
    //     appItemForViewDto: new AppItemForViewDto(),
    //     publish: false,
    // };

    productBodyData: any;

    public constructor(
        private _activatedRoute: ActivatedRoute,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        injector: Injector
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this.productBodyData = JSON.parse(localStorage.getItem("productData"));
        console.log(">>", this.productBodyData)

        // this.productId = this._activatedRoute.snapshot.params["id"];

        // this.showMainSpinner();
        // const subs = this._appItemsServiceProxy
        //     .getAppItemForView(
        //         undefined,
        //         0,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         this.productId,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         this.skipCount,
        //         this.maxResultCount
        //     )
        //     .pipe(
        //         finalize(() => {
        //             this.hideMainSpinner();
        //         })
        //     )
        //     .subscribe((result) => {
        //         this._appItemViewInput.appItemForViewDto = result.appItem;

        //         this.appItemViewInput = this._appItemViewInput;
        //     });

        // this.subscriptions.push(subs);
    }
    ngOnDestroy() {
        this.unsubscribeToAllSubscriptions();
    }
}
