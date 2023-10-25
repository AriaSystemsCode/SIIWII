import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppEntitiesServiceProxy, AppEntityDto, GetAppEntityForViewDto, LookupLabelDto, SydObjectsServiceProxy } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditAppEntityModalComponent } from './create-or-edit-appEntity-modal.component';
import { ViewAppEntityModalComponent } from './view-appEntity-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';

import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CreateOrEditAppEntityDynamicModalComponent } from '@app/app-entity-dynamic-modal/create-or-edit-app-entity-dynamic-modal/create-or-edit-app-entity-dynamic-modal.component';
// import { CreateOrEditAppEntityDynamicModalComponent } from '@app/app-entity-dynamic-modal/create-or-edit-app-entity-dynamic-modal/create-or-edit-app-entity-dynamic-modal.component';
export interface AccordionTabItem {
    id: number,
    label: string,
    icon: string,
    code: string
}
@Component({
    templateUrl:'./appEntities.component.html',
    styleUrls: ['./appEntities.component.css'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    // providers: [MessageService]

})
export class AppEntitiesComponent extends AppComponentBase {
    displayDeleteEntity: boolean = false;
    recordEntity: any;

    @ViewChild('createOreEditAppEntityModal', { static: true }) createOreEditAppEntityModal: CreateOrEditAppEntityDynamicModalComponent;
    @ViewChild('createOrEditAppEntityModal', { static: true }) createOrEditAppEntityModal: CreateOrEditAppEntityModalComponent;

    @ViewChild('viewAppEntityModalComponent', { static: true }) viewAppEntityModal: ViewAppEntityModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    idHover: any;
    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    codeFilter = '';
    descriptionFilter = '';
    extraDataFilter = '';
    sycEntityObjectTypeNameFilter = '';
    sycEntityObjectStatusNameFilter = '';
    sydObjectNameFilter = '';
    tabs: AccordionTabItem[];
    currTab: AccordionTabItem;
    items = [];
    _entityTypeFullName = 'onetouch.AppEntities.AppEntity';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _sydObjectsServiceProxy: SydObjectsServiceProxy,
        // private _notifyService: NotifyService,
        // private _tokenAuth: TokenAuthServiceProxy,
        // private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        // private messageService: MessageService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();

        // this.items1 = [
        //     {label: 'Home', icon: 'pi pi-fw pi-home'},
        //     {label: 'Calendar', icon: 'pi pi-fw pi-calendar'},
        //     {label: 'Edit', icon: 'pi pi-fw pi-pencil'},
        //     {label: 'Documentation', icon: 'pi pi-fw pi-file'},
        //     {label: 'Home', icon: 'pi pi-fw pi-home'},
        //     {label: 'Calendar', icon: 'pi pi-fw pi-calendar'},
        //     {label: 'Edit', icon: 'pi pi-fw pi-pencil'},
        //     {label: 'Documentation', icon: 'pi pi-fw pi-file'},
        //     {label: 'Home', icon: 'pi pi-fw pi-home'},
        //     {label: 'Calendar', icon: 'pi pi-fw pi-calendar'},
        //     {label: 'Edit', icon: 'pi pi-fw pi-pencil'},
        //     {label: 'Documentation', icon: 'pi pi-fw pi-file'},
        //     {label: 'Settings', icon: 'pi pi-fw pi-cog'}
        // ];

        this._sydObjectsServiceProxy.getAllLookups(
        ).subscribe(result => {

            this.tabs = result;
            const currTab = this.tabs.length > 0 ? this.tabs[0] : null;

            // this.tabs.forEach(element => {
            //     element.command = (event) => {
            //         this.tabChanged(element);

            //     }
            // });



            this.tabChanged(currTab)
            this.scrolltoTop()
        });

    }
    temp(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    onTabOpen(e,item) {
        this.tabChanged(item)
    }
    tabChanged(tab) {
        if(this.currTab === tab) return
        // this.primengTableHelper.records = null;
        this.currTab = tab
        this.filterText = ''
        this.nameFilter = ''
        this.codeFilter = ''
        this.descriptionFilter = ''
        this.getAppEntities();
        this.skipCount = 0
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return this.isGrantedAny('Pages.Administration.AuditLogs') && customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }
    skipCount : number = 0
    maxResultCount : number = 0
    getAppEntities(event?: {first?: number,page?: number, pageCount?: number, rows?: number}) {
        if (!this.currTab) return

        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();
        if(event &&event.rows && event.rows>0 )
        this.paginator.rows=event.rows;
        this.maxResultCount  = this.primengTableHelper.getMaxResultCount(this.paginator, event)
        this.skipCount  = ( event?.page || 0 ) * this.maxResultCount
        this._appEntitiesServiceProxy.getAll(
            this.filterText,
            this.nameFilter,
            this.codeFilter,
            this.descriptionFilter,
            this.extraDataFilter,
            this.sycEntityObjectTypeNameFilter,
            this.sycEntityObjectStatusNameFilter,
            this.sydObjectNameFilter,
            +this.currTab.id,
            this.primengTableHelper.getSorting(this.dataTable),
            this.skipCount,
            this.maxResultCount
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }
    createOrEditDoneHandler(){
        this.reloadPage()
    }

    reloadPage(): void {
        const currentPage = this.skipCount / this.maxResultCount
        const $event = { page : currentPage }
        this.getAppEntities($event)
    }

    createOrEditAppEntity(event,id?:number): void {
        event.preventDefault();
        event.stopPropagation();
        this.openCreateOrEditModal(id)
    }

    showHistory(appEntity: AppEntityDto): void {
        this.entityTypeHistoryModal.show({
            entityId: appEntity.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }
    deleteEntity(appEntity: AppEntityDto) {
        this.displayDeleteEntity = true;
        this.recordEntity = appEntity
    }
    onEmitButtonSaveYes(event) {
        if (event.value == 'yes' && event.type == 'deleteEntity') {
            this.displayDeleteEntity = false;
        }
        else {
            this.deleteAppEntity(this.recordEntity);
            this.displayDeleteEntity = false;
        }
    }
    deleteAppEntity(appEntity: AppEntityDto): void {
        this._appEntitiesServiceProxy.delete(appEntity.id)
        .subscribe(() => {
            this.reloadPage();
            this.notify.success(this.l('SuccessfullyDeleted'));
        });
        // this.message.confirm(
        //     '',
        //     this.l('AreYouSure'),
        //     (isConfirmed) => {
        //         if (isConfirmed) {
        //             this._appEntitiesServiceProxy.delete(appEntity.id)
        //                 .subscribe(() => {
        //                     this.reloadPage();
        //                     this.notify.success(this.l('SuccessfullyDeleted'));
        //                 });
        //         }
        //     }
        // );
    }

    exportToExcel(): void {
        this._appEntitiesServiceProxy.getAppEntitiesToExcel(
            this.filterText,
            this.nameFilter,
            this.codeFilter,
            this.descriptionFilter,
            this.extraDataFilter,
            this.sycEntityObjectTypeNameFilter,
            this.sycEntityObjectStatusNameFilter,
            this.sydObjectNameFilter,
        )
            .subscribe(result => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }
    openCreateOrEditModal(id?:number) : void {

        const appEntity : AppEntityDto = new AppEntityDto()
        if(id) {
            appEntity.id = id
        }
        const entityObjectType = {
            name:this.currTab.label,
            code:this.currTab.code
        }
        this.createOreEditAppEntityModal.codeIsRequired = true
        this.createOreEditAppEntityModal.show(entityObjectType,appEntity)
        // this.active = false
    }
}
