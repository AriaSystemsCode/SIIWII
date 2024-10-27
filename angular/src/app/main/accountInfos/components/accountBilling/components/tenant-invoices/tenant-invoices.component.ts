import { Component, Injector, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppTenantInvoiceDto, AppTenantInvoicesServiceProxy, TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
//import { FileDownloadService } from '@shared/utils/file-download.service';
import { NotifyService } from 'abp-ng2-module';
import * as _ from 'lodash';
import * as moment from 'moment';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { FileDownloadService } from "@shared/download/fileDownload.service" ;
import { AppConsts } from '@shared/AppConsts';
@Component({
  selector: 'app-tenant-invoices',
  templateUrl: './tenant-invoices.component.html',
  styleUrls: ['./tenant-invoices.component.scss']
})
export class TenantInvoicesComponent extends AppComponentBase {
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
  tenantId = this.appSession.tenantId;

  _entityTypeFullName = 'onetouch.AppSubscriptionPlans.AppTenantInvoice';
  entityHistoryEnabled = false;



  constructor(
      injector: Injector,
      private _appTenantInvoicesServiceProxy: AppTenantInvoicesServiceProxy,
      private _notifyService: NotifyService,
      private _tokenAuth: TokenAuthServiceProxy,
      private _activatedRoute: ActivatedRoute,
      private _fileDownloadService: FileDownloadService,
      private _router: Router,
      private _downloadService: FileDownloadService,
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
  downloadFile(url, name) {
    let attach = AppConsts.attachmentBaseUrl;
    let fullURL = `${attach}/${url}`;
    //this._downloadService.downloadFile(fullURL,name,false);
    this._downloadService.download(fullURL,
        name);
}
  getAppTenantInvoices(event?: LazyLoadEvent) {
      if (this.primengTableHelper.shouldResetPaging(event)) {
          this.paginator.changePage(0);
          //return;
      }

      this.primengTableHelper.showLoadingIndicator();

      this._appTenantInvoicesServiceProxy.getAll(
          this.tenantId,
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

  //exportToExcel(): void {
     /*  this._appTenantInvoicesServiceProxy.getAppTenantInvoicesToExcel(
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
       }); */

   // }
}
