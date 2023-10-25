import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSysObjectTypeForViewDto, SysObjectTypeDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSysObjectTypeModal',
    templateUrl: './view-sysObjectType-modal.component.html'
})
export class ViewSysObjectTypeModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSysObjectTypeForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSysObjectTypeForViewDto();
        this.item.sysObjectType = new SysObjectTypeDto();
    }

    show(item: GetSysObjectTypeForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
