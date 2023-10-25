import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { SycIdentifierDefinitionsServiceProxy, SycIdentifierDefinitionDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSycIdentifierDefinitionModalComponent } from './create-or-edit-sycIdentifierDefinition-modal.component';

import { ViewSycIdentifierDefinitionModalComponent } from './view-sycIdentifierDefinition-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
    templateUrl: './sycIdentifierDefinitions.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycIdentifierDefinitionsComponent extends AppComponentBase {
    
    
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('createOrEditSycIdentifierDefinitionModal', { static: true }) createOrEditSycIdentifierDefinitionModal: CreateOrEditSycIdentifierDefinitionModalComponent;
    @ViewChild('viewSycIdentifierDefinitionModalComponent', { static: true }) viewSycIdentifierDefinitionModal: ViewSycIdentifierDefinitionModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    isTenantLevelFilter = -1;
    maxNumberOfSegmentsFilter : number;
		maxNumberOfSegmentsFilterEmpty : number;
		minNumberOfSegmentsFilter : number;
		minNumberOfSegmentsFilterEmpty : number;
    maxMaxLengthFilter : number;
		maxMaxLengthFilterEmpty : number;
		minMaxLengthFilter : number;
		minMaxLengthFilterEmpty : number;
    maxMinSegmentLengthFilter : number;
		maxMinSegmentLengthFilterEmpty : number;
		minMinSegmentLengthFilter : number;
		minMinSegmentLengthFilterEmpty : number;
    maxMaxSegmentLengthFilter : number;
		maxMaxSegmentLengthFilterEmpty : number;
		minMaxSegmentLengthFilter : number;
		minMaxSegmentLengthFilterEmpty : number;


    _entityTypeFullName = 'onetouch.SycIdentifierDefinitions.SycIdentifierDefinition';
    entityHistoryEnabled = false;



    constructor(
        injector: Injector,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
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

    getSycIdentifierDefinitions(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycIdentifierDefinitionsServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.isTenantLevelFilter,
            this.maxNumberOfSegmentsFilter == null ? this.maxNumberOfSegmentsFilterEmpty: this.maxNumberOfSegmentsFilter,
            this.minNumberOfSegmentsFilter == null ? this.minNumberOfSegmentsFilterEmpty: this.minNumberOfSegmentsFilter,
            this.maxMaxLengthFilter == null ? this.maxMaxLengthFilterEmpty: this.maxMaxLengthFilter,
            this.minMaxLengthFilter == null ? this.minMaxLengthFilterEmpty: this.minMaxLengthFilter,
            this.maxMinSegmentLengthFilter == null ? this.maxMinSegmentLengthFilterEmpty: this.maxMinSegmentLengthFilter,
            this.minMinSegmentLengthFilter == null ? this.minMinSegmentLengthFilterEmpty: this.minMinSegmentLengthFilter,
            this.maxMaxSegmentLengthFilter == null ? this.maxMaxSegmentLengthFilterEmpty: this.maxMaxSegmentLengthFilter,
            this.minMaxSegmentLengthFilter == null ? this.minMaxSegmentLengthFilterEmpty: this.minMaxSegmentLengthFilter,
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

    createSycIdentifierDefinition(): void {
        this.createOrEditSycIdentifierDefinitionModal.show();        
    }


    showHistory(sycIdentifierDefinition: SycIdentifierDefinitionDto): void {
        this.entityTypeHistoryModal.show({
            entityId: sycIdentifierDefinition.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSycIdentifierDefinition(sycIdentifierDefinition: SycIdentifierDefinitionDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._sycIdentifierDefinitionsServiceProxy.delete(sycIdentifierDefinition.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sycIdentifierDefinitionsServiceProxy.getSycIdentifierDefinitionsToExcel(
        this.filterText,
            this.codeFilter,
            this.isTenantLevelFilter,
            this.maxNumberOfSegmentsFilter == null ? this.maxNumberOfSegmentsFilterEmpty: this.maxNumberOfSegmentsFilter,
            this.minNumberOfSegmentsFilter == null ? this.minNumberOfSegmentsFilterEmpty: this.minNumberOfSegmentsFilter,
            this.maxMaxLengthFilter == null ? this.maxMaxLengthFilterEmpty: this.maxMaxLengthFilter,
            this.minMaxLengthFilter == null ? this.minMaxLengthFilterEmpty: this.minMaxLengthFilter,
            this.maxMinSegmentLengthFilter == null ? this.maxMinSegmentLengthFilterEmpty: this.maxMinSegmentLengthFilter,
            this.minMinSegmentLengthFilter == null ? this.minMinSegmentLengthFilterEmpty: this.minMinSegmentLengthFilter,
            this.maxMaxSegmentLengthFilter == null ? this.maxMaxSegmentLengthFilterEmpty: this.maxMaxSegmentLengthFilter,
            this.minMaxSegmentLengthFilter == null ? this.minMaxSegmentLengthFilterEmpty: this.minMaxSegmentLengthFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
    
}
