import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycEntityObjectClassificationsServiceProxy, CreateOrEditSycEntityObjectClassificationDto ,SycEntityObjectClassificationSydObjectLookupTableDto
					,SycEntityObjectClassificationSycEntityObjectClassificationLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'createOrEditSycEntityObjectClassificationModal',
    templateUrl: './create-or-edit-sycEntityObjectClassification-modal.component.html'
})
export class CreateOrEditSycEntityObjectClassificationModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycEntityObjectClassification: CreateOrEditSycEntityObjectClassificationDto = new CreateOrEditSycEntityObjectClassificationDto();

    sydObjectName = '';
    sycEntityObjectClassificationName = '';

	allSydObjects: SycEntityObjectClassificationSydObjectLookupTableDto[];
						allSycEntityObjectClassifications: SycEntityObjectClassificationSycEntityObjectClassificationLookupTableDto[];
			
     entityObjectType:string ="CLASSIFICATION"		
    constructor(
        injector: Injector,
        private _sycEntityObjectClassificationsServiceProxy: SycEntityObjectClassificationsServiceProxy
    ) {
        super(injector);
    }

    show(sycEntityObjectClassificationId?: number): void {

        if (!sycEntityObjectClassificationId) {
            this.sycEntityObjectClassification = new CreateOrEditSycEntityObjectClassificationDto();
            this.sycEntityObjectClassification.id = sycEntityObjectClassificationId;
            this.sydObjectName = '';
            this.sycEntityObjectClassificationName = '';

            this.active = true;
            this.modal.show();
        } else {
            this._sycEntityObjectClassificationsServiceProxy.getSycEntityObjectClassificationForEdit(sycEntityObjectClassificationId).subscribe(result => {
                this.sycEntityObjectClassification = result.sycEntityObjectClassification;

                this.sydObjectName = result.sydObjectName;
                this.sycEntityObjectClassificationName = result.sycEntityObjectClassificationName;

                this.active = true;
                this.modal.show();
            });
        }
        this._sycEntityObjectClassificationsServiceProxy.getAllSydObjectForTableDropdown().subscribe(result => {						
						this.allSydObjects = result;
					});
					this._sycEntityObjectClassificationsServiceProxy.getAllSycEntityObjectClassificationForTableDropdown().subscribe(result => {						
						this.allSycEntityObjectClassifications = result;
					});
					
    }

    save(): void {
            this.saving = true;

			
            this._sycEntityObjectClassificationsServiceProxy.createOrEdit(this.sycEntityObjectClassification)
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
        this.sycEntityObjectClassification.code= code;
      }

}
