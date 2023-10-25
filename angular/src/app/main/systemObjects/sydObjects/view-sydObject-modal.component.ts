import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSydObjectForViewDto, SydObjectDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSydObjectModal',
    templateUrl: './view-sydObject-modal.component.html'
})
export class ViewSydObjectModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSydObjectForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSydObjectForViewDto();
        this.item.sydObject = new SydObjectDto();
    }

    show(item: GetSydObjectForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
