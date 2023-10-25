import { AppEntityAttachmentDto } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng/api';


export interface IVaritaionAttachment {
    entityAttachments: AppEntityAttachmentDto[];
    attachmentSrcs: string[];
    lookupData: SelectItem;
    defaultImageIndex: number;
}
