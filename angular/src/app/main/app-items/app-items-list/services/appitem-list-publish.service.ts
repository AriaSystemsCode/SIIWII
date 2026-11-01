import { Injectable, Injector } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsListsServiceProxy, EntityDtoOfInt64, PublishItemOptions } from '@shared/service-proxies/service-proxies';
import { PublishService } from '../../app-item-shared/services/publish.service';
import { PublishAppItemListingService } from '../../app-item-shared/services/publish-app-item-listing.service';

@Injectable()
export class AppitemListPublishService extends AppComponentBase {

    constructor(
        private injector:Injector,
        private _appItemsListsServiceProxy: AppItemsListsServiceProxy,
        private _publishService: PublishService,
        private _publishAppItemListingService: PublishAppItemListingService
    ) {
        super(injector)
    }

    getListingShareData(id: number) {
        return this._appItemsListsServiceProxy.getPublishOptions(id).toPromise()
    }

    async openSharingModal(alreadyPublished:boolean,AppItemListId:number,successCallBack:Function) {
        let publishItemOptions: PublishItemOptions = new PublishItemOptions();
        if (alreadyPublished) { // get the saved data if it is already published
            publishItemOptions = await this.getListingShareData(AppItemListId) || publishItemOptions;
        }

        const shareService = this._publishAppItemListingService;
        shareService.screen = 2;
        shareService.productId = AppItemListId;
        shareService.sharingStatus = publishItemOptions?.sharingLevel ??
            (alreadyPublished ? 1 : 0);
        shareService.itemSharing = publishItemOptions?.itemSharing || [];
        shareService.subscribersNumber = publishItemOptions?.numberOfSubscribers || 0;

        this._publishService.openSharingModal(publishItemOptions)
        .subscribe(() => successCallBack())
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
