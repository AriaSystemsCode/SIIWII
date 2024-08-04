import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppTenantInvoicesServiceProxy, GetAppTenantInvoiceForViewDto, AppTenantInvoiceDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ActivatedRoute } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';

@Component({
    templateUrl: './view-appTenantInvoice.component.html',
    animations: [appModuleAnimation()]
})
export class ViewAppTenantInvoiceComponent extends AppComponentBase implements OnInit {

    active = false;
    saving = false;

    item: GetAppTenantInvoiceForViewDto;


    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
         private _appTenantInvoicesServiceProxy: AppTenantInvoicesServiceProxy
    ) {
        super(injector);
        this.item = new GetAppTenantInvoiceForViewDto();
        this.item.appTenantInvoice = new AppTenantInvoiceDto();        
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
    }

    show(appTenantInvoiceId: number): void {
      this._appTenantInvoicesServiceProxy.getAppTenantInvoiceForView(appTenantInvoiceId).subscribe(result => {      
                 this.item = result;
                this.active = true;
            });       
    }
    
    
}
