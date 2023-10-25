import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycSegmentIdentifierDefinitionForViewDto, SycSegmentIdentifierDefinitionDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycSegmentIdentifierDefinitionModal',
    templateUrl: './view-sycSegmentIdentifierDefinition-modal.component.html'
})
export class ViewSycSegmentIdentifierDefinitionModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycSegmentIdentifierDefinitionForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycSegmentIdentifierDefinitionForViewDto();
        this.item.sycSegmentIdentifierDefinition = new SycSegmentIdentifierDefinitionDto();
    }

    show(item: GetSycSegmentIdentifierDefinitionForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
