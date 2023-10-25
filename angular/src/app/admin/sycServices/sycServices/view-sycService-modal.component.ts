import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycServiceForViewDto, SycServiceDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycServiceModal',
    templateUrl: './view-sycService-modal.component.html'
})
export class ViewSycServiceModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycServiceForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycServiceForViewDto();
        this.item.sycService = new SycServiceDto();
    }

    show(item: GetSycServiceForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
