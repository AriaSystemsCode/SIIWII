﻿import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetAppSubscriptionPlanHeaderForViewDto, AppSubscriptionPlanHeaderDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewAppSubscriptionPlanHeaderModal',
    templateUrl: './view-appSubscriptionPlanHeader-modal.component.html'
})
export class ViewAppSubscriptionPlanHeaderModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetAppSubscriptionPlanHeaderForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetAppSubscriptionPlanHeaderForViewDto();
        this.item.appSubscriptionPlanHeader = new AppSubscriptionPlanHeaderDto();
    }

    show(item: GetAppSubscriptionPlanHeaderForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
