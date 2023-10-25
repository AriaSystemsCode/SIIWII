import { SycAttachmentCategoryDto } from "@shared/service-proxies/service-proxies";
import { ImageFile } from "./imageFile.model";
export interface ServiceUtilites {
    checkImagesExistance(uploadingResult: any, imagesList: ImageFile[], sycAttachmentCategory: { [key: string]: SycAttachmentCategoryDto }): void;
    setImagesGuids(uploadingResult: any, finalUploadedImages: ImageFile[]);
}
