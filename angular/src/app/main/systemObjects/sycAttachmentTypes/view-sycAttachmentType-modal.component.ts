import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSycAttachmentTypeForViewDto, SycAttachmentTypeDto , AttachmentType} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSycAttachmentTypeModal',
    templateUrl: './view-sycAttachmentType-modal.component.html'
})
export class ViewSycAttachmentTypeModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSycAttachmentTypeForViewDto;
    attachmentType = AttachmentType;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSycAttachmentTypeForViewDto();
        this.item.sycAttachmentType = new SycAttachmentTypeDto();
    }

    show(item: GetSycAttachmentTypeForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
