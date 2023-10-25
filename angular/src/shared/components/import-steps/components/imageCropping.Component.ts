// <!-- Iteration-8 -->
import { EventEmitter, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { Injector } from "@angular/core";
import { Input } from "@angular/core";
import { OnChanges } from "@angular/core";
import { Component } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {  isEmpty, upperCase } from "lodash";
import { ModalDirective } from "ngx-bootstrap/modal";
import { ImageCroppedEvent } from "ngx-image-cropper";
import { Observable } from "rxjs";
import { ImageFile } from "../models/imageFile.model";
import { MainImportService } from "../services/mainImport.service";
import { ImportTypes } from "../models/ImportTypes";
import { SycAttachmentCategoryDto } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "imageCroppingModal",
    templateUrl: './imageCropping.component.html',
    styleUrls: ['./imageCropping.component.scss'],

})
export class imageCroppingComponent extends AppComponentBase implements OnInit,OnChanges {
    @ViewChild('imageCropping', { static: true }) modal: ModalDirective;
    @Input() finalImages: ImageFile[];
    @Output() goNext: EventEmitter<any> = new EventEmitter<number>();
    @Output() Previous: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() finishCropping:boolean=false;
    @Input() OnChange:boolean;
    finish:boolean
     _imageFailed: number = 0;
     _imagePassed: number = 0;
     @Output() finalCountFailed: EventEmitter<number> = new EventEmitter<number>();
    @Output() finalCountPassed: EventEmitter<number> = new EventEmitter<number>();

    selectedImage:ImageFile={
        file:null,
        imgtype:"",
        code:"",
        ratio:0,
        initialStatus:false,
        finalStatus:false,
        imageExist:false,
        croppedbase64:"",
        tempBase64:""
    };
    selectedIndex:number=0;
    imageName:string="";
    autoCrop:string="";
    croppedImage:string="";
    noOfItemsToShowInitially:number= 10;
    itemsToShow:ImageFile[]=[];
    totalCount:number=0;
    itemsToLoad:number=10;
    SkipCount:number=0;
    imageBase64: string="";
    acceptedRatio:number;
    image={
        width:0,
         height:0,
         size:0,
        sizeType:"" ,
         type:""
    }
    @Output() close = new EventEmitter<boolean>();
    importType:ImportTypes;
    ImportTypes=ImportTypes;
    sycAttachmentCategory: {[key:string]:SycAttachmentCategoryDto};
    public constructor(
        private _importService:MainImportService,
        injector: Injector) {
        super(injector);
    }

    ngOnInit()
    {
    }

    show(autoCrop:string,imagePassed:number,imageFailed:number, importType:ImportTypes,sycAttachmentCategory: {[key:string]:SycAttachmentCategoryDto})
    {
        this.sycAttachmentCategory=sycAttachmentCategory;
        this.importType=importType;
        this.autoCrop=autoCrop;
        this._imagePassed=0;
        this._imageFailed=0;
        if(imageFailed==0)
        this.finish=true;
    else
    this.finish=false;

        if(this.autoCrop=="true")
        {
        this._imagePassed=imageFailed+imagePassed;
        this._imageFailed=0;
         }
    else
    {
      this._imagePassed= imagePassed;
      this._imageFailed=imageFailed;
    }
    this.modal.show();


    }

    ngOnChanges(changes:SimpleChanges)
    {
    if(this.finalImages && this.finalImages.length>0)
    {
        if(this.finishCropping || this.autoCrop=="false"){
            this.finish=true;

        var img = this.finalImages.find(
         (x) =>
         x.imageExist==true
     );

     if (img)
        this.showImage(img);
        }
  this.GetData();

}
    }

    hide() {
        this.modal.hide();
    }

    showImage(image:ImageFile)
    {
        let index=this.finalImages.findIndex(
            (x) =>
                x.file.name.toUpperCase().substring(0,x.file.name.toUpperCase().lastIndexOf(".")) ===
                image.file.name.toUpperCase().substring(0, image.file.name.toUpperCase().lastIndexOf("."))
   );
        this.selectedImage=this.finalImages[index];
        this.imageName=this.selectedImage.file.name;

        this.acceptedRatio= Number(this.sycAttachmentCategory[this.selectedImage.imgtype.toUpperCase()].aspectRatio);

       this.selectedIndex=index;

       var base64="";

    if ((this.selectedImage.finalStatus || !this.selectedImage.finalStatus) && (isEmpty(this.selectedImage.croppedbase64)))
    base64= this.selectedImage.tempBase64
    else
    base64=  this.selectedImage.croppedbase64


this.imageBase64 = base64;

     this.image= this._importService.getImageInfo(base64,this.autoCrop);
       this.image.sizeType=this.l("KB");
     if(this.autoCrop=="false")
          this.image.size = this.selectedImage.file.size/1000;

          if(this.image.size>1000)
          {
            this.image.size *=0.001;
            this.image.sizeType=this.l("MB");
          }



     this.image.type=this.l(this.selectedImage.file.type);

}

    onScroll() {
        if (this.noOfItemsToShowInitially < this.totalCount) {
            this.SkipCount = this.noOfItemsToShowInitially;
            this.noOfItemsToShowInitially += this.itemsToLoad;
            this.GetData();
        }
    }

    GetData(){
        this.totalCount = this.finalImages.length;
        this.itemsToShow = this.finalImages.filter(x => x.imageExist==true)
        .slice(
            0,
            this.noOfItemsToShowInitially
        );

    }

 crop()
 {
        this.selectedImage.croppedbase64    =this.croppedImage;
        this.selectedImage.finalStatus=true;
        this.finalImages[this.selectedIndex]=this.selectedImage;
        this.imageBase64=this.croppedImage;
this._imageFailed-=1;
this._imagePassed+=1;
 }
 Undocrop()
 {
    this.imageBase64=this.selectedImage.tempBase64;
    this.selectedImage.croppedbase64="";
    this.selectedImage.finalStatus=false;
    this.finalImages[this.selectedIndex]=this.selectedImage;
    this._imageFailed+=1;
    this._imagePassed-=1;
 }

 imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
}

goNextStep()
{
    this.goNext.emit();
    this.finalCountFailed.emit(this._imageFailed);
    this.finalCountPassed.emit(this._imagePassed);
}
askToClose()
{
    this.close.emit(true);
}

goPreviousStep()
{
    var isConfirmed: Observable<boolean>;
    isConfirmed   = this.askToConfirm('Are you sure you want to lose all your changes?',"");

   isConfirmed.subscribe((res)=>{
      if(res){
            this.finalImages.forEach(element => {
                 if(!isEmpty(element.croppedbase64))
               {
                   element.croppedbase64="";
                   element.finalStatus=element.initialStatus;
               }
            });
            this.Previous.emit(true);
        }
    }
);
}


}
// <!-- Iteration-8 -->
