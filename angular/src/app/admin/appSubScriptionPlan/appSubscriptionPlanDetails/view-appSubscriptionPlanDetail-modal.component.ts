import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetAppSubscriptionPlanDetailForViewDto, AppSubscriptionPlanDetailDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewAppSubscriptionPlanDetailModal',
    templateUrl: './view-appSubscriptionPlanDetail-modal.component.html'
})
export class ViewAppSubscriptionPlanDetailModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetAppSubscriptionPlanDetailForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetAppSubscriptionPlanDetailForViewDto();
        this.item.appSubscriptionPlanDetail = new AppSubscriptionPlanDetailDto();
    }

    show(item: GetAppSubscriptionPlanDetailForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
