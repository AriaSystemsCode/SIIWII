import { Injector } from "@angular/core";
import { Injectable } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppItemExcelResultsDTO, AppItemImage, SycAttachmentCategoryDto } from "@shared/service-proxies/service-proxies";
import { iif } from "rxjs";
import { ImageFile } from "../models/imageFile.model";
import { ServiceUtilites } from "../models/ServiceUtilites";
import { MainImportService } from "./mainImport.service";
@Injectable()
export class itemsImport extends AppComponentBase implements ServiceUtilites {
    imagePassed: number;
    imageFailed: number;
    failedImagesIndex: number[];
    public constructor(
        private _importService: MainImportService,
        private injector: Injector
    ) {
        super(injector);
    }

    checkImagesExistance(uploadingResult: any, imagesList: ImageFile[], sycAttachmentCategory: { [key: string]: SycAttachmentCategoryDto }) {


        this.imagePassed = 0;
        this.imageFailed = 0;
        this.failedImagesIndex = [];

        for (let i = 0; i < imagesList.length; i++) {
            let code = imagesList[i].file.name;

            let ret = this._importService.setImageData(
                imagesList[i].file.name,
                code,
                'IMAGE', imagesList, sycAttachmentCategory
            );
            this.imagePassed += ret.imagePassed;
            this.imageFailed += ret.imageFailed;
            this.failedImagesIndex = [...this.failedImagesIndex, ...ret.failedImagesIndex];
        }
        return {
            imagePassed: this.imagePassed,
            imageFailed: this.imageFailed,
            failedImagesIndex: this.failedImagesIndex
        };
    }


    setImagesGuids(uploadingResult: AppItemExcelResultsDTO, finalUploadedImages: ImageFile[]) {
        for (let i = 0; i < finalUploadedImages.length; i++) {
            let image = finalUploadedImages[i];
            var indxX = -1;
            var indxY = -1;
            for (let j = 0; j < uploadingResult?.excelRecords.length; j++) {
                indxY =
                    uploadingResult?.excelRecords[j]?.excelDto?.images?.findIndex((y) =>
                        y?.imageFileName.toUpperCase() == image.code.toUpperCase()
                    );
               if (indxY >= 0)
                {
                    indxX = j;
                    break;
                }
            }
            if ((indxX >= 0) && (indxY >= 0))
                uploadingResult.excelRecords[indxX].excelDto.images[indxY].imageGuid = image.Guid;

        }
        return uploadingResult;
    }


}