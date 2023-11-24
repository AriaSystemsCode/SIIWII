import { HttpParams } from "@angular/common/http";
import { Component, Input,OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppConsts } from "@shared/AppConsts";

@Component({
    selector: "app-prodcut-card",
    templateUrl: "./prodcut-card.component.html",
    styleUrls: ["./prodcut-card.component.scss"],
})
export class ProdcutCardComponent {
    @Input() product;
    @Input() currency: string;
    @Input() buyerSSIN: string;
    @Input() sellerSSIN: string;
    @Input()  isSellerIdExists:boolean =false
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    params: any;
    ngOnInit(){
        this.product?.price % 1 ==0?this.product.price=Math.round(this.product.price * 100 / 100).toFixed(2):null; 
    }
    constructor(private router: Router) {}

    viewProduct(id: number) {
        const productBodyRequestForView = {
            id: id,
            currencyCode: this.currency,
            sellerSSIN: this.sellerSSIN,
            buyerSSIN : this.buyerSSIN
        };
        localStorage.setItem("productData", JSON.stringify(productBodyRequestForView))
        this.router.navigate(["/app/main/marketplace/products/view", id]);

        // this.router.navigateByUrl(`/view/${id}`)
    }
}
