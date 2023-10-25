import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { AppTransactionsServiceProxy, AppTransactionDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditAppTransactionModalComponent } from './create-or-edit-appTransaction-modal.component';

import { ViewAppTransactionModalComponent } from './view-appTransaction-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';


@Component({
    templateUrl: './appTransactions.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AppTransactionsComponent extends AppComponentBase {
    
    
    @ViewChild('createOrEditAppTransactionModal', { static: true }) createOrEditAppTransactionModal: CreateOrEditAppTransactionModalComponent;
    @ViewChild('viewAppTransactionModalComponent', { static: true }) viewAppTransactionModal: ViewAppTransactionModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    maxDateFilter : moment.Moment;
		minDateFilter : moment.Moment;
    maxAddDateFilter : moment.Moment;
		minAddDateFilter : moment.Moment;
    maxEndDateFilter : moment.Moment;
		minEndDateFilter : moment.Moment;






    constructor(
        injector: Injector,
        private _appTransactionsServiceProxy: AppTransactionsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getAppTransactions(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._appTransactionsServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.maxDateFilter === undefined ? this.maxDateFilter : moment(this.maxDateFilter).endOf('day'),
            this.minDateFilter === undefined ? this.minDateFilter : moment(this.minDateFilter).startOf('day'),
            this.maxAddDateFilter === undefined ? this.maxAddDateFilter : moment(this.maxAddDateFilter).endOf('day'),
            this.minAddDateFilter === undefined ? this.minAddDateFilter : moment(this.minAddDateFilter).startOf('day'),
            this.maxEndDateFilter === undefined ? this.maxEndDateFilter : moment(this.maxEndDateFilter).endOf('day'),
            this.minEndDateFilter === undefined ? this.minEndDateFilter : moment(this.minEndDateFilter).startOf('day'),
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

    createAppTransaction(): void {
        this.createOrEditAppTransactionModal.show();        
    }


    deleteAppTransaction(appTransaction: AppTransactionDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._appTransactionsServiceProxy.delete(appTransaction.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._appTransactionsServiceProxy.getAppTransactionsToExcel(
        this.filterText,
            this.codeFilter,
            this.maxDateFilter === undefined ? this.maxDateFilter : moment(this.maxDateFilter).endOf('day'),
            this.minDateFilter === undefined ? this.minDateFilter : moment(this.minDateFilter).startOf('day'),
            this.maxAddDateFilter === undefined ? this.maxAddDateFilter : moment(this.maxAddDateFilter).endOf('day'),
            this.minAddDateFilter === undefined ? this.minAddDateFilter : moment(this.minAddDateFilter).startOf('day'),
            this.maxEndDateFilter === undefined ? this.maxEndDateFilter : moment(this.maxEndDateFilter).endOf('day'),
            this.minEndDateFilter === undefined ? this.minEndDateFilter : moment(this.minEndDateFilter).startOf('day'),
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
}
