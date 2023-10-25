import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SycAttachmentTypesServiceProxy, CreateOrEditSycAttachmentTypeDto, SelectItemDto, SycAttachmentCategoriesServiceProxy } from '@shared/service-proxies/service-proxies';


@Component({
    selector: 'createOrEditSycAttachmentTypeModal',
    templateUrl: './create-or-edit-sycAttachmentType-modal.component.html'
})
export class CreateOrEditSycAttachmentTypeModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycAttachmentType: CreateOrEditSycAttachmentTypeDto = new CreateOrEditSycAttachmentTypeDto();



    constructor(
        injector: Injector,
        private _sycAttachmentTypesServiceProxy: SycAttachmentTypesServiceProxy,
    ) {
        super(injector);
    }

    show(sycAttachmentTypeId?: number): void {

        if (!sycAttachmentTypeId) {
            this.sycAttachmentType = new CreateOrEditSycAttachmentTypeDto();
            this.sycAttachmentType.id = sycAttachmentTypeId;

            this.active = true;
            this.modal.show();
        } else {
            this._sycAttachmentTypesServiceProxy.getSycAttachmentTypeForEdit(sycAttachmentTypeId).subscribe(result => {
                this.sycAttachmentType = result.sycAttachmentType;


                this.active = true;
                this.modal.show();
            });
        }
        this.getAllSycAttachmentCategoryTypesForTableDropdown()
    }
    allSycAttachmentCategorysTypes : SelectItemDto[]
    getAllSycAttachmentCategoryTypesForTableDropdown(){
        this._sycAttachmentCategoriesServiceProxy.getAllSycAttachmentCategoryTypesForTableDropdown().subscribe(result => {
            this.allSycAttachmentCategorysTypes = result;
        });
    }
    save(): void {
            this.saving = true;


            this._sycAttachmentTypesServiceProxy.createOrEdit(this.sycAttachmentType)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }







    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
