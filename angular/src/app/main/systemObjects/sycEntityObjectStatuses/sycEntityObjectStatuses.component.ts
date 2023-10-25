import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SycEntityObjectStatusesServiceProxy, SycEntityObjectStatusDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSycEntityObjectStatusModalComponent } from './create-or-edit-sycEntityObjectStatus-modal.component';
import { ViewSycEntityObjectStatusModalComponent } from './view-sycEntityObjectStatus-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';

@Component({
    templateUrl: './sycEntityObjectStatuses.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycEntityObjectStatusesComponent extends AppComponentBase {

    @ViewChild('createOrEditSycEntityObjectStatusModal', { static: true }) createOrEditSycEntityObjectStatusModal: CreateOrEditSycEntityObjectStatusModalComponent;
    @ViewChild('viewSycEntityObjectStatusModalComponent', { static: true }) viewSycEntityObjectStatusModal: ViewSycEntityObjectStatusModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    nameFilter = '';
        sydObjectNameFilter = '';


    _entityTypeFullName = 'onetouch.SystemObjects.SycEntityObjectStatus';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _sycEntityObjectStatusesServiceProxy: SycEntityObjectStatusesServiceProxy,
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

    getSycEntityObjectStatuses(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycEntityObjectStatusesServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.sydObjectNameFilter,
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

    createSycEntityObjectStatus(): void {
        this.createOrEditSycEntityObjectStatusModal.show();
    }

    showHistory(sycEntityObjectStatus: SycEntityObjectStatusDto): void {
        this.entityTypeHistoryModal.show({
            entityId: sycEntityObjectStatus.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSycEntityObjectStatus(sycEntityObjectStatus: SycEntityObjectStatusDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._sycEntityObjectStatusesServiceProxy.delete(sycEntityObjectStatus.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sycEntityObjectStatusesServiceProxy.getSycEntityObjectStatusesToExcel(
        this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.sydObjectNameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
