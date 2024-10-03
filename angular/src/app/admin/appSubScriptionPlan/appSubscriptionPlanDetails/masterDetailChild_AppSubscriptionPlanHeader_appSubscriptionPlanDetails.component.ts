import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { AppSubscriptionPlanDetailsServiceProxy, AppSubscriptionPlanDetailDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { MasterDetailChild_AppSubscriptionPlanHeader_CreateOrEditAppSubscriptionPlanDetailModalComponent } from './masterDetailChild_AppSubscriptionPlanHeader_create-or-edit-appSubscriptionPlanDetail-modal.component';

import { MasterDetailChild_AppSubscriptionPlanHeader_ViewAppSubscriptionPlanDetailModalComponent } from './masterDetailChild_AppSubscriptionPlanHeader_view-appSubscriptionPlanDetail-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AppSubscriptionPlanDetailAppFeatureLookupTableModalComponent } from './appSubscriptionPlanDetail-appFeature-lookup-table-modal.component';

@Component({
    templateUrl: './masterDetailChild_AppSubscriptionPlanHeader_appSubscriptionPlanDetails.component.html',
    selector: "masterDetailChild_AppSubscriptionPlanHeader_appSubscriptionPlanDetails-component",
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class MasterDetailChild_AppSubscriptionPlanHeader_AppSubscriptionPlanDetailsComponent extends AppComponentBase {
    @Input("appSubscriptionPlanHeaderId") appSubscriptionPlanHeaderId: any;
    
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('createOrEditAppSubscriptionPlanDetailModal', { static: true }) createOrEditAppSubscriptionPlanDetailModal: MasterDetailChild_AppSubscriptionPlanHeader_CreateOrEditAppSubscriptionPlanDetailModalComponent;
    @ViewChild('viewAppSubscriptionPlanDetailModalComponent', { static: true }) viewAppSubscriptionPlanDetailModal: MasterDetailChild_AppSubscriptionPlanHeader_ViewAppSubscriptionPlanDetailModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    featureCodeFilter = '';
    featureNameFilter = '';
    availabilityFilter = '';
    maxFeatureLimitFilter : number;
		maxFeatureLimitFilterEmpty : number;
		minFeatureLimitFilter : number;
		minFeatureLimitFilterEmpty : number;
    rollOverFilter = -1;
    maxUnitPriceFilter : number;
		maxUnitPriceFilterEmpty : number;
		minUnitPriceFilter : number;
		minUnitPriceFilterEmpty : number;
    featurePeriodLimitFilter = '';
    categoryFilter = '';
    featureDescriptionFilter = '';
    featureStatusFilter = '';
    unitOfMeasurementNameFilter = '';
    unitOfMeasurmentCodeFilter = '';
    isFeatureBillableFilter = -1;
    featureBillingCodeFilter = '';
    featureCategoryFilter = '';
    trackactivityFilter = -1;


    _entityTypeFullName = 'onetouch.AppSubScriptionPlan.AppSubscriptionPlanDetail';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _appSubscriptionPlanDetailsServiceProxy: AppSubscriptionPlanDetailsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
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

    getAppSubscriptionPlanDetails(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._appSubscriptionPlanDetailsServiceProxy.getAll(
            this.filterText,
            this.featureCodeFilter,
            this.featureNameFilter,
            this.availabilityFilter,
            this.maxFeatureLimitFilter == null ? this.maxFeatureLimitFilterEmpty: this.maxFeatureLimitFilter,
            this.minFeatureLimitFilter == null ? this.minFeatureLimitFilterEmpty: this.minFeatureLimitFilter,
            this.rollOverFilter,
            this.maxUnitPriceFilter == null ? this.maxUnitPriceFilterEmpty: this.maxUnitPriceFilter,
            this.minUnitPriceFilter == null ? this.minUnitPriceFilterEmpty: this.minUnitPriceFilter,
            this.featurePeriodLimitFilter,
            this.categoryFilter,
            this.featureDescriptionFilter,
            this.featureStatusFilter,
            this.unitOfMeasurementNameFilter,
            this.unitOfMeasurmentCodeFilter,
            this.isFeatureBillableFilter,
            this.featureBillingCodeFilter,
            this.featureCategoryFilter,
            this.trackactivityFilter,
            this.appSubscriptionPlanHeaderId,
            null,false, 
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

    createAppSubscriptionPlanDetail(): void {
        this.createOrEditAppSubscriptionPlanDetailModal.show(this.appSubscriptionPlanHeaderId);        
    }


    showHistory(appSubscriptionPlanDetail: AppSubscriptionPlanDetailDto): void {
        this.entityTypeHistoryModal.show({
            entityId: appSubscriptionPlanDetail.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteAppSubscriptionPlanDetail(appSubscriptionPlanDetail: AppSubscriptionPlanDetailDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._appSubscriptionPlanDetailsServiceProxy.delete(appSubscriptionPlanDetail.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._appSubscriptionPlanDetailsServiceProxy.getAppSubscriptionPlanDetailsToExcel(
        this.filterText,
            this.featureCodeFilter,
            this.featureNameFilter,
            this.availabilityFilter,
            this.maxFeatureLimitFilter == null ? this.maxFeatureLimitFilterEmpty: this.maxFeatureLimitFilter,
            this.minFeatureLimitFilter == null ? this.minFeatureLimitFilterEmpty: this.minFeatureLimitFilter,
            this.rollOverFilter,
            this.maxUnitPriceFilter == null ? this.maxUnitPriceFilterEmpty: this.maxUnitPriceFilter,
            this.minUnitPriceFilter == null ? this.minUnitPriceFilterEmpty: this.minUnitPriceFilter,
            this.featurePeriodLimitFilter,
            this.categoryFilter,
            this.featureDescriptionFilter,
            this.featureStatusFilter,
            this.unitOfMeasurementNameFilter,
            this.unitOfMeasurmentCodeFilter,
            this.isFeatureBillableFilter,
            this.featureBillingCodeFilter,
            this.featureCategoryFilter,
            this.trackactivityFilter,
        this.appSubscriptionPlanHeaderId,
undefined,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
   
}
