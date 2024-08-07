import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { AppTenantInvoicesServiceProxy, AppTenantInvoiceDto  } from '@shared/service-proxies/service-proxies';
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
    templateUrl: './appTenantInvoices.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AppTenantInvoicesComponent extends AppComponentBase {
    
    
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
       
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    invoiceNumberFilter = '';
    maxInvoiceDateFilter : moment.Moment;
		minInvoiceDateFilter : moment.Moment;
    maxDueDateFilter : moment.Moment;
		minDueDateFilter : moment.Moment;
    maxPayDateFilter : moment.Moment;
		minPayDateFilter : moment.Moment;


    _entityTypeFullName = 'onetouch.AppSubscriptionPlans.AppTenantInvoice';
    entityHistoryEnabled = false;



    constructor(
        injector: Injector,
        private _appTenantInvoicesServiceProxy: AppTenantInvoicesServiceProxy,
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

    getAppTenantInvoices(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._appTenantInvoicesServiceProxy.getAll(
            null,
            this.filterText,
            this.invoiceNumberFilter,
            this.maxInvoiceDateFilter === undefined ? this.maxInvoiceDateFilter : moment(this.maxInvoiceDateFilter).endOf('day'),
            this.minInvoiceDateFilter === undefined ? this.minInvoiceDateFilter : moment(this.minInvoiceDateFilter).startOf('day'),
            this.maxDueDateFilter === undefined ? this.maxDueDateFilter : moment(this.maxDueDateFilter).endOf('day'),
            this.minDueDateFilter === undefined ? this.minDueDateFilter : moment(this.minDueDateFilter).startOf('day'),
            this.maxPayDateFilter === undefined ? this.maxPayDateFilter : moment(this.maxPayDateFilter).endOf('day'),
            this.minPayDateFilter === undefined ? this.minPayDateFilter : moment(this.minPayDateFilter).startOf('day'),
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

    createAppTenantInvoice(): void {
        this._router.navigate(['/app/admin/appSubscriptionPlans/appTenantInvoices/createOrEdit']);        
    }


    showHistory(appTenantInvoice: AppTenantInvoiceDto): void {
        this.entityTypeHistoryModal.show({
            entityId: appTenantInvoice.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteAppTenantInvoice(appTenantInvoice: AppTenantInvoiceDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._appTenantInvoicesServiceProxy.delete(appTenantInvoice.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._appTenantInvoicesServiceProxy.getAppTenantInvoicesToExcel(
        this.filterText,
            this.invoiceNumberFilter,
            this.maxInvoiceDateFilter === undefined ? this.maxInvoiceDateFilter : moment(this.maxInvoiceDateFilter).endOf('day'),
            this.minInvoiceDateFilter === undefined ? this.minInvoiceDateFilter : moment(this.minInvoiceDateFilter).startOf('day'),
            this.maxDueDateFilter === undefined ? this.maxDueDateFilter : moment(this.maxDueDateFilter).endOf('day'),
            this.minDueDateFilter === undefined ? this.minDueDateFilter : moment(this.minDueDateFilter).startOf('day'),
            this.maxPayDateFilter === undefined ? this.maxPayDateFilter : moment(this.maxPayDateFilter).endOf('day'),
            this.minPayDateFilter === undefined ? this.minPayDateFilter : moment(this.minPayDateFilter).startOf('day'),
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
    
}
