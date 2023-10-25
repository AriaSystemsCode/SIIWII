// <!-- Iteration-8 -->
import {  OnInit, ViewChild } from "@angular/core";
import { Input } from "@angular/core";
import { Injector } from "@angular/core";
import { Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { Component } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ModalDirective } from "ngx-bootstrap/modal";
import {  ImageCropperComponent } from "ngx-image-cropper";
import { ImageFile } from "../models/imageFile.model";
import { MainImportService } from "../services/mainImport.service";
import { ImportTypes } from "../models/ImportTypes";
import { upperCase } from "lodash";
import { SycAttachmentCategoryDto } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "autoCropModal",
    templateUrl: "./autoCrop.component.html",
    styleUrls: ["./autoCrop.component.scss"],
})
export class autoCropComponent extends AppComponentBase implements OnInit {
    @ViewChild("autoCrop", { static: true }) modal: ModalDirective;
    @ViewChild("cropperImages") cropperImages: ImageCropperComponent;
    @ViewChild("cropperImage") cropperImage: ImageCropperComponent;

    @Input() imagesList: ImageFile[] = [];
    @Input() imageFailed: number = 0;
    @Input() imagePassed: number = 0;
    @Input() failedImagesIndex: number[] = [];
    acceptedRatio: number = 0;
    @Output() autoCrop = new EventEmitter<string>();
    @Output() finalImages=new EventEmitter<ImageFile[]>();
    @Output()   finishCropping=new EventEmitter<boolean>();
    imageChangedEvent: any;
    imagesChangedEvent: any;
    maxHeight:number=0;
    maxWidth:number=0;
    @Output() close = new EventEmitter<boolean>();
    hideCropper:boolean=false;
   importType:ImportTypes;
   ImportTypes=ImportTypes;
   sycAttachmentCategory: {[key:string]:SycAttachmentCategoryDto};


    public constructor(
        private _mainImportService: MainImportService,
          private _importService:MainImportService,
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit() {}


    show(importType:ImportTypes,sycAttachmentCategory: {[key:string]:SycAttachmentCategoryDto}): boolean {
        this.sycAttachmentCategory=sycAttachmentCategory;
       this.importType= importType;
        this.hideCropper=false;
        if (this.failedImagesIndex && this.failedImagesIndex.length > 0) {
            this.modal.show();
            this.finishCropping.emit(false);
            let firstFailedIndex=this.failedImagesIndex[0];
            var event = {
                target: {
                    files: [this.imagesList[firstFailedIndex].file],
                },
            };

            var image = this.imagesList[firstFailedIndex].file;
            this.acceptedRatio = Number(this.sycAttachmentCategory[this.imagesList[firstFailedIndex].imgtype.toUpperCase()].aspectRatio);
            
            this.imageChangedEvent = event;
                this.cropperImage.cropperReady.subscribe((sourceImageDimensions) => {
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onload = () => {
                var img = new Image();
                img.src = reader.result as string;
                img.onload = (rs) => {
                    var img_height = rs.currentTarget["height"];
                    var img_width = rs.currentTarget["width"];
                  setTimeout(() => {
                       /*  this.maxHeight=this.cropperImage.maxSize.height;
                        this.maxWidth=this.cropperImage.maxSize.width;

                        if(img_height > this.maxHeight)
                           img_height=this.maxHeight;

                        if(img_width>this.maxWidth)
                           img_width=this.maxWidth;
                        this.cropperImage.cropper.x1=0;
                        this.cropperImage.cropper.y1=(img_height/2)-25;
                        this.cropperImage.cropper.x2=img_width;
                        this.cropperImage.cropper.y2=(img_height/2)+25; */
                        this.cropperImage.cropper = this._importService.getCropperDimention(sourceImageDimensions,this.acceptedRatio);

                    });
                };
            };
        });


            return true;
        } else
        {
            this.finalImages.emit(this.imagesList.filter(x => x.imageExist==true));
            return false;
        }
    }

    hide() {
        this.modal.hide();
    }

    crop(autoCrop: string) {
        //AutoCrop
        if(autoCrop=="true")
          this.imageCropping(0);
      this.finalImages.emit(this.imagesList);
            this.autoCrop.emit(autoCrop);

    }

    imageCropping(index: number) {
        let reader = new FileReader();
       let imageIndex= this.failedImagesIndex[index];
        let file = this.imagesList[imageIndex].file;
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            var img_height = 0;
            var img_width = 0;
            const image = new Image();
            image.src = e.target.result.toString();
            image.onload = (rs) => {
                img_height = rs.currentTarget["height"];
                img_width = rs.currentTarget["width"];
            };
            var event = {
                target: {
                    files: [file],
                },
            }
            this.cropperImages.imageChangedEvent = event;
            this.imagesChangedEvent = event;
            this.acceptedRatio = Number(this.sycAttachmentCategory[this.imagesList[imageIndex].imgtype.toUpperCase()].aspectRatio);

            //let imageLoaded = this.cropperImages.imageLoaded.subscribe((event) => {
                let cropperReady =  this.cropperImages.cropperReady.subscribe((sourceImageDimensions) => {
                setTimeout(() => {
                    this.cropperImages.cropper = this._importService.getCropperDimention(sourceImageDimensions,this.acceptedRatio);
                  /*   let maxWidth = sourceImageDimensions.width;
        let maxHeight = sourceImageDimensions.height;
        let croppingHeight = maxWidth / this.acceptedRatio;;
        let croppingWidth = maxHeight / this.acceptedRatio;

        if ((this.acceptedRatio>1) || ((this.acceptedRatio<1) && (maxHeight>maxWidth)) ){
                 const Offset = ( maxHeight - croppingHeight ) / 2
                 this.cropperImages.cropper = {
                x1:0,
                x2:maxWidth,
                y1:Offset,
                y2:croppingHeight+Offset
            }

        }
       else if ((this.acceptedRatio<1) && (maxHeight<maxWidth))
       {
        const Offset = ( maxWidth - croppingWidth ) / 2

        this.cropperImages.cropper = {
                x1:Offset,
                x2:Offset+croppingWidth,
                y1:0,
                y2:maxHeight
            }
        } */

                   /*  this.cropperImages.cropper.x1 = 0;
                    this.cropperImages.cropper.y1 = (img_height / 2);
                    this.cropperImages.cropper.x2 = img_width;
                    this.cropperImages.cropper.y2 = (img_height / 2) + 25; */
                    this.cropperImages.crop();
                    this.imagesList[imageIndex].finalStatus = true;
                    if (index + 1 < this.failedImagesIndex.length)
                        this.imageCropping(index + 1);
                        else
                        {
                        this.finishCropping.emit(true);
                        this.hideCropper=true;
                        }
                    cropperReady.unsubscribe();
                });


            });

            let imageCroppedSubscripe =
                this.cropperImages.imageCropped.subscribe((event) => {
                    this.imagesList[imageIndex].croppedbase64=event.base64;
                   /*
                    if (index + 1 < this.failedImagesIndex.length)
                        this.imageCropping(index + 1);
                        else
                        {
                        this.finishCropping.emit(true);
                        this.hideCropper=true;
                        } */
                    imageCroppedSubscripe.unsubscribe();
                });
        };
    }

askToClose()
{
    this.close.emit(true);
}
}
// <!-- Iteration-8 -->
