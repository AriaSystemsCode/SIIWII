import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { SycAttachmentTypesServiceProxy, SycAttachmentTypeDto , AttachmentType, SycAttachmentCategoriesServiceProxy, SelectItemDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditSycAttachmentTypeModalComponent } from './create-or-edit-sycAttachmentType-modal.component';
import { ViewSycAttachmentTypeModalComponent } from './view-sycAttachmentType-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/public_api';

@Component({
    templateUrl: './sycAttachmentTypes.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SycAttachmentTypesComponent extends AppComponentBase {

    @ViewChild('createOrEditSycAttachmentTypeModal') createOrEditSycAttachmentTypeModal: CreateOrEditSycAttachmentTypeModalComponent;
    @ViewChild('viewSycAttachmentTypeModalComponent') viewSycAttachmentTypeModal: ViewSycAttachmentTypeModalComponent;
    @ViewChild('entityTypeHistoryModal') entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    typeFilter = -1;
    extensionFilter = '';

    attachmentType = AttachmentType;

    _entityTypeFullName = 'onetouch.SystemObjects.SycAttachmentType';
    entityHistoryEnabled = false;
    AttachmentTypesEnum = AttachmentType
    constructor(
        injector: Injector,
        private _sycAttachmentTypesServiceProxy: SycAttachmentTypesServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    getSycAttachmentTypes(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sycAttachmentTypesServiceProxy.getAll(
            this.filterText,
            this.nameFilter,
            this.typeFilter,
            this.extensionFilter,
            undefined,
            undefined,
            undefined,
            // this.primengTableHelper.getSorting(this.dataTable),
            // this.primengTableHelper.getSkipCount(this.paginator, event),
            // this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }
    allSycAttachmentCategorysTypes : SelectItemDto[]
    getAllSycAttachmentCategoryTypesForTableDropdown(){
        this._sycAttachmentCategoriesServiceProxy.getAllSycAttachmentCategoryTypesForTableDropdown().subscribe(result => {
            this.allSycAttachmentCategorysTypes = result;
        });
    }
    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createSycAttachmentType(): void {
        this.createOrEditSycAttachmentTypeModal.show();
    }

    showHistory(sycAttachmentType: SycAttachmentTypeDto): void {
        this.entityTypeHistoryModal.show({
            entityId: sycAttachmentType.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSycAttachmentType(sycAttachmentType: SycAttachmentTypeDto): void {
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._sycAttachmentTypesServiceProxy.delete(sycAttachmentType.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }
}
