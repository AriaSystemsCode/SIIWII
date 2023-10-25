import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { Observable } from 'rxjs';
export interface ImageUploadComponentOutput {
    image : string
    file : File
}
@Component({
    selector: 'app-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent extends AppComponentBase implements OnChanges {
    @Output() imageBrowseDone : EventEmitter<ImageUploadComponentOutput> = new EventEmitter<ImageUploadComponentOutput>()
    @Output() removeImage : EventEmitter<any> = new EventEmitter<any>()
    @Input() sycAttachmentCategory:SycAttachmentCategoryDto
    @Input() staticWidth:number
    @Input() staticHeight:number
    @Input() showGuidelines:boolean = false
    @Input() image : string
    inputID : string
    mbToByteConversionFactor = 1e+6
    acceptedExtensions:string =""
    acceptedExtensionsArr:string[] = []
    imgFile : File
    constructor(injector:Injector) {
        super(injector)
        this.inputID = this.guid()
    }
    ngOnChanges(changes: SimpleChanges): void {
        if(this.sycAttachmentCategory){
            let [width,height] = this.sycAttachmentCategory.aspectRatio.split(':')
            this.acceptedAspectRatio = Number(width) / Number(height)
            this.detectSupportedExtensions()
            if(this.staticWidth){
                this.staticHeight =  this.staticWidth / this.acceptedAspectRatio
            } else if( this.staticHeight ) {
                this.staticWidth =  this.staticHeight * this.acceptedAspectRatio
            }
        }
    }
    acceptedAspectRatio : number
    async fileChange($event:{target :{files : FileList,value}}){
        let imgFile = $event.target.files[0];
        let resetInput = ()=> $event.target.value = null
        //validate extension
        const isValidExtension = this.hasValidExtension(imgFile.name,this.acceptedExtensionsArr)
        if(!isValidExtension) return this.message.warn(this.l("UnsupportedExtension"))

        //validate size
        if(this.checkImageSize(imgFile.size)) return this.message.error(this.l('MaxFileSizeExceeded'))

        const renderedImage = await this.renderImageAndGetDimensions(imgFile)
        // validate aspect ratio
        const currentAspectRatio = renderedImage.width / renderedImage.height
        const buffer = 0.2

        if(this.acceptedAspectRatio - buffer  < currentAspectRatio  && this.acceptedAspectRatio + buffer  > currentAspectRatio ) {
            //image is accepted
            this.image = renderedImage.src
            this.imgFile = imgFile
            this.imageBrowseDone.emit({file : this.imgFile,image:this.image})
        } else {
            // image needs to be cropped
            let { onCropDone, data } = this.openImageCropper($event,this.acceptedAspectRatio);
            let subs = onCropDone.subscribe((res)=>{
                if(data.isCropDone) {
                    this.image = data.croppedImageAsBase64 as string
                    this.imgFile = new File([data.croppedImage], imgFile.name);
                    this.imageBrowseDone.emit({file : this.imgFile,image:this.image})
                }
                // reset input
                subs.unsubscribe()
            })
        }
        resetInput()
    }
    prevetFileBrowse($event){
        $event.stopPropagation();
        let labelElement = $event.target.parentElement
        labelElement.onclick = (e)=> e.preventDefault()
        setTimeout( ()=> labelElement.onclick = ()=>{} ,0)
    }
    emitRemoveImage($event){
        this.prevetFileBrowse($event)
        this.image = undefined
        this.removeImage.emit()
    }
    checkImageSize(imgSize:number){
        const maxFileSize = this.sycAttachmentCategory.maxFileSize * this.mbToByteConversionFactor
        return imgSize > maxFileSize
    }
    async renderImageAndGetDimensions(file:File) : Promise<HTMLImageElement> {
        return new Promise((resolve,reject)=>{
            var fr = new FileReader;
            fr.onload = function() { // file is loaded
                var img = new Image;

                img.onload = function() {
                    resolve(img)// image is loaded; sizes are available
                };

                img.src = fr.result as string; // is the data URL because called with readAsDataURL
            };

            fr.readAsDataURL(file);
        })
    }
    detectSupportedExtensions(){
        this.acceptedExtensionsArr = []
        this.acceptedExtensions = ""
        this.sycAttachmentCategory.sycAttachmentTypeDto.forEach((item,index)=>{
            const notFirst = index > 0
            const itemsCount = this.sycAttachmentCategory.sycAttachmentTypeDto.length
            if(notFirst && itemsCount > 1) this.acceptedExtensions +=   ','
            this.acceptedExtensions +=  `.${item.extension}`
            this.acceptedExtensionsArr.push(`.${item.extension}`)
        })
    }
    hasValidExtension(fileName:string, exts : string[]) {
        return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
    }
}
