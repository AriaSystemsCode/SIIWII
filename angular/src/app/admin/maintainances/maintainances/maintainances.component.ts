import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { MaintainancesServiceProxy, MaintainanceDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditMaintainanceModalComponent } from './create-or-edit-maintainance-modal.component';

import { ViewMaintainanceModalComponent } from './view-maintainance-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
    templateUrl: './maintainances.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class MaintainancesComponent extends AppComponentBase {
    
    
    @ViewChild('createOrEditMaintainanceModal', { static: true }) createOrEditMaintainanceModal: CreateOrEditMaintainanceModalComponent;
    @ViewChild('viewMaintainanceModal', { static: true }) viewMaintainanceModal: ViewMaintainanceModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    descriptionFilter = '';
    maxFromFilter : moment.Moment;
		minFromFilter : moment.Moment;
    maxToFilter : moment.Moment;
		minToFilter : moment.Moment;
    publishedFilter = -1;
    dismissIdsFilter = '';






    constructor(
        injector: Injector,
        private _maintainancesServiceProxy: MaintainancesServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getMaintainances(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records &&
                this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._maintainancesServiceProxy.getAll(
            this.filterText,
            this.nameFilter,
            this.descriptionFilter,
            this.maxFromFilter === undefined ? this.maxFromFilter : moment(this.maxFromFilter).endOf('day'),
            this.minFromFilter === undefined ? this.minFromFilter : moment(this.minFromFilter).startOf('day'),
            this.maxToFilter === undefined ? this.maxToFilter : moment(this.maxToFilter).endOf('day'),
            this.minToFilter === undefined ? this.minToFilter : moment(this.minToFilter).startOf('day'),
            this.publishedFilter,
            this.dismissIdsFilter,
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

    createMaintainance(): void {
        this.createOrEditMaintainanceModal.show();        
    }


    deleteMaintainance(maintainance: MaintainanceDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._maintainancesServiceProxy.delete(maintainance.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._maintainancesServiceProxy.getMaintainancesToExcel(
        this.filterText,
            this.nameFilter,
            this.descriptionFilter,
            this.maxFromFilter === undefined ? this.maxFromFilter : moment(this.maxFromFilter).endOf('day'),
            this.minFromFilter === undefined ? this.minFromFilter : moment(this.minFromFilter).startOf('day'),
            this.maxToFilter === undefined ? this.maxToFilter : moment(this.maxToFilter).endOf('day'),
            this.minToFilter === undefined ? this.minToFilter : moment(this.minToFilter).startOf('day'),
            this.publishedFilter,
            this.dismissIdsFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
    

    resetFilters(): void {
        this.filterText = '';
            this.nameFilter = '';
    this.descriptionFilter = '';
    this.maxFromFilter = undefined;
		this.minFromFilter = undefined;
    this.maxToFilter = undefined;
		this.minToFilter = undefined;
    this.publishedFilter = -1;
    this.dismissIdsFilter = '';

        this.getMaintainances();
    }
}
