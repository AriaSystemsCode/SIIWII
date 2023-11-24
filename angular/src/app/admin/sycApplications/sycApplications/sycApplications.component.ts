import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { SycApplicationsServiceProxy, SycApplicationDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSycApplicationModalComponent } from './create-or-edit-sycApplication-modal.component';

import { ViewSycApplicationModalComponent } from './view-sycApplication-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/public_api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';


@Component({
    templateUrl: './sycApplications.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycApplicationsComponent extends AppComponentBase {
    
    
    @ViewChild('createOrEditSycApplicationModal', { static: true }) createOrEditSycApplicationModal: CreateOrEditSycApplicationModalComponent;
    @ViewChild('viewSycApplicationModalComponent', { static: true }) viewSycApplicationModal: ViewSycApplicationModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    nameFilter = '';
    notesFilter = '';






    constructor(
        injector: Injector,
        private _sycApplicationsServiceProxy: SycApplicationsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getSycApplications(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycApplicationsServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.nameFilter,
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

    createSycApplication(): void {
        this.createOrEditSycApplicationModal.show();        
    }


    deleteSycApplication(sycApplication: SycApplicationDto): void {
        var isConfirmed: Observable<boolean>;
    isConfirmed   = this.askToConfirm("","AreYouSure");

   isConfirmed.subscribe((res)=>{
      if(res){
                    this._sycApplicationsServiceProxy.delete(sycApplication.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sycApplicationsServiceProxy.getSycApplicationsToExcel(
        this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.notesFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
}
