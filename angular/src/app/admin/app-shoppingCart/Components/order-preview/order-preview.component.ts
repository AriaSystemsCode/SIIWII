import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { Router } from "express-serve-static-core";
import { finalize } from "rxjs";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
import * as moment from "moment";
import { forEach } from "lodash";
import { GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";

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
    ) {
        super(injector);
    }
    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
      if(this.transactionFormPath)
          document.getElementById("objectID").setAttribute("data", this.transactionFormPath); 


    }



   
    
}