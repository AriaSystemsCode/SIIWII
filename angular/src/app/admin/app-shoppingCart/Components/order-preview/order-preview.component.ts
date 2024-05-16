import { AfterViewInit, Component, Injector, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppTransactionServiceProxy, GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs";

@Component({
    selector: "app-order-preview",
    templateUrl: "./order-preview.component.html",
    styleUrls: ["./order-preview.component.scss"],
})
export class OrderPreviewComponent extends AppComponentBase implements OnInit, OnChanges  , AfterViewInit{
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    @Input("orderConfirmationFile") orderConfirmationFile;
    @Input("transactionFormPath") transactionFormPath;
    @Input("orderId") orderId;
    loadingError: boolean = false;

    constructor(
        injector: Injector,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    ) {
        super(injector);
    }
    ngOnInit(): void {
    }
    ngOnChanges(changes: SimpleChanges) {
        this.loadPdf();
    }
    ngAfterViewInit(){
        this.loadPdf();
    }
    loadPdf() {
        this.loadingError = true;
        this.showMainSpinner()
        this._AppTransactionServiceProxy.getTransactionOrderConfirmation(this.orderId)
        .pipe(finalize(() => {
            this.hideMainSpinner()
        }))
        .subscribe((res) => {
            var base64String =res;
            var pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;
    
            if (base64String && pdfViewer) {
                pdfViewer.src = 'data:application/pdf;base64,' + base64String;
                this.loadingError = false;
            }
        });
       
    }

}

