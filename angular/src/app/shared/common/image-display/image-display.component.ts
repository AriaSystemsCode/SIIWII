import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-image-display',
    templateUrl: './image-display.component.html',
    styleUrls: ['./image-display.component.scss']
})
export class ImageDisplayComponent {
    @Input() image : string
    @Input() sycAttachmentCategory : SycAttachmentCategoryDto
    @Input() staticWidth:number
    @Input() staticHeight:number
    @Input() staticeRadius:number
    @Input() classList:string
    @Input() alt:string
    
    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        if(this.sycAttachmentCategory){
            let [width,height,border] = this.sycAttachmentCategory.aspectRatio.split(':')
            let acceptedAspectRatio = Number(width) / Number(height)
            if(this.staticWidth){
                this.staticHeight =  this.staticWidth / acceptedAspectRatio
            } else if( this.staticHeight ) {
                this.staticWidth =  this.staticHeight * acceptedAspectRatio
            }
            if(!this.alt) this.alt = this.sycAttachmentCategory.name + ' Photo'
        }
    }

}
