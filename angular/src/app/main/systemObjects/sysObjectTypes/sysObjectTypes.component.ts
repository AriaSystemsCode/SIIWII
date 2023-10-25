import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SysObjectTypesServiceProxy, SysObjectTypeDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSysObjectTypeModalComponent } from './create-or-edit-sysObjectType-modal.component';
import { ViewSysObjectTypeModalComponent } from './view-sysObjectType-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
//import { Table } from 'primeng/table';
import {TreeTableModule,TreeTable} from 'primeng/treetable';
import {TreeNode} from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';

@Component({
    templateUrl:'./sysObjectTypes.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SysObjectTypesComponent extends AppComponentBase {

    @ViewChild('createOrEditSysObjectTypeModal', { static: true }) createOrEditSysObjectTypeModal: CreateOrEditSysObjectTypeModalComponent;
    @ViewChild('viewSysObjectTypeModalComponent', { static: true }) viewSysObjectTypeModal: ViewSysObjectTypeModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: TreeTable;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    sysObjectTypeNameFilter = '';
    loadingChilds;

    _entityTypeFullName = 'onetouch.SystemObjects.SysObjectType';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _sysObjectTypesServiceProxy: SysObjectTypesServiceProxy,
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

    getSysObjectTypes(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sysObjectTypesServiceProxy.getAll(
            this.filterText,
            this.sysObjectTypeNameFilter,
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


        this._sysObjectTypesServiceProxy.getAllChilds(event.node.data.sysObjectType.id
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

    createSysObjectType(): void {
        this.createOrEditSysObjectTypeModal.show();
    }

    showHistory(sysObjectType: SysObjectTypeDto): void {
        this.entityTypeHistoryModal.show({
            entityId: sysObjectType.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSysObjectType(sysObjectType: SysObjectTypeDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._sysObjectTypesServiceProxy.delete(sysObjectType.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sysObjectTypesServiceProxy.getSysObjectTypesToExcel(
        this.filterText,
            this.sysObjectTypeNameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
