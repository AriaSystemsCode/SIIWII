import { Component, Injector, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppItemForViewDto,
    AppItemsServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/internal/operators/finalize";
import { AppItemViewInput } from "../../app-item-view/models/app-item-view-input";

@Component({
    selector: "app-my-item-view",
    templateUrl: "./my-item-view.component.html",
    styleUrls: ["./my-item-view.component.scss"],
})
export class MyItemViewComponent
    extends AppComponentBase
    implements OnInit, OnDestroy
{
    productId: number;
    skipCount: number = 0;
    maxResultCount: number = 10;
    appItemViewInput: AppItemViewInput = null;
    _appItemViewInput: AppItemViewInput = {
        header: "",
        marketPlace: false,
        appItemForViewDto: new AppItemForViewDto(),
        publish: false,
    };
    public constructor(
        private _activatedRoute: ActivatedRoute,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        injector: Injector
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this.productId = this._activatedRoute.snapshot.params["Id"];
         // T-SII-20230917.0005
        const timeZoneValue=  Intl.DateTimeFormat().resolvedOptions().timeZone ;

        this.showMainSpinner();
        const subs = this._appItemsServiceProxy
            .getAppItemForView(
                undefined,
                0,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                timeZoneValue,
                this.productId,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                this.skipCount,
                this.maxResultCount
            )
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((result) => {
                this._appItemViewInput.appItemForViewDto = result.appItem;

                if (this._appItemViewInput.appItemForViewDto.itemType == 0)
                    //My-Product
                    this._appItemViewInput.header = this.l(
                        "MyProductDetailView"
                    );
                else {
                    //My-List
                    this._appItemViewInput.header = this.l(
                        "MyListingDetailView"
                    );
                    this._appItemViewInput.publish =
                        this._appItemViewInput.appItemForViewDto.published;
                }

                this.appItemViewInput = this._appItemViewInput;
            });

        this.subscriptions.push(subs);
    }

    ngOnDestroy() {
        this.unsubscribeToAllSubscriptions();
    }
}
