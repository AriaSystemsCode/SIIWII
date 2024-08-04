import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { AppTenantActivitiesLogServiceProxy, AppTenantActivityLogDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';


import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
    templateUrl: './appTenantActivitiesLog.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AppTenantActivitiesLogComponent extends AppComponentBase {
    
    
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
       
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    maxTenantIdFilter : number;
		maxTenantIdFilterEmpty : number;
		minTenantIdFilter : number;
		minTenantIdFilterEmpty : number;
    tenantNameFilter = '';
    maxUserIdFilter : number;
		maxUserIdFilterEmpty : number;
		minUserIdFilter : number;
		minUserIdFilterEmpty : number;
    activityTypeFilter = '';
    maxAppSubscriptionPlanHeaderIdFilter : number;
		maxAppSubscriptionPlanHeaderIdFilterEmpty : number;
		minAppSubscriptionPlanHeaderIdFilter : number;
		minAppSubscriptionPlanHeaderIdFilterEmpty : number;
    appSubscriptionPlanCodeFilter = '';
    maxActivityDateTimeFilter : moment.Moment;
		minActivityDateTimeFilter : moment.Moment;
    userNameFilter = '';
    featureCodeFilter = '';
    featureNameFilter = '';
    billableFilter = -1;
    invoicedFilter = -1;
    referenceFilter = '';
    maxQtyFilter : number;
		maxQtyFilterEmpty : number;
		minQtyFilter : number;
		minQtyFilterEmpty : number;
    maxConsumedQtyFilter : number;
		maxConsumedQtyFilterEmpty : number;
		minConsumedQtyFilter : number;
		minConsumedQtyFilterEmpty : number;
    maxRemainingQtyFilter : number;
		maxRemainingQtyFilterEmpty : number;
		minRemainingQtyFilter : number;
		minRemainingQtyFilterEmpty : number;
    maxPriceFilter : number;
		maxPriceFilterEmpty : number;
		minPriceFilter : number;
		minPriceFilterEmpty : number;
    maxAmountFilter : number;
		maxAmountFilterEmpty : number;
		minAmountFilter : number;
		minAmountFilterEmpty : number;
    maxInvoiceDateFilter : moment.Moment;
		minInvoiceDateFilter : moment.Moment;
    invoiceNumberFilter = '';
    creditOrUsageFilter = '';
    monthFilter = '';
    yearFilter = '';


    _entityTypeFullName = 'onetouch.AppSubScriptionPlan.AppTenantActivityLog';
    entityHistoryEnabled = false;



    constructor(
        injector: Injector,
        private _appTenantActivitiesLogServiceProxy: AppTenantActivitiesLogServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
			private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return this.isGrantedAny('Pages.Administration.AuditLogs') && customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    getAppTenantActivitiesLog(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._appTenantActivitiesLogServiceProxy.getAll(
            this.filterText,
            this.maxTenantIdFilter == null ? this.maxTenantIdFilterEmpty: this.maxTenantIdFilter,
            this.minTenantIdFilter == null ? this.minTenantIdFilterEmpty: this.minTenantIdFilter,
            this.tenantNameFilter,
            this.maxUserIdFilter == null ? this.maxUserIdFilterEmpty: this.maxUserIdFilter,
            this.minUserIdFilter == null ? this.minUserIdFilterEmpty: this.minUserIdFilter,
            this.activityTypeFilter,
            this.maxAppSubscriptionPlanHeaderIdFilter == null ? this.maxAppSubscriptionPlanHeaderIdFilterEmpty: this.maxAppSubscriptionPlanHeaderIdFilter,
            this.minAppSubscriptionPlanHeaderIdFilter == null ? this.minAppSubscriptionPlanHeaderIdFilterEmpty: this.minAppSubscriptionPlanHeaderIdFilter,
            this.appSubscriptionPlanCodeFilter,
            this.maxActivityDateTimeFilter === undefined ? this.maxActivityDateTimeFilter : moment(this.maxActivityDateTimeFilter).endOf('day'),
            this.minActivityDateTimeFilter === undefined ? this.minActivityDateTimeFilter : moment(this.minActivityDateTimeFilter).startOf('day'),
            this.userNameFilter,
            this.featureCodeFilter,
            this.featureNameFilter,
            this.billableFilter,
            this.invoicedFilter,
            this.referenceFilter,
            this.maxQtyFilter == null ? this.maxQtyFilterEmpty: this.maxQtyFilter,
            this.minQtyFilter == null ? this.minQtyFilterEmpty: this.minQtyFilter,
            this.maxConsumedQtyFilter == null ? this.maxConsumedQtyFilterEmpty: this.maxConsumedQtyFilter,
            this.minConsumedQtyFilter == null ? this.minConsumedQtyFilterEmpty: this.minConsumedQtyFilter,
            this.maxRemainingQtyFilter == null ? this.maxRemainingQtyFilterEmpty: this.maxRemainingQtyFilter,
            this.minRemainingQtyFilter == null ? this.minRemainingQtyFilterEmpty: this.minRemainingQtyFilter,
            this.maxPriceFilter == null ? this.maxPriceFilterEmpty: this.maxPriceFilter,
            this.minPriceFilter == null ? this.minPriceFilterEmpty: this.minPriceFilter,
            this.maxAmountFilter == null ? this.maxAmountFilterEmpty: this.maxAmountFilter,
            this.minAmountFilter == null ? this.minAmountFilterEmpty: this.minAmountFilter,
            this.maxInvoiceDateFilter === undefined ? this.maxInvoiceDateFilter : moment(this.maxInvoiceDateFilter).endOf('day'),
            this.minInvoiceDateFilter === undefined ? this.minInvoiceDateFilter : moment(this.minInvoiceDateFilter).startOf('day'),
            this.invoiceNumberFilter,
            this.creditOrUsageFilter,
            this.monthFilter,
            this.yearFilter,
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

    createAppTenantActivityLog(): void {
        this._router.navigate(['/app/admin/appSubScriptionPlan/appTenantActivitiesLog/createOrEdit']);        
    }


    showHistory(appTenantActivityLog: AppTenantActivityLogDto): void {
        this.entityTypeHistoryModal.show({
            entityId: appTenantActivityLog.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteAppTenantActivityLog(appTenantActivityLog: AppTenantActivityLogDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._appTenantActivitiesLogServiceProxy.delete(appTenantActivityLog.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._appTenantActivitiesLogServiceProxy.getAppTenantActivitiesLogToExcel(
        this.filterText,
            this.maxTenantIdFilter == null ? this.maxTenantIdFilterEmpty: this.maxTenantIdFilter,
            this.minTenantIdFilter == null ? this.minTenantIdFilterEmpty: this.minTenantIdFilter,
            this.tenantNameFilter,
            this.maxUserIdFilter == null ? this.maxUserIdFilterEmpty: this.maxUserIdFilter,
            this.minUserIdFilter == null ? this.minUserIdFilterEmpty: this.minUserIdFilter,
            this.activityTypeFilter,
            this.maxAppSubscriptionPlanHeaderIdFilter == null ? this.maxAppSubscriptionPlanHeaderIdFilterEmpty: this.maxAppSubscriptionPlanHeaderIdFilter,
            this.minAppSubscriptionPlanHeaderIdFilter == null ? this.minAppSubscriptionPlanHeaderIdFilterEmpty: this.minAppSubscriptionPlanHeaderIdFilter,
            this.appSubscriptionPlanCodeFilter,
            this.maxActivityDateTimeFilter === undefined ? this.maxActivityDateTimeFilter : moment(this.maxActivityDateTimeFilter).endOf('day'),
            this.minActivityDateTimeFilter === undefined ? this.minActivityDateTimeFilter : moment(this.minActivityDateTimeFilter).startOf('day'),
            this.userNameFilter,
            this.featureCodeFilter,
            this.featureNameFilter,
            this.billableFilter,
            this.invoicedFilter,
            this.referenceFilter,
            this.maxQtyFilter == null ? this.maxQtyFilterEmpty: this.maxQtyFilter,
            this.minQtyFilter == null ? this.minQtyFilterEmpty: this.minQtyFilter,
            this.maxConsumedQtyFilter == null ? this.maxConsumedQtyFilterEmpty: this.maxConsumedQtyFilter,
            this.minConsumedQtyFilter == null ? this.minConsumedQtyFilterEmpty: this.minConsumedQtyFilter,
            this.maxRemainingQtyFilter == null ? this.maxRemainingQtyFilterEmpty: this.maxRemainingQtyFilter,
            this.minRemainingQtyFilter == null ? this.minRemainingQtyFilterEmpty: this.minRemainingQtyFilter,
            this.maxPriceFilter == null ? this.maxPriceFilterEmpty: this.maxPriceFilter,
            this.minPriceFilter == null ? this.minPriceFilterEmpty: this.minPriceFilter,
            this.maxAmountFilter == null ? this.maxAmountFilterEmpty: this.maxAmountFilter,
            this.minAmountFilter == null ? this.minAmountFilterEmpty: this.minAmountFilter,
            this.maxInvoiceDateFilter === undefined ? this.maxInvoiceDateFilter : moment(this.maxInvoiceDateFilter).endOf('day'),
            this.minInvoiceDateFilter === undefined ? this.minInvoiceDateFilter : moment(this.minInvoiceDateFilter).startOf('day'),
            this.invoiceNumberFilter,
            this.creditOrUsageFilter,
            this.monthFilter,
            this.yearFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
    
}
