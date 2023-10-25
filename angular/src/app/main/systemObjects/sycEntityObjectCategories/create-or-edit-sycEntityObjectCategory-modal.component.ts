import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycEntityObjectCategoriesServiceProxy, CreateOrEditSycEntityObjectCategoryDto ,SycEntityObjectCategorySydObjectLookupTableDto
					,SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'createOrEditSycEntityObjectCategoryModal',
    templateUrl: './create-or-edit-sycEntityObjectCategory-modal.component.html'
})
export class CreateOrEditSycEntityObjectCategoryModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycEntityObjectCategory: CreateOrEditSycEntityObjectCategoryDto = new CreateOrEditSycEntityObjectCategoryDto();

    sydObjectName = '';
    sycEntityObjectCategoryName = '';

	allSydObjects: SycEntityObjectCategorySydObjectLookupTableDto[];
						allSycEntityObjectCategorys: SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto[];
    entityObjectType:string ="DEPARTMENT";

    constructor(
        injector: Injector,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy
    ) {
        super(injector);
    }
    allSydObjectsLoading : boolean = false
    allSycEntityObjectCategorysLoading : boolean = false
    
    show(sycEntityObjectCategoryId?: number): void {
        if (!sycEntityObjectCategoryId) {
            this.sycEntityObjectCategory = new CreateOrEditSycEntityObjectCategoryDto();
            this.sycEntityObjectCategory.id = sycEntityObjectCategoryId;
            this.sydObjectName = '';
            this.sycEntityObjectCategoryName = '';

            this.active = true;
            this.modal.show();
        } else {
            this._sycEntityObjectCategoriesServiceProxy.getSycEntityObjectCategoryForEdit(sycEntityObjectCategoryId).subscribe(result => {
                this.sycEntityObjectCategory = result.sycEntityObjectCategory;

                this.sydObjectName = result.sydObjectName;
                this.sycEntityObjectCategoryName = result.sycEntityObjectCategoryName;

                this.active = true;
                this.modal.show();
            });
        }
        this.allSydObjectsLoading = true
        this._sycEntityObjectCategoriesServiceProxy.getAllSydObjectForTableDropdown()
        .pipe(finalize(()=> this.allSydObjectsLoading = false))
        .subscribe(result => {						
            this.allSydObjects = result;
        });
        
        this.allSycEntityObjectCategorysLoading = true
        this._sycEntityObjectCategoriesServiceProxy.getAllSycEntityObjectCategoryForTableDropdown()
        .pipe(finalize(()=> this.allSycEntityObjectCategorysLoading = false))
        .subscribe(result => {						
            this.allSycEntityObjectCategorys = result;
        });
					
    }

    save(): void {
            this.saving = true;

			
            this._sycEntityObjectCategoriesServiceProxy.createOrEdit(this.sycEntityObjectCategory)
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

    getCodeValue(code: string) {
        this.sycEntityObjectCategory.code= code;
      }
}
