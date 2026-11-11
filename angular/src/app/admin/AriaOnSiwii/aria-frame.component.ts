import { Component, Injector, OnInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DomSanitizer, SafeResourceUrl } from '@node_modules/@angular/platform-browser';

@Component({
    templateUrl: './aria-frame.component.html',
    styleUrls: ['./aria-frame.component.scss'],
    animations: [appModuleAnimation()]
})
export class AriaIframeComponent extends AppComponentBase implements OnInit {


    erpUrl: SafeResourceUrl;
    constructor(
        injector: Injector,
        private sanitizer: DomSanitizer
    ) {
        super(injector);
    }

    ngOnInit(): void {
        const externalUrl = 'https://ariaonline.net/RDWeb/webclient';
        this.erpUrl = this.sanitizer.bypassSecurityTrustResourceUrl(externalUrl);
      }
      
    openAriaNewTab(){
        let bt = 'app/admin/AriaSystem'
        window.open(bt);
    }
    openNewTab() {
        // const externalUrl = 'https://ariaonline.net/RDWeb/webclient/index.html'; // Replace with your ERP site URL
        // this.erpUrl = externalUrl;
        //  window.open(this.erpUrl);
         }
    onIframeLoad() {
        console.log('ERP site loaded successfully');
      }
      
      ngOnDestroy() {
        localStorage.removeItem('openArya')

    }
      
}
