import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycPlanForViewDto, SycPlanDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycPlanModal',
    templateUrl: './view-sycPlan-modal.component.html'
})
export class ViewSycPlanModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycPlanForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycPlanForViewDto();
        this.item.sycPlan = new SycPlanDto();
    }

    show(item: GetSycPlanForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
