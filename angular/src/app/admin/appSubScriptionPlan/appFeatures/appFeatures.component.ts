import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { AppFeaturesServiceProxy, AppFeatureDto  } from '@shared/service-proxies/service-proxies';
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
    templateUrl: './appFeatures.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AppFeaturesComponent extends AppComponentBase {
    
    
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
       
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    nameFilter = '';
    descriptionFilter = '';
    unitOfMeasurementCodeFilter = '';
    unitOfMeasurementNameFilter = '';
    featurePeriodLimitFilter = '';
    billableFilter = -1;
    billingCodeFilter = '';
    maxUnitPriceFilter : number;
		maxUnitPriceFilterEmpty : number;
		minUnitPriceFilter : number;
		minUnitPriceFilterEmpty : number;
    categoryFilter = '';
    trackActivityFilter = -1;


    _entityTypeFullName = 'onetouch.AppSubScriptionPlan.AppFeature';
    entityHistoryEnabled = false;



    constructor(
        injector: Injector,
        private _appFeaturesServiceProxy: AppFeaturesServiceProxy,
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

    getAppFeatures(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._appFeaturesServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.descriptionFilter,
            this.unitOfMeasurementCodeFilter,
            this.unitOfMeasurementNameFilter,
            this.featurePeriodLimitFilter,
            this.billableFilter,
            this.billingCodeFilter,
            this.maxUnitPriceFilter == null ? this.maxUnitPriceFilterEmpty: this.maxUnitPriceFilter,
            this.minUnitPriceFilter == null ? this.minUnitPriceFilterEmpty: this.minUnitPriceFilter,
            this.categoryFilter,
            this.trackActivityFilter,
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

    createAppFeature(): void {
        this._router.navigate(['/app/admin/appSubScriptionPlan/appFeatures/createOrEdit']);        
    }


    showHistory(appFeature: AppFeatureDto): void {
        this.entityTypeHistoryModal.show({
            entityId: appFeature.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteAppFeature(appFeature: AppFeatureDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._appFeaturesServiceProxy.delete(appFeature.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._appFeaturesServiceProxy.getAppFeaturesToExcel(
        this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.descriptionFilter,
            this.unitOfMeasurementCodeFilter,
            this.unitOfMeasurementNameFilter,
            this.featurePeriodLimitFilter,
            this.billableFilter,
            this.billingCodeFilter,
            this.maxUnitPriceFilter == null ? this.maxUnitPriceFilterEmpty: this.maxUnitPriceFilter,
            this.minUnitPriceFilter == null ? this.minUnitPriceFilterEmpty: this.minUnitPriceFilter,
            this.categoryFilter,
            this.trackActivityFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
    
}
