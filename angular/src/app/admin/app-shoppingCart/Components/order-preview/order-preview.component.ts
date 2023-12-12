import { Component, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { Observable, catchError, finalize } from "rxjs";
import { GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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
    input = document.querySelector('input[type=file]');

    printInfoParam: ProductCatalogueReportParams = new ProductCatalogueReportParams();
    reportUrl:string="";
    invokeAction = '/DXXRDV';
    @Input("orderId") orderId;

    constructor(
        injector: Injector,
        private sanitizer: DomSanitizer,
        private http: HttpClient
    ) {
        super(injector);
    }
    ngOnInit(): void {
        if (this.transactionFormPath)
            this.loadPdf();
    }
    ngOnChanges(changes: SimpleChanges) {
        if (this.transactionFormPath)
            this.loadPdf();
    }
    loadPdf() {
        this.printInfoParam.reportTemplateName = this.transactionReportTemplateName;
        this.printInfoParam.TransactionId = this.orderId.toString();
        //this.printInfoParam.orderType=this.appTransactionsForViewDto.transactionType== TransactionType.SalesOrder  ? "SO" : "PO";
        this.printInfoParam.orderConfirmationRole = this.getTransactionRole(this.appTransactionsForViewDto.enteredByUserRole);
        this.printInfoParam.saveToPDF = true;
        this.printInfoParam.tenantId = this.appSession?.tenantId
        this.printInfoParam.userId = this.appSession?.userId
        this.reportUrl = this.printInfoParam.getReportUrl()

        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(this.transactionFormPath);

        // fetch(this.transactionFormPath)
        //     .then(response => response.blob())
        //     .then(blob => {
        //         this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        //         // const reader = new FileReader();
        //         // reader.onload = (e) => {
        //         //     const fileContent = e.target.result as ArrayBuffer;
        //         //     const blob = new Blob([new Uint8Array(fileContent)], { type: 'application/pdf' });
        //         //     this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        //         // };
        //         // reader.readAsArrayBuffer(this.transactionFormPath);
        //     });
    }
}
