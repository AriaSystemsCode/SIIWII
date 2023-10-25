import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycEntityObjectTypeForViewDto, SycEntityObjectTypeDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycEntityObjectTypeModal',
    templateUrl: './view-sycEntityObjectType-modal.component.html'
})
export class ViewSycEntityObjectTypeModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycEntityObjectTypeForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycEntityObjectTypeForViewDto();
        this.item.sycEntityObjectType = new SycEntityObjectTypeDto();
    }

    show(item: GetSycEntityObjectTypeForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
