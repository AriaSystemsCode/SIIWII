import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetAppTenantPlanForViewDto, AppTenantPlanDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewAppTenantPlanModal',
    templateUrl: './view-appTenantPlan-modal.component.html'
})
export class ViewAppTenantPlanModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetAppTenantPlanForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetAppTenantPlanForViewDto();
        this.item.appTenantPlan = new AppTenantPlanDto();
    }

    show(item: GetAppTenantPlanForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
