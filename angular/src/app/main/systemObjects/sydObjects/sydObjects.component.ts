import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SydObjectsServiceProxy, SydObjectDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSydObjectModalComponent } from './create-or-edit-sydObject-modal.component';
import { ViewSydObjectModalComponent } from './view-sydObject-modal.component';
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
    templateUrl: './sydObjects.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SydObjectsComponent extends AppComponentBase {

    @ViewChild('createOrEditSydObjectModal', { static: true }) createOrEditSydObjectModal: CreateOrEditSydObjectModalComponent;
    @ViewChild('viewSydObjectModalComponent', { static: true }) viewSydObjectModal: ViewSydObjectModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: TreeTable;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
        sysObjectTypeNameFilter = '';
        sydObjectNameFilter = '';
        loadingChilds;

    _entityTypeFullName = 'onetouch.SystemObjects.SydObject';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _sydObjectsServiceProxy: SydObjectsServiceProxy,
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

    getSydObjects(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sydObjectsServiceProxy.getAll(
            this.filterText,
            this.sysObjectTypeNameFilter,
            this.sydObjectNameFilter,
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


        this._sydObjectsServiceProxy.getAllChilds(event.node.data.sydObject.id
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

    createSydObject(): void {
        this.createOrEditSydObjectModal.show();
    }

    showHistory(sydObject: SydObjectDto): void {
        this.entityTypeHistoryModal.show({
            entityId: sydObject.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSydObject(sydObject: SydObjectDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._sydObjectsServiceProxy.delete(sydObject.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sydObjectsServiceProxy.getSydObjectsToExcel(
        this.filterText,
            this.sysObjectTypeNameFilter,
            this.sydObjectNameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
