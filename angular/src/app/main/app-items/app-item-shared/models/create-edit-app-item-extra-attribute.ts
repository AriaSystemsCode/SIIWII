import { EExtraAttributeUsage } from "../../appItems/models/extra-attribute-usage.enum";
import { FilteredExtraAttribute } from "./filtered-extra-attribute";

export interface ICreateEditAppItemExtraAttribute {
    header:string,
    title:string,
    usageEnum:EExtraAttributeUsage,
    filteredExtraAttributes?:FilteredExtraAttribute[]
    orderOfDisplay:number,
    selectedValue?:string
}
export class CreateEditAppItemExtraAttribute {
    header:string
    title:string
    usageEnum:EExtraAttributeUsage
    extraAttributes?:FilteredExtraAttribute[]
    orderOfDisplay:number
    selectedValue?:string
    constructor(data:ICreateEditAppItemExtraAttribute){
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }
}

