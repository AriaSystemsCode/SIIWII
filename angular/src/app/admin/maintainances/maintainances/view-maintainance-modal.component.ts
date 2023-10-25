import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetMaintainanceForViewDto, MaintainanceDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewMaintainanceModal',
    templateUrl: './view-maintainance-modal.component.html'
})
export class ViewMaintainanceModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetMaintainanceForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetMaintainanceForViewDto();
        this.item.maintainance = new MaintainanceDto();
    }

    show(item: GetMaintainanceForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
