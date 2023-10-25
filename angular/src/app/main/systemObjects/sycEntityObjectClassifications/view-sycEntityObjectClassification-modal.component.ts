import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycEntityObjectClassificationForViewDto, SycEntityObjectClassificationDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycEntityObjectClassificationModal',
    templateUrl: './view-sycEntityObjectClassification-modal.component.html'
})
export class ViewSycEntityObjectClassificationModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycEntityObjectClassificationForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycEntityObjectClassificationForViewDto();
        this.item.sycEntityObjectClassification = new SycEntityObjectClassificationDto();
    }

    show(item: GetSycEntityObjectClassificationForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
