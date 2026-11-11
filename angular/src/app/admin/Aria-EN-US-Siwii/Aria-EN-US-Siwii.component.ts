import { Component, Injector, OnInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DomSanitizer, SafeResourceUrl } from '@node_modules/@angular/platform-browser';

@Component({
    templateUrl: './Aria-EN-US-Siwii.component.html',
    styleUrls: ['./Aria-EN-US-Siwii.component.scss'],
    animations: [appModuleAnimation()]
})
export class AriaEnUsSiwiiComponent extends AppComponentBase implements OnInit {


    erpUrl: SafeResourceUrl;
    constructor(
        injector: Injector,
        private sanitizer: DomSanitizer
    ) {
        super(injector);
    }

    ngOnInit(): void {
        const externalUrl = 'https://ariaonline.net/rdweb/pages/en-us';
        this.erpUrl = this.sanitizer.bypassSecurityTrustResourceUrl(externalUrl);
      }
      
    openAriaNewTab(){
        let bt = 'app/admin/AriaSystem-en-us'
        window.open(bt);
    }
 
    onIframeLoad() {
        console.log('ERP site loaded successfully');
      }
      


}
