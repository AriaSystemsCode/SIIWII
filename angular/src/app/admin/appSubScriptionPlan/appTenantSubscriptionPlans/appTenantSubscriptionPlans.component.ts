import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { AppTenantSubscriptionPlansServiceProxy, AppTenantSubscriptionPlanDto  } from '@shared/service-proxies/service-proxies';
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
    templateUrl: './appTenantSubscriptionPlans.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AppTenantSubscriptionPlansComponent extends AppComponentBase {
    
    
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
       
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    tenantNameFilter = '';
    maxAppSubscriptionHeaderIdFilter : number;
		maxAppSubscriptionHeaderIdFilterEmpty : number;
		minAppSubscriptionHeaderIdFilter : number;
		minAppSubscriptionHeaderIdFilterEmpty : number;
    subscriptionPlanCodeFilter = '';
    maxCurrentPeriodStartDateFilter : moment.Moment;
		minCurrentPeriodStartDateFilter : moment.Moment;
    maxCurrentPeriodEndDateFilter : moment.Moment;
		minCurrentPeriodEndDateFilter : moment.Moment;
    billingPeriodFilter = '';
    allowOverAgeFilter = -1;


    _entityTypeFullName = 'onetouch.AppSubScriptionPlan.AppTenantSubscriptionPlan';
    entityHistoryEnabled = false;



    constructor(
        injector: Injector,
        private _appTenantSubscriptionPlansServiceProxy: AppTenantSubscriptionPlansServiceProxy,
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

    getAppTenantSubscriptionPlans(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._appTenantSubscriptionPlansServiceProxy.getAll(
            this.filterText,
            this.tenantNameFilter,
            this.maxAppSubscriptionHeaderIdFilter == null ? this.maxAppSubscriptionHeaderIdFilterEmpty: this.maxAppSubscriptionHeaderIdFilter,
            this.minAppSubscriptionHeaderIdFilter == null ? this.minAppSubscriptionHeaderIdFilterEmpty: this.minAppSubscriptionHeaderIdFilter,
            this.subscriptionPlanCodeFilter,
            this.maxCurrentPeriodStartDateFilter === undefined ? this.maxCurrentPeriodStartDateFilter : moment(this.maxCurrentPeriodStartDateFilter).endOf('day'),
            this.minCurrentPeriodStartDateFilter === undefined ? this.minCurrentPeriodStartDateFilter : moment(this.minCurrentPeriodStartDateFilter).startOf('day'),
            this.maxCurrentPeriodEndDateFilter === undefined ? this.maxCurrentPeriodEndDateFilter : moment(this.maxCurrentPeriodEndDateFilter).endOf('day'),
            this.minCurrentPeriodEndDateFilter === undefined ? this.minCurrentPeriodEndDateFilter : moment(this.minCurrentPeriodEndDateFilter).startOf('day'),
            this.billingPeriodFilter,
            this.allowOverAgeFilter,
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

    createAppTenantSubscriptionPlan(): void {
        this._router.navigate(['/app/admin/appSubScriptionPlan/appTenantSubscriptionPlans/createOrEdit']);        
    }


    showHistory(appTenantSubscriptionPlan: AppTenantSubscriptionPlanDto): void {
        this.entityTypeHistoryModal.show({
            entityId: appTenantSubscriptionPlan.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteAppTenantSubscriptionPlan(appTenantSubscriptionPlan: AppTenantSubscriptionPlanDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._appTenantSubscriptionPlansServiceProxy.delete(appTenantSubscriptionPlan.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._appTenantSubscriptionPlansServiceProxy.getAppTenantSubscriptionPlansToExcel(
        this.filterText,
            this.tenantNameFilter,
            this.maxAppSubscriptionHeaderIdFilter == null ? this.maxAppSubscriptionHeaderIdFilterEmpty: this.maxAppSubscriptionHeaderIdFilter,
            this.minAppSubscriptionHeaderIdFilter == null ? this.minAppSubscriptionHeaderIdFilterEmpty: this.minAppSubscriptionHeaderIdFilter,
            this.subscriptionPlanCodeFilter,
            this.maxCurrentPeriodStartDateFilter === undefined ? this.maxCurrentPeriodStartDateFilter : moment(this.maxCurrentPeriodStartDateFilter).endOf('day'),
            this.minCurrentPeriodStartDateFilter === undefined ? this.minCurrentPeriodStartDateFilter : moment(this.minCurrentPeriodStartDateFilter).startOf('day'),
            this.maxCurrentPeriodEndDateFilter === undefined ? this.maxCurrentPeriodEndDateFilter : moment(this.maxCurrentPeriodEndDateFilter).endOf('day'),
            this.minCurrentPeriodEndDateFilter === undefined ? this.minCurrentPeriodEndDateFilter : moment(this.minCurrentPeriodEndDateFilter).startOf('day'),
            this.billingPeriodFilter,
            this.allowOverAgeFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
    
}
