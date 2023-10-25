import { Injector, OnInit } from "@angular/core";
import { Injectable } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { SycAttachmentCategoryDto } from "@shared/service-proxies/service-proxies";
import { upperCase } from "lodash";

import { Observable } from "rxjs";
import { ImageFile } from "../models/imageFile.model";
import { ImportStepInfo } from "../models/ImportStepInfo";
import { ImportStepsEnum } from "../models/ImportStepsEnum";
import { ImportTypes } from "../models/ImportTypes";
@Injectable()
export class MainImportService extends AppComponentBase  {
    public constructor(
        injector: Injector
    ) {
        super(injector);
    }
    originalImportSteps:ImportStepInfo[]=[];
    imagePassed:number;
    imageFailed:number;
    failedImagesIndex: number[] ;

    public getOriginalImportSteps(){
           this.originalImportSteps=[];
         this.originalImportSteps.push({
        stepEnum:ImportStepsEnum.BrowseModalStep,
        stepNumber:0
    },
    {
        stepEnum:ImportStepsEnum.StatusModalStep,
        stepNumber:1
    },
    {
        stepEnum:ImportStepsEnum.AutoCropModalStep,
        stepNumber:2
    },
    {
        stepEnum:ImportStepsEnum.imageCroppingModalStep,
        stepNumber:3
    },
    {
        stepEnum:ImportStepsEnum.importConfirmationModalStep,
        stepNumber:4
    },
    {
        stepEnum:ImportStepsEnum.successfullyImportModalStep,
        stepNumber:5
    }
    ); 
    return this.originalImportSteps;
}
    public calculateImageSize(base64String) {
        let padding;
        let inBytes;
        let base64StringLength;
        if (base64String.endsWith('==')) { padding = 2; }
        else if (base64String.endsWith('=')) { padding = 1; }
        else { padding = 0; }

        base64StringLength = base64String.length;
        inBytes = (base64StringLength / 4) * 3 - padding;
        var kbytes = inBytes / 1000;
        return kbytes;
    }

    getImageInfo(Base64: string, autoCrop: string) {
        var image = {
            width: 0,
            height: 0,
            size: 0,
            sizeType: "",
            type: "",
        }

        var img = new Image();
        img.src = Base64;

        if (autoCrop == "true")
            image.size = this.calculateImageSize(Base64);

        img.addEventListener('load', function () {
            image.width = img.width;
            image.height = img.height;

        });
        return image;

    }
    
    checkImageValidExt(imageName: string,sycAttachmentCategory: {[key:string]:SycAttachmentCategoryDto},imageType:string) {
       
        var imageExt= imageName.substring(imageName.lastIndexOf(".")+1);

        var indx =sycAttachmentCategory[imageType.toUpperCase()].sycAttachmentTypeDto.findIndex(
                            (x) =>
                                x.extension.toUpperCase() ==
                                imageExt.toUpperCase()
                        ); 
        if (indx>=0)
            return true;
        return false;
    }

    getCropperDimention(sourceImageDimensions: any, acceptedRatio: number) {
        let maxWidth = sourceImageDimensions.width;
        let maxHeight = sourceImageDimensions.height;
        let croppingHeight = maxWidth / acceptedRatio;;
        let croppingWidth = maxHeight / acceptedRatio;

        if ((acceptedRatio > 1) || ((acceptedRatio <= 1) && (maxHeight > maxWidth))) {
            const Offset = (maxHeight - croppingHeight) / 2
            var cropper = {
                x1: 0,
                x2: maxWidth,
                y1: Offset,
                y2: croppingHeight + Offset
            }
        }
        else if ((acceptedRatio <= 1) && (maxHeight < maxWidth)) {
            const Offset = (maxWidth - croppingWidth) / 2

            cropper = {
                x1: Offset,
                x2: Offset + croppingWidth,
                y1: 0,
                y2: maxHeight
            }
        }

        return cropper;
    }

    setImageData(imageName: string, code: string, imageType: string,imagesList: ImageFile[],sycAttachmentCategory: {[key:string]:SycAttachmentCategoryDto}) {
        
        this.imagePassed=0;
        this.imageFailed=0;
        this.failedImagesIndex= [];
         var indx = imagesList.findIndex(
            (x) =>
                x.file.name
                    .toUpperCase()
                    .substring(
                        0,
                        x.file.name.toUpperCase().lastIndexOf(".")
                    ) ===
                imageName
                    .toUpperCase()
                    .substring(0, imageName.toUpperCase().lastIndexOf("."))
        );
        if (indx >= 0) {
            imagesList[indx].imageExist = true;
            imagesList[indx].code = code;
            imagesList[indx].imgtype = imageType;
            
             var ratio = Number(sycAttachmentCategory[imageType.toUpperCase()].aspectRatio);
            if (
                imagesList[indx].ratio >= Math.abs(ratio - 0.05) &&
                imagesList[indx].ratio <= ratio + 0.05
            ) {
                imagesList[indx].initialStatus = true;
                imagesList[indx].finalStatus = true;
                this.imagePassed += 1;
            } else {
                imagesList[indx].initialStatus = false;
                imagesList[indx].finalStatus = false;
                this.failedImagesIndex.push(indx);
                this.imageFailed += 1;
            }
        } 
        return {
            imagePassed: this.imagePassed,
            imageFailed: this.imageFailed,
            failedImagesIndex: this.failedImagesIndex
        };
    }
}





