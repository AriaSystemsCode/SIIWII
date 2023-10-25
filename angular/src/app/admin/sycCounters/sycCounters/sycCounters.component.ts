import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { SycCountersServiceProxy, SycCounterDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSycCounterModalComponent } from './create-or-edit-sycCounter-modal.component';

import { ViewSycCounterModalComponent } from './view-sycCounter-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
    templateUrl: './sycCounters.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycCountersComponent extends AppComponentBase {
    
    
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('createOrEditSycCounterModal', { static: true }) createOrEditSycCounterModal: CreateOrEditSycCounterModalComponent;
    @ViewChild('viewSycCounterModalComponent', { static: true }) viewSycCounterModal: ViewSycCounterModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    maxCounterFilter : number;
		maxCounterFilterEmpty : number;
		minCounterFilter : number;
		minCounterFilterEmpty : number;
        sycSegmentIdentifierDefinitionNameFilter = '';


    _entityTypeFullName = 'onetouch.SycCounters.SycCounter';
    entityHistoryEnabled = false;



    constructor(
        injector: Injector,
        private _sycCountersServiceProxy: SycCountersServiceProxy,
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

    getSycCounters(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycCountersServiceProxy.getAll(
            this.filterText,
            this.maxCounterFilter == null ? this.maxCounterFilterEmpty: this.maxCounterFilter,
            this.minCounterFilter == null ? this.minCounterFilterEmpty: this.minCounterFilter,
            this.sycSegmentIdentifierDefinitionNameFilter,
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

    createSycCounter(): void {
        this.createOrEditSycCounterModal.show();        
    }


    showHistory(sycCounter: SycCounterDto): void {
        this.entityTypeHistoryModal.show({
            entityId: sycCounter.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSycCounter(sycCounter: SycCounterDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._sycCountersServiceProxy.delete(sycCounter.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sycCountersServiceProxy.getSycCountersToExcel(
        this.filterText,
            this.maxCounterFilter == null ? this.maxCounterFilterEmpty: this.maxCounterFilter,
            this.minCounterFilter == null ? this.minCounterFilterEmpty: this.minCounterFilter,
            this.sycSegmentIdentifierDefinitionNameFilter,
                    undefined,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
    
}
