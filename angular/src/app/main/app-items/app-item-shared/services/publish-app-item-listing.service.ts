import { Injectable, Injector } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsServiceProxy, EntityDtoOfInt64, PublishItemOptions } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { PublishService } from './publish.service';

@Injectable()
export class PublishAppItemListingService extends AppComponentBase  {

    constructor(
        private injector:Injector,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        private _publishService: PublishService
    ) {
        super(injector)
    }

    getListingShareData(id: number) {
        return this._appItemsServiceProxy.getPublishItemOptions(id).toPromise()
    }

    async openProductListingSharingModal(alreadyPublished:boolean,listingAppItemId:number,successCallBack:Function) {
        let publishItemOptions: PublishItemOptions
        if (alreadyPublished) { // get the saved data if it is already published
            publishItemOptions = await this.getListingShareData(listingAppItemId)
        }

        this._publishService.openSharingModal(publishItemOptions)
        .subscribe((_publishItemOptions) => {
            _publishItemOptions.listingItemId = listingAppItemId
            this.showMainSpinner()
            this.publish(_publishItemOptions)
            .pipe(
                finalize(()=>{
                    this.hideMainSpinner()
                })
            )
            .subscribe((res)=>{
                successCallBack()
            })
        })
    }

    publish(publishItemOptions: PublishItemOptions) {
        return this._appItemsServiceProxy.publishProduct(publishItemOptions)
    }

    unPublish(id:number) {
        const entityDtoOfInt64: EntityDtoOfInt64 = new EntityDtoOfInt64()
        entityDtoOfInt64.id = id
        return this._appItemsServiceProxy.unPublishProduct(entityDtoOfInt64)
    }
}
