import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetAppTenantsActivitiesLogForViewDto, AppTenantsActivitiesLogDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewAppTenantsActivitiesLogModal',
    templateUrl: './view-appTenantsActivitiesLog-modal.component.html'
})
export class ViewAppTenantsActivitiesLogModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetAppTenantsActivitiesLogForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetAppTenantsActivitiesLogForViewDto();
        this.item.appTenantsActivitiesLog = new AppTenantsActivitiesLogDto();
    }

    show(item: GetAppTenantsActivitiesLogForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
