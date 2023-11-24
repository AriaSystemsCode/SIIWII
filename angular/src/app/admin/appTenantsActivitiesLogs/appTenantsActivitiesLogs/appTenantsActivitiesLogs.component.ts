import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { AppTenantsActivitiesLogsServiceProxy, AppTenantsActivitiesLogDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditAppTenantsActivitiesLogModalComponent } from './create-or-edit-appTenantsActivitiesLog-modal.component';

import { ViewAppTenantsActivitiesLogModalComponent } from './view-appTenantsActivitiesLog-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/public_api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';


@Component({
    templateUrl: './appTenantsActivitiesLogs.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AppTenantsActivitiesLogsComponent extends AppComponentBase {
    
    
    @ViewChild('createOrEditAppTenantsActivitiesLogModal', { static: true }) createOrEditAppTenantsActivitiesLogModal: CreateOrEditAppTenantsActivitiesLogModalComponent;
    @ViewChild('viewAppTenantsActivitiesLogModalComponent', { static: true }) viewAppTenantsActivitiesLogModal: ViewAppTenantsActivitiesLogModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    maxActivityDateFilter : moment.Moment;
		minActivityDateFilter : moment.Moment;
    maxUnitsFilter : number;
		maxUnitsFilterEmpty : number;
		minUnitsFilter : number;
		minUnitsFilterEmpty : number;
    maxUnitPriceFilter : number;
		maxUnitPriceFilterEmpty : number;
		minUnitPriceFilter : number;
		minUnitPriceFilterEmpty : number;
    maxAmountFilter : number;
		maxAmountFilterEmpty : number;
		minAmountFilter : number;
		minAmountFilterEmpty : number;
    billedFilter = -1;
    isManualFilter = -1;
    invoiceNumberFilter = '';
    maxInvoiceDateFilter : moment.Moment;
		minInvoiceDateFilter : moment.Moment;
        sycServiceCodeFilter = '';
        sycApplicationNameFilter = '';
        appTransactionCodeFilter = '';
        sycPlanNameFilter = '';






    constructor(
        injector: Injector,
        private _appTenantsActivitiesLogsServiceProxy: AppTenantsActivitiesLogsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getAppTenantsActivitiesLogs(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._appTenantsActivitiesLogsServiceProxy.getAll(
            this.filterText,
            this.maxActivityDateFilter === undefined ? this.maxActivityDateFilter : moment(this.maxActivityDateFilter).endOf('day'),
            this.minActivityDateFilter === undefined ? this.minActivityDateFilter : moment(this.minActivityDateFilter).startOf('day'),
            this.maxUnitsFilter == null ? this.maxUnitsFilterEmpty: this.maxUnitsFilter,
            this.minUnitsFilter == null ? this.minUnitsFilterEmpty: this.minUnitsFilter,
            this.maxUnitPriceFilter == null ? this.maxUnitPriceFilterEmpty: this.maxUnitPriceFilter,
            this.minUnitPriceFilter == null ? this.minUnitPriceFilterEmpty: this.minUnitPriceFilter,
            this.maxAmountFilter == null ? this.maxAmountFilterEmpty: this.maxAmountFilter,
            this.minAmountFilter == null ? this.minAmountFilterEmpty: this.minAmountFilter,
            this.billedFilter,
            this.isManualFilter,
            this.invoiceNumberFilter,
            this.maxInvoiceDateFilter === undefined ? this.maxInvoiceDateFilter : moment(this.maxInvoiceDateFilter).endOf('day'),
            this.minInvoiceDateFilter === undefined ? this.minInvoiceDateFilter : moment(this.minInvoiceDateFilter).startOf('day'),
            this.sycServiceCodeFilter,
            this.sycApplicationNameFilter,
            this.appTransactionCodeFilter,
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

    createAppTenantsActivitiesLog(): void {
        this.createOrEditAppTenantsActivitiesLogModal.show();        
    }


    deleteAppTenantsActivitiesLog(appTenantsActivitiesLog: AppTenantsActivitiesLogDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
  
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._appTenantsActivitiesLogsServiceProxy.delete(appTenantsActivitiesLog.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._appTenantsActivitiesLogsServiceProxy.getAppTenantsActivitiesLogsToExcel(
        this.filterText,
            this.maxActivityDateFilter === undefined ? this.maxActivityDateFilter : moment(this.maxActivityDateFilter).endOf('day'),
            this.minActivityDateFilter === undefined ? this.minActivityDateFilter : moment(this.minActivityDateFilter).startOf('day'),
            this.maxUnitsFilter == null ? this.maxUnitsFilterEmpty: this.maxUnitsFilter,
            this.minUnitsFilter == null ? this.minUnitsFilterEmpty: this.minUnitsFilter,
            this.maxUnitPriceFilter == null ? this.maxUnitPriceFilterEmpty: this.maxUnitPriceFilter,
            this.minUnitPriceFilter == null ? this.minUnitPriceFilterEmpty: this.minUnitPriceFilter,
            this.maxAmountFilter == null ? this.maxAmountFilterEmpty: this.maxAmountFilter,
            this.minAmountFilter == null ? this.minAmountFilterEmpty: this.minAmountFilter,
            this.billedFilter,
            this.isManualFilter,
            this.invoiceNumberFilter,
            this.maxInvoiceDateFilter === undefined ? this.maxInvoiceDateFilter : moment(this.maxInvoiceDateFilter).endOf('day'),
            this.minInvoiceDateFilter === undefined ? this.minInvoiceDateFilter : moment(this.minInvoiceDateFilter).startOf('day'),
            this.sycServiceCodeFilter,
            this.sycApplicationNameFilter,
            this.appTransactionCodeFilter,
            this.sycPlanNameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
}
