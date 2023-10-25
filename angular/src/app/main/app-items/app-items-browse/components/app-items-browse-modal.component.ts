import { AfterViewInit, Component, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { AppItemsComponent } from '@app/main/app-items/app-items-browse/components/appItems.component';
import { AppItemsBrowseComponentActionsMenuFlags, AppItemsBrowseComponentFiltersDisplayFlags, AppItemsBrowseComponentStatusesFlags, AppItemsBrowseInputs } from '@app/main/app-items/app-items-browse/models/app-item-browse-inputs.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemDto, AppItemSelectorsServiceProxy, CreateOrEditAppItemSelectorDto, GetAllAppItemsInput, GetAppItemForViewDto, ItemsFilterTypesEnum } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SelectItem } from 'primeng/api';
import { tap } from 'rxjs/operators';
import { ActionsMenuEventEmitter } from '../models/ActionsMenuEventEmitter';
import { AppItemBrowseEvents } from '../models/appItems-browse-events';
import { BrowseMode } from '../models/BrowseModeEnum';
import { MultiSelectionInfo } from '../models/multi-selection-info.model';

@Component({
    selector: 'app-items-browse-modal',
    templateUrl: './app-items-browse-modal.component.html',
    styleUrls: ['./app-items-browse-modal.component.scss'],
})
export class AppItemsBrowseModalComponent extends AppComponentBase {
    @ViewChild('AppItemsBrowseComponent') appItemsBrowseComponent: AppItemsComponent
    @ViewChild("BrowseAppItemModal", { static: true }) modal: ModalDirective;
    @Output() apply: EventEmitter<{multiSelectionInfo:MultiSelectionInfo,totalCount:number}> = new EventEmitter<{multiSelectionInfo:MultiSelectionInfo,totalCount:number}>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    totalSelected:number = 0
    multiSelectionInfo : MultiSelectionInfo = new MultiSelectionInfo()
    lastFilterType:any;
    constructor(injector: Injector, private appItemSelectorsServiceProxy:AppItemSelectorsServiceProxy) {
        super(injector)
    }
    show( multiSelectionInfo:MultiSelectionInfo, options?:Partial<AppItemsBrowseInputs>, appItemListId?:number): void {
        this.appItemsBrowseComponent.appItemListId= appItemListId;
        if(multiSelectionInfo.sessionSelectionKey) this.multiSelectionInfo.sessionSelectionKey = multiSelectionInfo.sessionSelectionKey
        if(multiSelectionInfo.totalCount) this.multiSelectionInfo.totalCount = multiSelectionInfo.totalCount 
        else this.multiSelectionInfo.totalCount = 0
        if(multiSelectionInfo.bulkActionLimit) this.multiSelectionInfo.bulkActionLimit = multiSelectionInfo.bulkActionLimit
        const defaultMainFilter: ItemsFilterTypesEnum = ItemsFilterTypesEnum.MyItems
        const showMainFiltersOptions: boolean = true
        const pageMainFilters: SelectItem[] = [
            { label: this.l("MyProducts"), value: ItemsFilterTypesEnum.MyItems }
        ]
        const filtersFlags: AppItemsBrowseComponentFiltersDisplayFlags = new AppItemsBrowseComponentFiltersDisplayFlags()
        const statusesFlags: AppItemsBrowseComponentStatusesFlags = new AppItemsBrowseComponentStatusesFlags()
        const actionsMenuFlags: AppItemsBrowseComponentActionsMenuFlags = new AppItemsBrowseComponentActionsMenuFlags()
        filtersFlags.showAll()
        statusesFlags.showAll()
        actionsMenuFlags.allIsHidden = true
        const title: string = this.l("MyProducts")
        const canView: boolean = false
        const canAdd: boolean = false
        const isModal: boolean = true
        const browseMode = BrowseMode.Selection
        const inputs: AppItemsBrowseInputs = {
            canAdd,
            canView,
            title,
            statusesFlags,
            filtersFlags,
            actionsMenuFlags,
            defaultMainFilter,
            showMainFiltersOptions,
            pageMainFilters,
            isModal,
            browseMode,
            multiSelectionInfo:this.multiSelectionInfo,
            initialyShowTopBar:options?.initialyShowTopBar,
        }
        this.modal.show();
        this.appItemsBrowseComponent.show({...inputs,...options})
    }
    close(){
        this.modal.hide()
    }
    eventHandler($event:ActionsMenuEventEmitter<AppItemBrowseEvents,any>){

        this.lastFilterType=this.appItemsBrowseComponent.lastFilterType;

        switch ($event.event) {
            case AppItemBrowseEvents.Select:
                this.selectItem($event.data as GetAppItemForViewDto)
                break;
            case AppItemBrowseEvents.UnSelect:
                this.unSelectItem($event.data as GetAppItemForViewDto)
                break;
            case AppItemBrowseEvents.SelectAll:
                this.selectAllHandler()
                break;
            case AppItemBrowseEvents.InvertSelection:
                this.invertHandler()
                break;
            case AppItemBrowseEvents.SelectNone:
            // case AppItemBrowseEvents.FilterChange:
                this.noneSelectionHandler()
                break;
            case AppItemBrowseEvents.ApplySelection:
                this.applySelectionHandler()
                break;
            case AppItemBrowseEvents.CancelSelection:
                this.cancelSelectionHandler()
                break;
            default:
                break;
        }
    }
    selectAllHandler(){
        const body :GetAllAppItemsInput = new GetAllAppItemsInput({...this.appItemsBrowseComponent.filterBody,maxResultCount:this.appItemsBrowseComponent.primengTableHelper.totalRecordsCount}) 
        this.appItemSelectorsServiceProxy.selectAll(this.multiSelectionInfo.sessionSelectionKey, body)
        .subscribe(totalSelection=>{
            this.multiSelectionInfo.totalCount = totalSelection
            this.reloadPage()
        })
    }
    invertHandler(){ 
        const body :GetAllAppItemsInput = new GetAllAppItemsInput({...this.appItemsBrowseComponent.filterBody,maxResultCount:this.appItemsBrowseComponent.primengTableHelper.totalRecordsCount}) 
        this.appItemSelectorsServiceProxy.invert(this.multiSelectionInfo.sessionSelectionKey, body)
        .subscribe(totalSelection=>{
            this.multiSelectionInfo.totalCount = totalSelection
            this.reloadPage()
        })
    }
    reloadPage(){
        this.appItemsBrowseComponent.reloadPage()
    }
    selectItem(item:GetAppItemForViewDto){
        const body = new CreateOrEditAppItemSelectorDto({ key:this.multiSelectionInfo.sessionSelectionKey, selectedId:item.appItem.id, id:0 })
        this.appItemSelectorsServiceProxy.createOrEdit(body)
        .subscribe((totalSelection)=>{
            this.multiSelectionInfo.totalCount = totalSelection 
            item.selected = true
        },(err)=>{
            item.selected = false
        })
    }
    unSelectItem(item:GetAppItemForViewDto){
        this.appItemSelectorsServiceProxy.delete(this.multiSelectionInfo.sessionSelectionKey, item.appItem.id,undefined)
        .subscribe((totalSelection)=>{
            this.multiSelectionInfo.totalCount = totalSelection 
            item.selected = false
        },(err)=>{
            item.selected = true
        })
    }
    noneSelectionHandler(){
        this.resetSelection().subscribe(res=>{
            this.reloadPage()
        })
    }
    applySelectionHandler(){
        this.close()
        this.apply.emit({multiSelectionInfo:this.multiSelectionInfo,totalCount:this.appItemsBrowseComponent.primengTableHelper.totalRecordsCount});
    }
    cancelSelectionHandler(){
        this.resetSelection().subscribe(res=>{
            this.close()
            this.cancel.emit();
        })
    }
    resetSelection(){
        return this.appItemSelectorsServiceProxy.deleteAllTempWithKey(this.multiSelectionInfo.sessionSelectionKey, undefined, undefined).pipe(
            tap(res=>{
                this.multiSelectionInfo.totalCount = 0 
            })
        )
    }
    
}

