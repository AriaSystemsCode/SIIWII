import { EventsFilterTypesEnum } from "@shared/service-proxies/service-proxies";
import { SelectItem } from "primeng/api";
import { NewsBrowseComponentActionsMenuFlags } from "./NewsBrowseComponentActionsMenuFlags";
import { NewsBrowseComponentFiltersDisplayFlags } from "./NewsBrowseComponentFiltersDisplayFlags";
import { NewsBrowseComponentStatusesFlags } from "./NewsBrowseComponentStatusesFlags";

export interface NewsBrowseInputs {
    defaultMainFilter: EventsFilterTypesEnum
    showMainFiltersOptions: boolean
    pageMainFilters: SelectItem[]
    filtersFlags :NewsBrowseComponentFiltersDisplayFlags
    statusesFlags :NewsBrowseComponentStatusesFlags
    actionsMenuFlags :NewsBrowseComponentActionsMenuFlags
    title:string
    canView:boolean
    canAdd:boolean
}


export enum NewsBrowseActionsEvents {
    View,
    Edit,
    Delete,
    Publish,
    UnPublish
}
