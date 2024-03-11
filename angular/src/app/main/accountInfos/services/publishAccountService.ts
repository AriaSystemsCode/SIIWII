import { Injectable, Injector } from "@angular/core";
import { PublishService } from "@app/main/app-items/app-item-shared/services/publish.service";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AccountsServiceProxy,
    EntityDtoOfInt64,
} from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";

@Injectable()
export class PublishAccountService extends AppComponentBase {
    subsNumbers: number;
    sharingLevel: number;
    _accountId: number;
    screenNumber: number // 1 for product details page 2 for product list page

    constructor(
        private injector: Injector,
        private _publishService: PublishService,
        private _accountsServiceProxy:AccountsServiceProxy
    ) {
        super(injector);
    }

    async openAccountSharingModal(
        alreadyShared: boolean,
        successCallBack: Function,
    ) {

        //I40 set _shareOptions 
    let _shareOptions=null;
        this._publishService
            .openAccountSharingModal(_shareOptions)
            .subscribe((_shareOptions) => {
                this.showMainSpinner();
                this.share()
                    .pipe(
                        finalize(() => {
                            this.hideMainSpinner();
                        })
                    )
                    .subscribe((res) => {
                        successCallBack();
                    });
            });
    }

    share() {
        //I40 - call share api
        //return this._accountsServiceProxy.share();
        return null;
    }


    set subscribersNumber(val: number) {
        this.subsNumbers = val;
    }

    get subscribersNumber(): number {
        return this.subsNumbers;
    }

    set sharingStatus(val: number) {
        this.sharingLevel = val;
    }

    get sharingStatus(): number {
        return this.sharingLevel;
    }


    get accountId() {
        return this._accountId
    }

    set screen(val: number) {
        this.screenNumber = val
    }

    get screen() {
        return this.screenNumber
    }

}
