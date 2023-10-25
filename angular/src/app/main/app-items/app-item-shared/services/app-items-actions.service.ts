import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppItemsServiceProxy } from "@shared/service-proxies/service-proxies";

@Injectable({
    providedIn: "root",
})
@Injectable()
export class AppItemsActionsService extends AppComponentBase {
    public constructor(
        injector: Injector,
        private _appItemsServiceProxy: AppItemsServiceProxy
    ) {
        super(injector);
    }

    deleteItem(productId: number, successCallBack: Function) {
        this._appItemsServiceProxy.delete(productId).subscribe(
            (res) => {
                successCallBack();
            },
            (err: HttpErrorResponse) => {
                this.notify.error(err.message);
            }
        );
    }
}
