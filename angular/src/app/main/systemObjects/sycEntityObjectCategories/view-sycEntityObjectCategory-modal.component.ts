import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycEntityObjectCategoryForViewDto, SycEntityObjectCategoryDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycEntityObjectCategoryModal',
    templateUrl: './view-sycEntityObjectCategory-modal.component.html'
})
export class ViewSycEntityObjectCategoryModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycEntityObjectCategoryForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycEntityObjectCategoryForViewDto();
        this.item.sycEntityObjectCategory = new SycEntityObjectCategoryDto();
    }

    show(item: GetSycEntityObjectCategoryForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
