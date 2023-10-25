import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycPlanServiceForViewDto, SycPlanServiceDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycPlanServiceModal',
    templateUrl: './view-sycPlanService-modal.component.html'
})
export class ViewSycPlanServiceModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycPlanServiceForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycPlanServiceForViewDto();
        this.item.sycPlanService = new SycPlanServiceDto();
    }

    show(item: GetSycPlanServiceForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
