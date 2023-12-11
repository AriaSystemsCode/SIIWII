import { Component, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { Observable, finalize } from "rxjs";
import { GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';


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
      //  const encodedUrl = encodeURIComponent(this.transactionFormPath);
        this.getPdfBinary(this.transactionFormPath).subscribe((arrayBuffer: ArrayBuffer) => {
            const binaryString = this.arrayBufferToBinaryString(arrayBuffer);
            const dataUrl = 'data:application/pdf;base64,' + btoa(binaryString);
            this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
        });

    }

    getPdfBinary(url): Observable<ArrayBuffer> {
        return this.http.get(url, { responseType: 'arraybuffer' });
    }
    arrayBufferToBinaryString(arrayBuffer: ArrayBuffer): string {
        const binaryArray = new Uint8Array(arrayBuffer);
        const binaryString = String.fromCharCode.apply(null, binaryArray);
        return binaryString;
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