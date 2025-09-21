import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetValidationRuleForViewDto, ValidationRuleDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewValidationRuleModal',
    templateUrl: './view-validationRule-modal.component.html'
})
export class ViewValidationRuleModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetValidationRuleForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetValidationRuleForViewDto();
        this.item.validationRule = new ValidationRuleDto();
    }

    show(item: GetValidationRuleForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
