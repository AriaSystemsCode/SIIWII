import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SycEntityObjectTypesServiceProxy, SycEntityObjectTypeDto, SelectItemDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSycEntityObjectTypeModalComponent } from './create-or-edit-sycEntityObjectType-modal.component';
import { ViewSycEntityObjectTypeModalComponent } from './view-sycEntityObjectType-modal.component';
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
    templateUrl: './sycEntityObjectTypes.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycEntityObjectTypesComponent extends AppComponentBase {

    @ViewChild('createOrEditSycEntityObjectTypeModal', { static: true }) createOrEditSycEntityObjectTypeModal: CreateOrEditSycEntityObjectTypeModalComponent;
    @ViewChild('viewSycEntityObjectTypeModalComponent', { static: true }) viewSycEntityObjectTypeModal: ViewSycEntityObjectTypeModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: TreeTable;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    nameFilter = '';
    extraDataFilter = '';
    sydObjectNameFilter = '';
    sycEntityObjectTypeParents :any[]=[];
    loadingChilds;

    _entityTypeFullName = 'onetouch.SystemObjects.SycEntityObjectType';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
        this.getAllParentIds();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return this.isGrantedAny('Pages.Administration.AuditLogs') && customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }
    objectTypesParents : SelectItemDto[] = []
    getAllParentIds(){
        this._sycEntityObjectTypesServiceProxy.getAllParentsIds()
        .subscribe(res=>{
            this.objectTypesParents = res
        })
    }
    getSycEntityObjectTypes(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycEntityObjectTypesServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.extraDataFilter,
            this.sydObjectNameFilter,
            undefined,
            undefined,
            undefined,
            this.sycEntityObjectTypeParents,
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


        this._sycEntityObjectTypesServiceProxy.getChilds(event.node.data.sycEntityObjectType.id
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

    createSycEntityObjectType(): void {
        this.createOrEditSycEntityObjectTypeModal.show();
    }

    showHistory(sycEntityObjectType: SycEntityObjectTypeDto): void {
        this.entityTypeHistoryModal.show({
            entityId: sycEntityObjectType.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSycEntityObjectType(sycEntityObjectType: SycEntityObjectTypeDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._sycEntityObjectTypesServiceProxy.delete(sycEntityObjectType.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sycEntityObjectTypesServiceProxy.getSycEntityObjectTypesToExcel(
            this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.extraDataFilter,
            this.sydObjectNameFilter,
            undefined,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
