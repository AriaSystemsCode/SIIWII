import { IFilteredExtraAttribute } from './filtered-extra-attribute';
import { IVaritaionAttachment } from './IVaritaionAttachment';



export interface IIsVariationExtraAttribute extends IFilteredExtraAttribute {
    selected: boolean;
    defaultForAttachment : boolean
    selectedValuesAttachments : {
        [key:number]: IVaritaionAttachment
    }
}

