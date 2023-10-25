import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycCounterForViewDto, SycCounterDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'masterDetailChild_SycSegmentIdentifierDefinition_viewSycCounterModal',
    templateUrl: './masterDetailChild_SycSegmentIdentifierDefinition_view-sycCounter-modal.component.html'
})
export class MasterDetailChild_SycSegmentIdentifierDefinition_ViewSycCounterModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycCounterForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycCounterForViewDto();
        this.item.sycCounter = new SycCounterDto();
    }

    show(item: GetSycCounterForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
