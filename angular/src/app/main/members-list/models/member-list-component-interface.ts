import { SelectItem } from "primeng/api";
import { MemberFilterTypeEnum } from '@shared/service-proxies/service-proxies';

export interface MembersListComponentInputsI {
    defaultMainFilter: MemberFilterTypeEnum
    showMainFiltersOptions: boolean
    pageMainFilters: SelectItem[]
    accountId?:number
    title:string
    canView:boolean
    canAdd:boolean
}
