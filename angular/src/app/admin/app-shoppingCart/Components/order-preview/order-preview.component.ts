import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { Router } from "express-serve-static-core";
import { finalize } from "rxjs";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
import * as moment from "moment";
import { forEach } from "lodash";
import { GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProductCatalogueReportParams } from "@app/main/app-items/appitems-catalogue-report/models/product-Catalogue-Report-Params";


@Component({
    selector: "app-order-preview",
    templateUrl: "./order-preview.component.html",
    styleUrls: ["./order-preview.component.scss"],
})
export class OrderPreviewComponent extends AppComponentBase implements OnInit, OnChanges {
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    @Input("transactionFormPath") transactionFormPath;
    pdfPath: SafeResourceUrl;

    constructor(
        injector: Injector,
        private sanitizer: DomSanitizer
    ) {
        super(injector);
    }
    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
      //  this.transactionFormPath = this.attachmentBaseUrl + "/attachments/2154/OrderConfirmationForm1.pdf";
      //  this.transactionFormPath =  "../../../../../assets/OrderConfirmationForm1.pdf";
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.transactionFormPath
        );
    }
/* 
    iframeError() {
        console.error('Error loading iframe');
        // Display an error message or take other actions when the iframe cannot be loaded
        const errorMessage = document.createElement('p');
        errorMessage.innerText = 'Unable to display PDF file.';
    
        const downloadLink = document.createElement('a');
        downloadLink.href = this.transactionFormPath;
        downloadLink.target = '_blank';
        downloadLink.innerText = 'Download instead.';
    
        const errorContainer = document.createElement('div');
        errorContainer.appendChild(errorMessage);
        errorContainer.appendChild(downloadLink);
    
        // Replace the content of the iframe with the error message
        const iframe = document.querySelector('iframe');
        iframe.parentNode.replaceChild(errorContainer, iframe);
      }
 */





}