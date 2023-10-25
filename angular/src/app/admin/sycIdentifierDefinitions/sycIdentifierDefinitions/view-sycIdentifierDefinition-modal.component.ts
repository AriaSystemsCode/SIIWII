import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycIdentifierDefinitionForViewDto, SycIdentifierDefinitionDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycIdentifierDefinitionModal',
    templateUrl: './view-sycIdentifierDefinition-modal.component.html'
})
export class ViewSycIdentifierDefinitionModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycIdentifierDefinitionForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycIdentifierDefinitionForViewDto();
        this.item.sycIdentifierDefinition = new SycIdentifierDefinitionDto();
    }

    show(item: GetSycIdentifierDefinitionForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
