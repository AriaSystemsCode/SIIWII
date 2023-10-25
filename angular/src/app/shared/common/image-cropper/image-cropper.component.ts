import { Component,  ElementRef,  Injector,  OnDestroy,  OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as _  from 'ngx-image-cropper';
@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css']
})
export class ImageCropperComponent implements OnInit  {
    @ViewChild('imageCropper') imageCropper : _.ImageCropperComponent
    noOptions:boolean = true
    originalFileChangeEvent:Event
    title:string
    aspectRatio:number
    imageChangedEvent: any = '';
    croppedImageAsBase64: string | ArrayBuffer
    croppedImage: Blob
    containWithinAspectRatio:boolean

    transform: _.ImageTransform

    showCropper:boolean = false
    canvasRotation:number
    isCropDone:boolean = false
    constructor(public bsModalRef: BsModalRef) { }
    imgFile : File
    ngOnInit(){
        this.resetImage()
        const eventTarget  = (this.originalFileChangeEvent.target as HTMLInputElement)
        const file:File = eventTarget.files[0]
        this.imgFile = file;
        this.fileToBase64(file)
        if(!this.aspectRatio) this.aspectRatio = eventTarget.parentElement.offsetWidth / eventTarget.parentElement.offsetHeight

    }


    fileToBase64(file:File){
        var reader = new FileReader();
        const self = this
        reader.onload = function (e) {
            self.croppedImageAsBase64  =  e.target.result
        };
        reader.readAsDataURL( file )
    }

    imageCropped(event: _.ImageCroppedEvent) {
        this.croppedImageAsBase64 = event.base64
        this.croppedImage = _.base64ToFile(this.croppedImageAsBase64)
    }

    imageLoaded() {
        this.showCropper = true
    }
    
    async cropperReady(sourceImageDimensions: _.Dimensions) {
        let maxWidth = sourceImageDimensions.width
        let maxHeight = sourceImageDimensions.height
        const currAspectRatio = maxWidth / maxHeight
        let croppingHeight:number, croppingWidth:number;
        let takeMaxHeight : boolean, takeMaxWidth : boolean;
        currAspectRatio >= this.aspectRatio ?  takeMaxHeight = true : takeMaxWidth = true
        if ( takeMaxWidth ){
            croppingHeight = maxWidth / this.aspectRatio
            const Offset = ( maxHeight - croppingHeight ) / 2
            this.imageCropper.cropper = {
                x1:0,
                x2:maxWidth,
                y1:Offset,
                y2:croppingHeight+Offset
            }

        }
       else if ( takeMaxHeight ){
            croppingWidth = maxHeight * this.aspectRatio
            const Offset = ( maxWidth - croppingWidth ) / 2

            this.imageCropper.cropper = {
                x1:Offset,
                x2:Offset+croppingWidth,
                y1:0,
                y2:maxHeight
            }
        }
    }

    loadImageFailed() {
    }

    rotateLeft() {
        this.canvasRotation--
        this.changeTransformRef();
    }

    rotateRight() {
        this.canvasRotation++
        this.changeTransformRef();
    }

    changeTransformRef() {
        this.transform = JSON.parse( JSON.stringify(this.transform) )
    }

    flipHorizontal() {
        this.transform.flipH  = !this.transform.flipH
        this.changeTransformRef()
    }

    flipVertical() {
        this.transform.flipV  = !this.transform.flipV
        this.changeTransformRef()
    }

    resetImage() {
        const defaultTransformValues: _.ImageTransform = {
            scale:1,
            rotate:0,
            flipH:false,
            flipV:false,
        }
        this.canvasRotation = 0
        this.containWithinAspectRatio = false;
        this.transform = new Object(defaultTransformValues)
    }

    zoomOut() {
        this.transform.scale -= .1;
        this.changeTransformRef()
    }

    zoomIn() {
        this.transform.scale += .1;
        this.changeTransformRef()
    }

    toggleContainWithinAspectRatio() {
        this.containWithinAspectRatio = !this.containWithinAspectRatio;
    }

    cropDone(){
        if(this.croppedImage && this.croppedImageAsBase64){
            this.isCropDone = true
        }
        this.bsModalRef.hide()
    }

}
