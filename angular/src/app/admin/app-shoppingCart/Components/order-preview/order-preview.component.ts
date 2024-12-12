import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppTransactionServiceProxy, GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs";

@Component({
    selector: "app-order-preview",
    templateUrl: "./order-preview.component.html",
    styleUrls: ["./order-preview.component.scss"],
})
export class OrderPreviewComponent extends AppComponentBase implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    // @Input("orderConfirmationFile") orderConfirmationFile;
    @Input("transactionFormPath") transactionFormPath;
    @Input("orderId") orderId;
    @Input("regenrate") regenrate;
    @Output("stopReport") stopReport: EventEmitter<boolean> = new EventEmitter<boolean>()

    loadingError: boolean = false;
    showReport: boolean = false;
    visible: boolean = false;
    SuccessMsg: boolean = false;
    startload: boolean = false;
    showbar: boolean = true;
    dialogClosed: boolean = false; // New flag to track dialog closure
    constructor(
        injector: Injector,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    ) {
        super(injector);
    }
    ngOnInit(): void {
    }
    ngOnChanges(changes: SimpleChanges) {
        // if (!this.dialogClosed) { // Prevent re-triggering if the dialog is closed
            this.loadPdf();
        // }
    // this.isOrderConfirmationNeedsReprint()

    }
    ngAfterViewInit() {
        // this.loadPdf();
    }
    async loadPdf() {
        // if (this.startload) {
        //     // Guard condition to prevent reopening
        //     return;
        // }
    
        // this.showReport = false;
        // this.startload = true;
    
        // if (this.regenrate == true) {
        //     this.visible = true;
        // } else if (!this.regenrate) {
            this.showMainSpinner();
        // }
    
        try {
            await this.delay(10000);
            const subs = this._AppTransactionServiceProxy.getTransactionOrderConfirmation(this.orderId)
                .pipe(
                    finalize(() => {
                        // this.SuccessMsg = true;
                        // if (this.SuccessMsg) {
                        //     this.showbar = false;
                        // }
                        this.hideMainSpinner();
                        this.showReport = true;
                    })
                )
                .subscribe(
                    async (res) => {
                        try {
                            const byteCharacters = atob(res);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: 'application/pdf' });
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
    
            this.subscriptions.push(subs);
        } catch (error) {
            console.error('Error during PDF load process:', error);
            this.loadingError = true;
            this.hideMainSpinner();
        }
    }
    onDialogClose() {
        this.dialogClosed = true; // Set the flag to prevent re-triggering
        this.visible = false;
        this.startload = false;
        this.showReport = true;
        this.SuccessMsg = false;
        this.showbar = false;
        // Reset regenrate if necessary to prevent reopening
        this.regenrate = false;
    }
    
    
    // isOrderConfirmationNeedsReprint(){
        
    //     const subs =  this._AppTransactionServiceProxy.isOrderConfirmationNeedsReprint(this.orderId)
    //     .subscribe((res) => {
    //       console.log(res,'rep')
    //       if (res == true) {
    //         this.visible = res

    //        this.loadPdf()
       

    //       }
    //       else {
    //         this.loadPdf()
    //       }
       
    //     });
    //     this.subscriptions.push(subs)
        
    //   }
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


    ngOnDestroy() {
        this.emitDestroy()
        this.unsubscribeToAllSubscriptions();
    }

}

