import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SycEntityObjectClassificationsServiceProxy, SycEntityObjectClassificationDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSycEntityObjectClassificationModalComponent } from './create-or-edit-sycEntityObjectClassification-modal.component';
import { ViewSycEntityObjectClassificationModalComponent } from './view-sycEntityObjectClassification-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
//import { Table } from 'primeng/table';
import {TreeTableModule,TreeTable} from 'primeng/treetable';
import {TreeNode} from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/public_api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';

@Component({
    templateUrl: './sycEntityObjectClassifications.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycEntityObjectClassificationsComponent extends AppComponentBase {

    @ViewChild('createOrEditSycEntityObjectClassificationModal', { static: true }) createOrEditSycEntityObjectClassificationModal: CreateOrEditSycEntityObjectClassificationModalComponent;
    @ViewChild('viewSycEntityObjectClassificationModalComponent', { static: true }) viewSycEntityObjectClassificationModal: ViewSycEntityObjectClassificationModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: TreeTable;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    nameFilter = '';
        sydObjectNameFilter = '';
        sycEntityObjectClassificationNameFilter = '';
        loadingChilds;

    _entityTypeFullName = 'onetouch.SystemObjects.SycEntityObjectClassification';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _sycEntityObjectClassificationsServiceProxy: SycEntityObjectClassificationsServiceProxy,
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

    getSycEntityObjectClassifications(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycEntityObjectClassificationsServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.sydObjectNameFilter,
            this.sycEntityObjectClassificationNameFilter,
            0,
            undefined,
            undefined,
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

    onNodeExpand(event) {
        this.loadingChilds = true;


        this._sycEntityObjectClassificationsServiceProxy.getAllChilds(event.node.data.sycEntityObjectClassification.id
        ).subscribe(result => {
            const node = event.node;
            node.children=[];
            node.children=result;
            this.primengTableHelper.records  = [...this.primengTableHelper.records ];
        });


    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createSycEntityObjectClassification(): void {
        this.createOrEditSycEntityObjectClassificationModal.show();
    }

    showHistory(sycEntityObjectClassification: SycEntityObjectClassificationDto): void {
        this.entityTypeHistoryModal.show({
            entityId: sycEntityObjectClassification.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSycEntityObjectClassification(sycEntityObjectClassification: SycEntityObjectClassificationDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._sycEntityObjectClassificationsServiceProxy.delete(sycEntityObjectClassification.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sycEntityObjectClassificationsServiceProxy.getSycEntityObjectClassificationsToExcel(
        this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.sydObjectNameFilter,
            this.sycEntityObjectClassificationNameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
