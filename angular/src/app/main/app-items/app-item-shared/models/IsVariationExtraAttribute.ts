import { FilteredExtraAttribute } from './filtered-extra-attribute';
import { IIsVariationExtraAttribute } from './IIsVariationExtraAttribute';
import { IVaritaionAttachment } from './IVaritaionAttachment';

export class IsVariationExtraAttribute extends FilteredExtraAttribute {
    selected: boolean = false
    selectedValuesAttachments : {
        [key:string]: IVaritaionAttachment
    }
    defaultForAttachment :boolean = false
    constructor(data?: IIsVariationExtraAttribute) {
        super(data);
        if (data && data.selected) this.selected = data.selected
        if (data && data.selectedValuesAttachments) this.selectedValuesAttachments = data.selectedValuesAttachments
        if (data && typeof data.defaultForAttachment == 'boolean' ) this.defaultForAttachment = data.defaultForAttachment
    }
}
