import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsListDto, AppItemsListsServiceProxy, GetAppItemsListForViewDto, ItemsListFilterTypesEnum } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { debounceTime, finalize } from 'rxjs/operators';
import { CreateOrEditAppitemListComponent } from '../../app-item-shared/components/create-or-edit-appitem-list.component';
import { filter } from 'lodash';
import { Router } from '@angular/router';
import { AppitemListPublishService } from '../services/appitem-list-publish.service';
import { Observable } from 'rxjs';
import { SelectItem, LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-app-item-list-list',
  templateUrl: './app-item-list-list.component.html',
  styleUrls: ['./app-item-list-list.component.scss'],
  animations:[appModuleAnimation()]
})
export class AppItemListListComponent extends AppComponentBase implements OnInit {
    singleItemPerRowMode:boolean = false

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    selectedItemId:number
    selectedIndex:number

    _entityTypeFullName = 'onetouch.AppItemsLists.AppItemsList';
    entityHistoryEnabled = false;

    items : GetAppItemsListForViewDto[] = []
    sortingOptions : SelectItem[]

    filtersForm : FormGroup
    get mainFilterCtrl  () : FormControl { return this.filtersForm.get("mainFilter") as FormControl }
    get sortingCtrl  () : FormControl { return this.filtersForm.get("sorting") as FormControl }
    get searchCtrl  () : FormControl { return this.filtersForm.get("search") as FormControl }
    loading : boolean = false
    active : boolean = false
    pageMainFilters:SelectItem[] = []
    @ViewChild('createOrEditListModal', { static: true }) createOrEditListModal: CreateOrEditAppitemListComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;

    constructor(
        injector: Injector,
        private _appItemsListsServiceProxy: AppItemsListsServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _formBuilder:FormBuilder,
        private _router:Router,
        private _appitemListPublishService : AppitemListPublishService
    ) {
        super(injector);
    }
    initFiltersAndSetDefaultValues(){
        const defaultMainFilterValue = this.pageMainFilters[0]
        this.filtersForm = this._formBuilder.group({
            mainFilter : [ defaultMainFilterValue , [ Validators.required ] ],
            sorting : [ "", [ Validators.required ] ],
            search : [ "", [ Validators.required ] ],
        })
    }

    ngOnInit(): void {
        this.getUserPreferenceForListView()
        this.defineSortingOptions()
        this.definePagesMainFilter()
        this.initFiltersAndSetDefaultValues()
        this.getAppItemsLists({rows:this.primengTableHelper.defaultRecordsCountPerPage})
        this.applyFiltersOnChange()
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return this.isGrantedAny('Pages.Administration.AuditLogs') && customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }


    getFreshData(){
        this.resetPagination()
        this.getAppItemsLists({rows:this.primengTableHelper.defaultRecordsCountPerPage})
    }


    defineSortingOptions(){
        this.sortingOptions = [
            { label: this.l('Name'), value:"name" },
            { label: this.l('Code'), value:"code" },
        ]
    }

    applyFiltersOnChange(){
        this.filtersForm.valueChanges
        .pipe(
            debounceTime(1500)
        )
        .subscribe((value)=>{
            this.getFreshData()
        })
    }

    getAppItemsLists(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }
        this.loading = true
        this.showMainSpinner()
        this.primengTableHelper.showLoadingIndicator();
        this._appItemsListsServiceProxy.getAll(
            this.searchCtrl?.value,
            this.mainFilterCtrl?.value?.value,
            false,
            this.sortingCtrl?.value?.value,
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        )
        .pipe(finalize(()=>{
            this.loading=false
            this.hideMainSpinner()
            this.primengTableHelper.hideLoadingIndicator();
            if (!this.active)  this.active = true
        }))
        .subscribe(res=>{
            this.items = res.items
            this.primengTableHelper.totalRecordsCount = res.totalCount;
            this.primengTableHelper.records = res.items;
        })
    }
    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage() );
    }

    resetList(){
        this.applyFiltersOnChange()
        this.getAppItemsLists({rows:this.primengTableHelper.defaultRecordsCountPerPage})
    }

    resetPagination(){
        this.items = [];
    }

    askToConfirmDelete($event,id: number,index:number): void {
        var isConfirmed: Observable<boolean>;
    isConfirmed   = this.askToConfirm("","AreYouSureYouWantToDeleteThisList?");

   isConfirmed.subscribe((res)=>{
      if(res){
                    this.deleteItem(id,index)
                }
            }
        );
    }
    printList($event,item: GetAppItemsListForViewDto): void {
        if(item.appItemsList.itemsCount === 0 ) return this.notify.error(this.l("NoListingsInThisProductList.CannotPrint."))

        this._router.navigate(['app/main/linesheet/print',item.appItemsList.id])
    }

    exportToExcel(): void {
        this._appItemsListsServiceProxy.getAppItemsListsToExcel(
            this?.filtersForm?.value?.search,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
        });
    }

    deleteItem(id:number,index:number){
        this._appItemsListsServiceProxy.delete(id)
        .subscribe((res)=>{
            this.notify.success(this.l('SuccessfullyDeleted'));
            this.items.splice(index,1)
        },(err:HttpErrorResponse)=>{
            this.notify.error(err.message)
        })
    }

    saveUserPreferenceForListView(){
        const key = "appitem-list-view-mode"
        const value = String( Number(this.singleItemPerRowMode) )
        localStorage.setItem(key,value)
    }

    getUserPreferenceForListView(){
        const key = "appitem-list-view-mode"
        const value = localStorage.getItem(key)
        if(value) this.singleItemPerRowMode = Boolean( Number (value) )
    }

    triggerListView(){
        this.singleItemPerRowMode = !this.singleItemPerRowMode
        this.saveUserPreferenceForListView()
    }

    definePagesMainFilter(){
        this.pageMainFilters = [
            {   label:ItemsListFilterTypesEnum[ItemsListFilterTypesEnum.MyItemsList],value:ItemsListFilterTypesEnum.MyItemsList   },
            {   label:ItemsListFilterTypesEnum[ItemsListFilterTypesEnum.Public],value:ItemsListFilterTypesEnum.Public   },
            {   label:ItemsListFilterTypesEnum[ItemsListFilterTypesEnum.SharedWithMe],value:ItemsListFilterTypesEnum.SharedWithMe   },
        ]
    }


    // create or edit list methods
    openCreateOrEditModal(){
        this.createOrEditListModal.show()
    }

    onCreateOrEditDone(id:number){
        this.createOrEditListModal.hide()
        this.notify.success(this.l("SavedSuccessfully"))
        this.reloadPage()
    }
    showHistory(appItemsList: AppItemsListDto): void {
        this.entityTypeHistoryModal.show({
            entityId: appItemsList.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    openShareProductListModal(item:GetAppItemsListForViewDto){
        const listId : number = item.appItemsList.id
        const alreadyPublished:boolean = item.appItemsList.published

        const successCallBack = ()=> {
            this.notify.success(this.l("PublishedSuccessfully"))
            item.appItemsList.published = true
        }

        this._appitemListPublishService.openSharingModal( alreadyPublished, listId ,successCallBack)
    }

    unPublish(item:GetAppItemsListForViewDto){
        const listId : number = item.appItemsList.id
        this.showMainSpinner()
        this._appitemListPublishService.unPublish(listId)
        .pipe(
            finalize(()=>{
                this.hideMainSpinner()
            })
        )
        .subscribe(()=>{
            item.appItemsList.published = false
            this.notify.success(this.l("unPublishedSuccessfully"))
        })
    }

}
