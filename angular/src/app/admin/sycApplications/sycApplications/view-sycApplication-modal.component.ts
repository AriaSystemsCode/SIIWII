import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycApplicationForViewDto, SycApplicationDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycApplicationModal',
    templateUrl: './view-sycApplication-modal.component.html'
})
export class ViewSycApplicationModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycApplicationForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycApplicationForViewDto();
        this.item.sycApplication = new SycApplicationDto();
    }

    show(item: GetSycApplicationForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
