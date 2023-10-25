import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycPlansServiceProxy, CreateOrEditSycPlanDto ,SycPlanSycApplicationLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditSycPlanModal',
    templateUrl: './create-or-edit-sycPlan-modal.component.html'
})
export class CreateOrEditSycPlanModalComponent extends AppComponentBase {
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycPlan: CreateOrEditSycPlanDto = new CreateOrEditSycPlanDto();

    sycApplicationName = '';

	allSycApplications: SycPlanSycApplicationLookupTableDto[];
					
    constructor(
        injector: Injector,
        private _sycPlansServiceProxy: SycPlansServiceProxy
    ) {
        super(injector);
    }
    
    show(sycPlanId?: number): void {
    

        if (!sycPlanId) {
            this.sycPlan = new CreateOrEditSycPlanDto();
            this.sycPlan.id = sycPlanId;
            this.sycApplicationName = '';

            this.active = true;
            this.modal.show();
        } else {
            this._sycPlansServiceProxy.getSycPlanForEdit(sycPlanId).subscribe(result => {
                this.sycPlan = result.sycPlan;

                this.sycApplicationName = result.sycApplicationName;

                this.active = true;
                this.modal.show();
            });
        }
        this._sycPlansServiceProxy.getAllSycApplicationForTableDropdown().subscribe(result => {						
						this.allSycApplications = result;
					});
					
    }

    save(): void {
            this.saving = true;

			
			
            this._sycPlansServiceProxy.createOrEdit(this.sycPlan)
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
