import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { SycPlanServicesServiceProxy, SycPlanServiceDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSycPlanServiceModalComponent } from './create-or-edit-sycPlanService-modal.component';

import { ViewSycPlanServiceModalComponent } from './view-sycPlanService-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';


@Component({
    templateUrl: './sycPlanServices.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycPlanServicesComponent extends AppComponentBase {
    
    
    @ViewChild('createOrEditSycPlanServiceModal', { static: true }) createOrEditSycPlanServiceModal: CreateOrEditSycPlanServiceModalComponent;
    @ViewChild('viewSycPlanServiceModalComponent', { static: true }) viewSycPlanServiceModal: ViewSycPlanServiceModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    unitOfMeasureFilter = '';
    maxUnitPriceFilter : number;
		maxUnitPriceFilterEmpty : number;
		minUnitPriceFilter : number;
		minUnitPriceFilterEmpty : number;
    maxUnitsFilter : number;
		maxUnitsFilterEmpty : number;
		minUnitsFilter : number;
		minUnitsFilterEmpty : number;
    billingFrequencyFilter = '';
    maxMinimumUnitsFilter : number;
		maxMinimumUnitsFilterEmpty : number;
		minMinimumUnitsFilter : number;
		minMinimumUnitsFilterEmpty : number;
        sycApplicationNameFilter = '';
        sycPlanNameFilter = '';
        sycServiceCodeFilter = '';






    constructor(
        injector: Injector,
        private _sycPlanServicesServiceProxy: SycPlanServicesServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getSycPlanServices(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycPlanServicesServiceProxy.getAll(
            this.filterText,
            this.unitOfMeasureFilter,
            this.maxUnitPriceFilter == null ? this.maxUnitPriceFilterEmpty: this.maxUnitPriceFilter,
            this.minUnitPriceFilter == null ? this.minUnitPriceFilterEmpty: this.minUnitPriceFilter,
            this.maxUnitsFilter == null ? this.maxUnitsFilterEmpty: this.maxUnitsFilter,
            this.minUnitsFilter == null ? this.minUnitsFilterEmpty: this.minUnitsFilter,
            this.billingFrequencyFilter,
            this.maxMinimumUnitsFilter == null ? this.maxMinimumUnitsFilterEmpty: this.maxMinimumUnitsFilter,
            this.minMinimumUnitsFilter == null ? this.minMinimumUnitsFilterEmpty: this.minMinimumUnitsFilter,
            this.sycApplicationNameFilter,
            this.sycPlanNameFilter,
            this.sycServiceCodeFilter,
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

    createSycPlanService(): void {
        this.createOrEditSycPlanServiceModal.show();        
    }


    deleteSycPlanService(sycPlanService: SycPlanServiceDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._sycPlanServicesServiceProxy.delete(sycPlanService.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sycPlanServicesServiceProxy.getSycPlanServicesToExcel(
        this.filterText,
            this.unitOfMeasureFilter,
            this.maxUnitPriceFilter == null ? this.maxUnitPriceFilterEmpty: this.maxUnitPriceFilter,
            this.minUnitPriceFilter == null ? this.minUnitPriceFilterEmpty: this.minUnitPriceFilter,
            this.maxUnitsFilter == null ? this.maxUnitsFilterEmpty: this.maxUnitsFilter,
            this.minUnitsFilter == null ? this.minUnitsFilterEmpty: this.minUnitsFilter,
            this.billingFrequencyFilter,
            this.maxMinimumUnitsFilter == null ? this.maxMinimumUnitsFilterEmpty: this.maxMinimumUnitsFilter,
            this.minMinimumUnitsFilter == null ? this.minMinimumUnitsFilterEmpty: this.minMinimumUnitsFilter,
            this.sycApplicationNameFilter,
            this.sycPlanNameFilter,
            this.sycServiceCodeFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
}
