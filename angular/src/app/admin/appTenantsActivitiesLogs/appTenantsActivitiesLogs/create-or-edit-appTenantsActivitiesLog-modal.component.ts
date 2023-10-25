import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppTenantsActivitiesLogsServiceProxy, CreateOrEditAppTenantsActivitiesLogDto ,AppTenantsActivitiesLogSycServiceLookupTableDto
					,AppTenantsActivitiesLogSycApplicationLookupTableDto
					,AppTenantsActivitiesLogAppTransactionLookupTableDto
					,AppTenantsActivitiesLogSycPlanLookupTableDto
                    ,AppTenantsActivitiesLogTenantLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditAppTenantsActivitiesLogModal',
    templateUrl: './create-or-edit-appTenantsActivitiesLog-modal.component.html'
})
export class CreateOrEditAppTenantsActivitiesLogModalComponent extends AppComponentBase {
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    appTenantsActivitiesLog: CreateOrEditAppTenantsActivitiesLogDto = new CreateOrEditAppTenantsActivitiesLogDto();

    sycServiceCode = '';
    sycApplicationName = '';
    appTransactionCode = '';
    sycPlanName = '';
    tenancyName = '';
	allSycServices: AppTenantsActivitiesLogSycServiceLookupTableDto[];
						allSycApplications: AppTenantsActivitiesLogSycApplicationLookupTableDto[];
						allAppTransactions: AppTenantsActivitiesLogAppTransactionLookupTableDto[];
						allSycPlans: AppTenantsActivitiesLogSycPlanLookupTableDto[];
                        allTenants: AppTenantsActivitiesLogTenantLookupTableDto[];
					
    constructor(
        injector: Injector,
        private _appTenantsActivitiesLogsServiceProxy: AppTenantsActivitiesLogsServiceProxy
    ) {
        super(injector);
    }
    
    show(appTenantsActivitiesLogId?: number): void {
    

        if (!appTenantsActivitiesLogId) {
            this.appTenantsActivitiesLog = new CreateOrEditAppTenantsActivitiesLogDto();
            this.appTenantsActivitiesLog.id = appTenantsActivitiesLogId;
            this.appTenantsActivitiesLog.activityDate = moment().startOf('day');
            this.appTenantsActivitiesLog.invoiceDate = moment().startOf('day');
            this.sycServiceCode = '';
            this.sycApplicationName = '';
            this.appTransactionCode = '';
            this.sycPlanName = '';
            this.tenancyName = '';
            this.appTenantsActivitiesLog.isManual = true;

            this.active = true;
            this.modal.show();
        } else {
            this._appTenantsActivitiesLogsServiceProxy.getAppTenantsActivitiesLogForEdit(appTenantsActivitiesLogId).subscribe(result => {
                this.appTenantsActivitiesLog = result.appTenantsActivitiesLog;

                this.sycServiceCode = result.sycServiceCode;
                this.sycApplicationName = result.sycApplicationName;
                this.appTransactionCode = result.appTransactionCode;
                this.sycPlanName = result.sycPlanName;
                this.tenancyName = result.tenancyName;

                this.active = true;
                this.modal.show();
            });
        }
        this._appTenantsActivitiesLogsServiceProxy.getAllSycServiceForTableDropdown().subscribe(result => {						
						this.allSycServices = result;
					});
					this._appTenantsActivitiesLogsServiceProxy.getAllSycApplicationForTableDropdown().subscribe(result => {						
						this.allSycApplications = result;
					});
					this._appTenantsActivitiesLogsServiceProxy.getAllAppTransactionForTableDropdown().subscribe(result => {						
						this.allAppTransactions = result;
					});
					this._appTenantsActivitiesLogsServiceProxy.getAllSycPlanForTableDropdown().subscribe(result => {						
						this.allSycPlans = result;
					});
                    this._appTenantsActivitiesLogsServiceProxy.getAllTenantForTableDropdown().subscribe(result => {						
						this.allTenants = result;
					});
    }

    save(): void {
            this.saving = true;

			
			
            this._appTenantsActivitiesLogsServiceProxy.createOrEdit(this.appTenantsActivitiesLog)
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
