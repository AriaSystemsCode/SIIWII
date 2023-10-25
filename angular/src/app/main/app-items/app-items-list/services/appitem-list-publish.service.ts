import { Injectable, Injector } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsListsServiceProxy, EntityDtoOfInt64, PublishItemOptions } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { PublishService } from '../../app-item-shared/services/publish.service';

@Injectable()
export class AppitemListPublishService extends AppComponentBase {

    constructor(
        private injector:Injector,
        private _appItemsListsServiceProxy: AppItemsListsServiceProxy,
        private _publishService: PublishService
    ) {
        super(injector)
    }

    getListingShareData(id: number) {
        return this._appItemsListsServiceProxy.getPublishOptions(id).toPromise()
    }

    async openSharingModal(alreadyPublished:boolean,AppItemListId:number,successCallBack:Function) {
        let publishItemOptions: PublishItemOptions
        if (alreadyPublished) { // get the saved data if it is already published
            publishItemOptions = await this.getListingShareData(AppItemListId)
        }

        this._publishService.openSharingModal(publishItemOptions)
        .subscribe((_publishItemOptions) => {
            _publishItemOptions.itemListId = AppItemListId
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
        return this._appItemsListsServiceProxy.publish(publishItemOptions)
    }

    unPublish(id:number) {
        const entityDtoOfInt64: EntityDtoOfInt64 = new EntityDtoOfInt64()
        entityDtoOfInt64.id = id
        return this._appItemsListsServiceProxy.unPublish(entityDtoOfInt64)
    }

}
