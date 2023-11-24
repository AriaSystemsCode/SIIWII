import { PaginationSettings } from "@shared/components/shared-forms-components/dropdown-with-pagination/dropdown-with-pagination.component";
import { ExtraAttribute, IExtraAttribute, LookupLabelDto } from "@shared/service-proxies/service-proxies"
import { SelectItem } from "primeng";

export interface IFilteredExtraAttribute extends IExtraAttribute {
    lookupData ?: LookupLabelDto[]
}


export class FilteredExtraAttribute<SelecTedValueType=any>  extends ExtraAttribute{
    lookupData? : LookupLabelDto[]
    displayedLookupData : LookupLabelDto[]
    selectedValues?: SelecTedValueType
    isSelectedOnVariation? :boolean
    paginationSetting : PaginationSettings = new PaginationSettings()
    constructor(
        data?:IFilteredExtraAttribute,
    ){
        super(data);
        if(data && data.lookupData) this.lookupData = data.lookupData;
    }
}
