import { Injector } from "@angular/core";
import { Injectable } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { SycAttachmentCategoryDto } from "@shared/service-proxies/service-proxies";
import { ImageFile } from "../models/imageFile.model";
import { ServiceUtilites } from "../models/ServiceUtilites";
import { MainImportService } from "./mainImport.service";
@Injectable()
export class AccountsImport extends AppComponentBase implements ServiceUtilites {
    imagePassed: number;
    imageFailed: number;
    failedImagesIndex: number[];

    public constructor(
        private _importService: MainImportService,
        injector: Injector
    ) {
        super(injector);
    }

    checkImagesExistance(uploadingResult: any, imagesList: ImageFile[],sycAttachmentCategory: {[key:string]:SycAttachmentCategoryDto}) {
       this.imagePassed=0;
       this.imageFailed=0;
       this.failedImagesIndex=[];

        for (
            let i = 0;
            i <
            uploadingResult.excelRecords
                .length;
            i++
        ) {
            var record =
                uploadingResult
                    .excelRecords[i];
            if (
                record.status.toUpperCase() == "PASSED"
            ) {
                if (
                    record.image1 != "" &&
                    this._importService.checkImageValidExt(
                        record.image1,sycAttachmentCategory,record.image1Type
                    )
                ) {
                    let ret = this._importService.setImageData(
                        record.image1,
                        record.code,
                        record.image1Type, imagesList,sycAttachmentCategory
                    );
                    this.imagePassed += ret.imagePassed;
                    this.imageFailed += ret.imageFailed;
                    this.failedImagesIndex = [...this.failedImagesIndex, ...ret.failedImagesIndex];
                }

                if (
                    record.image2 != "" &&
                    this._importService.checkImageValidExt(
                        record.image2,sycAttachmentCategory, record.image2Type
                    )
                ) {
                    let ret = this._importService.setImageData(
                        record.image2,
                        record.code,
                        record.image2Type, imagesList,sycAttachmentCategory
                    );
                    this.imagePassed += ret.imagePassed;
                    this.imageFailed += ret.imageFailed;
                    this.failedImagesIndex = [...this.failedImagesIndex, ...ret.failedImagesIndex];
                }
                if (
                    record.image3 != "" &&
                    this._importService.checkImageValidExt(
                        record.image3,sycAttachmentCategory, record.image3Type
                    )
                ) {
                    let ret = this._importService.setImageData(
                        record.image3,
                        record.code,
                        record.image3Type, imagesList,sycAttachmentCategory
                    );
                    this.imagePassed += ret.imagePassed;
                    this.imageFailed += ret.imageFailed;
                    this.failedImagesIndex = [...this.failedImagesIndex, ...ret.failedImagesIndex];
                }
                if (
                    record.image4 != "" &&
                    this._importService.checkImageValidExt(
                        record.image4,sycAttachmentCategory, record.image4Type
                    )
                ) {
                    let ret = this._importService.setImageData(
                        record.image4,
                        record.code,
                        record.image4Type, imagesList,sycAttachmentCategory
                    );
                    this.imagePassed += ret.imagePassed;
                    this.imageFailed += ret.imageFailed;
                    this.failedImagesIndex = [...this.failedImagesIndex, ...ret.failedImagesIndex];
                }
                if (
                    record.image5 != "" &&
                    this._importService.checkImageValidExt(
                        record.image5,sycAttachmentCategory,record.image5Type
                    )
                ) {
                    let ret = this._importService.setImageData(
                        record.image5,
                        record.code,
                        record.image5Type, imagesList,sycAttachmentCategory
                    );
                    this.imagePassed += ret.imagePassed;
                    this.imageFailed += ret.imageFailed;
                    this.failedImagesIndex = [...this.failedImagesIndex, ...ret.failedImagesIndex];
                }
            }
        }
        return {
            imagePassed: this.imagePassed,
            imageFailed: this.imageFailed,
            failedImagesIndex: this.failedImagesIndex
        };
    }


    setImagesGuids(uploadingResult: any,finalUploadedImages: ImageFile[]){
        for (let i = 0; i <finalUploadedImages.length; i++) {
            let image = finalUploadedImages[i];

            var indx =
                uploadingResult.excelRecords.findIndex(
                    (x) =>
                        x.code.toUpperCase() ==
                        image.code.toUpperCase()
                );

            if (indx >= 0) {
                var record =
                    uploadingResult.excelRecords[indx];
                if (
                    record.image1.toUpperCase() ==
                    image.file.name.toUpperCase() &&
                    record.image1Type.toUpperCase() ==
                    image.imgtype.toUpperCase()
                )
                    uploadingResult.excelRecords[
                        indx
                    ].excelDto.image1Guid = image.Guid;
                else if (
                    record.image2.toUpperCase() ==
                    image.file.name.toUpperCase() &&
                    record.image2Type.toUpperCase() ==
                    image.imgtype.toUpperCase()
                )
                    uploadingResult.excelRecords[
                        indx
                    ].excelDto.image2Guid = image.Guid;
                else if (
                    record.image3.toUpperCase() ==
                    image.file.name.toUpperCase() &&
                    record.image3Type.toUpperCase() ==
                    image.imgtype.toUpperCase()
                )
                    uploadingResult.excelRecords[
                        indx
                    ].excelDto.image3Guid = image.Guid;
                else if (
                    record.image4.toUpperCase() ==
                    image.file.name.toUpperCase() &&
                    record.image4Type.toUpperCase() ==
                    image.imgtype.toUpperCase()
                )
                  uploadingResult.excelRecords[
                        indx
                    ].excelDto.image4Guid = image.Guid;
                else if (
                    record.image5.toUpperCase() ==
                    image.file.name.toUpperCase() &&
                    record.image5Type.toUpperCase() ==
                    image.imgtype.toUpperCase()
                )
                    uploadingResult.excelRecords[
                        indx
                    ].excelDto.image5Guid = image.Guid;
            }
        }
        return uploadingResult;
    }
}
