import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycEntityObjectStatusForViewDto, SycEntityObjectStatusDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycEntityObjectStatusModal',
    templateUrl: './view-sycEntityObjectStatus-modal.component.html'
})
export class ViewSycEntityObjectStatusModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycEntityObjectStatusForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycEntityObjectStatusForViewDto();
        this.item.sycEntityObjectStatus = new SycEntityObjectStatusDto();
    }

    show(item: GetSycEntityObjectStatusForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
