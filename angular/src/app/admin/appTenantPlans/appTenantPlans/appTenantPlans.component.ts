import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { AppTenantPlansServiceProxy, AppTenantPlanDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditAppTenantPlanModalComponent } from './create-or-edit-appTenantPlan-modal.component';

import { ViewAppTenantPlanModalComponent } from './view-appTenantPlan-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/public_api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';


@Component({
    templateUrl: './appTenantPlans.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AppTenantPlansComponent extends AppComponentBase {
    
    
    @ViewChild('createOrEditAppTenantPlanModal', { static: true }) createOrEditAppTenantPlanModal: CreateOrEditAppTenantPlanModalComponent;
    @ViewChild('viewAppTenantPlanModalComponent', { static: true }) viewAppTenantPlanModal: ViewAppTenantPlanModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    maxAddDateFilter : moment.Moment;
		minAddDateFilter : moment.Moment;
    maxEndDateFilter : moment.Moment;
		minEndDateFilter : moment.Moment;
    maxStartDateFilter : moment.Moment;
		minStartDateFilter : moment.Moment;
        sycPlanNameFilter = '';






    constructor(
        injector: Injector,
        private _appTenantPlansServiceProxy: AppTenantPlansServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getAppTenantPlans(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._appTenantPlansServiceProxy.getAll(
            this.filterText,
            this.maxAddDateFilter === undefined ? this.maxAddDateFilter : moment(this.maxAddDateFilter).endOf('day'),
            this.minAddDateFilter === undefined ? this.minAddDateFilter : moment(this.minAddDateFilter).startOf('day'),
            this.maxEndDateFilter === undefined ? this.maxEndDateFilter : moment(this.maxEndDateFilter).endOf('day'),
            this.minEndDateFilter === undefined ? this.minEndDateFilter : moment(this.minEndDateFilter).startOf('day'),
            this.maxStartDateFilter === undefined ? this.maxStartDateFilter : moment(this.maxStartDateFilter).endOf('day'),
            this.minStartDateFilter === undefined ? this.minStartDateFilter : moment(this.minStartDateFilter).startOf('day'),
            this.sycPlanNameFilter,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createAppTenantPlan(): void {
        this.createOrEditAppTenantPlanModal.show();        
    }


    deleteAppTenantPlan(appTenantPlan: AppTenantPlanDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._appTenantPlansServiceProxy.delete(appTenantPlan.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._appTenantPlansServiceProxy.getAppTenantPlansToExcel(
        this.filterText,
            this.maxAddDateFilter === undefined ? this.maxAddDateFilter : moment(this.maxAddDateFilter).endOf('day'),
            this.minAddDateFilter === undefined ? this.minAddDateFilter : moment(this.minAddDateFilter).startOf('day'),
            this.maxEndDateFilter === undefined ? this.maxEndDateFilter : moment(this.maxEndDateFilter).endOf('day'),
            this.minEndDateFilter === undefined ? this.minEndDateFilter : moment(this.minEndDateFilter).startOf('day'),
            this.maxStartDateFilter === undefined ? this.maxStartDateFilter : moment(this.maxStartDateFilter).endOf('day'),
            this.minStartDateFilter === undefined ? this.minStartDateFilter : moment(this.minStartDateFilter).startOf('day'),
            this.sycPlanNameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
}
