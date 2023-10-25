import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppTenantPlansServiceProxy, CreateOrEditAppTenantPlanDto ,AppTenantPlanSycPlanLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditAppTenantPlanModal',
    templateUrl: './create-or-edit-appTenantPlan-modal.component.html'
})
export class CreateOrEditAppTenantPlanModalComponent extends AppComponentBase {
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    appTenantPlan: CreateOrEditAppTenantPlanDto = new CreateOrEditAppTenantPlanDto();

    sycPlanName = '';

	allSycPlans: AppTenantPlanSycPlanLookupTableDto[];
					
    constructor(
        injector: Injector,
        private _appTenantPlansServiceProxy: AppTenantPlansServiceProxy
    ) {
        super(injector);
    }
    
    show(appTenantPlanId?: number): void {
    

        if (!appTenantPlanId) {
            this.appTenantPlan = new CreateOrEditAppTenantPlanDto();
            this.appTenantPlan.id = appTenantPlanId;
            this.appTenantPlan.addDate = moment().startOf('day');
            this.appTenantPlan.endDate = moment().startOf('day');
            this.appTenantPlan.startDate = moment().startOf('day');
            this.sycPlanName = '';

            this.active = true;
            this.modal.show();
        } else {
            this._appTenantPlansServiceProxy.getAppTenantPlanForEdit(appTenantPlanId).subscribe(result => {
                this.appTenantPlan = result.appTenantPlan;

                this.sycPlanName = result.sycPlanName;

                this.active = true;
                this.modal.show();
            });
        }
        this._appTenantPlansServiceProxy.getAllSycPlanForTableDropdown().subscribe(result => {						
						this.allSycPlans = result;
					});
					
    }

    save(): void {
            this.saving = true;

			
			
            this._appTenantPlansServiceProxy.createOrEdit(this.appTenantPlan)
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
