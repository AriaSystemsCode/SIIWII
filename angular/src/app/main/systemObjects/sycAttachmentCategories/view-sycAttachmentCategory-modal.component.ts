import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AttachmentType, GetSycAttachmentCategoryForViewDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycAttachmentCategoryModal',
    templateUrl: './view-sycAttachmentCategory-modal.component.html'
})
export class ViewSycAttachmentCategoryModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycAttachmentCategoryForViewDto;
    AttachmentTypesEnum = AttachmentType


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycAttachmentCategoryForViewDto();
        this.item.sycAttachmentCategory = new SycAttachmentCategoryDto();
    }

    show(item: GetSycAttachmentCategoryForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
