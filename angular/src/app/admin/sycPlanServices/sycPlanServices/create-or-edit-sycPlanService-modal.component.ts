import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycPlanServicesServiceProxy, CreateOrEditSycPlanServiceDto ,SycPlanServiceSycApplicationLookupTableDto
					,SycPlanServiceSycPlanLookupTableDto
					,SycPlanServiceSycServiceLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditSycPlanServiceModal',
    templateUrl: './create-or-edit-sycPlanService-modal.component.html'
})
export class CreateOrEditSycPlanServiceModalComponent extends AppComponentBase {
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycPlanService: CreateOrEditSycPlanServiceDto = new CreateOrEditSycPlanServiceDto();

    sycApplicationName = '';
    sycPlanName = '';
    sycServiceCode = '';

	allSycApplications: SycPlanServiceSycApplicationLookupTableDto[];
						allSycPlans: SycPlanServiceSycPlanLookupTableDto[];
						allSycServices: SycPlanServiceSycServiceLookupTableDto[];
					
    constructor(
        injector: Injector,
        private _sycPlanServicesServiceProxy: SycPlanServicesServiceProxy
    ) {
        super(injector);
    }
    
    show(sycPlanServiceId?: number): void {
    

        if (!sycPlanServiceId) {
            this.sycPlanService = new CreateOrEditSycPlanServiceDto();
            this.sycPlanService.id = sycPlanServiceId;
            this.sycApplicationName = '';
            this.sycPlanName = '';
            this.sycServiceCode = '';

            this.active = true;
            this.modal.show();
        } else {
            this._sycPlanServicesServiceProxy.getSycPlanServiceForEdit(sycPlanServiceId).subscribe(result => {
                this.sycPlanService = result.sycPlanService;

                this.sycApplicationName = result.sycApplicationName;
                this.sycPlanName = result.sycPlanName;
                this.sycServiceCode = result.sycServiceCode;

                this.active = true;
                this.modal.show();
            });
        }
        this._sycPlanServicesServiceProxy.getAllSycApplicationForTableDropdown().subscribe(result => {						
						this.allSycApplications = result;
					});
					this._sycPlanServicesServiceProxy.getAllSycPlanForTableDropdown().subscribe(result => {						
						this.allSycPlans = result;
					});
					this._sycPlanServicesServiceProxy.getAllSycServiceForTableDropdown().subscribe(result => {						
						this.allSycServices = result;
					});
					
    }

    save(): void {
            this.saving = true;

			
			
            this._sycPlanServicesServiceProxy.createOrEdit(this.sycPlanService)
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
