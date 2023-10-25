import { EventsFilterTypesEnum } from "@shared/service-proxies/service-proxies";
import { SelectItem } from "primeng/api";
import { EventsBrowseComponentActionsMenuFlags } from "./EventsBrowseComponentActionsMenuFlags";
import { EventsBrowseComponentFiltersDisplayFlags } from "./EventsBrowseComponentFiltersDisplayFlags";
import { EventsBrowseComponentStatusesFlags } from "./EventsBrowseComponentStatusesFlags";

export interface EventsBrowseInputs {
    defaultMainFilter: EventsFilterTypesEnum
    showMainFiltersOptions: boolean
    pageMainFilters: SelectItem[]
    filtersFlags :EventsBrowseComponentFiltersDisplayFlags
    statusesFlags :EventsBrowseComponentStatusesFlags
    actionsMenuFlags :EventsBrowseComponentActionsMenuFlags
    title:string
    canView:boolean
    canAdd:boolean
}


export enum EventsBrowseActionsEvents {
    View,
    Edit,
    Delete,
    Publish,
    UnPublish
}
