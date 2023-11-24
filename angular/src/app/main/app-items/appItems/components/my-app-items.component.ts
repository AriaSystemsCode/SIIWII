import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppItemSelectorsServiceProxy, CreateOrEditAppItemSelectorDto, GetAllAppItemsInput, GetAppItemForViewDto, ItemsFilterTypesEnum } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng';
import { AppItemsBrowseComponentActionsMenuFlags, AppItemsBrowseComponentFiltersDisplayFlags, AppItemsBrowseComponentStatusesFlags, AppItemsBrowseInputs } from '../../app-items-browse/models/app-item-browse-inputs.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsComponent } from '../../app-items-browse/components/appItems.component';
import { AppItemBrowseEvents } from '../../app-items-browse/models/appItems-browse-events';
import { ActionsMenuEventEmitter } from "../../app-items-browse/models/ActionsMenuEventEmitter";
import { BrowseMode } from '../../app-items-browse/models/BrowseModeEnum';
import { MultiSelectionInfo } from '../../app-items-browse/models/multi-selection-info.model';
import { tap } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ProductCatalogueReportParams } from '../../appitems-catalogue-report/models/product-Catalogue-Report-Params';

@Component({
    selector: 'app-my-app-items',
    templateUrl: './my-app-items.component.html',
    styleUrls: ['./my-app-items.component.scss']
})
export class MyAppItemsComponent extends AppComponentBase implements AfterViewInit {
    @ViewChild('AppItemsBrowseComponent') appItemsBrowseComponent: AppItemsComponent
    @ViewChild("LinesheetModal", { static: true }) linesheetModal: ModalDirective;
    
    totalSelected:number = 0
    multiSelectionInfo : MultiSelectionInfo = new MultiSelectionInfo()
    constructor(
        injector:Injector,
        private  _router: Router,
        private appItemSelectorsServiceProxy:AppItemSelectorsServiceProxy
    ){
        super(injector)
    }

    ngAfterViewInit(): void {
        this.multiSelectionInfo.sessionSelectionKey = this.guid()
        this.multiSelectionInfo.totalCount = 0
        const defaultMainFilter: ItemsFilterTypesEnum = ItemsFilterTypesEnum.MyItems
        const showMainFiltersOptions: boolean = true
        const pageMainFilters: SelectItem[] = [
            { label:this.l("MyProducts"), value: ItemsFilterTypesEnum.MyItems },
            { label:this.l("MyListings"), value: ItemsFilterTypesEnum.MyListing },
        ]
        const filtersFlags :AppItemsBrowseComponentFiltersDisplayFlags = new AppItemsBrowseComponentFiltersDisplayFlags()
        const statusesFlags :AppItemsBrowseComponentStatusesFlags = new AppItemsBrowseComponentStatusesFlags()
        const actionsMenuFlags :AppItemsBrowseComponentActionsMenuFlags= new AppItemsBrowseComponentActionsMenuFlags()
        filtersFlags.showAll()
        statusesFlags.showAll()
        actionsMenuFlags.showAll()
        const title:string = this.l("MyProducts")
        const canView:boolean = true
        const canAdd:boolean = true
        const browseMode = BrowseMode.ActionsAndSelections
        const applySelectionTitle = this.l('GenerateLinesheet')
        const inputs : AppItemsBrowseInputs = {
            canAdd,
            canView,
            title,
            statusesFlags,
            filtersFlags,
            actionsMenuFlags,
            defaultMainFilter,
            showMainFiltersOptions,
            pageMainFilters,
            browseMode,
            applySelectionTitle,
            multiSelectionInfo:this.multiSelectionInfo
        }
        this.appItemsBrowseComponent.show(inputs)
        
        this.linesheetModal.config.backdrop = 'static'
        this.linesheetModal.config.ignoreBackdropClick = true
    }
    
    eventHandler($event:ActionsMenuEventEmitter<AppItemBrowseEvents,any>){
        switch ($event.event) {
            case AppItemBrowseEvents.View:
                this.viewProductHandler($event.data)            
                break;
            case AppItemBrowseEvents.Create:
                this.createProductHandler()            
                break;
            case AppItemBrowseEvents.Edit:
                this.editProductHandler($event.data)            
                break;
            case AppItemBrowseEvents.CreateListing:
                this.createListingHandler($event.data)
                break;
            case AppItemBrowseEvents.EditListing:
                this.editListingHandler($event.data)
                break;
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
                this.generateLineSheet()
                break;
            case AppItemBrowseEvents.CancelSelection:
                this.cancelSelectionHandler()
                break;
            default:
                break;
        }
    }
    viewProductHandler(productId:number){
        this._router.navigate(['/app/main/products/view',productId])
    }
    createProductHandler(){
        this._router.navigate(['/app/main/products/createOrEdit'])
    }
    editProductHandler(productId:number){
        this._router.navigate(['/app/main/products/createOrEdit',productId])
    }
    createListingHandler(productId:number){
        this._router.navigate(['/app/main/products/createListing',productId])
    }
    editListingHandler(listingId:number){
        this._router.navigate(['/app/main/products/editListing',listingId])
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
    generateLineSheet(){
        this.showLinesheetWizardModal()
        // this.apply.emit({multiSelectionInfo:this.multiSelectionInfo,totalCount:this.appItemsBrowseComponent.primengTableHelper.totalRecordsCount});
    }
    cancelSelectionHandler(){
        this.resetSelection().subscribe(res=>{
            this.appItemsBrowseComponent.reloadPage()
        })
    }
    resetSelection(){
        return this.appItemSelectorsServiceProxy.deleteAllTempWithKey(this.multiSelectionInfo.sessionSelectionKey, undefined, undefined).pipe(
            tap(res=>{
                this.multiSelectionInfo.totalCount = 0 
            })
        )
    }
    close(){
        this.linesheetModal.hide()
    }
    showLineSheetModal:boolean
    getAllAppItemsInputForLineSheet :GetAllAppItemsInput
    showLinesheetWizardModal(){
        this.getAllAppItemsInputForLineSheet = new GetAllAppItemsInput({...this.appItemsBrowseComponent.filterBody,maxResultCount:this.multiSelectionInfo.totalCount}) 
        this.showLineSheetModal = true
        this.linesheetModal.show();
    }
    closeLineSheetModalHandler(){
        this.showLineSheetModal = false
        this.linesheetModal.hide()
    }
}
