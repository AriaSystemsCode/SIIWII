import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AttachmentType, SycAttachmentCategoriesServiceProxy, SycAttachmentCategoryDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSycAttachmentCategoryModalComponent } from './create-or-edit-sycAttachmentCategory-modal.component';
import { ViewSycAttachmentCategoryModalComponent } from './view-sycAttachmentCategory-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Component({
    templateUrl: './sycAttachmentCategories.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycAttachmentCategoriesComponent extends AppComponentBase {

    @ViewChild('createOrEditSycAttachmentCategoryModal', { static: true }) createOrEditSycAttachmentCategoryModal: CreateOrEditSycAttachmentCategoryModalComponent;
    @ViewChild('viewSycAttachmentCategoryModalComponent', { static: true }) viewSycAttachmentCategoryModal: ViewSycAttachmentCategoryModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    nameFilter = '';
    attributesFilter = '';
    parentCodeFilter = '';
    sycAttachmentCategoryNameFilter = '';
    maxFileSizeFilter :number;
    aspectRatioFilter = '';
    fileTypeFilter : AttachmentType
    messageFilter = '';
    AttachmentTypesEnum = AttachmentType

    _entityTypeFullName = 'onetouch.SystemObjects.SycAttachmentCategory';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
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

    getSycAttachmentCategories(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycAttachmentCategoriesServiceProxy.getAll(
            this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.attributesFilter,
            this.parentCodeFilter,
            this.sycAttachmentCategoryNameFilter,
            this.aspectRatioFilter,
            this.maxFileSizeFilter,
            this.messageFilter,
            this.fileTypeFilter,
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

    createSycAttachmentCategory(): void {
        this.createOrEditSycAttachmentCategoryModal.show();
    }

    showHistory(sycAttachmentCategory: SycAttachmentCategoryDto): void {
        this.entityTypeHistoryModal.show({
            entityId: sycAttachmentCategory.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSycAttachmentCategory(sycAttachmentCategory: SycAttachmentCategoryDto): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");

       isConfirmed.subscribe((res)=>{
          if(res){
                    this._sycAttachmentCategoriesServiceProxy.delete(sycAttachmentCategory.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._sycAttachmentCategoriesServiceProxy.getSycAttachmentCategoriesToExcel(
        this.filterText,
            this.codeFilter,
            this.nameFilter,
            this.attributesFilter,
            this.parentCodeFilter,
            this.sycAttachmentCategoryNameFilter,
            this.aspectRatioFilter,
            this.maxFileSizeFilter,
            this.messageFilter,
            this.fileTypeFilter
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
