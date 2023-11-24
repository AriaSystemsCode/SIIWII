import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SycEntityObjectCategoriesServiceProxy, SycEntityObjectCategoryDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSycEntityObjectCategoryModalComponent } from './create-or-edit-sycEntityObjectCategory-modal.component';
import { ViewSycEntityObjectCategoryModalComponent } from './view-sycEntityObjectCategory-modal.component';
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
    templateUrl: './sycEntityObjectCategories.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycEntityObjectCategoriesComponent extends AppComponentBase {

    @ViewChild('createOrEditSycEntityObjectCategoryModal', { static: true }) createOrEditSycEntityObjectCategoryModal: CreateOrEditSycEntityObjectCategoryModalComponent;
    @ViewChild('viewSycEntityObjectCategoryModalComponent', { static: true }) viewSycEntityObjectCategoryModal: ViewSycEntityObjectCategoryModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: TreeTable;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    nameFilter = '';
        sydObjectNameFilter = '';
        sycEntityObjectCategoryNameFilter = '';
        loadingChilds;

    _entityTypeFullName = 'onetouch.SystemObjects.SycEntityObjectCategory';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
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

    getSycEntityObjectCategories(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycEntityObjectCategoriesServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.sydObjectNameFilter,
            this.sycEntityObjectCategoryNameFilter,
            false,
            0,
            undefined,
            true,
            undefined,
            undefined,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event),

        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    onNodeExpand(event) {
        this.loadingChilds = true;


        this._sycEntityObjectCategoriesServiceProxy.getAllChilds(event.node.data.sycEntityObjectCategory.id
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

    createSycEntityObjectCategory(): void {
        this.createOrEditSycEntityObjectCategoryModal.show();
    }

    showHistory(sycEntityObjectCategory: SycEntityObjectCategoryDto): void {
        this.entityTypeHistoryModal.show({
            entityId: sycEntityObjectCategory.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSycEntityObjectCategory(sycEntityObjectCategory: SycEntityObjectCategoryDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._sycEntityObjectCategoriesServiceProxy.delete(sycEntityObjectCategory.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sycEntityObjectCategoriesServiceProxy.getSycEntityObjectCategoriesToExcel(
        this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.sydObjectNameFilter,
            this.sycEntityObjectCategoryNameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
