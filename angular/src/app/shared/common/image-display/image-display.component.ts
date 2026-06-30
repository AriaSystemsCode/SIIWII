import { Component, HostBinding, Input, OnInit, SimpleChanges } from '@angular/core';
import { SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-image-display',
    templateUrl: './image-display.component.html',
    styleUrls: ['./image-display.component.scss']
})
export class ImageDisplayComponent {
    @HostBinding('style.width')
    get hostWidth(): string | null {
        return this.staticWidth ? `${this.staticWidth}px` : null;
    }

    @HostBinding('style.height')
    get hostHeight(): string | null {
        return this.staticHeight ? `${this.staticHeight}px` : null;
    }

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
            // let [width,height,border] = this.sycAttachmentCategory.aspectRatio.split(':')
            // let acceptedAspectRatio = Number(width) / Number(height)
            const aspect = String(this.sycAttachmentCategory.aspectRatio);
            const [width, height] = aspect.split(':');
          
            if (!width || !height || isNaN(+width) || isNaN(+height)) {
              return;
            }
          
            const acceptedAspectRatio = Number(width) / Number(height);
            if(this.staticWidth){
                this.staticHeight =  this.staticWidth / acceptedAspectRatio
            } else if( this.staticHeight ) {
                this.staticWidth =  this.staticHeight * acceptedAspectRatio
            }
            if(!this.alt) this.alt = this.sycAttachmentCategory.name + ' Photo'
        }
    }

}
