import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetAppTransactionForViewDto, AppTransactionDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewAppTransactionModal',
    templateUrl: './view-appTransaction-modal.component.html'
})
export class ViewAppTransactionModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetAppTransactionForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetAppTransactionForViewDto();
        this.item.appTransaction = new AppTransactionDto();
    }

    show(item: GetAppTransactionForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
