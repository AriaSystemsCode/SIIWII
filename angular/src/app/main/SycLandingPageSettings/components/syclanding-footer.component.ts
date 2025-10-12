import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-syclanding-footer",
    templateUrl: "./syclanding-Footer.component.html",
    styleUrls: ["./syclanding-Footer.component.scss"],
})
export class SyclandingFooterComponent implements OnInit {
    brands:any
    constructor() {
        this.brands = [
            { name: 'Apple',        img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Samsung',      img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Nike',         img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Adidas',       img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Sony',         img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'LG',           img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Microsoft',    img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Huawei',       img: 'assets/placeholders/_logo-placeholder.png' },
            { name: 'Xiaomi',       img: 'assets/brands/xiaomi.svg' },
            { name: 'Lenovo',       img: 'assets/brands/lenovo.svg' },
          ];
    }

    ngOnInit(): void {}

}
