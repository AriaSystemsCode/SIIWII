import { Injectable, Injector } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PublishItemOptions } from '@shared/service-proxies/service-proxies';
import { ModalOptions, BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, Subscription } from 'rxjs';
import { ShareListingComponent } from '../components/share-listing.component';
import { ShareAccountComponent } from '@app/main/accountInfos/components/share-account.component';

@Injectable()
export class PublishService extends AppComponentBase {

    constructor(private injector:Injector) {
        super(injector)
    }

    openSharingModal(publishItemOptions?: PublishItemOptions): Observable<PublishItemOptions> {
        return new Observable((observer) => {
            const modalDefaultData: Partial<ShareListingComponent> = {
                publishItemOptions
            }
            const config: ModalOptions = new ModalOptions()
            config.class = "modal-center share-listing-modal"
            config.initialState = modalDefaultData
            config.ignoreBackdropClick = true
            config.animated = true
            const modalRef: BsModalRef = this.bsModalService.show(ShareListingComponent, config)
            let subs: Subscription = this.bsModalService.onHidden.subscribe(() => {
                const data: ShareListingComponent = modalRef.content
                if (data.savingDone) {
                    subs.unsubscribe()
                    observer.next(data.publishItemOptions)
                }
                else {
                    observer.error()
                }
            })
        })
    }


    openAccountSharingModal(_shareOptions) {
        return new Observable((observer) => {
            const modalDefaultData: Partial<ShareAccountComponent> = {
                _shareOptions
            }
            const config: ModalOptions = new ModalOptions()
            config.class = "modal-center share-listing-modal"
            config.initialState = modalDefaultData
            config.ignoreBackdropClick = true
            config.animated = true
            const modalRef: BsModalRef = this.bsModalService.show(ShareAccountComponent, config)
            let subs: Subscription = this.bsModalService.onHidden.subscribe(() => {
                const data: ShareAccountComponent = modalRef.content
                if (data.savingDone) {
                    subs.unsubscribe()
                    observer.next(data._shareOptions)
                }
                else {
                    observer.error()
                }
            })
        })
    }

}
