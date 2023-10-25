import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycAttachmentCategoriesServiceProxy, CreateOrEditSycAttachmentCategoryDto ,SycAttachmentCategorySycAttachmentCategoryLookupTableDto, SelectItemDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'createOrEditSycAttachmentCategoryModal',
    templateUrl: './create-or-edit-sycAttachmentCategory-modal.component.html'
})
export class CreateOrEditSycAttachmentCategoryModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycAttachmentCategory: CreateOrEditSycAttachmentCategoryDto = new CreateOrEditSycAttachmentCategoryDto();

    sycAttachmentCategoryName = '';

	allSycAttachmentCategorys: SycAttachmentCategorySycAttachmentCategoryLookupTableDto[];

	allSycAttachmentCategorysTypes: SelectItemDto[];

    constructor(
        injector: Injector,
    ) {
        super(injector);
    }

    show(sycAttachmentCategoryId?: number): void {

        if (!sycAttachmentCategoryId) {
            this.sycAttachmentCategory = new CreateOrEditSycAttachmentCategoryDto();
            this.sycAttachmentCategory.id = sycAttachmentCategoryId;
            this.sycAttachmentCategoryName = '';

            this.active = true;
            this.modal.show();
        } else {
            this._sycAttachmentCategoriesServiceProxy.getSycAttachmentCategoryForEdit(sycAttachmentCategoryId).subscribe(result => {
                this.sycAttachmentCategory = result.sycAttachmentCategory;

                this.sycAttachmentCategoryName = result.sycAttachmentCategoryName;

                this.active = true;
                this.modal.show();
            });
        }
        this.getAllSycAttachmentCategoryForTableDropdown();
        this.getAllSycAttachmentCategoryTypesForTableDropdown();
    }
    getAllSycAttachmentCategoryForTableDropdown(){
        this._sycAttachmentCategoriesServiceProxy.getAllSycAttachmentCategoryForTableDropdown().subscribe(result => {
            this.allSycAttachmentCategorys = result;
        });
    }
    getAllSycAttachmentCategoryTypesForTableDropdown(){
        this._sycAttachmentCategoriesServiceProxy.getAllSycAttachmentCategoryTypesForTableDropdown().subscribe(result => {
            this.allSycAttachmentCategorysTypes = result;
        });
    }
    save(): void {
        this.saving = true;

        this._sycAttachmentCategoriesServiceProxy.createOrEdit(this.sycAttachmentCategory)
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
