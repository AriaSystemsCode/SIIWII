import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { Router } from "express-serve-static-core";
import { finalize } from "rxjs";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
import * as moment from "moment";
import { forEach } from "lodash";
import { GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
    selector: "app-order-preview",
    templateUrl: "./order-preview.component.html",
    styleUrls: ["./order-preview.component.scss"],
})
export class OrderPreviewComponent extends AppComponentBase implements OnInit, OnChanges {
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    @Input("transactionFormPath")   transactionFormPath:string;
   // invokeAction = '/DXXRDV'

    constructor(
        injector: Injector,
        private sanitizer: DomSanitizer
    ) {
        super(injector);
    }
    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
      if(this.transactionFormPath)
          document.getElementById("objectID").setAttribute("data", this.transactionFormPath); 


    }

    getSafePdfUrl(): SafeResourceUrl {
        this.transactionFormPath="https://localhost:44301/attachments/2154/OrderConfirmationForm1.pdf";
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.transactionFormPath);
      }



   
    
}