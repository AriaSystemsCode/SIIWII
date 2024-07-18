import { AfterViewInit, Component, Injector, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppTransactionServiceProxy, GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs";

@Component({
    selector: "app-order-preview",
    templateUrl: "./order-preview.component.html",
    styleUrls: ["./order-preview.component.scss"],
})
export class OrderPreviewComponent extends AppComponentBase implements OnInit, OnChanges, AfterViewInit {
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    // @Input("orderConfirmationFile") orderConfirmationFile;
    @Input("transactionFormPath") transactionFormPath;
    @Input("orderId") orderId;
    loadingError: boolean = false;
    showReport: boolean = false;

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
    ngAfterViewInit() {
        // this.loadPdf();
    }
    async loadPdf() {
        this.showReport = false;
        this.showMainSpinner()
        try {
            await this.delay(10000);
            this._AppTransactionServiceProxy.getTransactionOrderConfirmation(this.orderId)
                .pipe(finalize(() => {
                    this.showReport = true;
                    this.hideMainSpinner()
                }))
                .subscribe(async (res) => {
                    try {
                        // Create a Blob from the base64 string
                        const byteCharacters = atob(res);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'application/pdf' });
                        // Create a URL for the Blob and set it as the iframe source
                        const pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;
                        const url = URL.createObjectURL(blob);
                        pdfViewer.src = url;

                        this.loadingError = false;
                    } catch (error) {
                        console.error('Error processing PDF:', error);
                        this.loadingError = true;
                    }
                },
                    (error) => {
                        console.error('Error loading PDF:', error);
                        this.loadingError = true;
                    }
                );
        } catch (error) {
            console.error('Error during PDF load process:', error);
            this.loadingError = true;
            this.hideMainSpinner();
        }
    }

    //     var base64String =res;
    //     var pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;

    //     if (base64String && pdfViewer) {
    //         pdfViewer.src = 'data:application/pdf;base64,' + base64String;
    //         this.loadingError = false;
    //     }
    //     else
    //         this.loadingError = true;
    // });

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

