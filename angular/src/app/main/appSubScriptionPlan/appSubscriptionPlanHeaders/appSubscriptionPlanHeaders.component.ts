import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { AppSubscriptionPlanHeadersServiceProxy, AppSubscriptionPlanHeaderDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditAppSubscriptionPlanHeaderModalComponent } from './create-or-edit-appSubscriptionPlanHeader-modal.component';

import { ViewAppSubscriptionPlanHeaderModalComponent } from './view-appSubscriptionPlanHeader-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
    templateUrl: './appSubscriptionPlanHeaders.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AppSubscriptionPlanHeadersComponent extends AppComponentBase {
    
    
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('createOrEditAppSubscriptionPlanHeaderModal', { static: true }) createOrEditAppSubscriptionPlanHeaderModal: CreateOrEditAppSubscriptionPlanHeaderModalComponent;
    @ViewChild('viewAppSubscriptionPlanHeaderModalComponent', { static: true }) viewAppSubscriptionPlanHeaderModal: ViewAppSubscriptionPlanHeaderModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    descriptionFilter = '';
    isStandardFilter = -1;
    isBillableFilter = -1;
    maxDiscountFilter : number;
		maxDiscountFilterEmpty : number;
		minDiscountFilter : number;
		minDiscountFilterEmpty : number;
    billingCodeFilter = '';
    maxMonthlyPriceFilter : number;
		maxMonthlyPriceFilterEmpty : number;
		minMonthlyPriceFilter : number;
		minMonthlyPriceFilterEmpty : number;
    maxYearlyPriceFilter : number;
		maxYearlyPriceFilterEmpty : number;
		minYearlyPriceFilter : number;
		minYearlyPriceFilterEmpty : number;
    codeFilter = '';
    nameFilter = '';


    _entityTypeFullName = 'onetouch.AppSubScriptionPlan.AppSubscriptionPlanHeader';
    entityHistoryEnabled = false;

            appSubscriptionPlanDetailRowSelection: boolean[] = [];
            

                   childEntitySelection: {} = {};
            

    constructor(
        injector: Injector,
        private _appSubscriptionPlanHeadersServiceProxy: AppSubscriptionPlanHeadersServiceProxy,
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

    getAppSubscriptionPlanHeaders(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._appSubscriptionPlanHeadersServiceProxy.getAll(
            this.filterText,
            this.descriptionFilter,
            this.isStandardFilter,
            this.isBillableFilter,
            this.maxDiscountFilter == null ? this.maxDiscountFilterEmpty: this.maxDiscountFilter,
            this.minDiscountFilter == null ? this.minDiscountFilterEmpty: this.minDiscountFilter,
            this.billingCodeFilter,
            this.maxMonthlyPriceFilter == null ? this.maxMonthlyPriceFilterEmpty: this.maxMonthlyPriceFilter,
            this.minMonthlyPriceFilter == null ? this.minMonthlyPriceFilterEmpty: this.minMonthlyPriceFilter,
            this.maxYearlyPriceFilter == null ? this.maxYearlyPriceFilterEmpty: this.maxYearlyPriceFilter,
            this.minYearlyPriceFilter == null ? this.minYearlyPriceFilterEmpty: this.minYearlyPriceFilter,
            this.codeFilter,
            this.nameFilter,
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

    createAppSubscriptionPlanHeader(): void {
        this.createOrEditAppSubscriptionPlanHeaderModal.show();        
    }


    showHistory(appSubscriptionPlanHeader: AppSubscriptionPlanHeaderDto): void {
        this.entityTypeHistoryModal.show({
            entityId: appSubscriptionPlanHeader.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteAppSubscriptionPlanHeader(appSubscriptionPlanHeader: AppSubscriptionPlanHeaderDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._appSubscriptionPlanHeadersServiceProxy.delete(appSubscriptionPlanHeader.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._appSubscriptionPlanHeadersServiceProxy.getAppSubscriptionPlanHeadersToExcel(
        this.filterText,
            this.descriptionFilter,
            this.isStandardFilter,
            this.isBillableFilter,
            this.maxDiscountFilter == null ? this.maxDiscountFilterEmpty: this.maxDiscountFilter,
            this.minDiscountFilter == null ? this.minDiscountFilterEmpty: this.minDiscountFilter,
            this.billingCodeFilter,
            this.maxMonthlyPriceFilter == null ? this.maxMonthlyPriceFilterEmpty: this.maxMonthlyPriceFilter,
            this.minMonthlyPriceFilter == null ? this.minMonthlyPriceFilterEmpty: this.minMonthlyPriceFilter,
            this.maxYearlyPriceFilter == null ? this.maxYearlyPriceFilterEmpty: this.maxYearlyPriceFilter,
            this.minYearlyPriceFilter == null ? this.minYearlyPriceFilterEmpty: this.minYearlyPriceFilter,
            this.codeFilter,
            this.nameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
                  selectEditTable(table){
                      this.childEntitySelection = {};
                      this.childEntitySelection[table] = true;
                  }
            
    
               openChildRowForAppSubscriptionPlanDetail(index, table) {
                   let isAlreadyOpened = this.appSubscriptionPlanDetailRowSelection[index];                   
                   this.closeAllChildRows();                   
                   this.appSubscriptionPlanDetailRowSelection = [];
                   if (!isAlreadyOpened) {
                       this.appSubscriptionPlanDetailRowSelection[index] = true;
                   }
                   this.selectEditTable(table);
               } 
            
    
                  closeAllChildRows() : void{
                     
                this.appSubscriptionPlanDetailRowSelection = [];
            
                  }
    
}
