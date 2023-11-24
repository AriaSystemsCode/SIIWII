import { AppConsts } from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppAdvertisementsServiceProxy, AppAdvertisementDto } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';


import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/public_api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';


@Component({
    templateUrl: './appAdvertisements.component.html',
    animations: [appModuleAnimation()]
})
export class AppAdvertisementsComponent extends AppComponentBase {


    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;


    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    maxTenantIdFilter: number;
    maxTenantIdFilterEmpty: number;
    minTenantIdFilter: number;
    minTenantIdFilterEmpty: number;
    maxStartDateFilter: moment.Moment;
    minStartDateFilter: moment.Moment;
    maxEndDateFilter: moment.Moment;
    minEndDateFilter: moment.Moment;
    startTimeFilter = '';
    endTimeFilter = '';
    timeZoneFilter = '';
    publishOnHomePageFilter = -1;
    isApprovedFilter = -1;
    publishOnMarketLandingPageFilter = -1
    maxApprovalDateTimeFilter: moment.Moment;
    minApprovalDateTimeFilter: moment.Moment;
    paymentMethodFilter = '';
    maxInvoiceNumberFilter: number;
    maxInvoiceNumberFilterEmpty: number;
    minInvoiceNumberFilter: number;
    minInvoiceNumberFilterEmpty: number;
    maxNumberOfOccurencesFilter: number;
    maxNumberOfOccurencesFilterEmpty: number;
    minNumberOfOccurencesFilter: number;
    minNumberOfOccurencesFilterEmpty: number;
    maxPeriodOfViewFilter: number;
    maxPeriodOfViewFilterEmpty: number;
    minPeriodOfViewFilter: number;
    minPeriodOfViewFilterEmpty: number;
    appEntityNameFilter = '';
    userNameFilter = '';

    _entityTypeFullName = 'onetouch.AppAdvertisements.AppAdvertisement';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _appAdvertisementsServiceProxy: AppAdvertisementsServiceProxy,
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

    getAppAdvertisements(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._appAdvertisementsServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.maxTenantIdFilter == null ? this.maxTenantIdFilterEmpty : this.maxTenantIdFilter,
            this.minTenantIdFilter == null ? this.minTenantIdFilterEmpty : this.minTenantIdFilter,
            this.maxStartDateFilter === undefined ? this.maxStartDateFilter : moment(this.maxStartDateFilter).endOf('day'),
            this.minStartDateFilter === undefined ? this.minStartDateFilter : moment(this.minStartDateFilter).startOf('day'),
            this.maxEndDateFilter === undefined ? this.maxEndDateFilter : moment(this.maxEndDateFilter).endOf('day'),
            this.minEndDateFilter === undefined ? this.minEndDateFilter : moment(this.minEndDateFilter).startOf('day'),
            this.startTimeFilter,
            this.endTimeFilter,
            this.timeZoneFilter,
            this.publishOnHomePageFilter,
            this.publishOnMarketLandingPageFilter,
            this.maxApprovalDateTimeFilter === undefined ? this.maxApprovalDateTimeFilter : moment(this.maxApprovalDateTimeFilter).endOf('day'),
            this.minApprovalDateTimeFilter === undefined ? this.minApprovalDateTimeFilter : moment(this.minApprovalDateTimeFilter).startOf('day'),
            this.paymentMethodFilter,
            this.maxInvoiceNumberFilter == null ? this.maxInvoiceNumberFilterEmpty : this.maxInvoiceNumberFilter,
            this.minInvoiceNumberFilter == null ? this.minInvoiceNumberFilterEmpty : this.minInvoiceNumberFilter,
            this.maxNumberOfOccurencesFilter == null ? this.maxNumberOfOccurencesFilterEmpty : this.maxNumberOfOccurencesFilter,
            this.minNumberOfOccurencesFilter == null ? this.minNumberOfOccurencesFilterEmpty : this.minNumberOfOccurencesFilter,
            this.maxPeriodOfViewFilter == null ? this.maxPeriodOfViewFilterEmpty : this.maxPeriodOfViewFilter,
            this.minPeriodOfViewFilter == null ? this.minPeriodOfViewFilterEmpty : this.minPeriodOfViewFilter,
            this.appEntityNameFilter,
            this.userNameFilter,
            undefined,
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

    createAppAdvertisement(): void {
        this._router.navigate(['/app/admin/appAdvertisements/appAdvertisements/createOrEdit']);
    }


    showHistory(appAdvertisement: AppAdvertisementDto): void {
        this.entityTypeHistoryModal.show({
            entityId: appAdvertisement.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteAppAdvertisement(appAdvertisement: AppAdvertisementDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
  
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._appAdvertisementsServiceProxy.delete(appAdvertisement.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }
}
