import { Component, Injector, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-order-preview",
    templateUrl: "./order-preview.component.html",
    styleUrls: ["./order-preview.component.scss"],
})
export class OrderPreviewComponent extends AppComponentBase implements OnInit, OnChanges {
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    @Input("orderConfirmationFile") orderConfirmationFile;
    @Input("transactionFormPath") transactionFormPath;
    loadingError: boolean = false;

    constructor(
        injector: Injector
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this.loadPdf();
    }
    ngOnChanges(changes: SimpleChanges) {
        this.loadPdf();
    }
    loadPdf() {
        this.loadingError = true;
        var base64String = this.orderConfirmationFile
        var pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;

        if (base64String && pdfViewer) {
            pdfViewer.src = 'data:application/pdf;base64,' + base64String;
            this.loadingError = false;
        }
    }

}
