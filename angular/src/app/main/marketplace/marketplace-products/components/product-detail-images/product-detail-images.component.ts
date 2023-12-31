import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AppConsts } from "@shared/AppConsts";
import { AppEntityAttachmentDto } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-product-detail-images",
    templateUrl: "./product-detail-images.component.html",
    styleUrls: ["./product-detail-images.component.scss"],
})
export class ProductDetailImagesComponent {
    @Input() productImages: AppEntityAttachmentDto[];
    @Input() colorAttachmentForMainIamge: string;
    @Input() colorView: boolean = false;
    @Output() setColorView = new EventEmitter<boolean>();
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    currentIndex: number = 0;
    translateY = 0;

    setMainImage(index: number) {
        this.setColorView.emit(false);
        this.colorView = false;
        this.currentIndex = index;
    }

    slideToNextImage(): void {
        this.setColorView.emit(false);
        this.colorView = false;
        this.currentIndex = (this.currentIndex + 1) % this.productImages.length;
        this.translateY = -this.currentIndex * 50; // Adjust the height of each image as needed
    }

    slideToPreviousImage(): void {
        this.setColorView.emit(false);
        this.colorView = false;
        this.currentIndex =
            (this.currentIndex - 1 + this.productImages.length) %
            this.productImages.length;
        this.translateY = -this.currentIndex * 50; // Adjust the height of each image as needed
    }
}
