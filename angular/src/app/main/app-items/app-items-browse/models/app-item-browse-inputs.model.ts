import { ItemsFilterTypesEnum } from "@shared/service-proxies/service-proxies";
import { SelectItem } from "primeng";
import { BrowseMode } from "./BrowseModeEnum";
import { MultiSelectionInfo } from "./multi-selection-info.model";

export interface AppItemsBrowseInputs {
    defaultMainFilter: ItemsFilterTypesEnum
    showMainFiltersOptions: boolean
    pageMainFilters: SelectItem[]
    filtersFlags :AppItemsBrowseComponentFiltersDisplayFlags
    statusesFlags :AppItemsBrowseComponentStatusesFlags
    actionsMenuFlags :AppItemsBrowseComponentActionsMenuFlags
    title:string
    canView:boolean
    canAdd:boolean
    isModal?:boolean
    browseMode: BrowseMode
    priceListId?:number
    multiSelectionInfo? : MultiSelectionInfo
    applySelectionTitle?:string
    initialyShowTopBar?:boolean
}

export class AppItemsBrowseComponentFiltersDisplayFlags {
    filterType:  boolean
    search: boolean
    sorting:  boolean
    appItemType:  boolean
    extraAttributes:  boolean
    categories: boolean
    departments: boolean
    classifications:  boolean
    listingStatus:  boolean
    publishStatus: boolean
    visibilityStatus: boolean
    showAll(){
        this.filterType = true
        this.search =  true
        this.sorting = true
        this.appItemType  = true
        this.extraAttributes = true
        this.categories = true
        this.departments = true
        this.classifications = true
        this.listingStatus = true
        this.publishStatus = true
        this.visibilityStatus = true
    }
    allIsHidden : boolean
}

export class AppItemsBrowseComponentActionsMenuFlags {
    addToList:  boolean
    publishOrUnpublish:  boolean
    delete:  boolean
    createListing:  boolean
    editListing:  boolean
    edit: boolean
    showAll(){
        this.addToList =  true
        this.publishOrUnpublish =  true
        this.delete =  true
        this.editListing =  true
        this.createListing =  true
        this.edit =  true
    }
    allIsHidden : boolean
}


export class AppItemsBrowseComponentStatusesFlags {
    listingStatus:  boolean
    publicityStatus:  boolean
    showAll(){
        this.listingStatus =  true
        this.publicityStatus =  true
    }
    allIsHidden : boolean
}
