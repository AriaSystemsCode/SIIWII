import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { SycServicesServiceProxy, SycServiceDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSycServiceModalComponent } from './create-or-edit-sycService-modal.component';

import { ViewSycServiceModalComponent } from './view-sycService-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/public_api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';


@Component({
    templateUrl: './sycServices.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycServicesComponent extends AppComponentBase {
    
    
    @ViewChild('createOrEditSycServiceModal', { static: true }) createOrEditSycServiceModal: CreateOrEditSycServiceModalComponent;
    @ViewChild('viewSycServiceModalComponent', { static: true }) viewSycServiceModal: ViewSycServiceModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    descriptionFilter = '';
    unitOfMeasureFilter = '';
    maxUnitPriceFilter : number;
		maxUnitPriceFilterEmpty : number;
		minUnitPriceFilter : number;
		minUnitPriceFilterEmpty : number;
    notesFilter = '';






    constructor(
        injector: Injector,
        private _sycServicesServiceProxy: SycServicesServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getSycServices(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycServicesServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.descriptionFilter,
            this.unitOfMeasureFilter,
            this.maxUnitPriceFilter == null ? this.maxUnitPriceFilterEmpty: this.maxUnitPriceFilter,
            this.minUnitPriceFilter == null ? this.minUnitPriceFilterEmpty: this.minUnitPriceFilter,
            this.notesFilter,
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

    createSycService(): void {
        this.createOrEditSycServiceModal.show();        
    }


    deleteSycService(sycService: SycServiceDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._sycServicesServiceProxy.delete(sycService.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sycServicesServiceProxy.getSycServicesToExcel(
        this.filterText,
            this.codeFilter,
            this.descriptionFilter,
            this.unitOfMeasureFilter,
            this.maxUnitPriceFilter == null ? this.maxUnitPriceFilterEmpty: this.maxUnitPriceFilter,
            this.minUnitPriceFilter == null ? this.minUnitPriceFilterEmpty: this.minUnitPriceFilter,
            this.notesFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
}
